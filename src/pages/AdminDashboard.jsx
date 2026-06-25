import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { ShareModal } from '../components/ui/ShareModal';
import { HelpGuideModal } from '../components/ui/HelpGuideModal';
import { PlusCircle, Share2, Settings, Users, ExternalLink, MoreVertical, HelpCircle } from 'lucide-react';

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
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const getApplicationCount = (formId) => applications.filter(a => a.form_id === formId).length;

  const getStatusBadge = (form) => {
    const status = form.status || 'open';
    const count = getApplicationCount(form.id);
    const isFull = form.capacity && count >= form.capacity;
    
    const baseStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px' };
    
    if (status === 'closed') return <span style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: '#B91C1C' }}>모집 마감</span>;
    if (isFull) return <span style={{ ...baseStyle, backgroundColor: '#FEF3C7', color: '#B45309' }}>정원 마감</span>;
    
    return <span style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: '#059669' }}>모집 중</span>;
  };

  const handleDelete = (formId) => {
    if (window.confirm('행사를 정말로 삭제하시겠습니까? 삭제 시 모든 신청자 데이터가 영구적으로 지워집니다.')) {
      deleteForm(formId);
    }
  };

  return (
    <div className="container-admin" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: 'var(--color-surface)', padding: '1.5rem 2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>대시보드</h1>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>현재 <b>{forms.length}개</b>의 행사를 관리하고 있습니다.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => setGuideModalOpen(true)} style={{ color: 'var(--color-primary)', border: '1px solid #E0E7FF', backgroundColor: '#EEF2FF', padding: '0.5rem 1rem' }}>
            <HelpCircle size={18} style={{marginRight: '6px'}} /> 도움말
          </Button>
          <span style={{ fontWeight: '500', backgroundColor: '#F3F4F6', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
            👤 {adminUser?.user_metadata?.name || '관리자'}님 환영합니다
          </span>
          <Button variant="ghost" onClick={logout} style={{ color: 'var(--color-text-muted)', border: '1px solid #E5E7EB' }}>로그아웃</Button>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>내 행사 목록</h2>
        <Button onClick={() => navigate('/admin/builder')} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}>
          <PlusCircle size={20} style={{marginRight: '8px'}}/> 새 행사 만들기
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {forms.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0', backgroundColor: '#F9FAFB', borderRadius: '1rem', border: '1px dashed #D1D5DB' }}>
            <div style={{ display: 'inline-flex', padding: '1.5rem', backgroundColor: '#EEF2FF', borderRadius: '50%', marginBottom: '1rem' }}>
              <PlusCircle size={48} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>아직 생성된 행사가 없습니다.</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>'새 행사 만들기' 버튼을 눌러 첫 번째 행사를 기획해보세요!</p>
          </div>
        ) : (
          forms.map(form => (
            <div key={form.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    {getStatusBadge(form)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', backgroundColor: '#F3F4F6', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
                  <Users size={16} color="#4B5563" />
                  <span style={{ color: '#4B5563' }}>현재 신청: <strong style={{ color: '#111827' }}>{getApplicationCount(form.id)}</strong>명 {form.capacity && `/ 정원 ${form.capacity}명`}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="ghost" size="sm" fullWidth onClick={() => setShareForm(form)} style={{ border: '1px solid #D1D5DB' }}>
                      <Share2 size={16} style={{marginRight: '4px'}}/> 공유
                    </Button>
                    <Button variant="ghost" size="sm" fullWidth onClick={() => navigate(`/form/${form.id}`)} style={{ border: '1px solid #D1D5DB' }}>
                      <ExternalLink size={16} style={{marginRight: '4px'}}/> 폼 보기
                    </Button>
                  </div>
                  <Button variant="primary" size="sm" fullWidth onClick={() => navigate(`/admin/manage/${form.id}`)} style={{ marginTop: '0.25rem' }}>
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

      {/* Help Guide Modal */}
      {guideModalOpen && <HelpGuideModal onClose={() => setGuideModalOpen(false)} />}
    </div>
  );
}
