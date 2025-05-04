import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App.tsx';

const API_URL = process.env.REACT_APP_API_URL;

const Navbar: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {    
    await fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 40px',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    zIndex: 1000
  };

  const linkStyle: React.CSSProperties = {
    margin: '0 15px',
    textDecoration: 'none',
    color: 'black',
    fontWeight: 'bold'
  };

  const centerNavWrapper: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '5vw',
    height: '100%',
    zIndex: 1
  };

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // 모바일 반응형: 세로 정렬 스타일
  const isMobile = window.innerWidth <= 768;
  const mobileNavStyle: React.CSSProperties = isMobile ? {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '16px 16px',
    height: 'auto',
    position: 'static',
    gap: 12
  } : {};
  const mobileCenterNavWrapper: React.CSSProperties = isMobile ? {
    position: 'static',
    left: 'unset',
    transform: 'none',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    margin: '12px 0'
  } : {};
  const mobileRight: React.CSSProperties = isMobile ? {
    marginLeft: 0,
    width: '100%',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8
  } : {};

  return (
    <nav style={{ ...navStyle, ...mobileNavStyle }}>
      <div style={isMobile ? { width: '100%', marginBottom: 8 } : {}}>
        <Link to="/" style={{ ...linkStyle, fontSize: '1.5em' }} onClick={handleNavClick}>LONEHEARTS.</Link>
      </div>
      <div style={{ ...centerNavWrapper, ...mobileCenterNavWrapper }}>
        <Link to="/community" style={linkStyle} onClick={handleNavClick}>community</Link>
        <Link to="/social" style={linkStyle} onClick={handleNavClick}>social</Link>
        <Link to="/match" style={linkStyle} onClick={handleNavClick}>match</Link>
      </div>
      <div style={{ marginLeft: isMobile ? 0 : 'auto', display: 'flex', alignItems: 'center', gap: 10, ...mobileRight }}>
        {user ? (
          <>
            <span style={{ fontWeight: 'bold', color: '#0082CC' }}>
              {user.username}
              {user.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF7A5A',
                    fontWeight: 'bold',
                    marginLeft: 6,
                    cursor: 'pointer',
                    fontSize: '1em',
                    padding: 0
                  }}
                >
                  (관리자)
                </button>
              )}
            </span>
            <button onClick={handleLogout} style={{
              background: 'none',
              color: 'black',
              border: 'none',
              borderRadius: 0,
              padding: '7px 18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1em',
              boxShadow: 'none'
            }}>로그아웃</button>
          </>
        ) : (
          <Link to="/login" style={linkStyle} onClick={handleNavClick}>로그인</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;