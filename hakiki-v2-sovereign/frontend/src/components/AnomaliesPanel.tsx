/**
 * AnomaliesPanel - Salary anomalies side panel
 * With search, histogram, evidence panel, and Stop Order confirmation
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle, DollarSign, User, Briefcase, FileText,
    Loader2, Search, AlertTriangle
} from 'lucide-react';
import type { SalaryAnomaly } from '../types';
import ScoreHistogram from './ScoreHistogram';
import EvidencePanel from './EvidencePanel';

const API_BASE = 'http://localhost:8000/api/v1';

interface AnomaliesPanelProps {
    anomalies: SalaryAnomaly[];
    loading?: boolean;
    onAnalyze: () => void;
    onTreasuryLock?: (name: string, id: string) => void;
}

const AnomaliesPanel: React.FC<AnomaliesPanelProps> = ({ anomalies, loading, onAnalyze, onTreasuryLock }) => {
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stopOrderTarget, setStopOrderTarget] = useState<SalaryAnomaly | null>(null);
    const [selectedSuspect, setSelectedSuspect] = useState<SalaryAnomaly | null>(null);

    // Filter anomalies by search term
    const filteredAnomalies = anomalies.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.job_group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateStopOrder = async (anomaly: SalaryAnomaly) => {
        setGeneratingId(anomaly.employee_id);
        setStopOrderTarget(null);

        // Trigger Treasury Lock effect in parent
        if (onTreasuryLock) {
            onTreasuryLock(anomaly.name, anomaly.employee_id);
        }

        try {
            const response = await fetch(`${API_BASE}/audit/generate-stop-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: anomaly.name,
                    national_id: anomaly.national_id || 'N/A',
                    employee_id: anomaly.employee_id,
                    job_group: anomaly.job_group,
                    department: anomaly.department || 'N/A',
                    amount_at_risk: anomaly.gross_salary,
                    fraud_reason: `Salary Padding: Risk Score ${(anomaly.anomaly_score * 100).toFixed(0)}% - Job Group ${anomaly.job_group} with KES ${anomaly.gross_salary.toLocaleString()}`
                }),
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `StopOrder_${anomaly.employee_id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Stop Order generation failed:', error);
            alert('Failed to generate Stop Order. Please try again.');
        } finally {
            setGeneratingId(null);
        }
    };

    // Get color based on risk score (uses raw 45-99 score directly)
    const getRiskColor = (anomaly: SalaryAnomaly) => {
        const score = anomaly.risk_score ?? (anomaly.anomaly_score * 100);
        if (score >= 90) return 'text-red-500';
        if (score >= 75) return 'text-orange-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getRiskBgColor = (anomaly: SalaryAnomaly) => {
        const score = anomaly.risk_score ?? (anomaly.anomaly_score * 100);
        if (score >= 90) return 'from-red-500 to-red-600';
        if (score >= 75) return 'from-orange-500 to-red-500';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-green-500 to-yellow-500';
    };

    const getScore = (anomaly: SalaryAnomaly) => {
        return anomaly.risk_score ?? (anomaly.anomaly_score * 100);
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {selectedSuspect ? (
                    <EvidencePanel
                        key="evidence"
                        suspect={selectedSuspect}
                        onBack={() => setSelectedSuspect(null)}
                        onGenerateStopOrder={() => setStopOrderTarget(selectedSuspect)}
                    />
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#12121a] rounded-xl border border-zinc-800 h-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                    <h3 className="font-semibold text-white">Salary Anomalies</h3>
                                </div>
                                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                                    {filteredAnomalies.length} flagged
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                Click suspects to view forensic evidence
                            </p>
                        </div>

                        {/* Histogram */}
                        <div className="px-4 pt-4">
                            <ScoreHistogram data={anomalies} />
                        </div>

                        {/* Search Bar */}
                        <div className="px-4 pb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search suspects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 
                                             text-sm text-white placeholder-zinc-500
                                             focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <div className="px-4 py-2 border-b border-zinc-800">
                            <button
                                onClick={onAnalyze}
                                disabled={loading}
                                className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 
                                       text-white text-sm font-medium rounded-lg transition-colors
                                       flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-4 h-4" />
                                        Run ML Analysis
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Anomalies List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredAnomalies.length === 0 ? (
                                    <div className="text-center text-zinc-500 py-8">
                                        <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            {searchTerm ? 'No matches found' : 'No anomalies detected yet'}
                                        </p>
                                        <p className="text-xs">
                                            {searchTerm ? 'Try a different search term' : 'Click "Run ML Analysis" to scan'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredAnomalies.map((anomaly, index) => (
                                        <motion.div
                                            key={anomaly.employee_id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => setSelectedSuspect(anomaly)}
                                            className="bg-[#1a1a2e] rounded-lg p-3 border border-zinc-800 
                                                     hover:border-emerald-500/50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-amber-500/20 rounded">
                                                        <User className="w-3 h-3 text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white truncate max-w-[140px] group-hover:text-emerald-400 transition-colors">
                                                            {anomaly.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">{anomaly.employee_id}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-red-400">
                                                        KES {anomaly.gross_salary.toLocaleString()}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                        <Briefcase className="w-3 h-3" />
                                                        Group {anomaly.job_group}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Risk Score */}
                                            <div className="mt-2">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-zinc-500">Risk Score</span>
                                                    <span className={`font-bold ${getRiskColor(anomaly)}`}>
                                                        {getScore(anomaly).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${getScore(anomaly)}%` }}
                                                        transition={{ duration: 0.5, delay: index * 0.03 }}
                                                        className={`h-full bg-gradient-to-r ${getRiskBgColor(anomaly)} rounded-full`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Click hint */}
                                            <div className="mt-2 text-[10px] text-zinc-600 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to view forensic evidence →
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {stopOrderTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setStopOrderTarget(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border-2 border-red-500/50 w-[420px] p-6 rounded-2xl shadow-2xl shadow-red-900/30"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Confirm Enforcement Action</h3>
                                    <p className="text-xs text-zinc-500">This is a sovereign legal action</p>
                                </div>
                            </div>

                            <div className="bg-zinc-800 rounded-lg p-4 mb-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Subject</span>
                                    <span className="text-white font-bold">{stopOrderTarget.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Employee ID</span>
                                    <span className="text-white">{stopOrderTarget.employee_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Salary at Risk</span>
                                    <span className="text-red-400 font-bold">KES {stopOrderTarget.gross_salary.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Risk Score</span>
                                    <span className={`font-bold ${getRiskColor(stopOrderTarget)}`}>
                                        {getScore(stopOrderTarget).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            <p className="text-zinc-400 text-sm mb-6">
                                Are you sure you want to <span className="text-red-400 font-bold">halt all payments</span> to this individual?
                                This will generate an official Stop Payment Order.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStopOrderTarget(null)}
                                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => generateStopOrder(stopOrderTarget)}
                                    disabled={generatingId === stopOrderTarget.employee_id}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {generatingId === stopOrderTarget.employee_id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <FileText className="w-4 h-4" />
                                    )}
                                    CONFIRM STOP ORDER
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AnomaliesPanel;
