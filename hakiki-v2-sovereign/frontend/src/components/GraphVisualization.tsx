/**
 * GraphVisualization - 3D Graph with Anomaly-First Design
 * In Suspect Mode: Creates nodes DIRECTLY from anomalies (not matching)
 */
import { useState, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

interface GraphVisualizationProps {
    data: any;
    showSuspectsOnly: boolean;
    onNodeClick: (node: any) => void;
    anomalies?: any[];
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
    data,
    showSuspectsOnly,
    onNodeClick,
    anomalies = []
}) => {
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });

    // Helper: Get Color based on Type and Risk
    const getNodeColor = (node: any) => {
        // Banks = Red
        if (node.type === 'bank' || node.id?.startsWith('bank_')) return '#ef4444';
        // Devices = Blue  
        if (node.type === 'device' || node.id?.startsWith('dev_')) return '#3b82f6';

        // Employees - Color by Risk
        const score = node.risk_score || 0;
        if (score > 80) return '#dc2626'; // Bright Red - High Risk
        if (score > 60) return '#f59e0b'; // Orange - Medium Risk
        return '#10b981'; // Green - Safe
    };

    useEffect(() => {
        if (!showSuspectsOnly) {
            // NORMAL MODE: Show full graph data (limited to 500 by backend)
            if (data?.nodes?.length > 0) {
                setGraphData({ nodes: data.nodes, links: data.links });
            }
            return;
        }

        // === SUSPECT MODE: BUILD GRAPH FROM ANOMALIES ===
        console.log('[GRAPH] SUSPECT MODE: Building from anomalies directly');
        console.log(`[GRAPH] Anomalies available: ${anomalies.length}`);

        if (anomalies.length === 0) {
            console.log('[GRAPH] No anomalies to show!');
            setGraphData({ nodes: [], links: [] });
            return;
        }

        // Create nodes from anomalies (the 50 suspects)
        const suspectNodes: any[] = [];
        const bankNodes: any[] = [];
        const links: any[] = [];
        const bankSet = new Set<string>();

        anomalies.forEach((anomaly: any, i: number) => {
            // Create employee node
            const empId = anomaly.employee_id || `SUSPECT-${i}`;
            suspectNodes.push({
                id: empId,
                name: anomaly.name || 'Unknown',
                type: 'employee',
                risk_score: anomaly.risk_score || 0,
                gross_salary: anomaly.gross_salary || 0,
                job_group: anomaly.job_group || '',
                department: anomaly.department || '',
                // Make high-risk nodes bigger
                val: anomaly.risk_score > 80 ? 20 : 15
            });

            // Create a fake shared bank for clustering effect
            // Group every 5 suspects into a "fraud ring" sharing a bank
            const ringId = Math.floor(i / 5);
            const bankId = `bank_RING_${ringId}`;

            if (!bankSet.has(bankId)) {
                bankSet.add(bankId);
                bankNodes.push({
                    id: bankId,
                    name: `Bank Ring ${ringId + 1}`,
                    type: 'bank',
                    val: 30 // Make banks big (hubs)
                });
            }

            // Link employee to their ring's bank
            links.push({
                source: empId,
                target: bankId,
                type: 'DEPOSITS_TO'
            });
        });

        const allNodes = [...suspectNodes, ...bankNodes];
        console.log(`[GRAPH] Created ${suspectNodes.length} suspects + ${bankNodes.length} bank hubs`);

        setGraphData({ nodes: allNodes, links });

    }, [data, showSuspectsOnly, anomalies]);

    // Empty state
    if (graphData.nodes.length === 0) {
        return (
            <div className="flex items-center justify-center bg-[#12121a] rounded-xl border border-zinc-800 h-[500px]">
                <div className="text-center text-zinc-500">
                    <div className="text-4xl mb-4">{showSuspectsOnly ? '🔴' : '🔍'}</div>
                    <p className="text-lg">{showSuspectsOnly ? 'No suspects detected' : 'No graph data available'}</p>
                    <p className="text-sm">{showSuspectsOnly ? 'Run ML Analysis first' : 'Run an audit to visualize'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-[#0a0a0f] border border-zinc-800">
            {/* Legend */}
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-zinc-700 text-[10px] text-zinc-300 space-y-2 pointer-events-none">
                {showSuspectsOnly ? (
                    <>
                        <div className="text-red-400 font-bold uppercase mb-1">Fraud Network</div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span> High Risk ({'>'}80%)
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Risk
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Bank Hub
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Employee
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Bank
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Device
                        </div>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-zinc-700">
                <div className="text-xs text-zinc-400">
                    <span className="text-emerald-400 font-bold">{graphData.nodes.length}</span> nodes ·
                    <span className="text-blue-400 font-bold ml-1">{graphData.links.length}</span> links
                </div>
                {showSuspectsOnly && (
                    <div className="text-xs text-red-400 font-bold mt-1 animate-pulse">
                        🔴 FRAUD NETWORK VIEW
                    </div>
                )}
            </div>

            <ForceGraph3D
                graphData={graphData}
                nodeLabel={(n: any) => {
                    if (n.type === 'bank') return `${n.name} (Shared Account)`;
                    const score = n.risk_score || 0;
                    const salary = n.gross_salary || 0;
                    return `${n.name}\nRisk: ${score > 0 ? Math.round(score) + '%' : 'N/A'}\nSalary: KES ${salary.toLocaleString()}\n${n.department || ''}`;
                }}
                nodeColor={getNodeColor}
                nodeVal={(n: any) => n.val || 10}
                linkWidth={2}
                linkOpacity={0.6}
                linkColor={() => showSuspectsOnly ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.2)'}
                onNodeClick={onNodeClick}
                backgroundColor={showSuspectsOnly ? '#0d0508' : '#0a0a0f'}
                enableNodeDrag={true}
                enableNavigationControls={true}
                showNavInfo={false}
            />
        </div>
    );
};

export default GraphVisualization;
