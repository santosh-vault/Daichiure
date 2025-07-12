import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const SettingsPanel: React.FC = () => (
  <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-8 border border-gray-700">
    <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2"><SettingsIcon className="w-7 h-7" /> Settings</h1>
    <div className="text-gray-300">Settings page coming soon...</div>
  </div>
); 