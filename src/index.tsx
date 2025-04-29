import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 여기에 전역 스타일을 추가할 수 있습니다
import App from './App.tsx'; // App 컴포넌트는 라우팅과 레이아웃을 관리합니다
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);