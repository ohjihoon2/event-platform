import React, { useState } from 'react';
import { X, CalendarPlus, Users, Share2, Search } from 'lucide-react';
import { Button } from './Button';

export function HelpGuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('create');

  const tabs = [
    { id: 'create', icon: <CalendarPlus size={18} />, label: '폼 제작' },
    { id: 'manage', icon: <Users size={18} />, label: '신청자 관리' },
    { id: 'share', icon: <Share2 size={18} />, label: '공유하기' },
    { id: 'lookup', icon: <Search size={18} />, label: '내역 조회' },
  ];

  const content = {
    create: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>새 행사(폼) 기획하기</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>대시보드에서 <strong>[새 행사 만들기]</strong> 버튼을 눌러 나만의 신청서를 쉽게 만들 수 있습니다.</p>
        <div style={{ backgroundColor: '#EEF2FF', padding: '1.5rem', borderRadius: '0.75rem', marginTop: '0.5rem' }}>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#374151', margin: 0 }}>
            <li><strong>기본 정보:</strong> 행사 이름, 일시, 장소, 참가비 등을 설정합니다.</li>
            <li><strong>정원 설정:</strong> 선착순 인원 제한을 둘 수 있으며, 정원이 꽉 차면 자동으로 신청 폼이 닫힙니다.</li>
            <li><strong>추가 항목:</strong> 소속, 티셔츠 사이즈 등 원하는 질문(단답형/객관식)을 마음대로 추가할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    ),
    manage: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>신청자 관리하기</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>각 행사의 <strong>[신청자 관리하기]</strong> 버튼을 누르면 접수된 명단을 한눈에 볼 수 있습니다.</p>
        <div style={{ backgroundColor: '#EEF2FF', padding: '1.5rem', borderRadius: '0.75rem', marginTop: '0.5rem' }}>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#374151', margin: 0 }}>
            <li><strong>입금 상태 관리:</strong> 신청자의 입금 여부에 따라 <strong style={{color: 'var(--color-primary)'}}>'입금 대기'</strong> 상태를 <strong style={{color: 'var(--color-primary)'}}>'확정 완료'</strong>로 변경하거나, 반대로 '대기로 변경'하여 상태를 자유롭게 관리할 수 있습니다.</li>
            <li><strong>수동 추가:</strong> 현장/전화 접수자를 관리자가 직접 추가할 수 있으며, <strong style={{color: 'var(--color-primary)'}}>정원이 꽉 차거나 마감된 상태라도 관리자는 예외적으로 인원을 추가</strong>할 수 있습니다.</li>
            <li><strong>수정/삭제:</strong> 신청자의 정보(입금자명 등)를 변경하거나 신청을 취소(삭제)할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    ),
    share: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>신청서 공유하기</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>만들어진 폼을 다른 사람들에게 가장 쉽게 공유하는 방법입니다.</p>
        <div style={{ backgroundColor: '#EEF2FF', padding: '1.5rem', borderRadius: '0.75rem', marginTop: '0.5rem' }}>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#374151', margin: 0 }}>
            <li><strong>링크 복사:</strong> 카카오톡, 밴드, 인스타그램 등에 올릴 수 있는 짧은 링크를 바로 복사합니다.</li>
            <li><strong>QR 코드:</strong> 오프라인 포스터나 전단지에 넣을 수 있는 QR코드를 이미지 파일로 다운로드합니다.</li>
            <li><strong>상태 변경:</strong> 더 이상 신청을 받지 않으려면 폼을 삭제하지 말고 상태를 '모집 마감'으로만 변경하세요.</li>
          </ul>
        </div>
      </div>
    ),
    lookup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>신청자의 내역 조회 (보안)</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>신청자는 자기가 접수한 내용을 안전하게 조회하고 직접 수정/취소할 수 있습니다.</p>
        <div style={{ backgroundColor: '#EEF2FF', padding: '1.5rem', borderRadius: '0.75rem', marginTop: '0.5rem' }}>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#374151', margin: 0 }}>
            <li><strong>비밀번호 검증:</strong> 본인이 신청할 때 적었던 비밀번호 4자리를 알아야만 조회가 가능합니다.</li>
            <li><strong>내용 수정:</strong> 입금자명이나 추가 항목의 답변은 직접 수정할 수 있습니다. (이름과 연락처는 변경 불가)</li>
            <li><strong>참가 취소:</strong> 신청자가 직접 참가를 취소할 수 있으며, 이 경우 자동으로 정원에 1자리가 늘어납니다.</li>
          </ul>
        </div>
      </div>
    )
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '750px', height: '80vh', maxHeight: '550px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>📘</span> 서비스 이용 가이드
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#9CA3AF', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#4B5563'} onMouseOut={e=>e.currentTarget.style.color='#9CA3AF'}>
            <X size={24} />
          </button>
        </div>

        {/* Content Area (Tabs + Details) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Tabs */}
          <div style={{ width: '200px', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', borderRight: '1px solid #E5E7EB' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.5rem',
                  background: activeTab === tab.id ? 'white' : 'transparent',
                  border: 'none', borderLeft: activeTab === tab.id ? '4px solid var(--color-primary)' : '4px solid transparent',
                  cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === tab.id ? 'bold' : '500',
                  color: activeTab === tab.id ? 'var(--color-primary)' : '#4B5563',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab.id ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Details */}
          <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
            {content[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
