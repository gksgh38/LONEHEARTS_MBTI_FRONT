import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CommunityWritePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || '';

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/session`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.loggedIn) {
          alert('로그인 후 이용 가능합니다.');
          navigate('/login');
          return;
        }
        
        setIsLoggedIn(true);
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        alert('로그인 상태 확인에 실패했습니다.');
        navigate('/login');
      }
    };
    
    checkLoginStatus();
  }, [API_URL, navigate]);

  // 게시글 등록 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    
    if (title.length > 255) {
      alert('제목은 255자 이내로 작성해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ title, content })
      });
      
      if (!response.ok) {
        throw new Error('게시글 등록에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('게시글이 등록되었습니다.');
        navigate(`/community/post/${data.postId}`);
      } else {
        throw new Error(data.error || '게시글 등록에 실패했습니다.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '게시글 등록 중 오류가 발생했습니다.');
      console.error('게시글 등록 중 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (!confirm('작성 중인 내용이 있습니다. 목록으로 돌아가시겠습니까?')) {
        return;
      }
    }
    navigate('/community');
  };

  if (!isLoggedIn) {
    return <div>로그인 확인 중...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
        게시글 작성
      </h1>
      
      <form onSubmit={handleSubmit}>
        {/* 제목 입력 */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
            maxLength={255}
          />
        </div>
        
        {/* 내용 입력 */}
        <div style={{ marginBottom: '30px' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            style={{
              width: '100%',
              height: '400px',
              padding: '15px',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: '1.6'
            }}
          />
        </div>
        
        {/* 버튼 영역 */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#333',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            disabled={isSubmitting}
          >
            취소
          </button>
          
          <button
            type="submit"
            style={{
              backgroundColor: '#0082CC',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'default' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityWritePage;
