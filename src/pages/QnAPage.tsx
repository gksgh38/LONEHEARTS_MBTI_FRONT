import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 게시글 타입 정의
interface Post {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
  author_id: number;
}

// 게시글 목록 응답 타입
interface PostsResponse {
  posts: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

const QnAPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || '';
  const limit = 30; // 페이지당 게시글 수

  // 로그인 상태 및 관리자 권한 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/session`, {
          credentials: 'include'
        });
        const data = await response.json();
        setIsLoggedIn(data.loggedIn || false);
        setIsAdmin(data.loggedIn && data.user.isAdmin);
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    
    checkLoginStatus();
  }, [API_URL]);

  // 게시글 목록 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/qna/posts?page=${currentPage}&limit=${limit}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }
        
        const data: PostsResponse = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotalPosts(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '게시글 로딩 실패');
        console.error('게시글 로딩 중 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [API_URL, currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 글쓰기 버튼 클릭 핸들러
  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      alert('관리자만 글을 작성할 수 있습니다.');
      return;
    }
    
    navigate('/qna/write');
  };

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    // 최대 표시할 페이지 버튼 수
    const maxPageButtons = 5;
    const pageNumbers = [];
    
    // 현재 페이지 주변의 페이지 버튼만 표시
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // 표시할 페이지 버튼이 maxPageButtons보다 적을 경우 조정
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => handlePageChange(1)} 
          disabled={currentPage === 1}
          style={{ margin: '0 5px', padding: '5px 10px', cursor: currentPage === 1 ? 'default' : 'pointer' }}
        >
          {'<<'}
        </button>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          style={{ margin: '0 5px', padding: '5px 10px', cursor: currentPage === 1 ? 'default' : 'pointer' }}
        >
          {'<'}
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            style={{
              margin: '0 5px',
              padding: '5px 10px',
              backgroundColor: currentPage === number ? '#0082CC' : 'white',
              color: currentPage === number ? 'white' : 'black',
              border: currentPage === number ? '1px solid #0082CC' : '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            {number}
          </button>
        ))}
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          style={{ margin: '0 5px', padding: '5px 10px', cursor: currentPage === totalPages ? 'default' : 'pointer' }}
        >
          {'>'}
        </button>
        <button 
          onClick={() => handlePageChange(totalPages)} 
          disabled={currentPage === totalPages}
          style={{ margin: '0 5px', padding: '5px 10px', cursor: currentPage === totalPages ? 'default' : 'pointer' }}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Q&A</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p>게시글을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>
          <p>오류: {error}</p>
          
          {/* 오류 상태에서도 테이블과 버튼 표시 */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '10px', width: '10%' }}>번호</th>
                <th style={{ padding: '10px', width: '50%' }}>제목</th>
                <th style={{ padding: '10px', width: '15%' }}>작성자</th>
                <th style={{ padding: '10px', width: '15%' }}>작성일</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td colSpan={4} style={{ padding: '40px 0', textAlign: 'center' }}>
                  데이터를 불러오는데 실패했습니다. 다시 시도해주세요.
                </td>
              </tr>
            </tbody>
          </table>

          {/* 페이지네이션과 글쓰기 버튼 */}
          <div style={{ 
            position: 'relative',
            margin: '20px 0'
          }}>
            {isAdmin && (
              <div style={{ 
                position: 'absolute',
                right: 0,
                top: 0
              }}>
                <button 
                  onClick={handleWriteClick}
                  style={{
                    backgroundColor: '#0082CC',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  글쓰기
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '10px', width: '10%' }}>번호</th>
                <th style={{ padding: '10px', width: '50%' }}>제목</th>
                <th style={{ padding: '10px', width: '15%' }}>작성자</th>
                <th style={{ padding: '10px', width: '15%' }}>작성일</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td colSpan={4} style={{ padding: '40px 0', textAlign: 'center' }}>
                    게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} 
                      onClick={() => navigate(`/qna/post/${post.id}`)}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{post.id}</td>
                    <td style={{ padding: '12px', textAlign: 'left' }}>{post.title}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{post.author_name}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{formatDate(post.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* 페이지네이션과 글쓰기 버튼을 위한 컨테이너 */}
          <div style={{ 
            position: 'relative',
            margin: '20px 0'
          }}>
            {/* 페이지네이션 - 중앙 정렬, 게시글이 있을 때만 표시 */}
            {posts.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination />
              </div>
            )}
            
            {/* 글쓰기 버튼 - 관리자만 보이게 */}
            {isAdmin && (
              <div style={{ 
                position: 'absolute',
                right: 0,
                top: 0
              }}>
                <button 
                  onClick={handleWriteClick}
                  style={{
                    backgroundColor: '#0082CC',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  글쓰기
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QnAPage;
