import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

// Using Inter font for a modern and readable look
const fontStyle = { fontFamily: '"Inter", sans-serif' };

interface Blog {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  tags: string;
  created_at: string;
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, description, image_url, category, tags, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) setBlogs(data);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  const featured = blogs[0];
  const highlightArticles = blogs.slice(1, 3); // Next two articles
  const mainArticles = blogs.slice(3, 9); // Remaining for recent posts
  let trendingArticles = blogs.slice(9, 12);
  // Fill with demo news if less than 3 trending articles
  if (trendingArticles.length < 3) {
    const demoSources = [featured, ...highlightArticles, ...mainArticles].filter(Boolean);
    for (let i = 0; trendingArticles.length < 3 && i < demoSources.length; i++) {
      // Avoid duplicates
      if (!trendingArticles.find(a => a.id === demoSources[i].id)) {
        trendingArticles.push(demoSources[i]);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 py-20 px-4 sm:px-6 lg:px-8" style={fontStyle}>
     

      {loading ? (
        <div className="text-white text-center text-xl animate-pulse">Loading captivating stories...</div>
      ) : blogs.length === 0 ? (
        <div className="text-white text-center text-xl">No blogs found. Our content creators are busy crafting something amazing!</div>
      ) : (
        <>
          {/* Top Section: Featured + 2 Highlights */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Featured Article (Big Card, 2/3 width) */}
            {featured ? (
              <Link
                to={`/blogs/${featured.id}`}
                className="md:col-span-2 block bg-gray-900 rounded-3xl shadow-2xl overflow-hidden group hover:shadow-amber-500/40 transition-all duration-700 ease-in-out border border-gray-800 hover:border-amber-400 relative h-full"
              >
                <div className="relative w-full h-[600px] overflow-hidden flex">
                  {featured.image_url && (
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110 brightness-90 group-hover:brightness-100 flex-1"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none" />
                  {featured.category && (
                    <span className="absolute top-6 right-6 bg-amber-500 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide z-40 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      {featured.category}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 w-full pl-8 pt-0 z-20 flex flex-col justify-end transition-transform duration-500 ease-in-out group-hover:-translate-y-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-1 leading-relaxed drop-shadow-lg">
                      {featured.title}
                    </h2>
                    <p className="text-gray-300 text-lg md:text-xl leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out delay-150 line-clamp-3">
                      {featured.description.split(' ').slice(0, 18).join(' ')}{featured.description.split(' ').length > 18 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ) : <div />}
            {/* Highlight Articles (2 stacked cards, 1/3 width) */}
            <div className="md:col-span-1 flex flex-col gap-8">
              {highlightArticles.map(blog => (
                <Link
                  to={`/blogs/${blog.id}`}
                  key={blog.id}
                  className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:scale-[1.01] transition-transform duration-300 ease-in-out flex flex-col border border-gray-800 hover:border-amber-400 group relative h-full"
                >
                  <div className="w-full h-36 overflow-hidden">
                    {blog.image_url && (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover object-center group-hover:brightness-90 transition-all duration-300 ease-in-out"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 p-5">
                    {blog.category && (
                      <span className="mb-2 inline-block text-yellow-400 px-2 py-0.5 rounded text-xs font-normal">
                        {blog.category}
                      </span>
                    )}
                    <h2 className="text-lg font-bold text-white mb-1 leading-relaxed truncate">
                      {blog.title}
                    </h2>
                    <p className="text-gray-300 text-base line-clamp-2">
                      {blog.description.split(' ').slice(0, 15).join(' ')}{blog.description.split(' ').length > 15 ? '...' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content: Recent Posts + Trending Sidebar */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-10">
            {/* Left Column: Main Articles & News */}
            <div className="lg:col-span-2 flex flex-col gap-16">
              {/* Recent Posts Grid (starts after highlights) */}
              <div>
                <div className="flex items-center mb-10">
                  <span className="hidden md:inline-block w-1 h-10 bg-amber-400 rounded-full mr-4"></span>
                  <h3 className="text-4xl font-bold text-white drop-shadow-lg">Recent Posts</h3>
                </div>
                <div className="flex flex-col gap-6">
                  {mainArticles.map(blog => (
                    <Link
                      to={`/blogs/${blog.id}`}
                      key={blog.id}
                      className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:scale-[1.01] transition-transform duration-300 ease-in-out flex flex-row border border-gray-800 hover:border-amber-400 group relative w-full"
                    >
                      {/* Image on the left */}
                      <div className="w-40 h-32 flex-shrink-0 overflow-hidden rounded-l-2xl">
                        {blog.image_url && (
                          <img
                            src={blog.image_url}
                            alt={blog.title}
                            className="w-full h-full object-cover object-center group-hover:brightness-90 transition-all duration-300 ease-in-out"
                          />
                        )}
                      </div>
                      {/* Content on the right */}
                      <div className="flex flex-col justify-center flex-1 p-5">
                        {blog.category && (
                          <span className="mb-2  inline-block text-yellow-400 px-2 py-0.5 rounded text-xs font-normal">
                            {blog.category}
                          </span>
                        )}
                        <h2 className="text-xl font-bold text-white mb-1 leading-relaxed truncate">
                          {blog.title}
                        </h2>
                        <p className="text-gray-300 text-base line-clamp-2">
                          {blog.description.split(' ').slice(0, 15).join(' ')}{blog.description.split(' ').length > 15 ? '...' : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Trending Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-8 pt-0 ">
              <div className="flex items-center  mt-3">
                <span className="hidden md:inline-block w-1 h-8 bg-amber-400 rounded-full mr-4"></span>
                <h3 className="text-3xl font-bold text-yellow-400 drop-shadow-lg inline-block rounded">Trending Articles</h3>
              </div>
              {trendingArticles.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {trendingArticles.map(item => (
                    <Link
                      to={`/blogs/${item.id}`}
                      key={item.id}
                      className="bg-gray-900 rounded-xl shadow-md overflow-hidden group hover:shadow-amber-500/15 transition-all duration-500 ease-in-out border border-gray-800 hover:border-amber-400 relative p-3 flex gap-4 items-center"
                    >
                      {item.image_url && (
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        {item.category && (
                          <span className="mb-2 inline-block  text-yellow-400 px-2 py-0.5 rounded text-xs font-normal">
                            {item.category}
                          </span>
                        )}
                        <h4 className="text-base font-semibold text-white  mb-1 leading-relaxed group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center">No trending articles.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Blogs;