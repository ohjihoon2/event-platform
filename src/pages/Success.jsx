import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Copy } from 'lucide-react';

export default function Success() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const fetchFormById = useStore(state => state.fetchFormById);

  useEffect(() => {
    fetchFormById(formId).then(data => setForm(data));
  }, [formId, fetchFormById]);

  if (!form) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <p>로딩 중...</p>
    </div>
  );

  const handleCopyAccount = () => {
    if (form.bank_account) {
      navigator.clipboard.writeText(form.bank_account);
      alert('계좌번호가 복사되었습니다!');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <CheckCircle2 size={64} style={{ color: 'var(--color-secondary)', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>신청이 완료되었습니다!</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>입금 확인 후 최종 확정 안내를 드립니다.</p>

      {form.bank_account && (
        <div style={{ backgroundColor: 'var(--color-surface)', width: '100%', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary)', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>입금 안내</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{form.bank_account}</span>
            <button onClick={handleCopyAccount} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.25rem' }}>
              <Copy size={20} />
            </button>
          </div>
          {form.fee && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>입금액: {Number(form.fee).toLocaleString()}원</p>}
        </div>
      )}

      <Button variant="secondary" fullWidth size="lg" onClick={() => navigate(`/form/${formId}`)}>
        확인
      </Button>
    </div>
  );
}
