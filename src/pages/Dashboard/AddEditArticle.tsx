import React, { useState, useRef } from 'react';
import { UploadCloud, Link2, Edit, PlusCircle, ArrowLeft, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_OPTIONS = [
  'News',
  'Update',
  'Blog',
  'Review',
  'Guide',
  'Other',
];

interface AddEditArticleProps {
  initialData?: {
    title: string;
    description: string;
    category: string;
    customCategory: string;
    tags: string;
    content: string;
    imageUrl: string;
  };
  loading?: boolean;
  error?: string;
  success?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  mode?: 'add' | 'edit';
}

export const AddEditArticle: React.FC<AddEditArticleProps> = ({
  initialData = {
    title: '',
    description: '',
    category: '',
    customCategory: '',
    tags: '',
    content: '',
    imageUrl: '',
  },
  loading = false,
  error = '',
  success = '',
  onSubmit,
  onCancel,
  mode = 'add',
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [category, setCategory] = useState(initialData.category);
  const [customCategory, setCustomCategory] = useState(initialData.customCategory);
  const [tags, setTags] = useState(initialData.tags);
  const [content, setContent] = useState(initialData.content);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl('');
    setImageUrlInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      customCategory,
      tags,
      content,
      image,
      imageUrl,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 py-10 px-2">
      {/* Page Header */}
      <div className="w-full max-w-3xl flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-amber-400 border border-gray-700 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          {mode === 'edit' ? <Edit className="w-7 h-7" /> : <PlusCircle className="w-7 h-7" />} {mode === 'edit' ? 'Edit Article' : 'Add New Article'}
        </h2>
      </div>
      {/* Form Card */}
      <form
        id="article-form"
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 flex flex-col md:flex-row gap-8 animate-fadeIn"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-white font-semibold mb-1">Title <span className="text-amber-400">*</span></label>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition w-full" required />
          </div>
          <div>
            <label className="block text-white font-semibold mb-1">Description</label>
            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition w-full" />
            <span className="text-xs text-gray-400">A short summary for your article.</span>
          </div>
          <div>
            <label className="block text-white font-semibold mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white w-full border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition">
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
                className="mt-2 px-4 py-3 rounded-lg bg-gray-700 text-white w-full border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition"
                disabled={category !== 'custom'}
              />
            )}
          </div>
          <div>
            <label className="block text-white font-semibold mb-1">Tags</label>
            <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition w-full" />
            <span className="text-xs text-gray-400">Separate tags with commas (e.g. action, multiplayer).</span>
          </div>
        </div>
        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-white font-semibold mb-1">Content <span className="text-amber-400">*</span></label>
            <textarea placeholder="Content (Markdown supported)" value={content} onChange={e => setContent(e.target.value)} className="px-4 py-3 rounded-lg bg-gray-700 text-white min-h-[280px] text-lg border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition w-full resize-vertical" required />
            <span className="text-xs text-gray-400">You can use Markdown for formatting.</span>
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Image</label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive ? 'border-amber-400 bg-gray-700' : 'border-gray-600 bg-gray-900'}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="mx-auto mb-2 text-amber-400 w-10 h-10" />
              <div className="text-gray-300">Drag & drop an image, or <span className="underline">click to select</span></div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Link2 className="text-amber-400 w-5 h-5" />
              <input type="text" placeholder="Paste image URL" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-700 text-white flex-1 border border-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition" />
              <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-bold" onClick={handleImageUrlPaste}>Use URL</button>
            </div>
            {(imageUrl || imageUrlInput) && (
              <div className="relative mt-4 flex flex-col items-center">
                <img src={imageUrl || imageUrlInput} alt="Preview" className="rounded-lg max-h-48 border-2 border-amber-400 shadow-lg" />
                <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-gray-900 bg-opacity-80 rounded-full p-1 text-red-400 hover:text-red-600 transition-colors" aria-label="Remove image">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            )}
            <span className="text-xs text-gray-400 block mt-2">Recommended: 800x400px or larger. JPG, PNG, or GIF.</span>
          </div>
        </div>
        {/* End Columns */}
      </form>
      {/* Error/Success and Actions */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 mt-6">
        {error && <div className="flex-1 text-red-400 text-center font-semibold flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> {error}</div>}
        {success && <div className="flex-1 text-green-400 text-center font-semibold flex items-center justify-center gap-2"><PlusCircle className="w-5 h-5" /> {success}</div>}
      </div>
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg text-xl flex-1 border border-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="article-form"
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 rounded-lg text-xl flex-1 border border-amber-400 shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {mode === 'edit' ? 'Update Article' : 'Add Article'}
        </button>
      </div>
    </div>
  );
}; 