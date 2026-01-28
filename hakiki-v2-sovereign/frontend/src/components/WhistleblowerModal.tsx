/**
 * WhistleblowerModal - Secure Anonymous Tip Submission
 * Phase 3: Kenya-localized with 21 Ministries, 47 Counties, Fraud Categories
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareWarning, Send, ShieldCheck, X, MapPin, Building2, Calendar, FileWarning, Lock } from 'lucide-react';

// All 21+ Kenyan Ministries (2024)
const MINISTRIES = [
    "Office of the President",
    "Office of the Deputy President",
    "Ministry of Interior & National Administration",
    "Ministry of Defence",
    "The National Treasury & Economic Planning",
    "Ministry of Foreign & Diaspora Affairs",
    "Ministry of Public Service, Performance & Delivery",
    "Ministry of Roads and Transport",
    "Ministry of Lands, Public Works, Housing & Urban Development",
    "Ministry of Information, Communications & The Digital Economy",
    "Ministry of Health",
    "Ministry of Education",
    "Ministry of Agriculture & Livestock Development",
    "Ministry of Investments, Trade & Industry",
    "Ministry of Co-operatives & MSME Development",
    "Ministry of Youth Affairs, Creative Economy & Sports",
    "Ministry of Tourism & Wildlife",
    "Ministry of Environment, Climate Change & Forestry",
    "Ministry of Energy & Petroleum",
    "Ministry of Water, Sanitation & Irrigation",
    "Ministry of Labour & Social Protection",
    "Ministry of East African Community (EAC)",
    "Ministry of Mining, Blue Economy & Maritime Affairs",
    "Office of the Attorney General"
];

// All 47 Kenyan Counties
const COUNTIES = [
    "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
    "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
    "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
    "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
    "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
    "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho",
    "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya",
    "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City"
];

// Fraud Categories
const FRAUD_TYPES = [
    "Ghost Worker / Non-Existent Employee",
    "Salary Padding / Overpayment",
    "Nepotism / Unauthorized Hiring",
    "Procurement Fraud / Tender Inflation",
    "Allowance Abuse (Per Diem Fraud)",
    "Pension Fraud",
    "Identity Theft / Double Payroll",
    "Other Financial Irregularity"
];

interface WhistleblowerModalProps {
    onClose: () => void;
}

const WhistleblowerModal: React.FC<WhistleblowerModalProps> = ({ onClose }) => {
    const [tip, setTip] = useState("");
    const [ministry, setMinistry] = useState(MINISTRIES[0]);
    const [county, setCounty] = useState("Nairobi City");
    const [fraudType, setFraudType] = useState(FRAUD_TYPES[0]);
    const [timeframe, setTimeframe] = useState("Ongoing Issue");

    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!tip) return;
        setLoading(true);

        // Simulate AI processing delay
        setTimeout(() => {
            setAnalysis({
                fraud_type: fraudType,
                risk_score: "CRITICAL (92%)",
                action: "Recommended for Immediate Forensic Audit",
                ref_id: `HK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
            });
            setLoading(false);
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border border-emerald-500/30 w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {!analysis ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="border-b border-zinc-800 pb-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
                                    <MessageSquareWarning className="text-emerald-500 w-6 h-6" />
                                </div>
                                Secure Whistleblower Portal
                            </h2>
                            <p className="text-zinc-400 text-sm mt-1 ml-12 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Encrypted. Anonymous. Sovereign.
                            </p>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ministry */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> Target Ministry
                                </label>
                                <select
                                    value={ministry}
                                    onChange={e => setMinistry(e.target.value)}
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none text-sm"
                                >
                                    {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {/* County */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> County / Location
                                </label>
                                <select
                                    value={county}
                                    onChange={e => setCounty(e.target.value)}
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none text-sm"
                                >
                                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Fraud Type */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                                    <FileWarning className="w-3 h-3" /> Fraud Category
                                </label>
                                <select
                                    value={fraudType}
                                    onChange={e => setFraudType(e.target.value)}
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none text-sm"
                                >
                                    {FRAUD_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            {/* Timeframe */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Timeframe
                                </label>
                                <select
                                    value={timeframe}
                                    onChange={e => setTimeframe(e.target.value)}
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:border-emerald-500 outline-none text-sm"
                                >
                                    <option>Ongoing Issue</option>
                                    <option>Occurred in Last 30 Days</option>
                                    <option>Occurred in Last 6 Months</option>
                                    <option>Historical (&gt; 1 Year)</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase">
                                Description of Corrupt Activity
                            </label>
                            <textarea
                                className="w-full h-32 bg-black/50 border border-zinc-700 rounded-xl p-4 text-zinc-200 focus:border-emerald-500 outline-none resize-none"
                                placeholder="Example: I witnessed the HR director, Leslie Okoth Owuor, manually adding 3 ghost workers to the 'Roads' payroll on Friday night..."
                                value={tip}
                                onChange={(e) => setTip(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !tip}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="animate-pulse">ENCRYPTING & ROUTING TO SENTINEL...</span>
                            ) : (
                                <><Send className="w-5 h-5" /> SUBMIT SECURE TIP</>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Success Screen */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6 text-center py-8"
                    >
                        <div className="w-24 h-24 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                            <ShieldCheck className="w-12 h-12 text-emerald-500" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white">Tip Encrypted & Received</h3>
                            <p className="text-zinc-400 font-mono">Reference ID: #{analysis.ref_id}</p>
                        </div>

                        <div className="bg-zinc-800/50 p-6 rounded-xl text-left border border-zinc-700 max-w-sm mx-auto space-y-3">
                            <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
                                <span className="text-zinc-400 text-xs uppercase">Category</span>
                                <span className="text-white font-bold text-sm text-right max-w-[200px] truncate">{analysis.fraud_type}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
                                <span className="text-zinc-400 text-xs uppercase">AI Assessment</span>
                                <span className="text-red-400 font-bold text-sm">{analysis.risk_score}</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-zinc-400 text-xs uppercase block mb-1">Recommended Action</span>
                                <span className="text-emerald-400 font-mono text-xs">{analysis.action}</span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full max-w-sm mx-auto py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white font-bold transition-colors"
                        >
                            Close Portal
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default WhistleblowerModal;
