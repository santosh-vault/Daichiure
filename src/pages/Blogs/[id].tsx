import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '@supabase/supabase-js';

const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };

interface Blog {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  tags: string;
  content: string;
  created_at: string;
}

interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, description, image_url, category, tags, content, created_at')
        .eq('id', id)
        .single();
      if (!error && data) setBlog(data);
      setLoading(false);
    };
    fetchBlog();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', id)
        .order('created_at', { ascending: true });
      if (!error && data) setComments(data);
    };
    fetchComments();
  }, [id]);

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    if (!user) {
      setCommentError('You must be logged in to comment.');
      return;
    }
    if (!commentInput.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    setCommentLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({ blog_id: id, user_id: user.id, content: commentInput.trim() })
      .select('*')
      .single();
    setCommentLoading(false);
    if (error) {
      setCommentError('Failed to post comment.');
      return;
    }
    setComments([...comments, data]);
    setCommentInput('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white" style={fontStyle}>Loading...</div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center text-white" style={fontStyle}>Article not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black py-10 px-2" style={fontStyle}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left: Main Blog Card */}
        <div className="w-full lg:w-3/4">
          <div className="w-full bg-gray-800 rounded-2xl shadow-lg p-8">
            <Link to="/blogs" className="text-amber-400 hover:underline mb-4 inline-block">← Back to Blogs</Link>
            <h1 className="text-4xl font-bold text-white mb-2">{blog.title}</h1>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {blog.category && <span className="bg-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">{blog.category}</span>}
              {blog.tags && blog.tags.split(',').map(tag => (
                <span key={tag.trim()} className="bg-gray-700 text-amber-300 px-2 py-1 rounded-full text-xs">{tag.trim()}</span>
              ))}
              <span className="text-xs text-gray-400 ml-auto">{new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
            {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-full rounded-lg mb-6 max-h-80 object-cover" />}
            <div className="text-lg text-gray-200 mb-4">{blog.description}</div>
            <div className="prose prose-invert max-w-none text-gray-100" style={{ fontFamily: 'inherit' }}>
              {blog.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
           {/* Comments Section */}
           <div className="mt-10">
             <h3 className="text-2xl font-bold text-white mb-4">Comments</h3>
             <div className="mb-6">
               {comments.length === 0 && <div className="text-gray-400">No comments yet. Be the first to comment!</div>}
               {comments.map(comment => (
                 <div key={comment.id} className="mb-4 p-4 bg-gray-900 rounded-lg shadow-sm">
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs text-amber-400 font-semibold">User</span>
                     <span className="text-xs text-gray-500 ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                   </div>
                   <div className="text-gray-200 text-base">{comment.content}</div>
                 </div>
               ))}
             </div>
             {user ? (
               <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
                 <textarea
                   className="bg-gray-800 text-gray-100 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                   rows={3}
                   placeholder="Add a comment..."
                   value={commentInput}
                   onChange={e => setCommentInput(e.target.value)}
                   disabled={commentLoading}
                 />
                 <button
                   type="submit"
                   className="self-end bg-amber-400 text-gray-900 px-5 py-2 rounded-full font-semibold hover:bg-amber-300 transition-colors disabled:opacity-60"
                   disabled={commentLoading}
                 >
                   {commentLoading ? 'Posting...' : 'Post Comment'}
                 </button>
                 {commentError && <div className="text-red-400 text-sm mt-1">{commentError}</div>}
               </form>
             ) : (
               <div className="text-gray-400">Login to add a comment.</div>
             )}
           </div>
          </div>
        </div>
        {/* Right: Sidebar (Ads/Highlights) */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="bg-gray-900 rounded-2xl shadow-md p-6 mb-6">
            <p className="text-amber-400 text-lg font-bold mb-2">Ad Space</p>
            <p className="text-gray-400 text-sm">Your ad or highlight could be here!</p>
          </div>
          <div className="bg-gray-900 rounded-2xl shadow-md p-6">
            <p className="text-amber-400 text-lg font-bold mb-2">Highlights</p>
            <p className="text-gray-400 text-sm">Showcase trending posts, author info, or more.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 