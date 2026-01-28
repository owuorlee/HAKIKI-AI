/**
 * FraudGraph - 3D Force-Directed Graph Visualization
 * With "Red Mode" filter and fly-to camera animation
 */
import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import type { GraphData, GraphNode } from '../types';

interface FraudGraphProps {
    data?: GraphData;
    onNodeClick?: (node: GraphNode) => void;
    width?: number;
    height?: number;
    redMode?: boolean;
}

// Color mapping by node type
const NODE_COLORS: Record<string, string> = {
    employee: '#10b981',   // Green
    bank: '#ef4444',       // Red
    department: '#8b5cf6', // Purple
    device: '#3b82f6',     // Blue
};

const FraudGraph = forwardRef<any, FraudGraphProps>(({
    data,
    onNodeClick,
    width,
    height = 600,
    redMode = false,
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: width || 800, height });

    // Expose graphRef methods to parent
    useImperativeHandle(ref, () => ({
        cameraPosition: (pos: any, lookAt: any, duration: number) => {
            if (graphRef.current) {
                graphRef.current.cameraPosition(pos, lookAt, duration);
            }
        },
        zoomToFit: (duration: number) => {
            if (graphRef.current) {
                graphRef.current.zoomToFit(duration);
            }
        }
    }));

    // Handle container resize
    useEffect(() => {
        if (!containerRef.current || width) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height,
                });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [width, height]);

    // Filter graph data for "Red Mode" - Isolate fraud rings based on risk score
    const filteredData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };
        if (!redMode) return data;

        // Red Mode: Find high-risk employees (risk_score > 75) and their connections
        const suspectIds = new Set<string>();

        // First pass: Find all high-risk employees
        data.nodes.forEach((node: any) => {
            // Include high-risk employees
            if (node.risk_score && node.risk_score > 75) {
                suspectIds.add(node.id);
            }
            // Always include banks and devices as potential fraud hubs
            if (node.type === 'bank' || node.type === 'device') {
                suspectIds.add(node.id);
            }
        });

        // Second pass: Find everything connected to suspects (the "Ring")
        data.links.forEach((link: any) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            // If either end is a suspect, include both ends
            if (suspectIds.has(sourceId) || suspectIds.has(targetId)) {
                suspectIds.add(sourceId);
                suspectIds.add(targetId);
            }
        });

        // Only keep nodes that are in suspect set AND are either:
        // 1. High risk employees
        // 2. Banks/devices connected to high-risk employees
        const relevantNodes = data.nodes.filter((node: any) => suspectIds.has(node.id));

        return {
            nodes: relevantNodes,
            links: data.links.filter((link: any) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return suspectIds.has(sourceId) && suspectIds.has(targetId);
            })
        };
    }, [data, redMode]);

    // Node color based on type (brighter in red mode)
    const getNodeColor = useCallback((node: GraphNode) => {
        const baseColor = NODE_COLORS[node.type] || '#71717a';
        return baseColor;
    }, []);

    // Node size based on type AND risk
    const getNodeVal = useCallback((node: any) => {
        // Banks are always big (central hubs)
        if (node.type === 'bank') return redMode ? 15 : 8;
        if (node.type === 'department') return 6;
        if (node.type === 'device') return redMode ? 12 : 5;

        // For employees, size by risk score
        if (node.risk_score) {
            if (node.risk_score > 90) return redMode ? 12 : 6;
            if (node.risk_score > 75) return redMode ? 10 : 5;
        }
        return 3; // Normal employees are small
    }, [redMode]);

    // Handle node click with fly-to animation
    const handleNodeClick = useCallback((node: any) => {
        // Fly-to animation
        if (graphRef.current) {
            const distance = 150;
            const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);

            graphRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                node, // lookAt
                2000  // 2 second transition
            );
        }

        if (onNodeClick) {
            onNodeClick(node);
        }
    }, [onNodeClick]);

    // Empty state
    if (!data || data.nodes.length === 0) {
        return (
            <div
                ref={containerRef}
                className="flex items-center justify-center bg-[#12121a] rounded-xl border border-zinc-800"
                style={{ height }}
            >
                <div className="text-center text-zinc-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-lg">No graph data available</p>
                    <p className="text-sm">Run an audit to visualize the network</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative rounded-xl overflow-hidden border bg-[#0a0a0f] transition-all duration-500 ${redMode ? 'border-red-500/50 shadow-lg shadow-red-900/30' : 'border-zinc-800'
                }`}
        >
            {/* Legend */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Node Types
                </div>
                {Object.entries(NODE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-zinc-300 capitalize">{type}</span>
                    </div>
                ))}
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                <div className="text-xs text-zinc-400">
                    <span className="text-emerald-400 font-bold">{filteredData.nodes.length}</span> nodes ·
                    <span className="text-blue-400 font-bold ml-1">{filteredData.links.length}</span> links
                </div>
                {redMode && (
                    <div className="text-xs text-red-400 font-bold mt-1 animate-pulse">
                        🔴 SUSPECTS ONLY
                    </div>
                )}
            </div>

            {/* Click hint */}
            <div className="absolute bottom-4 right-4 z-10 text-xs text-zinc-600">
                Click nodes to inspect
            </div>

            <ForceGraph3D
                ref={graphRef}
                graphData={filteredData}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor={redMode ? '#0d0508' : '#0a0a0f'}
                nodeColor={getNodeColor}
                nodeVal={getNodeVal}
                nodeLabel={(node: any) => `${node.name} (${node.type})`}
                nodeOpacity={0.9}
                linkColor={() => redMode ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)'}
                linkWidth={redMode ? 1 : 0.5}
                linkOpacity={redMode ? 0.5 : 0.3}
                onNodeClick={handleNodeClick}
                enableNodeDrag={true}
                enableNavigationControls={true}
                showNavInfo={false}
            />
        </div>
    );
});

FraudGraph.displayName = 'FraudGraph';

export default FraudGraph;
