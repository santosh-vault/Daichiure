import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };

const AdminBlogs: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check admin authentication
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        window.location.href = '/admin/login';
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profile || profile.role !== 'admin') {
        window.location.href = '/admin/login';
      }
    };
    checkAdmin();
  }, []);

  // Handle image upload and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageUrl('');
    }
  };

  // Handle blog submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    let uploadedImageUrl = '';
    // Upload image to Supabase Storage if present
    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, image);
      if (uploadError) {
        setError('Image upload failed.');
        setLoading(false);
        return;
      }
      uploadedImageUrl = supabase.storage.from('blog-images').getPublicUrl(fileName).data.publicUrl;
    }
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    // Insert blog post
    const { error: insertError } = await supabase.from('blogs').insert([
      {
        title,
        description,
        content,
        category,
        image_url: uploadedImageUrl,
        author_id: user?.id || null,
      },
    ]);
    if (insertError) {
      setError('Failed to add blog post.');
      setLoading(false);
      return;
    }
    setSuccess('Blog post added successfully!');
    setTitle('');
    setDescription('');
    setContent('');
    setCategory('');
    setImage(null);
    setImageUrl('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black py-8" style={fontStyle}>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-xl flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Add New Blog Post</h1>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <textarea
          placeholder="Content (Markdown supported)"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[120px]"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <div>
          <label className="block text-white mb-2">Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-white" />
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="mt-2 rounded-lg max-h-40 border-2 border-amber-400" />
          )}
        </div>
        {error && <div className="text-red-400 text-center font-semibold">{error}</div>}
        {success && <div className="text-green-400 text-center font-semibold">{success}</div>}
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 rounded-lg transition-colors text-xl"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Blog Post'}
        </button>
      </form>
    </div>
  );
};

export default AdminBlogs; 