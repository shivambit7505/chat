import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import './index.css';

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/chats" /> : <AuthPage />} />
        <Route path="/chats" element={user ? <ChatPage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
