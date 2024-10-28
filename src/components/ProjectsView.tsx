import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, Moon, Sun, User, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  tasksCount: number;
  milestonesCount: number;
}

interface ProjectsViewProps {
  onProjectSelect: (projectId: string) => void;
}

type SortField = 'name' | 'updatedAt' | 'tasksCount';
type SortDirection = 'asc' | 'desc';

const ProjectsView: React.FC<ProjectsViewProps> = ({ onProjectSelect }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Mock projects data - replace with actual data source
  const [projects] = useState<Project[]>([
    { 
      id: '1', 
      name: 'Construction Workflow', 
      updatedAt: '2024-03-15T10:00:00Z',
      tasksCount: 24,
      milestonesCount: 5
    },
    { 
      id: '2', 
      name: 'Renovation Project', 
      updatedAt: '2024-03-14T15:30:00Z',
      tasksCount: 18,
      milestonesCount: 3
    },
    { 
      id: '3', 
      name: 'Site Development', 
      updatedAt: '2024-03-13T09:45:00Z',
      tasksCount: 32,
      milestonesCount: 7
    },
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects]
    .filter(project => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * modifier;
        case 'updatedAt':
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * modifier;
        case 'tasksCount':
          return (a.tasksCount - b.tasksCount) * modifier;
        default:
          return 0;
      }
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  return (
    <>
      {/* Brand Header */}
      <header className={`h-12 border-b ${
        isDarkMode 
          ? 'bg-bolt-dark-bg border-bolt-dark-border text-bolt-dark-text-primary' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              <Activity size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Pulse
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isDarkMode ? 'hover:bg-bolt-dark-hover' : 'hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? (
                <Sun size={14} className="text-bolt-dark-text-secondary" />
              ) : (
                <Moon size={14} className="text-gray-600" />
              )}
            </button>

            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-bolt-dark-surface' : 'bg-gray-100'
            }`}>
              <User size={14} className={isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Projects Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-semibold
            ${isDarkMode ? 'text-bolt-dark-text-primary' : 'text-gray-900'}`}
          >
            Projects
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects"
                className={`w-64 pl-9 pr-3 py-1.5 rounded-md border text-sm transition-colors
                  ${isDarkMode 
                    ? 'bg-bolt-dark-bg border-bolt-dark-border text-bolt-dark-text-primary placeholder-bolt-dark-text-tertiary focus:border-bolt-dark-hover' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                  } focus:outline-none`}
              />
              <Search 
                size={14} 
                className={`absolute left-3 top-1/2 -translate-y-1/2
                  ${isDarkMode ? 'text-bolt-dark-text-tertiary' : 'text-gray-400'}`}
              />
            </div>
            <button
              className="px-3 py-1.5 rounded-md text-white flex items-center gap-2 transition-colors text-sm bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
            >
              <Plus size={14} />
              New Project
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className={`rounded-lg border overflow-hidden
          ${isDarkMode ? 'border-bolt-dark-border' : 'border-gray-200'}`}
        >
          <div className={`px-6 py-3 border-b text-xs font-medium grid grid-cols-12 gap-4
            ${isDarkMode 
              ? 'bg-bolt-dark-surface border-bolt-dark-border text-bolt-dark-text-secondary' 
              : 'bg-gray-50 border-gray-200 text-gray-500'}`}
          >
            <button 
              onClick={() => handleSort('name')}
              className="col-span-6 flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Name
              <SortIcon field="name" />
            </button>
            <button 
              onClick={() => handleSort('updatedAt')}
              className="col-span-3 flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Last edited
              <SortIcon field="updatedAt" />
            </button>
            <button 
              onClick={() => handleSort('tasksCount')}
              className="col-span-2 flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Activities
              <SortIcon field="tasksCount" />
            </button>
            <div className="col-span-1"></div>
          </div>

          <div className={isDarkMode ? 'divide-y divide-bolt-dark-border' : 'divide-y divide-gray-200'}>
            {sortedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onProjectSelect(project.id)}
                className={`px-6 py-3 grid grid-cols-12 gap-4 items-center cursor-pointer group transition-colors
                  ${isDarkMode 
                    ? 'hover:bg-bolt-dark-hover' 
                    : 'hover:bg-gray-50'}`}
              >
                <div className={`col-span-6 font-medium
                  ${isDarkMode ? 'text-bolt-dark-text-primary' : 'text-gray-900'}`}>
                  {project.name}
                </div>
                <div className={`col-span-3 text-sm
                  ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-500'}`}>
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
                <div className={`col-span-2 text-sm flex items-center gap-3
                  ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-1">
                    <span>{project.tasksCount}</span>
                    <span className="text-xs opacity-60">tasks</span>
                  </div>
                  <div className="w-px h-3 bg-current opacity-20" />
                  <div className="flex items-center gap-1">
                    <span>{project.milestonesCount}</span>
                    <span className="text-xs opacity-60">milestones</span>
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add menu handling here
                    }}
                    className={`p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity
                      ${isDarkMode 
                        ? 'hover:bg-bolt-dark-surface text-bolt-dark-text-secondary hover:text-bolt-dark-text-primary' 
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}

            {sortedProjects.length === 0 && (
              <div className={`px-6 py-8 text-center
                ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-500'}`}
              >
                {searchQuery
                  ? `No projects found matching "${searchQuery}"`
                  : 'No projects yet'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsView;