import React, { useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
import { useWorkflowStore } from '../store/workflowStore';
import { useThemeStore } from '../stores/themeStore';

const ThreeDView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const { nodes, edges } = useWorkflowStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the graph
    graphRef.current = ForceGraph3D()(containerRef.current)
      .backgroundColor(isDarkMode ? '#0A0A0A' : '#ffffff')
      .nodeColor(node => {
        const status = (node as any).status;
        switch (status) {
          case 'completed': return '#22c55e';
          case 'in-progress': return '#3b82f6';
          case 'delayed': return '#ef4444';
          default: return '#f59e0b';
        }
      })
      .nodeLabel(node => (node as any).label)
      .linkColor(() => isDarkMode ? '#404040' : '#e5e7eb')
      .linkWidth(2)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(2);

    // Clean up
    return () => {
      if (graphRef.current) {
        graphRef.current._destructor();
      }
    };
  }, [isDarkMode]);

  useEffect(() => {
    if (!graphRef.current) return;

    // Transform nodes and edges into the format expected by ForceGraph3D
    const graphData = {
      nodes: nodes.map(node => ({
        id: node.id,
        label: node.data.label,
        status: node.data.status,
      })),
      links: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: 1
      }))
    };

    graphRef.current.graphData(graphData);
  }, [nodes, edges]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
    />
  );
};

export default ThreeDView;