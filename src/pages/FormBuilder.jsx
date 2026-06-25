import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

registerLocale('ko', ko);

export default function FormBuilder() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const addForm = useStore(state => state.addForm);
  const updateForm = useStore(state => state.updateForm);
  const existingForm = useStore(state => state.forms.find(f => f.id === formId));

  // Basic info state
  const [basicInfo, setBasicInfo] = useState({
    title: existingForm?.title || '',
    location: existingForm?.location || '',
    date: existingForm?.date || '',
    fee: existingForm?.fee || '',
    capacity: existingForm?.capacity || '',
    description: existingForm?.description || '',
    bank_account: existingForm?.bank_account || ''
  });

  // Custom fields state
  const [fields, setFields] = useState(existingForm?.fields || []);

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const addField = (type) => {
    setFields([...fields, { id: uuidv4(), type, label: '', options: '', required: false }]);
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const handleSave = async () => {
    if (!basicInfo.title) {
      alert('행사 제목은 필수입니다.');
      return;
    }
    
    // Parse options for select/radio
    const parsedFields = fields.map(f => ({
      ...f,
      optionsList: f.options ? f.options.split(',').map(o => o.trim()) : []
    }));

    if (existingForm) {
      const result = await updateForm(formId, {
        ...basicInfo,
        fields: parsedFields
      });
      if (result && result.success) {
        alert('신청서가 수정되었습니다!');
        navigate('/admin');
      } else {
        alert('수정 실패: ' + (result?.error?.message || 'DB 오류. 테이블 설정을 확인하세요.'));
      }
    } else {
      const result = await addForm({
        ...basicInfo,
        fields: parsedFields
      });
      if (result && result.success) {
        alert('새 신청서가 저장되었습니다!');
        navigate('/admin');
      } else {
        alert('저장 실패: ' + (result?.error?.message || 'DB 오류. 테이블(Table)이 아직 생성되지 않았을 수 있습니다.'));
      }
    }
  };

  return (
    <div className="container-admin" style={{ maxWidth: '800px' }}>
      <header style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{existingForm ? '신청서 수정' : '새 신청서 만들기'}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Basic Info Section */}
        <section style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>행사 기본 정보</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="행사 제목 (필수)" name="title" value={basicInfo.title} onChange={handleBasicInfoChange} />
            <div className="form-row">
              <div className="input-wrapper input-full">
                <label className="input-label">일시</label>
                <DatePicker
                  selected={basicInfo.date ? new Date(basicInfo.date) : null}
                  onChange={(date) => setBasicInfo({ ...basicInfo, date: date ? date.toISOString() : '' })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={10}
                  timeCaption="시간"
                  dateFormat="yyyy-MM-dd HH:mm"
                  locale="ko"
                  placeholderText="YYYY-MM-DD HH:MM"
                  className="input-field"
                  wrapperClassName="date-picker-wrapper"
                />
              </div>
              <Input label="장소" name="location" value={basicInfo.location} onChange={handleBasicInfoChange} placeholder="행사 장소 입력" />
            </div>
            <div className="form-row">
              <Input label="참가비" name="fee" type="number" value={basicInfo.fee} onChange={handleBasicInfoChange} placeholder="숫자만 입력 (예: 45000)" />
              <Input label="모집 정원(명)" name="capacity" type="number" value={basicInfo.capacity} onChange={handleBasicInfoChange} placeholder="숫자만 입력 (예: 50)" />
            </div>
            <Input label="입금 계좌번호" name="bank_account" value={basicInfo.bank_account} onChange={handleBasicInfoChange} placeholder="예: 국민은행 123-456-789 홍길동" />
            <div className="input-wrapper input-full">
              <label className="input-label">행사 상세 내용</label>
              <textarea 
                className="input-field" 
                name="description"
                rows="4" 
                value={basicInfo.description} 
                onChange={handleBasicInfoChange}
                placeholder="참석 대상, 주의사항 등 상세 안내를 작성해주세요."
              />
            </div>
          </div>
        </section>

        {/* Custom Fields Section */}
        <section style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: '1 1 250px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>신청자 정보 수집</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', lineHeight: '1.4', wordBreak: 'keep-all' }}>
                기본 수집 항목(이름, 연락처, 비밀번호)은 자동으로 양식에 포함됩니다. 필요한 추가 질문만 생성하세요.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <Button size="sm" variant="secondary" onClick={() => addField('text')}><PlusCircle size={16} style={{marginRight: '4px'}}/> 단답형 질문</Button>
              <Button size="sm" variant="secondary" onClick={() => addField('select')}><PlusCircle size={16} style={{marginRight: '4px'}}/> 객관식 질문</Button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Display default fields that are always collected */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>🔒 기본 수집 항목 (수정 불가)</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>참가자 이름, 연락처, 신청확인용 4자리 비밀번호, 입금자명</p>
            </div>

            {fields.length > 0 && <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '1rem 0' }}></div>}
            
            {fields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', backgroundColor: '#F3F4F6' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input 
                    label={`추가 질문 ${index + 1} (${field.type === 'text' ? '단답형' : '객관식'})`} 
                    value={field.label} 
                    onChange={(e) => updateField(field.id, 'label', e.target.value)} 
                    placeholder="질문 내용을 입력하세요 (예: 티셔츠 사이즈)"
                  />
                  {field.type === 'select' && (
                    <Input 
                      label="선택지 (쉼표로 구분하여 입력)" 
                      value={field.options} 
                      onChange={(e) => updateField(field.id, 'options', e.target.value)} 
                      placeholder="예: S, M, L, XL"
                    />
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, 'required', e.target.checked)} />
                    이 질문을 필수 항목으로 설정
                  </label>
                </div>
                <Button variant="ghost" onClick={() => removeField(field.id)} style={{ color: 'var(--color-danger)' }}>
                  <Trash2 size={20} />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ marginTop: '3rem', paddingBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="lg" onClick={handleSave} style={{ minWidth: '150px' }}>
          <Save size={20} style={{marginRight: '8px'}}/> {existingForm ? '수정하기' : '저장하기'}
        </Button>
      </div>
    </div>
  );
}
