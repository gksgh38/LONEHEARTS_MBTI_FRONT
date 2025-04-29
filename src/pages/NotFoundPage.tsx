import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div style={{ textAlign: 'center', marginTop: 100 }}>
    <h1>404</h1>
    <p>존재하지 않는 경로입니다.</p>
    <Link
      to="/"
      style={{
        display: 'inline-block',
        background: '#0082CC',
        color: '#fff',
        border: 'none',
        borderRadius: 20,
        padding: '10px 28px',
        fontWeight: 'bold',
        fontSize: '1.1em',
        textDecoration: 'none',
        marginTop: 32,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
      }}
    >
      메인으로 돌아가기
    </Link>
  </div>
);

export default NotFoundPage;
