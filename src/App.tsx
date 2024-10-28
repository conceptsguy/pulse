import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import WorkflowCanvas from './components/WorkflowCanvas';
import TableView from './components/TableView';
import ThreeDView from './components/ThreeDView';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import CommandBar from './components/CommandBar';
import ViewSwitcher from './components/ViewSwitcher';
import LoadingScreen from './components/LoadingScreen';
import { useThemeStore } from './stores/themeStore';
import { useWorkflowStore } from './store/workflowStore';
import ProjectsView from './components/ProjectsView';

const App = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const addNode = useWorkflowStore((state) => state.addNode);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'canvas' | 'table' | '3d'>('canvas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddActivity = () => {
    const basePosition = { x: 100, y: 100 };
    
    // If we have existing nodes, position the new node relative to them
    const existingNodes = useWorkflowStore.getState().nodes;
    if (existingNodes.length > 0) {
      const lastNode = existingNodes[existingNodes.length - 1];
      basePosition.x = lastNode.position.x + 250;
      basePosition.y = lastNode.position.y;
    }

    const newNode = {
      id: `node-${Date.now()}`,
      type: 'taskNode',
      position: basePosition,
      data: {
        label: 'New Activity',
        status: 'pending',
      }
    };

    addNode(newNode);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentProjectId) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-bolt-dark-bg' : 'bg-gray-100'}`}>
        <ProjectsView onProjectSelect={setCurrentProjectId} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-bolt-dark-bg' : 'bg-gray-100'}`}>
      <HeaderBar 
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        showProjectNav={true}
        onBackToProjects={() => setCurrentProjectId(null)}
        projectId={currentProjectId}
      />
      <ViewSwitcher 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onAddActivity={handleAddActivity}
      />
      <ReactFlowProvider>
        <div className="flex h-[calc(100vh-7rem)]">
          {isSidebarOpen && currentView !== '3d' && <Sidebar />}
          <div className="flex-1">
            {currentView === 'canvas' && <WorkflowCanvas />}
            {currentView === 'table' && <TableView />}
            {currentView === '3d' && <ThreeDView />}
          </div>
        </div>
      </ReactFlowProvider>
      <CommandBar 
        isOpen={isCommandBarOpen} 
        onClose={() => setIsCommandBarOpen(false)} 
      />
    </div>
  );
};

export default App;