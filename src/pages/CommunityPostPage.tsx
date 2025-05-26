import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_id: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

const CommunityPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const API_URL = process.env.REACT_APP_API_URL || '';

  // 로그인 상태 및 사용자 정보 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/session`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.loggedIn) {
          setUser({
            id: data.user.id,
            username: data.user.username,
            isAdmin: data.user.isAdmin
          });
        }
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
      }
    };
    
    checkLoginStatus();
  }, [API_URL]);

  // 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      
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
        
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '게시글 로딩 실패');
        console.error('게시글 로딩 중 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPost();
    }
  }, [API_URL, id]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 게시글 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/community/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('게시글 삭제에 실패했습니다.');
      }
      
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      alert(err instanceof Error ? err.message : '게시글 삭제 중 오류가 발생했습니다.');
      console.error('게시글 삭제 중 오류:', err);
    }
  };

  // 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/community/edit/${id}`);
  };

  // 목록으로 이동
  const handleGoToList = () => {
    navigate('/community');
  };

  // 권한 확인 (작성자 본인 또는 관리자인지)
  const hasPermission = () => {
    if (!user || !post) return false;
    return user.id === post.author_id || user.isAdmin;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p>게시글을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error || '게시글을 찾을 수 없습니다.'}</p>
        <button 
          onClick={handleGoToList}
          style={{
            backgroundColor: '#0082CC',
            color: 'white',
            padding: '8px 16px',
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
      {/* 게시글 헤더 */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '15px' }}>{post.title}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
          <span>작성자: {post.author_name}</span>
          <span>작성일: {formatDate(post.created_at)}</span>
        </div>
      </div>
      
      {/* 게시글 내용 */}
      <div style={{ 
        minHeight: '300px', 
        padding: '20px 0', 
        marginBottom: '30px',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6'
      }}>
        {post.content}
      </div>
      
      {/* 버튼 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <button 
          onClick={handleGoToList}
          style={{
            backgroundColor: '#f0f0f0',
            color: '#333',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          목록으로
        </button>
        
        {hasPermission() && (
          <div>
            <button 
              onClick={handleEdit}
              style={{
                backgroundColor: '#0082CC',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              수정
            </button>
            <button 
              onClick={handleDelete}
              style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPostPage;
