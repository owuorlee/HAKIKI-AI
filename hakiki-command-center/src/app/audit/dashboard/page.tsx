'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ghost, TrendingUp, Users, AlertTriangle, ArrowRight, MessageCircle, Ban } from 'lucide-react';
import ForensicReportModal from '@/components/ForensicReportModal';
import { ScanResult, Suspect } from '@/lib/api';

export default function VerdictDashboard() {
    const router = useRouter();
    const [count, setCount] = useState(0);
    const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
    const [summary, setSummary] = useState<ScanResult | null>(null);
    const [suspects, setSuspects] = useState<Suspect[]>([]);
    const [suspendedIds, setSuspendedIds] = useState<Set<string>>(new Set());

    // Load Data on Mount
    useEffect(() => {
        const storedData = sessionStorage.getItem('scanResults');
        if (!storedData) {
            // Security: No data, no view. Redirect to upload.
            router.push('/audit/upload');
            return;
        }

        try {
            const data: ScanResult = JSON.parse(storedData);
            console.log("DASHBOARD LOADING DATA:", data);

            setSummary(data); // Data is now flat
            setSuspects(data.suspects || []);

            // Animate only if valid target
            if (typeof data.totalRisk === 'number') {
                animateCount(data.totalRisk);
            }
        } catch (e) {
            console.error("Data corruption", e);
            router.push('/audit/upload');
        }
    }, [router]);

    const animateCount = (target: number) => {
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
    };

    const handleSuspend = async (id: string) => {
        setSuspendedIds(prev => new Set(prev).add(id));
    };

    if (!summary) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading Secure Environment...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 overflow-y-auto">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        SOVEREIGN AUDIT CONSOLE
                    </h1>
                    <div className="text-xs font-mono text-slate-500">SESSION ID: HAKIKI-2026-ALPHA</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* HERO SECTION */}
                <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-red-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <h2 className="text-sm font-semibold text-red-500 tracking-widest uppercase mb-2">Total Payroll At Risk</h2>
                    <div className="text-5xl md:text-7xl font-mono font-bold text-amber-500 mb-4 tracking-tight tabular-nums">
                        {formatCurrency(count)}
                    </div>
                    <p className="text-slate-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-300 font-medium">
                            {(summary.ghostCount || 0) + (summary.allowanceFraud || 0) + (summary.doubleDipperCount || 0)} High-Risk Entities
                        </span> Detected in Uploaded Batch
                    </p>
                </div>

                {/* GRID SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-slate-900 border border-red-500/50 p-6 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                <Ghost className="w-6 h-6 text-red-500" />
                            </div>
                            <span className="text-xs font-mono text-red-400 bg-red-950/30 px-2 py-1 rounded">CRITICAL</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{summary.ghostCount || 0} Entities</div>
                        <div className="text-sm text-slate-400">Ghost Workers Detected</div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-slate-900 border border-orange-500/50 p-6 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                            <span className="text-xs font-mono text-orange-400 bg-orange-950/30 px-2 py-1 rounded">MODERATE</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{summary.allowanceFraud || 0} Entities</div>
                        <div className="text-sm text-slate-400">Allowance Padding</div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-slate-900 border border-yellow-500/50 p-6 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                                <Users className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{summary.doubleDipperCount || 0} Entities</div>
                        <div className="text-sm text-slate-400">Double Dippers</div>
                    </div>
                </div>

                {/* TARGET LIST SECTION */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                        <h3 className="font-bold text-lg text-slate-100">🎯 Priority Targets (Sorted by Risk)</h3>
                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-700 transition-colors">
                            Export Report
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <h4 className="text-slate-400 text-sm font-mono uppercase">Flagged Entities</h4>
                            </div>

                            <ul className="space-y-2">
                                {Array.isArray(suspects) && suspects.length > 0 ? (
                                    suspects.map((suspect: any, index: number) => (
                                        <li key={index} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-800 hover:border-red-500/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-600 font-mono text-xs">#{index + 1}</span>
                                                <span className="text-red-400 font-mono font-medium">
                                                    {/* Safe Render: Handle String or Object */}
                                                    {typeof suspect === 'string' ? suspect : (suspect?.name || "Unknown Entity")}
                                                </span>
                                            </div>
                                            <span className="text-[10px] bg-red-950/50 text-red-500 px-2 py-1 rounded border border-red-900/20">
                                                FLAGGED
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-emerald-500 flex items-center gap-2 py-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        No high-risk suspects identified.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>

            {/* Floating Action Button */}
            <Link
                href="/investigation"
                className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-110 transition-all flex items-center gap-2 group z-50"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-out font-medium pr-1">
                    Ask Sovereign Assistant
                </span>
            </Link>

            {/* Forensic Report Modal */}
            <ForensicReportModal
                isOpen={!!selectedSuspect}
                onClose={() => setSelectedSuspect(null)}
                data={selectedSuspect}
                onSuspend={handleSuspend}
            />

        </div>
    );
}
