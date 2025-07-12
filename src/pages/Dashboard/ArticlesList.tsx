import React from 'react';
import { FileText, Edit, Trash2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  image_url: string;
  created_at: string;
}

interface ArticlesListProps {
  articles: Article[];
  loading: boolean;
  showDeleteId: string | null;
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

export const ArticlesList: React.FC<ArticlesListProps> = ({
  articles,
  loading,
  showDeleteId,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}) => {
  if (loading) {
    return <div className="flex justify-center py-10"><span className="animate-spin text-amber-400 w-10 h-10">Loading...</span></div>;
  }
  if (!articles.length) {
    return <div className="text-gray-400">No articles found.</div>;
  }
  return (
    <div className="flex flex-col divide-y divide-gray-700">
      {articles.map(article => (
        <div key={article.id} className="flex items-start gap-4 py-6">
          {article.image_url && <img src={article.image_url} alt={article.title} className="w-24 h-24 object-cover rounded-lg border-2 border-amber-400 flex-shrink-0" />}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-1">
              {article.category && <span className="bg-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">{article.category}</span>}
              {article.tags && article.tags.split(',').map(tag => <span key={tag.trim()} className="bg-gray-700 text-amber-300 px-2 py-1 rounded-full text-xs">{tag.trim()}</span>)}
            </div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><FileText className="w-5 h-5" />{article.title}</h3>
            <p className="text-gray-300 mb-1 line-clamp-2 min-h-[32px]">{article.description}</p>
            <div className="text-xs text-gray-400 mb-2">{new Date(article.created_at).toLocaleString()}</div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(article)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2" title="Edit Article"><Edit className="w-4 h-4" /> Edit</button>
              <button onClick={() => onDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2" title="Delete Article"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
            {/* Delete confirmation dialog */}
            {showDeleteId === article.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-fadeIn border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Delete Article?</h3>
                  <p className="text-gray-300 mb-6">Are you sure you want to delete <span className="font-bold text-amber-400">{article.title}</span>?</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => onConfirmDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Yes, Delete</button>
                    <button onClick={onCancelDelete} className="bg-gray-600 text-white px-6 py-2 rounded-lg font-bold">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 