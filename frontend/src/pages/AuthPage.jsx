import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }
    
    if (success) {
      navigate('/chats');
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-box glass-panel">
        <h1 className="auth-title">ConnectChatPro</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          {isLogin ? 'Sign in to continue' : 'Create an account'}
        </p>

        {error && <div style={{ color: '#EF4444', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="john@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
