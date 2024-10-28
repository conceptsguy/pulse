import React from 'react';
import { LayoutGrid, Table2, Box, PanelLeftClose, PanelLeft, Plus } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

interface ViewSwitcherProps {
  currentView: 'canvas' | 'table' | '3d';
  onViewChange: (view: 'canvas' | 'table' | '3d') => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onAddActivity: () => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ 
  currentView, 
  onViewChange,
  isSidebarOpen,
  onToggleSidebar,
  onAddActivity
}) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <div className={`h-12 px-4 border-b flex items-center justify-between
      ${isDarkMode ? 'border-bolt-dark-border' : 'border-gray-200'}`}
    >
      <button
        onClick={onToggleSidebar}
        className={`p-2 rounded-lg transition-colors
          ${isDarkMode 
            ? 'hover:bg-bolt-dark-hover text-bolt-dark-text-secondary' 
            : 'hover:bg-gray-100 text-gray-600'}`}
      >
        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
      </button>

      <div className={`inline-flex rounded-lg p-1
        ${isDarkMode ? 'bg-bolt-dark-bg' : 'bg-gray-100'}`}
      >
        <button
          onClick={() => onViewChange('canvas')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${currentView === 'canvas'
              ? isDarkMode
                ? 'bg-bolt-dark-surface text-bolt-dark-text-primary'
                : 'bg-white text-gray-900 shadow-sm'
              : isDarkMode
                ? 'text-bolt-dark-text-secondary hover:text-bolt-dark-text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <LayoutGrid size={16} />
          Canvas
        </button>
        <button
          onClick={() => onViewChange('table')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${currentView === 'table'
              ? isDarkMode
                ? 'bg-bolt-dark-surface text-bolt-dark-text-primary'
                : 'bg-white text-gray-900 shadow-sm'
              : isDarkMode
                ? 'text-bolt-dark-text-secondary hover:text-bolt-dark-text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Table2 size={16} />
          Table
        </button>
        <button
          onClick={() => onViewChange('3d')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${currentView === '3d'
              ? isDarkMode
                ? 'bg-bolt-dark-surface text-bolt-dark-text-primary'
                : 'bg-white text-gray-900 shadow-sm'
              : isDarkMode
                ? 'text-bolt-dark-text-secondary hover:text-bolt-dark-text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Box size={16} />
          3D
        </button>
      </div>

      <button
        onClick={onAddActivity}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
          ${isDarkMode 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-blue-500 text-white hover:bg-blue-600'}`}
      >
        <Plus size={16} />
        Add Activity
      </button>
    </div>
  );
};

export default ViewSwitcher;