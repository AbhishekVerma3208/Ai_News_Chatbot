import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatInterface from './components/ChatInterface';
import { apiService } from './services/api';
import './styles/global.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState({
    node: 'checking',
    python: 'checking'
  });

  useEffect(() => {
    checkServerConnections();
  }, []);

  const checkServerConnections = async () => {
    try {
      console.log('🔍 Checking server connections...');
      console.log('📡 Node.js URL:', process.env.REACT_APP_API_URL || 'http://172.23.2.8:5001');
      console.log('🐍 Python URL:', process.env.REACT_APP_PYTHON_API_URL || 'http://172.23.2.8:5000');

      // Check Node.js server
      try {
        const nodeHealth = await apiService.auth.testConnection();
        console.log('✅ Node.js server connected:', nodeHealth);
        setServerStatus(prev => ({ ...prev, node: 'connected' }));
      } catch (nodeError) {
        console.error('❌ Node.js server connection failed:', nodeError.message);
        setServerStatus(prev => ({ ...prev, node: 'failed' }));
      }

      // Check Python server
      try {
        const pythonCategories = await apiService.news.getCategories();
        console.log('✅ Python server connected. Categories:', pythonCategories.categories?.length);
        setServerStatus(prev => ({ ...prev, python: 'connected' }));
      } catch (pythonError) {
        console.error('❌ Python server connection failed:', pythonError.message);
        setServerStatus(prev => ({ ...prev, python: 'failed' }));
      }

      // Show status toast
      if (serverStatus.node === 'connected' && serverStatus.python === 'connected') {
        toast.success('All servers connected successfully!');
      } else if (serverStatus.node === 'failed' && serverStatus.python === 'failed') {
        toast.error('Cannot connect to any server. Please check backend services.');
        setError('Both Node.js and Python servers are not responding');
      } else if (serverStatus.node === 'failed') {
        toast.error('Node.js server is not responding. Authentication may not work.');
      } else if (serverStatus.python === 'failed') {
        toast.error('Python server is not responding. News fetching may be limited.');
      }

    } catch (error) {
      console.error('❌ Connection check failed:', error);
      setError('Failed to check server connections');
    } finally {
      // Add a small delay for better UX
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const retryConnection = () => {
    setLoading(true);
    setError(null);
    setServerStatus({ node: 'checking', python: 'checking' });
    checkServerConnections();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-icon">🤖</div>
          <h2>AI News Chatbot</h2>
          <p>Loading your intelligent news assistant...</p>
          <div className="server-status">
            <div className={`status-item ${serverStatus.node}`}>
              <span className="status-dot"></span>
              Node.js Server {serverStatus.node === 'checking' ? '⏳' : serverStatus.node === 'connected' ? '✅' : '❌'}
            </div>
            <div className={`status-item ${serverStatus.python}`}>
              <span className="status-dot"></span>
              Python Server {serverStatus.python === 'checking' ? '⏳' : serverStatus.python === 'connected' ? '✅' : '❌'}
            </div>
          </div>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="error-details">
            <p>Server Status:</p>
            <ul>
              <li>Node.js: {serverStatus.node === 'connected' ? '✅ Connected' : '❌ Failed'}</li>
              <li>Python: {serverStatus.python === 'connected' ? '✅ Connected' : '❌ Failed'}</li>
            </ul>
          </div>
          <button 
            className="retry-button"
            onClick={retryConnection}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatInterface />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;