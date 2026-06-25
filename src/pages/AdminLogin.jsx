import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CalendarDays, ClipboardList } from 'lucide-react';
import { HelpGuideModal } from '../components/ui/HelpGuideModal';

export default function AdminLogin() {
  const isAdmin = useStore(state => state.isAdmin);
  const login = useStore(state => state.login);
  const signup = useStore(state => state.signup);
  const resetPassword = useStore(state => state.resetPassword);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetName, setResetName] = useState('');
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }

    if (!isLoginMode && password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!isLoginMode && !name) {
      alert('이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        const result = await signup(email, password, name);
        if (result && result.needsEmailVerification) {
          alert('가입하신 이메일로 인증 메일이 발송되었습니다. 이메일 안의 링크를 클릭하신 후 로그인해주세요!');
          setIsLoginMode(true);
          return;
        }
        alert('회원가입이 완료되었습니다!');
      }
    } catch (error) {
      if (error.message.includes('Invalid login credentials')) {
        alert('이메일이나 비밀번호가 일치하지 않습니다.');
      } else if (error.message.includes('User already registered')) {
        alert('이미 가입된 이메일입니다.');
      } else if (error.message.includes('Email not confirmed')) {
        alert('이메일 인증이 아직 완료되지 않았습니다. 메일함에서 인증 링크를 클릭해주세요.');
      } else {
        alert('오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', padding: '1rem' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '2.5rem 2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#EEF2FF', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.1)' }}>
              <img src="/favicon.svg" alt="행사관리시스템 로고" style={{ width: '48px', height: '48px' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#4F46E5', letterSpacing: '2px', marginBottom: '0.5rem' }}>EVENT MANAGER</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', color: '#1F2937', lineHeight: '1.3' }}>
            {!isLoginMode ? '관리자 회원가입' : '행사 관리 시스템 시작하기'}
          </h1>
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
            나만의 참가 신청 폼을 만들고,<br/>수백 명의 신청자를 클릭 한 번으로 관리하세요.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLoginMode && (
            <Input 
              label="이름 (관리자명)" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="예: 홍길동" 
              required
            />
          )}
          <Input 
            label="이메일" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="admin@example.com" 
            required
          />
          <Input 
            label="비밀번호" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            required
          />
          {isLoginMode && (
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <button type="button" onClick={() => setResetModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}
          {!isLoginMode && (
            <Input 
              label="비밀번호 확인" 
              type="password"
              value={passwordConfirm} 
              onChange={(e) => setPasswordConfirm(e.target.value)} 
              placeholder="비밀번호를 다시 입력하세요" 
              required
            />
          )}
          <Button type="submit" size="lg" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? '처리 중...' : (isLoginMode ? '로그인' : '가입하고 시작하기')}
          </Button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}>
              {isLoginMode ? '계정이 없으신가요? 무료 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
            <button type="button" onClick={() => setGuideModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 'bold' }}>
              ❓ 서비스 이용 가이드 보기
            </button>
          </div>
        </form>
      </div>

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>비밀번호 찾기</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>가입 시 입력하신 이름과 이메일을 정확히 입력해주세요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="가입한 이름" type="text" value={resetName} onChange={e => setResetName(e.target.value)} required placeholder="예: 홍길동" />
              <Input label="이메일" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required placeholder="admin@example.com" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <Button variant="secondary" fullWidth onClick={() => setResetModalOpen(false)}>취소</Button>
              <Button fullWidth onClick={async () => {
                if(!resetName) return alert('이름을 입력해주세요.');
                if(!resetEmail) return alert('이메일을 입력해주세요.');
                try {
                  await resetPassword(resetEmail, resetName);
                  alert('비밀번호 재설정 링크가 이메일로 발송되었습니다!');
                  setResetModalOpen(false);
                } catch(e) {
                  alert(e.message);
                }
              }}>메일 보내기</Button>
            </div>
          </div>
        </div>
      )}

      {/* Help Guide Modal */}
      {guideModalOpen && <HelpGuideModal onClose={() => setGuideModalOpen(false)} />}
    </div>
  );
}
