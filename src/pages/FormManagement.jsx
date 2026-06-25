import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Check, Clock, Edit, Trash2, PlusCircle, X } from 'lucide-react';

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
    <div className="container-admin">
      <header style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{form.title} - 신청자 관리</h1>
      </header>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>총 신청자</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{applications.length}</p>
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>입금 대기</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>{pendingCount}</p>
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>확정 완료</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{confirmedCount}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button onClick={() => openModal()}><PlusCircle size={18} style={{marginRight: '6px'}}/> 수동 신청자 추가</Button>
      </div>

      {/* Applications Table */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>신청일시</th>
                <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>이름</th>
                <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>연락처</th>
                <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>입금자명</th>
                {form.fields && form.fields.map(f => (
                  <th key={f.id} style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{f.label}</th>
                ))}
                <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>상태</th>
                <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>상태 변경</th>
                <th style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>아직 신청자가 없습니다.</td>
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
                        <Button size="sm" variant="primary" onClick={() => updateApplicationStatus(app.id, 'confirmed')}>
                          입금 확인
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => updateApplicationStatus(app.id, 'pending')}>
                          대기로 변경
                        </Button>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openModal(app)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} title="수정">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(app.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }} title="삭제">
                          <Trash2 size={18} />
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
