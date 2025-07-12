import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '@supabase/supabase-js';

// Consider using Google Fonts for a wider range of modern and appealing typefaces.
// For example, you could import 'Inter' or 'Montserrat' for a clean, professional look.
const fontStyle = { fontFamily: 'Inter, Helvetica, Arial, sans-serif' }; // Changed to Inter as an example

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black py-10 px-4 sm:px-6 lg:px-8" style={fontStyle}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Left: Main Blog Content */}
        <div className="w-full lg:w-3/4">
          <article className="w-full bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 border border-gray-700">
            <Link to="/blogs" className="text-amber-400 hover:text-amber-300 transition-colors duration-200 mb-6 inline-flex items-center group">
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span className="font-medium">Back to Blogs</span>
            </Link>

            <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">{blog.title}</h1>
            
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {blog.category && <span className="bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">{blog.category}</span>}
              {blog.tags && blog.tags.split(',').map(tag => (
                <span key={tag.trim()} className="bg-gray-700 text-amber-300 px-3 py-1 rounded-full text-xs opacity-90">{tag.trim()}</span>
              ))}
              <span className="text-sm text-gray-400 ml-auto flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            {/* Description placed above the image */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed italic">{blog.description}</p>
            
            {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-full rounded-xl mb-8 max-h-[400px] object-cover shadow-lg border border-gray-700" />}
            
            {/* Improved readability for the content */}
            <div className="prose prose-invert max-w-none text-gray-100 leading-relaxed text-lg" style={{ fontFamily: 'inherit' }}>
              {/* Using dangerouslySetInnerHTML for more complex HTML content from a rich text editor if available,
                  otherwise, keep the split('\n').map for simple line breaks.
                  For true readability, you might want a rich text editor that outputs HTML.
                  If 'blog.content' is plain text with just line breaks, the current approach is fine.
                  If it contains markdown, you'd need a markdown parser.
              */}
              {blog.content.split('\n').map((line, i) => (
                <p key={i} className="mb-4">{line}</p>
              ))}
            </div>

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <h3 className="text-3xl font-bold text-white mb-6">Comments</h3>
              <div className="mb-8 space-y-6">
                {comments.length === 0 && <div className="text-gray-400 text-lg">No comments yet. Be the first to share your thoughts!</div>}
                {comments.map(comment => (
                  <div key={comment.id} className="p-5 bg-gray-900 rounded-xl shadow-md border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-400 font-bold">Anonymous User</span>
                      <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-200 text-base leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
                  <textarea
                    className="bg-gray-800 text-gray-100 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400 text-base"
                    rows={4}
                    placeholder="Share your thoughts..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    disabled={commentLoading}
                  />
                  <button
                    type="submit"
                    className="self-end bg-amber-500 text-gray-900 px-7 py-3 rounded-full font-bold hover:bg-amber-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    disabled={commentLoading}
                  >
                    {commentLoading ? 'Posting Comment...' : 'Post Comment'}
                  </button>
                  {commentError && <div className="text-red-400 text-sm mt-2 text-center">{commentError}</div>}
                </form>
              ) : (
                <div className="text-gray-400 text-lg text-center p-6 bg-gray-900 rounded-xl border border-gray-700">
                  <Link to="/login" className="text-amber-400 hover:underline font-medium">Login</Link> to add a comment.
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Right: Sidebar (Ads/Highlights) */}
        <aside className="w-full lg:w-1/4 space-y-8">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700">
            <h4 className="text-amber-400 text-xl font-bold mb-3">Sponsor Spotlight</h4>
            <p className="text-gray-400 text-base">Your brand could be featured here, reaching a highly engaged audience!</p>
            <button className="mt-4 w-full bg-amber-500 text-gray-900 px-5 py-2.5 rounded-full font-semibold hover:bg-amber-400 transition-colors">
              Learn More
            </button>
          </div>
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700">
            <h4 className="text-amber-400 text-xl font-bold mb-3">More from the Blog</h4>
            <ul className="space-y-3 text-gray-300">
              <li><Link to="#" className="hover:text-amber-400 transition-colors">Top 5 React Hooks</Link></li>
              <li><Link to="#" className="hover:text-amber-400 transition-colors">Mastering Tailwind CSS</Link></li>
              <li><Link to="#" className="hover:text-amber-400 transition-colors">Supabase vs. Firebase</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogDetail;