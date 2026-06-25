import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const updatePassword = useStore(state => state.updatePassword);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user actually has a valid session from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('유효하지 않거나 만료된 링크입니다.');
        navigate('/admin/login');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return alert('비밀번호는 6자리 이상이어야 합니다.');
    if (password !== passwordConfirm) return alert('비밀번호가 일치하지 않습니다.');

    setLoading(true);
    try {
      await updatePassword(password);
      alert('비밀번호가 성공적으로 변경되었습니다! 새 비밀번호로 다시 로그인해주세요.');
      await supabase.auth.signOut(); // Ensure they have to log in manually again
      navigate('/admin/login');
    } catch (error) {
      if (error.message && error.message.includes('New password should be different from the old password')) {
        alert('이전과 동일한 비밀번호로는 변경할 수 없습니다. 새로운 비밀번호를 입력해주세요.');
      } else {
        alert('오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', padding: '1rem' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '2.5rem 2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#FEF3C7', padding: '1rem', borderRadius: '50%' }}>
            <KeyRound size={32} color="#D97706" />
          </div>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', color: '#1F2937' }}>
          새 비밀번호 설정
        </h1>
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.875rem', marginBottom: '2rem' }}>새롭게 사용할 비밀번호를 입력해주세요.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="새 비밀번호" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="6자리 이상" 
            required
          />
          <Input 
            label="새 비밀번호 확인" 
            type="password"
            value={passwordConfirm} 
            onChange={(e) => setPasswordConfirm(e.target.value)} 
            placeholder="다시 한번 입력해주세요" 
            required
          />
          <Button type="submit" fullWidth size="lg" disabled={loading} style={{ marginTop: '0.5rem', background: 'linear-gradient(to right, #D97706, #EA580C)', border: 'none', fontWeight: 'bold' }}>
            {loading ? '변경 중...' : '비밀번호 변경하기'}
          </Button>
        </form>
      </div>
    </div>
  );
}
