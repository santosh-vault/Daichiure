import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileText, Settings as SettingsIcon, PlusCircle, Edit, Trash2, Loader, User as UserIcon, BookOpen, UploadCloud, Link2, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArticlesList } from './ArticlesList';
import UsersList from './UsersList';
import { SettingsPanel } from './SettingsPanel';

const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };

const CATEGORY_OPTIONS = [
  'News',
  'Update',
  'Blog',
  'Review',
  'Guide',
  'Other',
];

interface Blog {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  image_url: string;
  content: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

export const Dashboard: React.FC = () => {
  // Sidebar navigation
  const [activeSection, setActiveSection] = useState<'articles' | 'users' | 'settings'>('articles');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Article form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Article list state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeSection === 'articles') fetchBlogs();
    if (activeSection === 'users') fetchUsers();
    setShowForm(false);
    setEditingId(null);
    setTitle(''); setDescription(''); setCategory(''); setCustomCategory(''); setTags(''); setContent(''); setImage(null); setImageUrl(''); setImageUrlInput(''); setError(''); setSuccess('');
  }, [activeSection]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, description, category, tags, content, image_url, created_at')
        .order('created_at', { ascending: false });
      if (error) {
        setError('Failed to fetch articles. Please check if the blogs table exists and has the correct columns.');
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

  // Handle image upload and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setImageUrl(URL.createObjectURL(file));
      setImageUrlInput('');
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
      setImageUrl(URL.createObjectURL(e.dataTransfer.files[0]));
      setImageUrlInput('');
    }
  };

  // Handle image URL input
  const handleImageUrlPaste = () => {
    setImage(null);
    setImageUrl(imageUrlInput);
  };

  // Handle add/edit submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    let uploadedImageUrl = imageUrl;
    if (image && !imageUrl.startsWith('http')) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      try {
        const { data, error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, image);
        if (uploadError) {
          setError('Image upload failed. Please check if the blog-images bucket exists and you have upload permissions.');
          return;
        }
        uploadedImageUrl = supabase.storage.from('blog-images').getPublicUrl(fileName).data.publicUrl;
      } catch (err) {
        setError('Unexpected error uploading image.');
        return;
      }
    }
    const finalCategory = category === 'custom' ? customCategory : category;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (editingId) {
      const { error: updateError } = await supabase.from('blogs').update({
        title: title || '',
        description: description || '',
        category: finalCategory || '',
        tags: tags || '',
        content: content || '',
        image_url: uploadedImageUrl || ''
      }).eq('id', editingId);
      if (updateError) {
        setError('Failed to update article.');
        return;
      }
      setSuccess('Article updated!');
    } else {
      const { error: insertError } = await supabase.from('blogs').insert([
        {
          title: title || '',
          description: description || '',
          category: finalCategory || '',
          tags: tags || '',
          content: content || '',
          image_url: uploadedImageUrl || '',
          author_id: user?.id || null
        }
      ]);
      if (insertError) {
        setError('Failed to add article.');
        return;
      }
      setSuccess('Article added!');
    }
    setTitle(''); setDescription(''); setCategory(''); setCustomCategory(''); setTags(''); setContent(''); setImage(null); setImageUrl(''); setImageUrlInput(''); setEditingId(null); setShowForm(false);
    fetchBlogs();
  };

  // Handle edit
  const handleEdit = (blog: Blog) => {
    setTitle(blog.title);
    setDescription(blog.description);
    setCategory(CATEGORY_OPTIONS.includes(blog.category) ? blog.category : 'custom');
    setCustomCategory(CATEGORY_OPTIONS.includes(blog.category) ? '' : blog.category);
    setTags(blog.tags || '');
    setContent(blog.content);
    setImageUrl(blog.image_url || '');
    setImageUrlInput('');
    setEditingId(blog.id);
    setImage(null);
    setSuccess('');
    setError('');
    setShowForm(true);
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

  // Cancel edit or add
  const handleCancelEdit = () => {
    setTitle(''); setDescription(''); setCategory(''); setCustomCategory(''); setTags(''); setContent(''); setImage(null); setImageUrl(''); setImageUrlInput(''); setEditingId(null); setSuccess(''); setError(''); setShowForm(false);
  };

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 font-inter flex flex-col" style={fontStyle}>
      {/* Topbar */}
     
      <div className="flex flex-1 w-full max-w-7xl mx-auto pt-6 pb-10 px-2 md:px-8 gap-6">
        {/* Sidebar - fixed full height on the extreme left */}
        <aside className={`fixed top-8 left-0 h-screen gap-3 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 bg-gray-900 rounded-none shadow-lg p-6 flex flex-col gap-2`} style={{borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem'}}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> Admin Menu</h2>
          <button
            className={`flex items-center gap-2 text-left px-4 py-4 rounded-lg font-semibold transition-colors group ${activeSection === 'users' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            onClick={() => { setActiveSection('users'); setSidebarOpen(false); }}
            title="View logged in users"
          >
            <Users className="w-5 h-5" /> Logged In Users
          </button>
          <button
            className={`flex items-center gap-2 text-left px-4 py-4 rounded-lg font-semibold transition-colors group ${activeSection === 'articles' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            onClick={() => { setActiveSection('articles'); setSidebarOpen(false); }}
            title="Manage articles"
          >
            <FileText className="w-5 h-5" /> Articles
          </button>
          <button
            className={`flex items-center gap-2 text-left px-4 py-4 rounded-lg font-semibold transition-colors group ${activeSection === 'settings' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            onClick={() => { setActiveSection('settings'); setSidebarOpen(false); }}
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" /> Settings
          </button>
        </aside>
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={handleSidebarToggle}></div>}
        {/* Main Content - add left margin for sidebar */}
        <main className="flex-1 max-w-3xl mx-auto w-full md:ml-64">
          {/* Section Divider */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500/30 via-amber-400/10 to-amber-500/30 rounded-full mb-8" />
          {activeSection === 'articles' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2"><BookOpen className="w-7 h-7" /> Articles</h1>
                <button
                  className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-lg text-xl transition-colors shadow flex items-center gap-2"
                  onClick={() => navigate('/dashboard/articles/new')}
                  title="Add a new article"
                >
                  <PlusCircle className="w-6 h-6" /> Add Article
                </button>
              </div>
              <div className="mb-8">
                <ArticlesList
                  articles={blogs}
                  loading={loading}
                  showDeleteId={showDeleteId}
                  onEdit={blog => navigate(`/dashboard/articles/edit/${blog.id}`)}
                  onDelete={handleDelete}
                  onConfirmDelete={confirmDelete}
                  onCancelDelete={() => setShowDeleteId(null)}
                />
              </div>
            </>
          )}
          {activeSection === 'users' && (
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 border border-gray-700">
              <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2"><UserIcon className="w-7 h-7" /> Logged In Users</h1>
              <UsersList users={users} loading={loadingUsers} />
            </div>
          )}
          {activeSection === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
};