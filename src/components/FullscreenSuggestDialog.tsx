import React from 'react';

interface FullscreenSuggestDialogProps {
  open: boolean;
  onClose: () => void;
  onGoFullscreen: () => void;
}

const FullscreenSuggestDialog: React.FC<FullscreenSuggestDialogProps> = ({ open, onClose, onGoFullscreen }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-gray-700 text-center relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-amber-400 text-xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Better Gaming Experience</h2>
        <p className="text-gray-200 mb-6">For the best experience, play in fullscreen mode!</p>
        <button
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
          onClick={onGoFullscreen}
        >
          Go Fullscreen
        </button>
      </div>
    </div>
  );
};

export default FullscreenSuggestDialog; 