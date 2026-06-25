import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Check, Clock, Edit, Trash2, PlusCircle, X, Users } from 'lucide-react';

export default function FormManagement() {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const form = useStore(state => state.forms.find(f => f.id === formId));
  const allApplications = useStore(state => state.applications);
  const applications = allApplications.filter(a => a.form_id === formId);
  
  const addApplication = useStore(state => state.addApplication);
  const updateApplication = useStore(state => state.updateApplication);
  const deleteApplication = useStore(state => state.deleteApplication);
  const updateApplicationStatus = useStore(state => state.updateApplicationStatus);
  const updateForm = useStore(state => state.updateForm);
  const deleteForm = useStore(state => state.deleteForm);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fetchApplications = useStore(state => state.fetchApplications);

  useEffect(() => {
    if (formId && form) {
      fetchApplications(formId);
    }
  }, [formId, form, fetchApplications]);
  
  // Modal Form State
  const [formData, setFormData] = useState({ name: '', phone: '', password: '0000', deposit_name: '', status: 'confirmed' });
  const [customData, setCustomData] = useState({});

  if (!form) return <div style={{ padding: '2rem' }}>신청서를 찾을 수 없습니다.</div>;

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const confirmedCount = applications.filter(a => a.status === 'confirmed').length;

  const isFull = form.capacity && applications.length >= form.capacity;
  const getStatusBadge = () => {
    const status = form.status || 'open';
    const baseStyle = { padding: '6px 10px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '12px' };
    
    if (status === 'closed') return <span style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: '#B91C1C' }}>모집 마감</span>;
    if (isFull) return <span style={{ ...baseStyle, backgroundColor: '#FEF3C7', color: '#B45309' }}>정원 마감</span>;
    
    return <span style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: '#059669' }}>모집 중</span>;
  };

  const openModal = (app = null) => {
    if (app) {
      setEditingId(app.id);
      setFormData({
        name: app.name,
        phone: app.phone,
        password: app.password,
        deposit_name: app.deposit_name || '',
        status: app.status
      });
      setCustomData(app.custom_data || {});
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', password: '0000', deposit_name: '', status: 'confirmed' });
      setCustomData({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert('이름과 연락처는 필수입니다.');

    if (editingId) {
      updateApplication(editingId, { ...formData, custom_data: customData });
    } else {
      addApplication({ form_id: formId, ...formData, custom_data: customData }, true);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('정말로 이 신청자를 삭제하시겠습니까?')) {
      deleteApplication(id);
    }
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  return (
    <div className="container-admin" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: 'var(--color-surface)', padding: '1.5rem 2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/admin')} style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '50%', padding: '0.5rem', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }}>
            <ArrowLeft size={20} color="#4B5563" />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }}>
              {form.title}
              {getStatusBadge()}
            </h1>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>신청자 현황 및 상세 내역을 관리합니다.</span>
          </div>
        </div>
        <Button onClick={() => openModal()} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)', padding: '0.75rem 1.5rem' }}>
          <PlusCircle size={18} style={{marginRight: '8px'}}/> 수동 신청자 추가
        </Button>
      </header>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><Users size={100} /></div>
          <p style={{ color: '#1E40AF', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', zIndex: 1 }}>총 신청자</p>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1D4ED8', zIndex: 1 }}>{applications.length}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #FDE68A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><Clock size={100} /></div>
          <p style={{ color: '#92400E', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', zIndex: 1 }}>입금 대기</p>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#B45309', zIndex: 1 }}>{pendingCount}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #A7F3D0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><Check size={100} /></div>
          <p style={{ color: '#065F46', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', zIndex: 1 }}>확정 완료</p>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#047857', zIndex: 1 }}>{confirmedCount}</p>
        </div>
      </div>

      {/* Applications Table */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1.25rem', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>신청자 목록</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'white', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem' }}>신청일시</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem' }}>이름</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem' }}>연락처</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem' }}>입금자명</th>
                {form.fields && form.fields.map(f => (
                  <th key={f.id} style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem' }}>{f.label}</th>
                ))}
                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem' }}>상태</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem' }}>상태 변경</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#4B5563', fontSize: '0.875rem', textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Users size={48} color="#D1D5DB" />
                      <p style={{ fontSize: '1.125rem' }}>아직 신청자가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(app.created_at).toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{app.name}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{app.phone}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{app.deposit_name || '-'}</td>
                    {form.fields && form.fields.map(f => (
                      <td key={f.id} style={{ padding: '1rem', fontSize: '0.875rem' }}>{app.custom_data?.[f.id] || '-'}</td>
                    ))}
                    <td style={{ padding: '1rem' }}>
                      {app.status === 'pending' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          <Clock size={14} /> 입금 대기
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          <Check size={14} /> 확정
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.status === 'pending' ? (
                        <button onClick={() => updateApplicationStatus(app.id, 'confirmed')} style={{ backgroundColor: '#F3F4F6', color: '#111827', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          입금 확인
                        </button>
                      ) : (
                        <button onClick={() => updateApplicationStatus(app.id, 'pending')} style={{ backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                          대기로 변경
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button onClick={() => openModal(app)} style={{ backgroundColor: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#4B5563', padding: '8px', borderRadius: '6px', transition: 'background-color 0.2s' }} title="수정" onMouseOver={e=>e.currentTarget.style.backgroundColor='#E5E7EB'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#F3F4F6'}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(app.id)} style={{ backgroundColor: '#FEF2F2', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '8px', borderRadius: '6px', transition: 'background-color 0.2s' }} title="삭제" onMouseOver={e=>e.currentTarget.style.backgroundColor='#FEE2E2'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#FEF2F2'}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {editingId ? '신청자 정보 수정' : '신청자 수동 추가'}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="이름" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="연락처" value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})} required />
              <Input label="입금자명" value={formData.deposit_name} onChange={e => setFormData({...formData, deposit_name: e.target.value})} />
              
              <div className="input-wrapper input-full">
                <label className="input-label">상태</label>
                <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="confirmed">확정 완료</option>
                  <option value="pending">입금 대기</option>
                </select>
              </div>

              {form.fields && form.fields.length > 0 && (
                <>
                  <hr style={{ borderTop: '1px dashed var(--color-border)', margin: '0.5rem 0' }} />
                  {form.fields.map(field => (
                    <div key={field.id} className="input-wrapper input-full">
                      <label className="input-label">{field.label}</label>
                      {field.type === 'text' ? (
                        <input className="input-field" value={customData[field.id] || ''} onChange={(e) => setCustomData({...customData, [field.id]: e.target.value})} />
                      ) : (
                        <select className="input-field" value={customData[field.id] || ''} onChange={(e) => setCustomData({...customData, [field.id]: e.target.value})}>
                          <option value="">선택해주세요</option>
                          {field.optionsList && field.optionsList.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </>
              )}
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <Button variant="secondary" onClick={closeModal} fullWidth type="button">취소</Button>
                <Button variant="primary" fullWidth type="submit">저장하기</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
