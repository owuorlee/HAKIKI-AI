'use client';

import { useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

export default function FraudGraph() {
    // DUMMY NATIONAL DATA FOR VISUALIZATION
    const gData = {
        nodes: [
            { id: 'Employee_1', group: 1, val: 10 },
            { id: 'Employee_2', group: 1, val: 10 },
            { id: 'Bank_Account_X', group: 2, val: 50 }, // The Hub
            { id: 'Device_Z', group: 3, val: 30 },
            { id: 'Ghost_1', group: 1, val: 10 },
            { id: 'Ghost_2', group: 1, val: 10 },
        ],
        links: [
            { source: 'Employee_1', target: 'Bank_Account_X' },
            { source: 'Employee_2', target: 'Bank_Account_X' },
            { source: 'Ghost_1', target: 'Device_Z' },
            { source: 'Ghost_2', target: 'Device_Z' },
            { source: 'Ghost_1', target: 'Bank_Account_X' } // The Fraud Link
        ]
    };

    return (
        <div className="h-[600px] w-full border border-slate-700 bg-slate-900 rounded-xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-xs text-green-400 font-mono">
                LIVE FRAUD NETWORK VISUALIZATION
            </div>
            <ForceGraph3D
                graphData={gData}
                nodeAutoColorBy="group"
                nodeLabel="id"
                linkColor={() => 'rgba(255,255,255,0.2)'}
                backgroundColor="#0f172a" // Slate-900
            />
        </div>
    );
}
