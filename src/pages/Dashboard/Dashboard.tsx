import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileText, Settings as SettingsIcon, PlusCircle, Edit, Trash2, Loader, User as UserIcon, BookOpen, UploadCloud, Link2, Menu, X, Shield, BarChart2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArticlesList } from './ArticlesList';
import UsersList from './UsersList';
import { SettingsPanel } from './SettingsPanel';
import { AnalyticsPanel } from './AnalyticsPanel';
import { useAuth } from '../../contexts/AuthContext';

const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };

const SIDEBAR_LINKS = [
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'articles', label: 'Articles', icon: <FileText className="w-5 h-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
];

export const Dashboard: React.FC = () => {
  const { signOut } = useAuth();
  // Sidebar navigation
  const [activeSection, setActiveSection] = useState<'analytics' | 'articles' | 'users' | 'settings'>('analytics');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Article list state
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeSection === 'articles') fetchBlogs();
    if (activeSection === 'users') fetchUsers();
    setError(''); setSuccess('');
  }, [activeSection]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, description, category, tags, content, image_url, created_at')
        .order('created_at', { ascending: false });
      if (error) {
        setError('Failed to fetch articles.');
        setBlogs([]);
      } else if (data) {
        setBlogs(data);
      }
    } catch (err) {
      setError('Unexpected error fetching articles.');
      setBlogs([]);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoadingUsers(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    setShowDeleteId(id);
  };
  const confirmDelete = async (id: string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) {
      setSuccess('Article deleted.');
      fetchBlogs();
    } else {
      setError('Failed to delete article.');
    }
    setShowDeleteId(null);
  };

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 font-inter flex" style={fontStyle}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static w-64 glassmorphism bg-gradient-to-b from-gray-900/90 to-black/90 shadow-2xl border-r border-gray-800 p-6 flex flex-col gap-4`}>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-8 h-8 text-amber-400" />
          <span className="text-2xl font-extrabold tracking-tight text-white">Admin Panel</span>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4">
            {SIDEBAR_LINKS.map(link => (
              <button
                key={link.id}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-bold text-lg tracking-wide transition-colors rounded-lg border-l-4 border-transparent hover:bg-gray-800/80 hover:text-amber-400 ${activeSection === link.id ? 'text-amber-400 bg-gray-800/80 border-amber-400 shadow-inner' : 'text-gray-200'}`}
                onClick={() => { setActiveSection(link.id as any); setSidebarOpen(false); }}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-3 px-4 py-3 w-full text-left font-bold text-lg tracking-wide transition-colors rounded-lg border-l-4 border-transparent text-red-500 hover:bg-red-500/10 hover:text-red-400"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden" onClick={handleSidebarToggle}></div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Topbar */}
        <header className="sticky top-0 z-30 w-full bg-gray-950/80 backdrop-blur-md shadow-md border-b border-gray-800">
          <div className="px-4 sm:px-8 flex items-center justify-between h-20">
            <button className="md:hidden p-3 rounded-xl text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all duration-300" onClick={handleSidebarToggle}>
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex-1" /> {/* Spacer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full shadow text-amber-400 font-semibold">
                <UserIcon className="w-5 h-5" /> Admin
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 space-y-10 overflow-y-auto">
          {activeSection === 'analytics' && <AnalyticsPanel />}
          {activeSection === 'articles' && (
            <section className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-2"><BookOpen className="w-7 h-7 text-amber-400" /> Articles</h1>
                <button
                  className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-lg text-xl transition-colors shadow flex items-center gap-2"
                  onClick={() => navigate('/dashboard/articles/new')}
                  title="Add a new article"
                >
                  <PlusCircle className="w-6 h-6" /> Add Article
                </button>
              </div>
              <ArticlesList
                articles={blogs}
                loading={loading}
                showDeleteId={showDeleteId}
                onEdit={blog => navigate(`/dashboard/articles/edit/${blog.id}`)}
                onDelete={handleDelete}
                onConfirmDelete={confirmDelete}
                onCancelDelete={() => setShowDeleteId(null)}
              />
            </section>
          )}
          {activeSection === 'users' && (
            <section className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-8">
              <h1 className="text-3xl font-extrabold text-white mb-4 flex items-center gap-2"><UserIcon className="w-7 h-7 text-amber-400" /> Users</h1>
              <UsersList users={users} loading={loadingUsers} onUserDeleted={fetchUsers} />
            </section>
          )}
          {activeSection === 'settings' && (
            <section className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-8">
              <SettingsPanel />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};