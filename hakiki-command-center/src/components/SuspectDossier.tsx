'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Files, AlertTriangle, Fingerprint, MapPin, X } from "lucide-react";

// Made props optional for static demo mode
interface SuspectDossierProps {
    node?: any;
    onClose?: () => void;
    onGenerateStop?: () => void;
}

export default function SuspectDossier({ node, onClose, onGenerateStop }: SuspectDossierProps) {
    // If no node passed, show a "Static Demo Node" or a placeholder state
    // ideally we show a demo dossier
    const displayNode = node || {
        id: "GHOST_X",
        name: "UNKNOWN ENTITY",
        risk: 99.9
    };

    return (
        <div className="h-full w-full bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-y-auto rounded-xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        TARGET DOSSIER
                    </h2>
                    <p className="text-sm text-slate-400 font-mono">ID: {displayNode.id}</p>
                </div>
            </div>

            {/* Profile */}
            <div className="bg-slate-800/50 p-4 rounded mb-6 border border-slate-700">
                <div className="w-24 h-24 bg-slate-700 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl">
                    👤
                </div>
                <h3 className="text-center text-lg font-bold text-white mb-1">{displayNode.name}</h3>
                <p className="text-center text-slate-400 text-sm">
                    STATUS: <span className="text-red-500 font-bold">ACTIVE THREAT</span>
                </p>
            </div>

            {/* Metrics */}
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Risk Score</span>
                    <span className="text-red-500 font-bold font-mono text-xl">{displayNode.risk}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 flex items-center gap-2"><Files className="w-4 h-4" /> Flagged By</span>
                    <span className="text-white font-mono">AI: INVESTIGATOR</span>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-auto">
                <button
                    onClick={onGenerateStop ? onGenerateStop : () => alert("STOP ORDER GENERATED")}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded animate-pulse shadow-lg shadow-red-900/50 flex items-center justify-center gap-2"
                >
                    <AlertTriangle /> GENERATE STOP ORDER
                </button>
            </div>
        </div>
    );
}
