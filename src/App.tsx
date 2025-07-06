import React, { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Games } from './pages/Games';
import { Categories } from './pages/Categories';
import { GamePlayer } from './pages/GamePlayer';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Success } from './pages/Success';
import { Debug } from './pages/Debug';
import { StripeSetupPage } from './pages/StripeSetup';
import { AdminPanel } from './pages/Admin/AdminPanel';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 2s or until first paint
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <div className="loading-text">
                Loading
                <span className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            </div>
          )}
          <div className="App" style={{ filter: loading ? 'blur(2px)' : 'none' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<Games />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/games/:slug" element={<GamePlayer />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/success" element={<Success />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="/stripe-setup" element={<StripeSetupPage />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </Layout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;