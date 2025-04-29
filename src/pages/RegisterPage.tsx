import React, { useState, FormEvent, FC } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const RegisterPage: FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameCheckMsg, setUsernameCheckMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password || !confirmPassword) {
      setError('모든 항목을 입력하세요.');
      return;
    }
    if (password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '회원가입 실패');
        return;
      }
      navigate('/login');
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    }
  };

  // 닉네임 중복확인
  const handleCheckUsername = async () => {
    if (!username) {
      setUsernameCheckMsg('닉네임을 입력하세요.');
      setUsernameChecked(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.exists) {
        setUsernameCheckMsg('이미 사용 중인 닉네임입니다.');
        setUsernameChecked(false);
      } else {
        setUsernameCheckMsg('사용 가능한 닉네임입니다!');
        setUsernameChecked(true);
      }
    } catch {
      setUsernameCheckMsg('서버 오류');
      setUsernameChecked(false);
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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 32 }}>회원가입</h1>
        <form onSubmit={handleRegister} style={{ width: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: 320,
              padding: '14px',
              marginBottom: 18,
              fontSize: '1.1rem',
              borderRadius: 8,
              border: '1.5px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', width: 320, marginBottom: 18 }}>
            <input
              type="text"
              placeholder="닉네임"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setUsernameChecked(false);
                setUsernameCheckMsg('');
              }}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '1.1rem',
                borderRadius: 8,
                border: '1.5px solid #ddd',
                marginRight: 10,
                minWidth: 0
              }}
            />
            <button type="button" onClick={handleCheckUsername} style={{
              padding: '12px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#0082CC',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1em',
              whiteSpace: 'nowrap'
            }}>중복확인</button>
          </div>
          {usernameCheckMsg && <div style={{ color: usernameChecked ? 'green' : 'red', marginBottom: 8, width: 320, textAlign: 'left', fontSize: '0.97em' }}>{usernameCheckMsg}</div>}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: 320,
              padding: '14px',
              marginBottom: 18,
              fontSize: '1.1rem',
              borderRadius: 8,
              border: '1.5px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{
              width: 320,
              padding: '14px',
              marginBottom: 18,
              fontSize: '1.1rem',
              borderRadius: 8,
              border: '1.5px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
          {error && <div style={{ color: 'red', marginBottom: 12, width: 320 }}>{error}</div>}
          <button
            type="submit"
            style={{
              width: 320,
              background: '#FF7A5A',
              color: '#fff',
              border: 'none',
              borderRadius: '40px',
              padding: '16px 0',
              fontSize: '1.25em',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: 10
            }}
          >
            회원가입
          </button>
        </form>
        <div style={{ marginTop: 18 }}>
          이미 계정이 있으신가요?{' '}
          <span
            style={{ color: '#0082CC', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/login')}
          >
            로그인
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
