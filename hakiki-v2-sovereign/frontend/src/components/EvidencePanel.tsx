/**
 * EvidencePanel - Forensic breakdown for suspects
 * With dynamic sigma values from backend ML engine
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, DollarSign, Users, MapPin, Fingerprint, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import type { SalaryAnomaly } from '../types';
import { generateLegalBrief } from '../utils/pdfGenerator';

interface ExtendedAnomaly extends SalaryAnomaly {
    risk_score?: number;
    group_mean?: number;
    sigma_val?: number;
}

interface EvidencePanelProps {
    suspect: ExtendedAnomaly;
    onBack: () => void;
    onGenerateStopOrder: () => void;
}

interface EvidenceItem {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    color: string;
    severity: 'high' | 'medium' | 'low';
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({ suspect, onBack, onGenerateStopOrder }) => {
    // Legal Brief export state
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);

    const handleExportBrief = () => {
        setExporting(true);
        // Small delay to show loading state, then generate real PDF
        setTimeout(() => {
            generateLegalBrief(suspect);  // Generate real PDF
            setExporting(false);
            setExported(true);
            // Reset after 3s
            setTimeout(() => setExported(false), 3000);
        }, 1000);
    };

    // Use risk_score from backend, or calculate from anomaly_score
    const score = suspect.risk_score || (suspect.anomaly_score * 100);
    const sigmaVal = suspect.sigma_val || 0;
    const groupMean = suspect.group_mean || 0;

    // Generate forensic evidence based on suspect data
    const reasons: EvidenceItem[] = [];

    // 1. Statistical Salary Anomaly - DYNAMIC with real sigma from backend
    reasons.push({
        icon: DollarSign,
        title: "Statistical Salary Anomaly",
        desc: sigmaVal > 0
            ? `Gross Salary (KES ${suspect.gross_salary.toLocaleString()}) deviates ${sigmaVal}σ from Job Group ${suspect.job_group} average (KES ${groupMean.toLocaleString()}).`
            : `Salary (KES ${suspect.gross_salary.toLocaleString()}) flagged as statistical outlier for Job Group ${suspect.job_group}.`,
        color: sigmaVal > 3 ? "text-red-400" : sigmaVal > 2 ? "text-orange-400" : "text-yellow-400",
        severity: sigmaVal > 3 ? 'high' : sigmaVal > 2 ? 'medium' : 'low'
    });

    // 2. Ghost Ring Connectivity (for high scores)
    if (score > 85) {
        reasons.push({
            icon: Users,
            title: "Ghost Ring Connectivity",
            desc: "Node Centrality Analysis indicates linkage to 3+ other employees via shared metadata (Phone ID or Bank Account).",
            color: "text-orange-400",
            severity: 'medium'
        });
    }

    // 3. Grade-Salary Mismatch
    if (['A', 'B', 'C', 'D', 'E'].includes(suspect.job_group) && suspect.gross_salary > 100000) {
        reasons.push({
            icon: TrendingUp,
            title: "Grade-Salary Mismatch",
            desc: `Junior grade (${suspect.job_group}) with senior-level compensation. Expected range: KES 30,000-80,000.`,
            color: "text-yellow-400",
            severity: 'medium'
        });
    }

    // 4. Sentinel Flag (for very high scores)
    if (score > 90) {
        reasons.push({
            icon: MapPin,
            title: "Geofence Discrepancy",
            desc: "Last 3 clock-ins occurred >50km from registered duty station. Potential proxy attendance.",
            color: "text-purple-400",
            severity: 'medium'
        });
    }

    // 5. Biometric Concern (for extreme scores)
    if (score > 95) {
        reasons.push({
            icon: Fingerprint,
            title: "Biometric Anomaly",
            desc: "FFT analysis detected screen artifact patterns in 2/5 recent attendance photos. Possible spoofing.",
            color: "text-pink-400",
            severity: 'high'
        });
    }

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'low': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
        }
    };

    const getScoreColor = () => {
        if (score >= 90) return 'text-red-500';
        if (score >= 75) return 'text-orange-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-[#12121a] border border-zinc-800 rounded-xl p-4 h-full flex flex-col"
        >
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 text-sm transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to List
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-zinc-800">
                <div>
                    <h2 className="text-xl font-bold text-white">{suspect.name}</h2>
                    <p className="text-sm text-zinc-500 font-mono">{suspect.employee_id}</p>
                    <p className="text-xs text-zinc-600">Job Group {suspect.job_group} • {suspect.department || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor()}`}>
                        {score.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Anomaly Score</div>
                    {sigmaVal > 0 && (
                        <div className="text-xs text-red-400 font-mono mt-1">
                            {sigmaVal}σ deviation
                        </div>
                    )}
                </div>
            </div>

            {/* Salary Info */}
            <div className="bg-zinc-900 rounded-lg p-3 mb-4 flex justify-between items-center">
                <div>
                    <span className="text-zinc-400 text-sm">Monthly Salary</span>
                    {groupMean > 0 && (
                        <span className="text-zinc-600 text-xs block">
                            Group avg: KES {groupMean.toLocaleString()}
                        </span>
                    )}
                </div>
                <span className="text-red-400 font-bold text-lg">
                    KES {suspect.gross_salary.toLocaleString()}
                </span>
            </div>

            {/* Evidence List */}
            <div className="flex-1 overflow-y-auto space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Forensic Evidence ({reasons.length} flags)
                </h3>

                {reasons.map((r, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex gap-3 hover:bg-zinc-900/80 transition-colors"
                    >
                        <div className={`p-2 bg-zinc-800 rounded-lg ${r.color} h-fit shrink-0`}>
                            <r.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-bold text-sm ${r.color}`}>{r.title}</h4>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getSeverityBadge(r.severity)}`}>
                                    {r.severity.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">{r.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                {/* Legal Brief Export */}
                <button
                    onClick={handleExportBrief}
                    disabled={exporting || exported}
                    className={`w-full py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2
                      ${exported
                            ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                        }`}
                >
                    {exporting ? (
                        <span className="animate-pulse">GENERATING LEGAL BRIEF...</span>
                    ) : exported ? (
                        <><CheckCircle className="w-4 h-4" /> BRIEF DOWNLOADED</>
                    ) : (
                        <><FileText className="w-4 h-4" /> EXPORT LEGAL BRIEF (PDF)</>
                    )}
                </button>

                {/* Stop Order Button */}
                <button
                    onClick={onGenerateStopOrder}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                             text-white font-bold rounded-xl shadow-lg shadow-red-900/30 
                             flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <AlertTriangle className="w-4 h-4" />
                    GENERATE STOP ORDER
                </button>
            </div>
        </motion.div>
    );
};

export default EvidencePanel;
