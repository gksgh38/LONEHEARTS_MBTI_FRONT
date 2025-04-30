import React, { createContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import CommunityPage from './pages/CommunityPage.tsx';
import SocialPage from './pages/SocialPage.tsx';
import MatchPage from './pages/MatchPage.tsx';
import QAPage from './pages/QAPage.tsx';
import TestPage from './pages/TestPage.tsx';
import ResultPage from './pages/ResultPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import AdminPage from './pages/AdminPage.tsx';

const API_URL = process.env.REACT_APP_API_URL;

// 로그인 상태 Context 생성
export const UserContext = createContext<{
  user: { username: string; isAdmin?: boolean } | null;
  setUser: React.Dispatch<React.SetStateAction<{ username: string; isAdmin?: boolean } | null>>;
}>({ user: null, setUser: () => {} });

const App: React.FC = () => {
  const [user, setUser] = useState<{ username: string; isAdmin?: boolean } | null>(null);

  // 앱 시작 시 세션 확인
  useEffect(() => {
    fetch(`${API_URL}/api/session`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) setUser(data.user);
        else setUser(null);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Navbar />
      <div style={{ paddingTop: 80, paddingBottom: 60, minHeight: 'calc(100vh - 140px)' }}>
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/qa" element={<QAPage />} />
          <Route path="/result/:resultType" element={<ResultPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </UserContext.Provider>
  );
};

export default App;