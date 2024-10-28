import React, { useState, useMemo } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { tradeCategories } from '../data/trades';
import { GripVertical, Search } from 'lucide-react';

const TradeLibrary = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return tradeCategories;

    const query = searchQuery.toLowerCase().trim();
    return tradeCategories
      .map(category => ({
        ...category,
        trades: category.trades.filter(trade =>
          trade.name.toLowerCase().includes(query) ||
          category.name.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.trades.length > 0);
  }, [searchQuery]);

  const onDragStart = (event: React.DragEvent, trade: { name: string; color: string; id: string }) => {
    const dragImage = event.target.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(4deg)';
    dragImage.style.width = '200px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '1000';
    
    document.body.appendChild(dragImage);
    
    event.dataTransfer.setData('application/json', JSON.stringify(trade));
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setDragImage(dragImage, 100, 30);

    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trades"
            className={`w-full pl-7 pr-2 py-1 text-xs rounded-md border
              ${isDarkMode 
                ? 'bg-bolt-dark-bg border-bolt-dark-border text-bolt-dark-text-primary placeholder-bolt-dark-text-tertiary focus:border-bolt-dark-hover' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
              } focus:outline-none`}
          />
          <Search 
            size={12} 
            className={`absolute left-2 top-1/2 -translate-y-1/2 
              ${isDarkMode ? 'text-bolt-dark-text-tertiary' : 'text-gray-500'}`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.name} className="space-y-1">
              <div className={`px-2 py-1 text-sm font-medium ${
                isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'
              }`}>
                {category.name}
              </div>
              
              <div className="space-y-1">
                {category.trades.map((trade) => (
                  <div
                    key={trade.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, trade)}
                    className={`group p-2 rounded-md cursor-move text-sm transition-colors
                      ${isDarkMode 
                        ? 'hover:bg-bolt-dark-hover' 
                        : 'hover:bg-gray-50'}`}
                    style={{ 
                      backgroundColor: trade.color + '20',
                      borderLeft: `3px solid ${trade.color}`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-bolt-dark-text-primary' : 'text-gray-900'} select-none`}>
                        {trade.name}
                      </span>
                      <GripVertical 
                        size={14} 
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDarkMode ? 'text-bolt-dark-text-tertiary' : 'text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className={`px-4 py-3 text-sm ${
              isDarkMode ? 'text-bolt-dark-text-secondary' : 'text-gray-600'
            }`}>
              No trades found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeLibrary;