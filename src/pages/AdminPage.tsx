import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App.tsx';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

interface QuestionData {
  id: number;
  text: string;
}

const AdminPage: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user || !user.isAdmin) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100, fontSize: '1.5rem', color: 'red' }}>
        관리자만 접근할 수 있습니다.<br />
        <button onClick={() => navigate('/')} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0082CC', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    // 60개 문항 한 번에 가져오기
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questions?page=1&limit=60`);
        if (!response.ok) throw new Error('문항을 불러오지 못했습니다.');
        const data = await response.json();
        setQuestions(data.questions);
        setFetchError(false);
      } catch (e) {
        setQuestions([]);
        setFetchError(true);
      }
    };
    fetchQuestions();
  }, []);

  const handleChange = (id: number, value: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text: value } : q));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`${API_URL}/api/admin/update-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 세션 쿠키 포함
        body: JSON.stringify({ questions })
      });
      if (!res.ok) throw new Error('저장 실패');
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    }
  };

  if (fetchError) {
    return <div style={{ color: 'red', marginTop: 40 }}>문항을 불러오지 못했습니다.</div>;
  }

  // 그룹 정보 정의
  const GROUPS = [
    { key: 'A', name: '외향성' },
    { key: 'B', name: '계획성과 즉흥성' },
    { key: 'C', name: '사회성' },
    { key: 'D', name: '시간관점' },
    { key: 'E', name: '도전성과 창의성' },
    { key: 'F', name: '감정민감도' },
    { key: 'G', name: '이성관계' },
    { key: 'H', name: '공감성' },
    { key: 'I', name: '현실 인지' },
    { key: 'J', name: '자존감' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 32 }}>문항 수정</h1>
      <div style={{ maxHeight: 600, overflowY: 'auto', marginBottom: 24 }}>
        {GROUPS.map((group, groupIdx) => {
          const groupQuestions = questions.slice(groupIdx * 6, groupIdx * 6 + 6);
          return (
            <div key={group.key} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: 6 }}>
                {group.key}. {group.name}
              </div>
              {groupQuestions.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: 18 }}>
                  <label style={{ fontWeight: 'bold', marginRight: 12 }}>문항 {group.key}{idx + 1}</label>
                  <input
                    type="text"
                    value={q.text}
                    onChange={e => handleChange(q.id, e.target.value)}
                    style={{ width: '80%', padding: 8, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <button
        onClick={handleSave}
        style={{ padding: '12px 32px', fontSize: '1.1em', borderRadius: 8, background: '#0082CC', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
      >
        저장
      </button>
      {saveStatus === 'saving' && <span style={{ marginLeft: 16, color: '#888' }}>저장 중...</span>}
      {saveStatus === 'success' && <span style={{ marginLeft: 16, color: 'green' }}>저장 완료!</span>}
    </div>
  );
};

export default AdminPage;
