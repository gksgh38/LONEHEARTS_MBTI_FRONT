import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App.tsx';

const API_URL = process.env.REACT_APP_API_URL;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력하세요.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '로그인 실패');
        return;
      }
      setUser({ username: data.username });
      navigate('/');
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff' // 배경을 흰색으로 변경
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        padding: '48px 36px',
        minWidth: 380,
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 24 }}>로그인</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 18px', // 좌우 패딩 동일하게 수정
              marginBottom: 18,
              fontSize: '1.1rem',
              borderRadius: 8,
              border: '1.5px solid #ddd'
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 18px', // 좌우 패딩 동일하게 수정
              marginBottom: 18,
              fontSize: '1.1rem',
              borderRadius: 8,
              border: '1.5px solid #ddd'
            }}
          />
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#0082CC',
              color: '#fff',
              border: 'none',
              borderRadius: '40px',
              padding: '16px 0',
              fontSize: '1.3em',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: 12
            }}
          >
            로그인
          </button>
        </form>
        <div style={{ marginTop: 18 }}>
          계정이 없으신가요?{' '}
          <span
            style={{ color: '#FF7A5A', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/register')}
          >
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
