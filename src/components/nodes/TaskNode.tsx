import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Clock, CheckCircle, AlertCircle, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useThemeStore } from '../../stores/themeStore';

const statusIcons = {
  pending: AlertCircle,
  'in-progress': Clock,
  completed: CheckCircle,
  delayed: AlertTriangle,
};

interface TaskData {
  label: string;
  assignee?: string;
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  trade?: string;
  tradeColor?: string;
  isMilestone?: boolean;
  completion?: number;
}

interface TaskNodeProps {
  id: string;
  data: TaskData;
  selected: boolean;
}

const TaskNode: React.FC<TaskNodeProps> = ({ id, data, selected }) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [isHovered, setIsHovered] = useState(false);
  const [isDelayedDependent, setIsDelayedDependent] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const { getNodes, getEdges } = useReactFlow();
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const StatusIcon = statusIcons[data.status];

  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  // Check if this node is dependent on any delayed tasks
  useEffect(() => {
    const checkDelayedDependencies = () => {
      const nodes = getNodes();
      const edges = getEdges();
      const visited = new Set<string>();

      const findDelayedPredecessors = (nodeId: string): boolean => {
        if (visited.has(nodeId)) return false;
        visited.add(nodeId);

        const predecessors = edges
          .filter(edge => edge.target === nodeId)
          .map(edge => edge.source);

        for (const predId of predecessors) {
          const predNode = nodes.find(n => n.id === predId);
          if (predNode?.data.status === 'delayed' || findDelayedPredecessors(predId)) {
            return true;
          }
        }

        return false;
      };

      const isDependent = findDelayedPredecessors(id);
      setIsDelayedDependent(isDependent);
    };

    checkDelayedDependencies();
  }, [id, getNodes, getEdges, data.status]);

  const handleLabelSubmit = () => {
    if (label.trim()) {
      updateNode(id, {
        data: { ...data, label: label.trim() }
      });
    } else {
      setLabel(data.label);
    }
    setIsEditingLabel(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setLabel(data.label);
      setIsEditingLabel(false);
    }
    e.stopPropagation();
  };

  const getNodeStyle = () => {
    if (data.status === 'delayed' || isDelayedDependent) {
      return {
        backgroundColor: isDarkMode ? '#1F1515' : '#FEE2E2',
        borderColor: '#EF4444',
      };
    }
    return {
      backgroundColor: isDarkMode ? '#141414' : '#ffffff',
      borderColor: isDarkMode ? '#262626' : '#e5e7eb',
    };
  };

  if (data.isMilestone) {
    const milestoneStyle = data.status === 'delayed' || isDelayedDependent
      ? {
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
        }
      : {
          backgroundColor: data.tradeColor || (isDarkMode ? '#141414' : '#ffffff'),
          borderColor: data.tradeColor || (isDarkMode ? '#262626' : '#e5e7eb'),
        };

    return (
      <div className="relative">
        <div className="w-[120px] h-[120px] rotate-45 relative">
          <Handle
            type="target"
            position={Position.Left}
            className={`w-3 h-3 !bg-gray-400 cursor-crosshair hover:!bg-blue-500 
              transition-colors !opacity-0 group-hover:!opacity-100
              !border-2 ${isDarkMode ? '!border-bolt-dark-border' : '!border-gray-200'}`}
            style={{ 
              left: '0',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)'
            }}
          />
          <Handle
            type="source"
            position={Position.Right}
            className={`w-3 h-3 !bg-gray-400 cursor-crosshair hover:!bg-blue-500 
              transition-colors !opacity-0 group-hover:!opacity-100
              !border-2 ${isDarkMode ? '!border-bolt-dark-border' : '!border-gray-200'}`}
            style={{ 
              right: '0',
              top: '50%',
              transform: 'translate(50%, -50%) rotate(-45deg)'
            }}
          />
          <div 
            className={`absolute inset-0 shadow-lg border-2 transition-colors group
              ${selected ? 'ring-2 ring-blue-500' : ''} 
              hover:shadow-xl cursor-pointer
              ${isDarkMode ? 'shadow-black/20' : 'shadow-gray-200/50'}`}
            style={milestoneStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
              <h3 className="font-semibold text-white text-center px-4">
                {data.label}
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 !bg-gray-400 cursor-crosshair hover:!bg-blue-500 
          transition-colors !opacity-0 group-hover:!opacity-100
          !border-2 ${isDarkMode ? '!border-bolt-dark-border' : '!border-gray-200'}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !bg-gray-400 cursor-crosshair hover:!bg-blue-500 
          transition-colors !opacity-0 group-hover:!opacity-100
          !border-2 ${isDarkMode ? '!border-bolt-dark-border' : '!border-gray-200'}`}
      />

      <div 
        className={`group rounded-2xl overflow-hidden shadow-lg transition-all
          ${selected ? 'ring-2 ring-blue-500' : ''} 
          hover:shadow-xl cursor-pointer w-[280px]
          ${isDarkMode ? 'shadow-black/20' : 'shadow-gray-200/50'}
          ${data.status === 'delayed' || isDelayedDependent ? 'border-2 border-red-500' : ''}`}
        style={getNodeStyle()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Trade Badge */}
        {data.trade && (
          <div 
            className="px-3 py-1.5 text-sm font-medium"
            style={{ 
              backgroundColor: data.tradeColor,
              color: '#fff'
            }}
          >
            {data.trade}
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            {isEditingLabel ? (
              <input
                ref={labelInputRef}
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleLabelSubmit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className={`font-semibold text-xl px-2 py-1 rounded w-full
                  ${isDarkMode 
                    ? 'bg-bolt-dark-bg text-white' 
                    : 'bg-gray-100 text-gray-900'}`}
                autoFocus
              />
            ) : (
              <h3 
                className={`font-semibold text-xl cursor-text
                  ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingLabel(true);
                }}
              >
                {data.label}
              </h3>
            )}
            <button
              className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                ${isDarkMode 
                  ? 'hover:bg-bolt-dark-hover text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Status Icon */}
          <StatusIcon 
            className={`w-5 h-5 mb-4 ${
              data.status === 'completed' ? 'text-green-500' :
              data.status === 'in-progress' ? 'text-blue-500' :
              data.status === 'delayed' ? 'text-red-500' :
              'text-yellow-500'
            }`} 
          />

          {/* Delayed Warning */}
          {isDelayedDependent && (
            <div className="mb-4 text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} />
              Dependent on delayed task
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
          <div 
            className={`h-full transition-all duration-300 ${
              data.status === 'delayed' || isDelayedDependent
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${data.completion || 0}%` }}
          />
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between
          ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}
        >
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-semibold
              ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {data.completion || 0}%
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {data.assignee}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNode;