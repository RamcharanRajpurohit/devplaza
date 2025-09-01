import React from 'react';

const Settings: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center text-white">
    <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black p-8 rounded-lg shadow-xl w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">Settings</h2>
      <p className="text-gray-300">Profile settings and preferences will appear here.</p>
    </div>
  </div>
);

export default Settings;
