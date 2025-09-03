'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

interface SitingButtonProps {
  onClick: () => void;
  isActive: boolean;
}

const SitingButton: React.FC<SitingButtonProps> = ({ onClick, isActive }) => {
  // Prevent default behavior and stop propagation
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      className={`
        absolute top-4 left-4 z-10 
        px-3 py-2 
        rounded-md
        flex items-center 
        shadow-lg
        transition-colors
        ${isActive 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-white text-blue-600 hover:bg-gray-100'}
      `}
    >
      <MapPin className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">New Siting Analysis</span>
    </button>
  );
};

export default SitingButton;
