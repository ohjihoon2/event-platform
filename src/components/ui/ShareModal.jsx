import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './Button';
import { X, Copy, Printer } from 'lucide-react';

export function ShareModal({ form, onClose }) {
  if (!form) return null;

  const url = `${window.location.origin}/form/${form.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('참가 신청 링크가 복사되었습니다!');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: 'var(--color-text-main)' }}>신청서 공유하기</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          참가자들에게 아래 QR 코드를 보여주거나<br/>URL 링크를 복사하여 공유하세요.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'white' }}>
          <QRCodeSVG value={url} size={180} />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            readOnly 
            value={url} 
            style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', outline: 'none' }}
          />
          <Button variant="primary" onClick={copyToClipboard} style={{ padding: '0.5rem 1rem' }}>
            <Copy size={18} />
          </Button>
        </div>
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <Button variant="secondary" fullWidth onClick={() => window.open(`/admin/print/${form.id}`, '_blank')}>
            <Printer size={18} style={{ marginRight: '8px' }} />
            홍보용 포스터(A4) 인쇄하기
          </Button>
        </div>
      </div>
    </div>
  );
}
