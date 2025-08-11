// frontend/src/components/LibraryManager.tsx
import React, { useState } from 'react';


export const LibraryManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
        <p className="text-gray-600">Manage your digital book collection</p>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="text-center text-gray-500 py-8">
        <p>Library management features coming soon...</p>
      </div>
    </div>
  );
};
