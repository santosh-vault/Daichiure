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
import AdminBlogs from './pages/Admin/Blogs';
import { AdminLogin } from './pages/Admin/AdminLogin';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/Blogs/[id]';
import ScrollToTop from './components/ScrollToTop';
import { GoogleAnalyticsTracker } from './components/GoogleAnalyticsTracker';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import UserDashboard from './pages/Dashboard/UserDashboard';
import { AddEditArticle } from './pages/Dashboard/AddEditArticle';
import { AdminRouteGuard } from './components/AdminRouteGuard';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 2s or until first paint
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Add Article handler
  function AddArticleWrapper() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [notLoggedIn, setNotLoggedIn] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (data: any) => {
      setSubmitting(true);
      setError('');
      setSuccess('');
      let uploadedImageUrl = data.imageUrl;
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if (!user) {
        setNotLoggedIn(true);
        setError('You must be logged in to add an article.');
        setSubmitting(false);
        return;
      }
      
      // User authentication is handled by AdminRouteGuard
      // The user should already exist in the users table
      if (data.image && !data.imageUrl?.startsWith('http')) {
        const fileExt = data.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        try {
          const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, data.image);
          if (uploadError) {
            setError('Image upload failed. Please check if the blog-images bucket exists and you have upload permissions.');
            setSubmitting(false);
            return;
          }
          uploadedImageUrl = supabase.storage.from('blog-images').getPublicUrl(fileName).data.publicUrl;
        } catch (err) {
          setError('Unexpected error uploading image.');
          setSubmitting(false);
          return;
        }
      }
      const finalCategory = data.category === 'custom' ? data.customCategory : data.category;
      
      const articleData = {
        title: data.title || '',
        description: data.description || '',
        category: finalCategory || '',
        tags: data.tags || '',
        content: data.content || '',
        image_url: uploadedImageUrl || '',
        author_id: user.id,
      };
      
      const { error: insertError } = await supabase.from('blogs').insert([articleData]);
      
      if (insertError) {
        setError('Failed to add article: ' + insertError.message);
        setSubmitting(false);
        return;
      }
      setSuccess('Article added!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
      setSubmitting(false);
    };
    return (
      <>
        {notLoggedIn && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-center font-semibold">You must be logged in to add an article.</div>
        )}
        <AddEditArticle
          mode="add"
          loading={submitting}
          error={error}
          success={success}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
        />
      </>
    );
  }

  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <GoogleAnalyticsTracker />
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
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/dashboard" element={
                  <AdminRouteGuard>
                    <Dashboard />
                  </AdminRouteGuard>
                } />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/success" element={<Success />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="/stripe-setup" element={<StripeSetupPage />} />
                <Route path="/admin/blogs" element={
                  <AdminRouteGuard>
                    <AdminBlogs />
                  </AdminRouteGuard>
                } />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard/articles/new" element={
                  <AdminRouteGuard>
                    <AddArticleWrapper />
                  </AdminRouteGuard>
                } />
                <Route path="/dashboard/articles/edit/:id" element={
                  <AdminRouteGuard>
                    <AddEditArticle mode="edit" onSubmit={() => {}} onCancel={() => {}} />
                  </AdminRouteGuard>
                } />
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