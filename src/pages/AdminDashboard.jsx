import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { ShareModal } from '../components/ui/ShareModal';
import { PlusCircle, Share2, Settings, Users, ExternalLink, MoreVertical } from 'lucide-react';

export default function AdminDashboard() {
  const isAdmin = useStore(state => state.isAdmin);
  const adminUser = useStore(state => state.adminUser);
  const logout = useStore(state => state.logout);
  const forms = useStore(state => state.forms);
  const applications = useStore(state => state.applications);
  const deleteForm = useStore(state => state.deleteForm);
  const updateForm = useStore(state => state.updateForm);
  const navigate = useNavigate();
  
  const [shareForm, setShareForm] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [statusModalForm, setStatusModalForm] = useState(null);

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const getApplicationCount = (formId) => applications.filter(a => a.form_id === formId).length;

  const getStatusBadge = (status) => {
    const baseStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px' };
    if (status === 'closed') return <span style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: '#B91C1C' }}>모집 마감</span>;
    return <span style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: '#059669' }}>모집 중</span>;
  };

  const handleDelete = (formId) => {
    if (window.confirm('행사를 정말로 삭제하시겠습니까? 삭제 시 모든 신청자 데이터가 영구적으로 지워집니다.')) {
      deleteForm(formId);
    }
  };

  return (
    <div className="container-admin">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>관리자 대시보드</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: '500', color: 'var(--color-primary)' }}>
            {adminUser?.user_metadata?.name || '관리자'}님 환영합니다
          </span>
          <Button variant="secondary" onClick={logout}>로그아웃</Button>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>내 행사 목록</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={() => navigate('/admin/builder')}><PlusCircle size={20} style={{marginRight: '8px'}}/> 새 행사 만들기</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {forms.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
            생성된 행사가 없습니다. '새 행사 만들기' 버튼을 눌러 시작해보세요.
          </p>
        ) : (
          forms.map(form => (
            <div key={form.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    {getStatusBadge(form.status || 'open')}
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-main)', lineHeight: '1.3' }}>{form.title}</h3>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === form.id ? null : form.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <MoreVertical size={20} color="var(--color-text-muted)" />
                    </button>
                    {openMenuId === form.id && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 10, width: '140px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <button onClick={() => { navigate(`/admin/builder/${form.id}`); setOpenMenuId(null); }} style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.875rem' }}>✏️ 수정하기</button>
                        <button onClick={() => { setStatusModalForm(form); setOpenMenuId(null); }} style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.875rem' }}>🔄 상태 변경</button>
                        <button onClick={() => { handleDelete(form.id); setOpenMenuId(null); }} style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-danger)' }}>🗑️ 영구 삭제</button>
                      </div>
                    )}
                  </div>
                </div>
                
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem', flexGrow: 1 }}>
                  {form.date ? new Date(form.date).toLocaleString() : '일시 미정'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <Users size={16} />
                  <span>현재 신청: <strong>{getApplicationCount(form.id)}</strong>명 {form.capacity && `/ 정원 ${form.capacity}명`}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="secondary" size="sm" fullWidth onClick={() => setShareForm(form)}>
                      <Share2 size={16} style={{marginRight: '4px'}}/> QR / 공유
                    </Button>
                    <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(`/form/${form.id}`)}>
                      <ExternalLink size={16} style={{marginRight: '4px'}}/> 미리보기
                    </Button>
                  </div>
                  <Button variant="primary" size="sm" fullWidth onClick={() => navigate(`/admin/manage/${form.id}`)}>
                    <Settings size={16} style={{marginRight: '4px'}}/> 신청자 관리하기
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {shareForm && <ShareModal form={shareForm} onClose={() => setShareForm(null)} />}

      {/* Status Modal */}
      {statusModalForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '320px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>행사 상태 변경</h3>
            <select 
              value={statusModalForm.status || 'open'} 
              onChange={(e) => { 
                updateForm(statusModalForm.id, { status: e.target.value }); 
                setStatusModalForm(null); 
              }}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
            >
              <option value="open">🟢 모집 중 (신청 가능)</option>
              <option value="closed">🔴 모집 마감 (신청 불가)</option>
            </select>
            <Button variant="secondary" fullWidth onClick={() => setStatusModalForm(null)}>취소</Button>
          </div>
        </div>
      )}
    </div>
  );
}
