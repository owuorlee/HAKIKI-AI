import Link from 'next/link';
import { Radio, ShieldAlert, Flag, Clock, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function IntelligenceFeed() {
    const tips = [
        {
            id: 1,
            content: "The County Director in Kiambu is demanding 10% kickbacks for the new road project before signing off on payments.",
            tags: ["#Corruption", "#Kiambu", "#Procurement"],
            severity: "CRITICAL",
            sentiment: "Critical Risk",
            time: "2 hours ago",
            source: "Encrypted(Tor) - Node 4DA"
        },
        {
            id: 2,
            content: "There are 5 people on the payroll in the Health Dept who haven't shown up since 2023. They are all listed under the 'Outreach' unit.",
            tags: ["#GhostWorkers", "#Health", "#Payroll"],
            severity: "HIGH",
            sentiment: "High Credibility",
            time: "4 hours ago",
            source: "Public Gateway - Verified ID"
        },
        {
            id: 3,
            content: "Supplies for Dandora clinic are being sold at the local market. I saw boxes marked 'GoK Not for Sale' at a stall near the bus stage.",
            tags: ["#Theft", "#Dandora", "#MedicalSupplies"],
            severity: "MODERATE",
            sentiment: "Moderate Reliability",
            time: "6 hours ago",
            source: "SMS Tip - Anonymous"
        },
        {
            id: 4,
            content: "Suspicious transfers detected in the Water Ministry accounts late Friday nights. Amounts are always just below the reporting threshold.",
            tags: ["#MoneyLaundering", "#Water", "#Finance"],
            severity: "CRITICAL",
            sentiment: "Pattern Match: High",
            time: "12 hours ago",
            source: "Internal Whistleblower"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 overflow-y-auto">
            {/* HEADER */}
            <div className="border-b border-slate-800 bg-slate-900/50 p-6 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                            <h1 className="text-xl font-bold tracking-wider text-slate-100">
                                SIGNAL INTELLIGENCE (SIGINT)
                            </h1>
                        </div>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                            Encrypted Whistleblower Submissions | Source: Public Gateway
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/50 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <span className="text-xs font-mono text-red-400 font-bold">4 NEW SIGNALS</span>
                    </div>
                </div>
            </div>

            {/* MAIN FEED */}
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                {/* FILTERS (Visual only) */}
                <div className="flex gap-2 pb-4">
                    <button className="text-xs font-mono bg-slate-800 text-white px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 transition-colors">ALL SIGNALS</button>
                    <button className="text-xs font-mono text-slate-400 px-3 py-1 rounded hover:bg-slate-800/50 transition-colors">HIGH PRIORITY</button>
                    <button className="text-xs font-mono text-slate-400 px-3 py-1 rounded hover:bg-slate-800/50 transition-colors">ARCHIVED</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tips.map((tip) => (
                        <div
                            key={tip.id}
                            className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group"
                        >
                            <div className={`h-1 w-full ${tip.severity === 'CRITICAL' ? 'bg-red-600' :
                                    tip.severity === 'HIGH' ? 'bg-orange-500' :
                                        'bg-yellow-500'
                                }`} />

                            <div className="p-6">
                                {/* Meta Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        {tip.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {tip.severity === 'CRITICAL' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                                    {tip.severity === 'HIGH' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                                    {tip.severity === 'MODERATE' && <ShieldCheck className="w-4 h-4 text-yellow-500" />}
                                </div>

                                {/* Content */}
                                <p className="text-slate-200 text-sm leading-relaxed font-medium mb-6">
                                    "{tip.content}"
                                </p>

                                {/* Sentiment & Action */}
                                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs font-bold uppercase tracking-wide ${tip.severity === 'CRITICAL' ? 'text-red-400' :
                                                tip.severity === 'HIGH' ? 'text-orange-400' :
                                                    'text-yellow-400'
                                            }`}>
                                            {tip.sentiment}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {tip.time}
                                        </div>
                                    </div>

                                    <button className="flex items-center gap-2 text-xs font-bold border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white px-3 py-2 rounded transition-all uppercase tracking-wider">
                                        <Flag className="w-3 h-3" />
                                        Flag
                                    </button>
                                </div>
                            </div>

                            {/* Technical Footer */}
                            <div className="bg-slate-950 px-6 py-2 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-600">
                                    SOURCE: {tip.source}
                                </span>
                                <span className="text-[10px] font-mono text-slate-700">
                                    ID: SIG-{202600 + tip.id}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Action Button (Optional, maybe for manual tip entry later) */}
            <div className="fixed bottom-8 right-8 pointer-events-none opacity-50">
                {/* Placeholder for future interactivity */}
            </div>

        </div>
    );
}
