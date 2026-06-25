import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Calendar, MapPin, CreditCard, FileText, Users, ArrowLeft, X, Clock, Check, Search } from 'lucide-react';

export default function ApplicationForm() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchFormById = useStore(state => state.fetchFormById);
  const getApplicationCount = useStore(state => state.getApplicationCount);
  const addApplication = useStore(state => state.addApplication);
  const isAdmin = useStore(state => state.isAdmin);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    depositName: '',
  });

  const [customData, setCustomData] = useState({});
  const [currentCount, setCurrentCount] = useState(0);

  // Lookup Modal State
  const lookupApplication = useStore(state => state.lookupApplication);
  const updatePublicApplication = useStore(state => state.updatePublicApplication);
  const deletePublicApplication = useStore(state => state.deletePublicApplication);
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [lookupData, setLookupData] = useState({ name: '', phone: '', password: '' });
  const [lookupResult, setLookupResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ depositName: '', customData: {} });

  useEffect(() => {
    fetchFormById(formId).then(data => {
      setForm(data);
      setLoading(false);
    });
    getApplicationCount(formId).then(count => {
      setCurrentCount(count);
    });
  }, [formId, fetchFormById, getApplicationCount]);

  useEffect(() => {
    if (lookupModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lookupModalOpen]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>존재하지 않거나 삭제된 신청서입니다.</p>
      </div>
    );
  }

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomChange = (id, value) => {
    setCustomData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.password || !formData.passwordConfirm) {
      return alert('필수 기본 항목을 모두 입력해주세요.');
    }

    const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      return alert('연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)');
    }

    if (!/^\d{4}$/.test(formData.password)) {
      return alert('비밀번호는 숫자 4자리로 입력해주세요.');
    }

    if (formData.password !== formData.passwordConfirm) {
      return alert('비밀번호 확인이 일치하지 않습니다.');
    }

    // Custom fields validation
    if (form.fields) {
      for (const field of form.fields) {
        if (field.required && !customData[field.id]) {
          return alert(`'${field.label}' 항목을 입력해주세요.`);
        }
      }
    }

    const result = await addApplication({
      form_id: formId,
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
      deposit_name: formData.depositName,
      custom_data: customData,
    });

    if (result && result.success) {
      navigate(`/form/${formId}/success`);
    } else {
      if (result.error && result.error.includes('Capacity reached')) {
        alert('죄송합니다. 선착순 정원이 모두 마감되었습니다.');
      } else {
        alert('신청 중 오류가 발생했습니다.');
      }
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    const result = await lookupApplication(formId, lookupData.name, formatPhoneNumber(lookupData.phone), lookupData.password);
    if (result.success) {
      setLookupResult(result.data);
      setEditData({
        depositName: result.data.deposit_name || '',
        customData: result.data.custom_data || {}
      });
      setIsEditing(false);
    } else {
      alert(result.error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const result = await updatePublicApplication(
      lookupResult.id,
      lookupData.password, // Required for security verification
      editData.depositName,
      editData.customData
    );
    if (result.success) {
      alert('신청 내역이 성공적으로 수정되었습니다.');
      setLookupResult(result.data);
      setIsEditing(false);
    } else {
      alert(result.error);
    }
  };

  const handleCancelApplication = async () => {
    if (window.confirm('정말로 참가 신청을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const result = await deletePublicApplication(lookupResult.id, lookupData.password);
      if (result.success) {
        alert('신청이 성공적으로 취소되었습니다.');
        closeLookupModal();
        getApplicationCount(formId).then(count => setCurrentCount(count));
      } else {
        alert(result.error);
      }
    }
  };

  const closeLookupModal = () => {
    setLookupModalOpen(false);
    setLookupResult(null);
    setIsEditing(false);
    setLookupData({ name: '', phone: '', password: '' });
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {isAdmin && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)' }}>
          <Button variant="ghost" onClick={() => navigate('/admin')} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={20} style={{ marginRight: '8px' }} /> 관리자 대시보드로 돌아가기
          </Button>
        </div>
      )}

      {/* Event Header Banner */}
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '3rem 1.5rem', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', lineHeight: '1.2' }}>{form.title}</h1>
      </div>

      <div style={{ padding: '0 1.5rem', marginTop: '-1.5rem' }}>
        {/* Event Details Card */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {form.date && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>일시</p>
                  <p style={{ fontWeight: '500' }}>{new Date(form.date).toLocaleString()}</p>
                </div>
              </div>
            )}
            {form.location && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>장소</p>
                  <p style={{ fontWeight: '500' }}>{form.location}</p>
                </div>
              </div>
            )}
            {form.fee && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <CreditCard size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>참가비</p>
                  <p style={{ fontWeight: '500' }}>{Number(form.fee).toLocaleString()}원</p>
                </div>
              </div>
            )}
            {form.capacity && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Users size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>모집 인원</p>
                  <p style={{ fontWeight: '500' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{currentCount}명</span> / {form.capacity}명 
                    {currentCount >= Number(form.capacity) && <span style={{ marginLeft: '8px', fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>마감</span>}
                  </p>
                </div>
              </div>
            )}
            {form.description && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <FileText size={20} style={{ color: 'var(--color-primary)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>상세 안내</p>
                    <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{form.description}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Application Form */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>참가 신청하기</h2>
        
        {form.status === 'closed' || (form.capacity && currentCount >= Number(form.capacity)) ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#FEF2F2', borderRadius: '1rem', border: '1px solid #FCA5A5', color: '#991B1B' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>모집이 마감되었습니다</h2>
            <p>보내주신 성원에 감사드립니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Default Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="이름 (필수)" name="name" value={formData.name} onChange={handleInputChange} placeholder="실명을 입력해주세요" required />
              <Input label="연락처 (필수)" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="010-1234-5678" required />
              <Input label="비밀번호 4자리 (필수)" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="숫자 4자리" required maxLength={4} />
              <Input label="비밀번호 확인 (필수)" name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleInputChange} placeholder="비밀번호 재입력" required maxLength={4} />
              <Input label="입금자명" name="depositName" value={formData.depositName} onChange={handleInputChange} placeholder="신청자와 다를 경우 입력" />
            </div>

            {/* Custom Fields */}
            {form.fields && form.fields.length > 0 && (
              <>
                <hr style={{ border: 'none', borderTop: '1px dashed var(--color-border)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {form.fields.map(field => (
                    <div key={field.id} className="input-wrapper input-full">
                      <label className="input-label">{field.label} {field.required && <span style={{color: 'var(--color-danger)'}}>*</span>}</label>
                      {field.type === 'text' ? (
                        <input 
                          className="input-field" 
                          value={customData[field.id] || ''}
                          onChange={(e) => handleCustomChange(field.id, e.target.value)}
                          required={field.required}
                        />
                      ) : (
                        <select 
                          className="input-field"
                          value={customData[field.id] || ''}
                          onChange={(e) => handleCustomChange(field.id, e.target.value)}
                          required={field.required}
                        >
                          <option value="">선택해주세요</option>
                          {field.optionsList && field.optionsList.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <Button type="submit" size="lg" fullWidth style={{ marginTop: '1rem', boxShadow: 'var(--shadow-md)' }}>
              신청서 제출하기
            </Button>
          </form>
        )}

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--color-border)' }}>
          <Button type="button" variant="secondary" fullWidth onClick={() => setLookupModalOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#F3F4F6', color: '#1F2937', border: '1px solid #D1D5DB', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease' }}>
            <Search size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>내 신청 내역 조회 / 정보 수정 / 취소</span>
          </Button>
        </div>
      </div>

      {/* Lookup & Edit Modal */}
      {lookupModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={closeLookupModal} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>내 신청 내역 조회</h2>
            
            {!lookupResult ? (
              <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>신청 시 입력했던 정보를 정확히 입력해주세요.</p>
                <Input label="이름" value={lookupData.name} onChange={e => setLookupData({...lookupData, name: e.target.value})} required />
                <Input label="연락처" value={lookupData.phone} onChange={e => setLookupData({...lookupData, phone: formatPhoneNumber(e.target.value)})} required placeholder="010-0000-0000" />
                <Input label="비밀번호 4자리" type="password" value={lookupData.password} onChange={e => setLookupData({...lookupData, password: e.target.value})} required maxLength={4} />
                <Button type="submit" fullWidth style={{ marginTop: '0.5rem' }}>조회하기</Button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>현재 상태</span>
                  {lookupResult.status === 'pending' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <Clock size={14} /> 입금 대기
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <Check size={14} /> 확정 완료
                    </span>
                  )}
                </div>

                {!isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>이름 / 연락처 (수정 불가)</p>
                      <p style={{ fontWeight: '500' }}>{lookupResult.name} ({lookupResult.phone})</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>입금자명</p>
                      <p style={{ fontWeight: '500' }}>{lookupResult.deposit_name || '-'}</p>
                    </div>
                    {form.fields && form.fields.length > 0 && form.fields.map(f => (
                      <div key={f.id}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{f.label}</p>
                        <p style={{ fontWeight: '500' }}>{lookupResult.custom_data?.[f.id] || '-'}</p>
                      </div>
                    ))}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <Button onClick={handleCancelApplication} fullWidth variant="ghost" style={{ color: 'var(--color-danger)', backgroundColor: '#FEE2E2' }}>신청 취소하기</Button>
                      <Button onClick={() => setIsEditing(true)} fullWidth variant="secondary">내용 수정하기</Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#F3F4F6', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>이름과 연락처는 보안상 수정할 수 없습니다.</span>
                    </div>
                    <Input label="입금자명" value={editData.depositName} onChange={e => setEditData({...editData, depositName: e.target.value})} />
                    
                    {form.fields && form.fields.map(field => (
                      <div key={field.id} className="input-wrapper input-full">
                        <label className="input-label">{field.label} {field.required && <span style={{color: 'var(--color-danger)'}}>*</span>}</label>
                        {field.type === 'text' ? (
                          <input 
                            className="input-field" 
                            value={editData.customData[field.id] || ''}
                            onChange={(e) => setEditData({...editData, customData: {...editData.customData, [field.id]: e.target.value}})}
                            required={field.required}
                          />
                        ) : (
                          <select 
                            className="input-field"
                            value={editData.customData[field.id] || ''}
                            onChange={(e) => setEditData({...editData, customData: {...editData.customData, [field.id]: e.target.value}})}
                            required={field.required}
                          >
                            <option value="">선택해주세요</option>
                            {field.optionsList && field.optionsList.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <Button type="button" onClick={() => setIsEditing(false)} fullWidth variant="secondary">취소</Button>
                      <Button type="submit" fullWidth>저장하기</Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
