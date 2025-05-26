import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CommunityEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalAuthorId, setOriginalAuthorId] = useState<number | null>(null);
  
  const API_URL = process.env.REACT_APP_API_URL || '';

  // 로그인 상태 및 권한 확인
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
        
        // 게시글 정보 불러오기
        fetchPostData(data.user.id, data.user.isAdmin);
        
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        alert('로그인 상태 확인에 실패했습니다.');
        navigate('/login');
      }
    };
    
    checkLoginStatus();
  }, [API_URL, id, navigate]);

  // 게시글 데이터 불러오기
  const fetchPostData = async (userId: number, isAdmin: boolean) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/community/posts/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('게시글을 찾을 수 없습니다.');
        }
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }
      
      const post = await response.json();
      
      // 권한 확인 (작성자 본인 또는 관리자만 수정 가능)
      if (post.author_id !== userId && !isAdmin) {
        alert('이 게시글을 수정할 권한이 없습니다.');
        navigate(`/community/post/${id}`);
        return;
      }
      
      setTitle(post.title);
      setContent(post.content);
      setOriginalAuthorId(post.author_id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 로딩 실패');
      console.error('게시글 로딩 중 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 수정 핸들러
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
      const response = await fetch(`${API_URL}/api/community/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ title, content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '게시글 수정에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('게시글이 수정되었습니다.');
        navigate(`/community/post/${id}`);
      } else {
        throw new Error(data.error || '게시글 수정에 실패했습니다.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '게시글 수정 중 오류가 발생했습니다.');
      console.error('게시글 수정 중 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate(`/community/post/${id}`);
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p>게시글을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => navigate('/community')}
          style={{
            backgroundColor: '#0082CC',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
        게시글 수정
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
            {isSubmitting ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityEditPage;
