import React from 'react';

const Footer: React.FC = () => {
    // 경계선 제거, 하단 고정
    const footerStyle: React.CSSProperties = {
        padding: '10px 20px',
        textAlign: 'center',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
    };

    return (
        <footer style={footerStyle}>
            <a href="/qa" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold', display: 'inline-block' }}>Q&A</a>
        </footer>
    );
};

export default Footer;