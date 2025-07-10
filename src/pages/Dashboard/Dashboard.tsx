import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileText, Settings as SettingsIcon, PlusCircle, Edit, Trash2, Loader, User as UserIcon, BookOpen, UploadCloud, Link2 } from 'lucide-react';

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
          image_url: uploadedImageUrl || ''
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 font-inter py-10 px-2 flex" style={fontStyle}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 rounded-2xl shadow-lg p-6 mr-8 flex flex-col gap-2 h-fit sticky top-10 self-start">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> Admin Menu</h2>
        <button
          className={`flex items-center gap-2 text-left px-4 py-2 rounded-lg font-semibold transition-colors group ${activeSection === 'users' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          onClick={() => setActiveSection('users')}
          title="View logged in users"
        >
          <Users className="w-5 h-5" /> Logged In Users
        </button>
        <button
          className={`flex items-center gap-2 text-left px-4 py-2 rounded-lg font-semibold transition-colors group ${activeSection === 'articles' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          onClick={() => setActiveSection('articles')}
          title="Manage articles"
        >
          <FileText className="w-5 h-5" /> Articles
        </button>
        <button
          className={`flex items-center gap-2 text-left px-4 py-2 rounded-lg font-semibold transition-colors group ${activeSection === 'settings' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          onClick={() => setActiveSection('settings')}
          title="Settings"
        >
          <SettingsIcon className="w-5 h-5" /> Settings
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto">
        {activeSection === 'articles' && (
          <>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 flex flex-col items-center">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2"><BookOpen className="w-7 h-7" /> Articles</h1>
              <p className="text-gray-300 mb-6 text-center">Manage your gaming news, blogs, and updates. Add, edit, or delete articles as needed.</p>
              {!showForm && (
                <button
                  className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-lg text-xl transition-colors shadow mb-2 flex items-center gap-2"
                  onClick={() => { setShowForm(true); setEditingId(null); setTitle(''); setDescription(''); setCategory(''); setCustomCategory(''); setTags(''); setContent(''); setImage(null); setImageUrl(''); setImageUrlInput(''); setError(''); setSuccess(''); }}
                  title="Add a new article"
                >
                  <PlusCircle className="w-6 h-6" /> Add Article
                </button>
              )}
            </div>
            {/* Inline Add/Edit Article Form */}
            {showForm && (
              <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 w-full animate-fadeIn">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">{editingId ? <Edit className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />} {editingId ? 'Edit Article' : 'Add New Article'}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white" required />
                  <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white" />
                  {/* Category dropdown with custom option */}
                  <div>
                    <label className="block text-white mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white w-full">
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      <option value="custom">Custom...</option>
                    </select>
                    {category === 'custom' && (
                      <input
                        type="text"
                        placeholder="Custom category"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        className="mt-2 px-4 py-3 rounded-lg bg-gray-700 text-white w-full"
                        disabled={category !== 'custom'}
                      />
                    )}
                  </div>
                  <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white" />
                  <textarea placeholder="Content (Markdown supported)" value={content} onChange={e => setContent(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white min-h-[100px]" required />
                  {/* Image upload: drag-and-drop, file, or URL */}
                  <div>
                    <label className="block text-white mb-2">Image</label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive ? 'border-amber-400 bg-gray-700' : 'border-gray-600 bg-gray-900'}`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="mx-auto mb-2 text-amber-400 w-8 h-8" />
                      <div className="text-gray-300">Drag & drop an image, or <span className="underline">click to select</span></div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Link2 className="text-amber-400 w-5 h-5" />
                      <input type="text" placeholder="Paste image URL" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-700 text-white flex-1" />
                      <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-bold" onClick={handleImageUrlPaste}>Use URL</button>
                    </div>
                    {(imageUrl || imageUrlInput) && (
                      <img src={imageUrl || imageUrlInput} alt="Preview" className="mt-2 rounded-lg max-h-32 border-2 border-amber-400 mx-auto" />
                    )}
                  </div>
                  {error && <div className="text-red-400 text-center font-semibold">{error}</div>}
                  {success && <div className="text-green-400 text-center font-semibold">{success}</div>}
                  <div className="flex gap-4">
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 rounded-lg transition-colors text-xl flex-1" disabled={loading}>
                      {editingId ? 'Update Article' : 'Add Article'}
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="bg-gray-600 text-white font-bold py-3 rounded-lg text-xl flex-1">Cancel</button>
                  </div>
                </form>
              </div>
            )}
            <div className="mb-8">
              {loading ? (
                <div className="flex justify-center py-10"><Loader className="animate-spin text-amber-400 w-10 h-10" /></div>
              ) : blogs.length === 0 ? (
                <div className="text-gray-400">No articles found.</div>
              ) : (
                <div className="space-y-6">
                  {blogs.map(blog => (
                    <div key={blog.id} className="bg-gray-800 rounded-xl p-6 shadow flex flex-col md:flex-row gap-6 items-center transition-all hover:shadow-amber-400/20">
                      {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-32 h-32 object-cover rounded-lg border-2 border-amber-400" />}
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {blog.category && <span className="bg-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">{blog.category}</span>}
                          {blog.tags && blog.tags.split(',').map(tag => <span key={tag.trim()} className="bg-gray-700 text-amber-300 px-2 py-1 rounded-full text-xs">{tag.trim()}</span>)}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><FileText className="w-5 h-5" />{blog.title}</h3>
                        <p className="text-gray-300 mb-2">{blog.description}</p>
                        <div className="text-xs text-gray-400 mb-2">{new Date(blog.created_at).toLocaleString()}</div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(blog)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2" title="Edit Article"><Edit className="w-4 h-4" /> Edit</button>
                          <button onClick={() => handleDelete(blog.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2" title="Delete Article"><Trash2 className="w-4 h-4" /> Delete</button>
                        </div>
                        {/* Delete confirmation dialog */}
                        {showDeleteId === blog.id && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-fadeIn">
                              <h3 className="text-xl font-bold text-white mb-4">Delete Article?</h3>
                              <p className="text-gray-300 mb-6">Are you sure you want to delete <span className="font-bold text-amber-400">{blog.title}</span>?</p>
                              <div className="flex gap-4 justify-center">
                                <button onClick={() => confirmDelete(blog.id)} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Yes, Delete</button>
                                <button onClick={() => setShowDeleteId(null)} className="bg-gray-600 text-white px-6 py-2 rounded-lg font-bold">Cancel</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {activeSection === 'users' && (
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2"><UserIcon className="w-7 h-7" /> Logged In Users</h1>
            {loadingUsers ? (
              <div className="flex justify-center py-10"><Loader className="animate-spin text-amber-400 w-10 h-10" /></div>
            ) : users.length === 0 ? (
              <div className="text-gray-400">No users found.</div>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="bg-gray-900 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-2 shadow hover:shadow-amber-400/20 transition-all">
                    <span className="font-bold text-white flex items-center gap-2"><UserIcon className="w-5 h-5" />{user.email}</span>
                    <span className="text-xs text-gray-400 ml-2">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeSection === 'settings' && (
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2"><SettingsIcon className="w-7 h-7" /> Settings</h1>
            <div className="text-gray-300">Settings page coming soon...</div>
          </div>
        )}
      </main>
    </div>
  );
};