import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function AdminLogin() {
  const isAdmin = useStore(state => state.isAdmin);
  const login = useStore(state => state.login);
  const signup = useStore(state => state.signup);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

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
        await signup(email, password, name);
        alert('회원가입이 완료되었습니다!');
      }
    } catch (error) {
      if (error.message.includes('Invalid login credentials')) {
        alert('이메일이나 비밀번호가 일치하지 않습니다.');
      } else if (error.message.includes('User already registered')) {
        alert('이미 가입된 이메일입니다.');
      } else {
        alert('오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)', padding: '1rem' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', color: 'var(--color-primary)' }}>
          관리자 {isLoginMode ? '로그인' : '회원가입'}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            placeholder="6자리 이상 입력" 
            required
          />
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
        </div>
      </form>
    </div>
  );
}
