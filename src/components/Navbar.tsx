import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App.tsx';

const Navbar: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
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

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{ ...linkStyle, fontSize: '1.5em' }} onClick={handleNavClick}>LONEHEARTS.</Link>
      </div>
      <div style={centerNavWrapper}>
        <Link to="/community" style={linkStyle} onClick={handleNavClick}>community</Link>
        <Link to="/social" style={linkStyle} onClick={handleNavClick}>social</Link>
        <Link to="/match" style={linkStyle} onClick={handleNavClick}>match</Link>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <span style={{ fontWeight: 'bold', color: '#0082CC' }}>{user.username}</span>
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