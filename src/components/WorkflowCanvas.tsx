import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Node,
  Edge,
  Connection,
  Panel,
  MarkerType,
  useReactFlow,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Sparkles, 
  Command, 
  Undo2, 
  Redo2 
} from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useWorkflowStore } from '../store/workflowStore';
import TaskNode from './nodes/TaskNode';
import TaskDetails from './TaskDetails';
import ChatBot from './ChatBot';

const nodeTypes = {
  taskNode: TaskNode,
};

const getEdgeStyle = (isDarkMode: boolean, isSelected: boolean, sourceColor?: string, targetColor?: string, edgeId?: string) => {
  if (sourceColor && targetColor && edgeId) {
    return {
      stroke: `url(#gradient-${edgeId})`,
      strokeWidth: isSelected ? 3 : 2,
      transition: '0.3s ease-in-out',
    };
  }
  
  return {
    stroke: isDarkMode ? '#A3A3A3' : '#64748b',
    strokeWidth: isSelected ? 3 : 2,
    transition: '0.3s ease-in-out',
  };
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
  style: {
    transition: '0.3s ease-in-out',
  }
};

const WorkflowCanvas: React.FC = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const {
    nodes,
    edges,
    addNode,
    updateNode,
    removeNode,
    setEdges,
    addEdge,
    selectedNodeId,
    setSelectedNodeId,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useWorkflowStore();

  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && 'position' in change) {
        updateNode(change.id, { position: change.position });
      }
    });
  }, [updateNode]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const newEdges = edges.filter(edge => 
      !changes.some(change => 
        change.id === edge.id && change.type === 'remove'
      )
    );
    setEdges(newEdges);
  }, [edges, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;

    const newEdge: Edge = {
      id: `edge-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      animated: false,
      style: getEdgeStyle(isDarkMode, false),
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };

    const connectionExists = edges.some(
      edge => edge.source === connection.source && edge.target === connection.target
    );

    if (!connectionExists) {
      addEdge(newEdge);
    }
  }, [isDarkMode, edges, addEdge]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId]);

  // Create gradient definitions for edges
  const gradientDefs = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode?.data.tradeColor && targetNode?.data.tradeColor) {
      return (
        <svg key={`svg-${edge.id}`}>
          <defs>
            <linearGradient
              id={`gradient-${edge.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor={sourceNode.data.tradeColor}
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor={targetNode.data.tradeColor}
                stopOpacity={1}
              />
            </linearGradient>
          </defs>
        </svg>
      );
    }
    return null;
  });

  const edgesWithStyles = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    return {
      ...edge,
      style: getEdgeStyle(
        isDarkMode, 
        edge.id === selectedEdgeId,
        sourceNode?.data.tradeColor,
        targetNode?.data.tradeColor,
        edge.id
      ),
      className: edge.id === selectedEdgeId ? 'selected' : '',
    };
  });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    try {
      const json = event.dataTransfer.getData('application/json');
      if (!json) return;

      const data = JSON.parse(json);
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      if (data.type === 'template') {
        // Handle template drop
        const { template } = data;
        let lastNodeId: string | null = null;
        let baseX = position.x;
        let baseY = position.y;

        template.tasks.forEach((task: any, index: number) => {
          const nodeId = `node-${Date.now()}-${index}`;
          const newNode: Node = {
            id: nodeId,
            type: 'taskNode',
            position: {
              x: baseX + (index * 250),
              y: baseY,
            },
            data: {
              ...task,
              status: 'pending',
            },
          };

          addNode(newNode);

          if (lastNodeId) {
            const edgeId = `edge-${lastNodeId}-${nodeId}`;
            addEdge({
              id: edgeId,
              source: lastNodeId,
              target: nodeId,
              type: 'smoothstep',
              animated: false,
              style: getEdgeStyle(isDarkMode, false),
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            });
          }

          lastNodeId = nodeId;
        });
      } else {
        // Handle single trade drop
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: 'taskNode',
          position,
          data: {
            label: `New ${data.name} Task`,
            status: 'pending',
            trade: data.name,
            tradeColor: data.color,
          },
        };

        addNode(newNode);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [addNode, addEdge, isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          removeNode(selectedNodeId);
        }
        if (selectedEdgeId) {
          setEdges(edges.filter(edge => edge.id !== selectedEdgeId));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, removeNode, setEdges, edges]);

  return (
    <div className="relative flex-1 h-full">
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className={`text-center ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'}`}>
            <h3 className="text-xl font-medium mb-2">No activities yet</h3>
            <p className="text-sm mb-4">
              Drag trades from the library or use the add button below to create activities
            </p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edgesWithStyles}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode="strict"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode="Delete"
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Control"
        selectNodesOnDrag={false}
        className="touch-none"
        panOnDrag={true}
        snapToGrid={true}
        snapGrid={[20, 20]}
        connectOnClick={false}
      >
        {gradientDefs}
        <Background />

        <Panel position="bottom-center" className="bg-transparent">
          <div className={`flex gap-2 p-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-bolt-dark-surface' : 'bg-white'
          }`}>
            <button
              onClick={() => zoomIn()}
              className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500
                ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'}`}
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => zoomOut()}
              className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500
                ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'}`}
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={() => fitView({ duration: 500 })}
              className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500
                ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'}`}
              title="Fit View"
            >
              <Maximize size={20} />
            </button>
          </div>
        </Panel>

        <Panel position="bottom-left" className="m-4">
          <div className={`flex items-center gap-1 text-xs
            ${isDarkMode ? 'text-bolt-dark-text-tertiary' : 'text-gray-500'}`}
          >
            <Command size={14} />
            <span>Press</span>
            <kbd className={`px-1.5 py-0.5 rounded text-xs
              ${isDarkMode ? 'bg-bolt-dark-bg' : 'bg-gray-100'}`}
            >
              ⌘K
            </kbd>
            <span>for commands</span>
          </div>
        </Panel>

        <Panel position="bottom-right" className="mr-4 mb-4">
          <button
            onClick={() => setIsChatBotOpen(!isChatBotOpen)}
            className={`p-3 rounded-full shadow-lg transition-colors relative group
              ${isDarkMode 
                ? 'bg-gray-900 hover:bg-gray-800' 
                : 'bg-white hover:bg-gray-50'}`}
            title="Workflow Assistant"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ padding: '1px' }}>
              <div className={`w-full h-full rounded-full ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`} />
            </div>
            <div className="relative flex items-center gap-1">
              <Sparkles 
                size={20} 
                className={`${isDarkMode ? 'text-gray-100' : 'text-gray-700'}
                  transition-all group-hover:text-blue-500`}
              />
            </div>
          </button>
        </Panel>
      </ReactFlow>

      {selectedNode && (
        <div className="absolute top-0 right-0 h-full">
          <TaskDetails
            nodeId={selectedNode.id}
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={(id, data) => updateNode(id, { data })}
            onDelete={removeNode}
            onDuplicate={(id) => {
              const nodeToDuplicate = nodes.find(n => n.id === id);
              if (nodeToDuplicate) {
                const newNode = {
                  ...nodeToDuplicate,
                  id: `node-${Date.now()}`,
                  position: {
                    x: nodeToDuplicate.position.x + 50,
                    y: nodeToDuplicate.position.y + 50,
                  },
                };
                addNode(newNode);
              }
            }}
            edges={edges}
            nodes={nodes}
          />
        </div>
      )}

      {isChatBotOpen && (
        <ChatBot onClose={() => setIsChatBotOpen(false)} />
      )}
    </div>
  );
};

export default WorkflowCanvas;