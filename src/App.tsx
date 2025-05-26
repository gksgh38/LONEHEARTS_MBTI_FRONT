import React, { createContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import CommunityPage from './pages/CommunityPage.tsx';
import CommunityPostPage from './pages/CommunityPostPage.tsx';
import CommunityWritePage from './pages/CommunityWritePage.tsx';
import CommunityEditPage from './pages/CommunityEditPage.tsx';
import SocialPage from './pages/SocialPage.tsx';
import MatchPage from './pages/MatchPage.tsx';
import TestPage from './pages/TestPage.tsx';
import ResultPage from './pages/ResultPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import QnAPage from './pages/QnAPage.tsx';
import QnAPostPage from './pages/QnAPostPage.tsx';
import QnAWritePage from './pages/QnAWritePage.tsx';
import QnAEditPage from './pages/QnAEditPage.tsx';

const API_URL = process.env.REACT_APP_API_URL;

// 로그인 상태 Context 생성
export const UserContext = createContext<{
  user: { username: string; isAdmin?: boolean } | null;
  setUser: React.Dispatch<React.SetStateAction<{ username: string; isAdmin?: boolean } | null>>;
}>({ user: null, setUser: () => {} });

const App: React.FC = () => {
  const [user, setUser] = useState<{ username: string; isAdmin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 앱 시작 시 세션 확인
  useEffect(() => {
    fetch(`${API_URL}/api/session`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setUser(data.user);
        } else {
          setUser(null);
          // navigate는 여기서 하지 않고 조건부 렌더링으로 처리
        }
      })
      .catch((err) => {
        console.error('세션 확인 실패', err);
      })
      .finally(() => {
        setLoading(false); // ✅ 세션 체크 끝났음
      });
  }, []);

  if (loading) return <div>로딩 중...</div>; // ✅ 아직 세션 체크 중이면 대기

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Navbar />
      <div style={{ paddingTop: 80, paddingBottom: 60, minHeight: 'calc(100vh - 140px)' }}>
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/post/:id" element={<CommunityPostPage />} />
          <Route path="/community/write" element={<CommunityWritePage />} />
          <Route path="/community/edit/:id" element={<CommunityEditPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/result/:resultType" element={<ResultPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/qna" element={<QnAPage />} />
          <Route path="/qna/post/:id" element={<QnAPostPage />} />
          <Route path="/qna/write" element={<QnAWritePage />} />
          <Route path="/qna/edit/:id" element={<QnAEditPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </UserContext.Provider>
  );
};

export default App;