/**
 * ScoreHistogram - Bulletproof risk score distribution visualization
 * Handles any data range (0-100%) with debug logging
 */
import { useEffect } from 'react';
import type { SalaryAnomaly } from '../types';

interface ScoreHistogramProps {
    data: SalaryAnomaly[];
}

const ScoreHistogram: React.FC<ScoreHistogramProps> = ({ data }) => {
    // 1. DEBUG: Log the data receiving (Check Console F12 if bars are empty)
    useEffect(() => {
        if (data.length > 0) {
            const scores = data.map(d => Math.round(d.risk_score || 0));
            console.log("[HISTOGRAM DEBUG] Incoming Scores:", scores);
            console.log("[HISTOGRAM DEBUG] Min:", Math.min(...scores), "Max:", Math.max(...scores));
        }
    }, [data]);

    // 2. DEFINE ROBUST BINS (Covering 0-100 to ensure nothing is missed)
    // Bins: 0-20, 20-40, 40-60, 60-80, 80-90, 90-100
    const bins = [0, 20, 40, 60, 80, 90, 100];
    const counts = Array(bins.length - 1).fill(0);

    data.forEach(item => {
        const score = item.risk_score || 0;
        // Find which bin this score belongs to
        const index = bins.findIndex((b, i) => {
            if (i === bins.length - 1) return false; // Skip last boundary
            const end = bins[i + 1];
            return score >= b && score < end; // Lower-inclusive
        });

        if (index !== -1) {
            counts[index]++;
        } else if (score >= 100) {
            // Handle edge case: score exactly 100
            counts[counts.length - 1]++;
        } else {
            // Fallback for out-of-bounds data
            console.warn("[HISTOGRAM] Score out of bounds:", score);
        }
    });

    const maxCount = Math.max(...counts, 1);

    // 3. COLOR MAPPING
    const getBarColor = (binStart: number) => {
        if (binStart >= 90) return 'bg-red-600';      // Critical
        if (binStart >= 80) return 'bg-red-500';      // High
        if (binStart >= 60) return 'bg-orange-500';   // Medium
        if (binStart >= 40) return 'bg-yellow-500';   // Moderate
        return 'bg-emerald-600';                       // Low/Normal
    };

    if (data.length === 0) return null;

    return (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-4 shadow-lg">
            <div className="flex justify-between items-end mb-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Anomaly Distribution
                </h4>
                <span className="text-[10px] text-zinc-600 font-mono">Total: {data.length}</span>
            </div>

            <div className="flex items-end gap-1 h-24 w-full pb-2 border-b border-zinc-800">
                {counts.map((count, i) => {
                    // Calculate height percentage, ensure at least 10% if there's 1 item so it's visible
                    const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 10) : 0;

                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                            {/* Tooltip on Hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-zinc-800 text-white 
                                          text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                                          transition-opacity whitespace-nowrap z-20 pointer-events-none 
                                          border border-zinc-700 shadow-xl">
                                {count} Suspect{count !== 1 ? 's' : ''} <br /> Range: {bins[i]}-{bins[i + 1]}%
                            </div>

                            {/* The Bar */}
                            <div className="w-full px-0.5 h-full flex items-end">
                                <div
                                    style={{ height: `${heightPct}%` }}
                                    className={`w-full rounded-t-sm transition-all duration-500 ${getBarColor(bins[i])} 
                                              opacity-80 group-hover:opacity-100`}
                                ></div>
                            </div>

                            {/* X-Axis Label */}
                            <div className="text-[9px] text-zinc-600 text-center mt-1 font-mono">{bins[i]}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScoreHistogram;
