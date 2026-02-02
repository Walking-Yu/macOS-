import React from 'react';

interface MenuBarProps {
  totalKeystrokes: number;
}

const MenuBar: React.FC<MenuBarProps> = ({ totalKeystrokes }) => {
  return (
    <div className="w-full h-8 bg-white/80 backdrop-blur-md border-b border-macos-border flex items-center justify-between px-4 fixed top-0 left-0 z-50 text-xs font-medium text-gray-700 shadow-sm select-none">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-black"> KeyFlow</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">Total Hits:</span>
          <span className="font-mono text-macos-accent font-semibold">{totalKeystrokes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;