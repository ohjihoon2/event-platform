import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, CreditCard } from 'lucide-react';

export default function PrintPoster() {
  const { formId } = useParams();
  const form = useStore(state => state.forms.find(f => f.id === formId));

  useEffect(() => {
    // Automatically trigger print dialog when loaded
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!form) return null;

  const url = `${window.location.origin}/form/${form.id}`;

  return (
    <div className="outer-bg" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      {/* A4 Paper Container */}
      <div 
        className="print-container"
        style={{ 
          backgroundColor: 'white', 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '30mm 20mm', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: "'Pretendard', sans-serif",
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '1.5rem', width: '100%' }}>
          <p style={{ fontSize: '1.125rem', color: '#6B7280', marginBottom: '0.5rem', fontWeight: 'bold' }}>참가 신청 안내</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', wordBreak: 'keep-all', lineHeight: '1.3' }}>
            {form.title}
          </h1>
        </div>
        
        <p style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '2rem', textAlign: 'center', fontWeight: '600', lineHeight: '1.5' }}>
          스마트폰 카메라로 아래 QR 코드를 스캔하여<br/>
          <span style={{ color: '#2563EB', fontSize: '1.75rem' }}>지금 바로 참가 신청하세요!</span>
        </p>

        <div style={{ border: '6px solid #2563EB', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', backgroundColor: 'white' }}>
          <QRCodeSVG value={url} size={200} />
        </div>

        <div style={{ width: '100%', padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {form.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.25rem' }}>
              <Calendar size={28} style={{ color: '#2563EB' }} />
              <span style={{ fontWeight: '600', color: '#475569', width: '80px' }}>일시</span> 
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{new Date(form.date).toLocaleString()}</span>
            </div>
          )}
          {form.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.25rem' }}>
              <MapPin size={28} style={{ color: '#2563EB' }} />
              <span style={{ fontWeight: '600', color: '#475569', width: '80px' }}>장소</span> 
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{form.location}</span>
            </div>
          )}
          {form.fee && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.25rem' }}>
              <CreditCard size={28} style={{ color: '#2563EB' }} />
              <span style={{ fontWeight: '600', color: '#475569', width: '80px' }}>참가비</span> 
              <span style={{ color: '#0F172A', fontWeight: '500' }}>{Number(form.fee).toLocaleString()}원</span>
            </div>
          )}
          {form.description && (
            <>
              <hr style={{ borderTop: '1px dashed #CBD5E1', margin: '0.5rem 0' }} />
              <div style={{ fontSize: '1.125rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {form.description}
              </div>
            </>
          )}
        </div>
      </div>

      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @media print {
            body, html { 
              margin: 0 !important; 
              padding: 0 !important; 
              background-color: white !important; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 100% !important;
              height: 100% !important;
            }
            .outer-bg {
              background-color: white !important;
              padding: 0 !important;
              margin: 0 !important;
              display: block !important;
              min-height: 0 !important;
            }
            .print-container { 
              box-shadow: none !important; 
              width: 100% !important; 
              height: 100vh !important; 
              padding: 15mm 20mm !important;
              margin: 0 !important;
              border: none !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
            }
          }
        `}
      </style>
    </div>
  );
}
