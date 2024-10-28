import React, { useState } from 'react';
import { Edit2, MoreHorizontal, GripVertical, Check, ChevronDown, Trash2, PanelRightOpen } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useWorkflowStore } from '../store/workflowStore';
import { trades } from '../data/trades';
import TaskDetails from './TaskDetails';

interface EditingCell {
  nodeId: string;
  field: string;
  value: string;
}

interface Column {
  id: string;
  label: string;
  field: string;
  width: string;
}

const defaultColumns: Column[] = [
  { id: 'label', label: 'Task Name', field: 'label', width: 'min-w-[200px]' },
  { id: 'trade', label: 'Trade', field: 'trade', width: 'min-w-[120px]' },
  { id: 'status', label: 'Status', field: 'status', width: 'min-w-[120px]' },
  { id: 'duration', label: 'Duration', field: 'duration', width: 'min-w-[100px]' },
];

const TableView = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { nodes, edges, updateNode, removeNode, setSelectedNodeId, selectedNodeId } = useWorkflowStore();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTradeDropdownOpen, setIsTradeDropdownOpen] = useState(false);

  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  const handleEdit = (nodeId: string, field: string, value: string) => {
    setEditingCell({ nodeId, field, value: value || '' });
  };

  const handleEditSubmit = () => {
    if (!editingCell) return;

    updateNode(editingCell.nodeId, {
      data: {
        ...nodes.find(n => n.id === editingCell.nodeId)?.data,
        [editingCell.field]: editingCell.value
      }
    });
    setEditingCell(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, column: Column) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggedColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, targetColumn: Column) => {
    e.preventDefault();
    if (!draggedColumn || targetColumn.id === draggedColumn.id) return;

    const newColumns = [...columns];
    const draggedIdx = columns.findIndex(col => col.id === draggedColumn.id);
    const targetIdx = columns.findIndex(col => col.id === targetColumn.id);

    newColumns.splice(draggedIdx, 1);
    newColumns.splice(targetIdx, 0, draggedColumn);

    setColumns(newColumns);
  };

  const handleRowSelect = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newSelected = new Set(selectedNodes);
    
    if (e.shiftKey && selectedNodes.size > 0) {
      const nodeIds = nodes.map(n => n.id);
      const lastSelected = Array.from(selectedNodes).pop()!;
      const lastIdx = nodeIds.indexOf(lastSelected);
      const currentIdx = nodeIds.indexOf(nodeId);
      const [start, end] = [Math.min(lastIdx, currentIdx), Math.max(lastIdx, currentIdx)];
      
      for (let i = start; i <= end; i++) {
        newSelected.add(nodeIds[i]);
      }
    } else if (e.metaKey || e.ctrlKey) {
      if (selectedNodes.has(nodeId)) {
        newSelected.delete(nodeId);
      } else {
        newSelected.add(nodeId);
      }
    } else {
      newSelected.clear();
      newSelected.add(nodeId);
    }
    
    setSelectedNodes(newSelected);
  };

  const handleBulkEdit = (field: string, value: string) => {
    selectedNodes.forEach(nodeId => {
      updateNode(nodeId, {
        data: {
          ...nodes.find(n => n.id === nodeId)?.data,
          [field]: value
        }
      });
    });
    setIsStatusDropdownOpen(false);
    setIsTradeDropdownOpen(false);
  };

  const handleBulkDelete = () => {
    selectedNodes.forEach(nodeId => {
      removeNode(nodeId);
    });
    setSelectedNodes(new Set());
  };

  const renderCell = (node: any, field: string) => {
    const isEditing = editingCell?.nodeId === node.id && editingCell?.field === field;
    const value = node.data[field];

    if (isEditing) {
      return (
        <input
          type="text"
          value={editingCell.value}
          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
          onBlur={handleEditSubmit}
          onKeyDown={handleEditKeyDown}
          className={`w-full px-2 py-1 rounded text-sm ${
            isDarkMode 
              ? 'bg-bolt-dark-surface text-bolt-dark-text-primary border-bolt-dark-border' 
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
          autoFocus
        />
      );
    }

    if (field === 'status') {
      const statusColors = isDarkMode ? {
        completed: 'bg-green-500/20 text-green-300 ring-green-500/30',
        'in-progress': 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
        delayed: 'bg-red-500/20 text-red-300 ring-red-500/30',
        pending: 'bg-yellow-500/20 text-yellow-300 ring-yellow-500/30'
      } : {
        completed: 'bg-green-50 text-green-700 ring-green-600/20',
        'in-progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
        delayed: 'bg-red-50 text-red-700 ring-red-600/20',
        pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
      };

      return (
        <div 
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset
            ${statusColors[value as keyof typeof statusColors]}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </div>
      );
    }

    if (field === 'trade') {
      const trade = trades.find(t => t.name === value);
      if (!trade) return null;
      
      return (
        <div 
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: isDarkMode ? `${trade.color}30` : `${trade.color}20`,
            color: isDarkMode ? `${trade.color}CC` : trade.color,
            width: 'fit-content',
            minWidth: '80px',
            justifyContent: 'center'
          }}
        >
          {trade.name}
        </div>
      );
    }

    return (
      <div 
        className="flex items-center justify-between group cursor-pointer"
        onClick={() => handleEdit(node.id, field, value)}
      >
        <span className={`text-sm ${isDarkMode ? 'text-bolt-dark-text-primary' : 'text-gray-900'}`}>
          {value}
        </span>
        <Edit2 
          size={14} 
          className={`opacity-0 group-hover:opacity-100 transition-opacity
            ${isDarkMode ? 'text-bolt-dark-text-tertiary' : 'text-gray-400'}`}
        />
      </div>
    );
  };

  const renderBulkEditDropdown = () => {
    if (!selectedNodes.size) return null;

    return (
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg text-xs
        ${isDarkMode ? 'bg-bolt-dark-surface' : 'bg-white'}`}
      >
        <span className={`${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'}`}>
          {selectedNodes.size} selected
        </span>

        <div className="h-3 w-px bg-gray-300" />

        <button
          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors
            ${isDarkMode 
              ? 'hover:bg-bolt-dark-hover text-bolt-dark-text-primary' 
              : 'hover:bg-gray-100 text-gray-900'}`}
        >
          Status
          <ChevronDown size={12} />
        </button>

        {isStatusDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsStatusDropdownOpen(false)}
            />
            <div className={`absolute bottom-full left-0 mb-1 w-32 rounded-lg shadow-lg py-1 z-20
              ${isDarkMode ? 'bg-bolt-dark-bg' : 'bg-white'}`}
            >
              {['pending', 'in-progress', 'completed', 'delayed'].map(status => (
                <button
                  key={status}
                  onClick={() => handleBulkEdit('status', status)}
                  className={`w-full px-3 py-1.5 text-xs text-left flex items-center
                    ${isDarkMode 
                      ? 'hover:bg-bolt-dark-hover text-bolt-dark-text-primary' 
                      : 'hover:bg-gray-100 text-gray-900'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => setIsTradeDropdownOpen(!isTradeDropdownOpen)}
          className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors
            ${isDarkMode 
              ? 'hover:bg-bolt-dark-hover text-bolt-dark-text-primary' 
              : 'hover:bg-gray-100 text-gray-900'}`}
        >
          Trade
          <ChevronDown size={12} />
        </button>

        {isTradeDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsTradeDropdownOpen(false)}
            />
            <div className={`absolute bottom-full left-0 mb-1 w-40 rounded-lg shadow-lg py-1 z-20
              ${isDarkMode ? 'bg-bolt-dark-bg' : 'bg-white'}`}
            >
              {trades.map(trade => (
                <button
                  key={trade.id}
                  onClick={() => {
                    handleBulkEdit('trade', trade.name);
                    handleBulkEdit('tradeColor', trade.color);
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left flex items-center gap-2
                    ${isDarkMode 
                      ? 'hover:bg-bolt-dark-hover text-bolt-dark-text-primary' 
                      : 'hover:bg-gray-100 text-gray-900'}`}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: trade.color }}
                  />
                  {trade.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="h-3 w-px bg-gray-300" />

        <button
          onClick={handleBulkDelete}
          className={`px-2 py-1 rounded flex items-center gap-1.5 text-red-500 transition-colors
            ${isDarkMode ? 'hover:bg-bolt-dark-hover' : 'hover:bg-gray-100'}`}
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="relative flex-1 h-full">
      <div className={`h-full overflow-auto ${isDarkMode ? 'bg-bolt-dark-bg' : 'bg-gray-50'}`}>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className={isDarkMode ? 'bg-bolt-dark-surface' : 'bg-white'}>
              <th className="w-8 px-4 py-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNodes.size === nodes.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNodes(new Set(nodes.map(n => n.id)));
                      } else {
                        setSelectedNodes(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </div>
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, column)}
                  className={`sticky top-0 px-4 py-2 text-left text-xs font-medium select-none
                    ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-500'}
                    ${column.width}`}
                >
                  <div className="flex items-center gap-2 group">
                    <GripVertical 
                      size={14} 
                      className={`opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing
                        ${isDarkMode ? 'text-bolt-dark-text-tertiary' : 'text-gray-400'}`}
                    />
                    {column.label}
                  </div>
                </th>
              ))}
              <th className={`sticky top-0 w-8 px-4 py-2 text-left text-xs font-medium ${
                isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-500'
              }`}>
                <MoreHorizontal size={16} />
              </th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr 
                key={node.id}
                onClick={(e) => handleRowSelect(node.id, e)}
                className={`border-t cursor-pointer select-none
                  ${isDarkMode 
                    ? 'border-bolt-dark-border hover:bg-bolt-dark-surface' 
                    : 'border-gray-200 hover:bg-gray-50'}
                  ${selectedNodes.has(node.id) 
                    ? isDarkMode
                      ? 'bg-bolt-dark-hover'
                      : 'bg-blue-50'
                    : ''
                  }`}
              >
                <td className="w-8 px-4 py-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNodes.has(node.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300"
                    />
                  </div>
                </td>
                {columns.map((column) => (
                  <td key={`${node.id}-${column.id}`} className="px-4 py-2">
                    {renderCell(node, column.field)}
                  </td>
                ))}
                <td className="px-4 py-2 w-8">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    className={`p-1 rounded-lg hover:bg-opacity-10 hover:bg-gray-500
                      ${isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-400'}`}
                  >
                    <PanelRightOpen size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {renderBulkEditDropdown()}
      </div>

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
                updateNode(newNode.id, newNode);
              }
            }}
            edges={edges}
            nodes={nodes}
          />
        </div>
      )}
    </div>
  );
};

export default TableView;