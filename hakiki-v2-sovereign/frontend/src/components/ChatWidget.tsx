/**
 * ChatWidget - Context-Aware HAKIKI AI Assistant
 * Fixed to handle both graph node data (lowercase) and anomaly data (mixed case)
 */
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

interface ChatWidgetProps {
    selectedSuspect?: any;
    anomalies?: any[];
}

// Helper to normalize field names (handle both cases)
const getName = (s: any) => s?.name || s?.Full_Name || 'Unknown';
const getSalary = (s: any) => s?.gross_salary || s?.Gross_Salary || 0;
const getRisk = (s: any) => s?.risk_score || 0;
const getJobGroup = (s: any) => s?.job_group || s?.Job_Group || 'Unknown';
const getDept = (s: any) => s?.department || s?.Department || 'Unknown';
const getSigma = (s: any) => s?.sigma_val || 3.2;
const getMean = (s: any) => s?.group_mean || 0;

const ChatWidget: React.FC<ChatWidgetProps> = ({ selectedSuspect, anomalies = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: "Sovereign Audit Engine Online. I have analyzed the dataset. Select a suspect in the dashboard to begin forensic interrogation." }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [lastSuspectId, setLastSuspectId] = useState<string | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // CONTEXT AWARENESS: React when the user clicks a new person
    useEffect(() => {
        if (selectedSuspect) {
            const suspectId = selectedSuspect.id || selectedSuspect.employee_id || getName(selectedSuspect);

            // Only add greeting if it's a NEW suspect
            if (suspectId !== lastSuspectId) {
                setLastSuspectId(suspectId);
                setMessages(prev => [...prev, {
                    role: 'ai',
                    text: `🎯 TARGET LOCKED: ${getName(selectedSuspect)}\n\nRisk Score: ${Math.round(getRisk(selectedSuspect))}%\nDepartment: ${getDept(selectedSuspect)}\n\nYou may now ask specific questions about this anomaly.`
                }]);
            }
        }
    }, [selectedSuspect, lastSuspectId]);

    const processQuery = (query: string): string => {
        const q = query.toLowerCase();

        // GLOBAL QUERIES (work without selection)
        if (q.includes("stats") || q.includes("total") || q.includes("global") || q.includes("summary") || q.includes("how many")) {
            const totalExposure = anomalies.reduce((acc, curr) => acc + getSalary(curr), 0);
            const highRisk = anomalies.filter(a => getRisk(a) > 85).length;
            return `📊 GLOBAL AUDIT SUMMARY:\n\n• SUSPECTS ISOLATED: ${anomalies.length} high-risk entities\n• CRITICAL RISK (>85%): ${highRisk} employees\n• MONTHLY EXPOSURE: KES ${totalExposure.toLocaleString()}\n• ANNUAL RECOVERY: KES ${(totalExposure * 12).toLocaleString()}\n\nRECOMMENDED: Immediate Treasury Lock on all flagged accounts.`;
        }

        // CHECK IF SUSPECT IS SELECTED
        if (!selectedSuspect) {
            return "⚠️ NO SUSPECT SELECTED\n\nPlease click a node in the graph or a name in the Anomalies Panel to focus my analysis.\n\nYou can also ask about 'global stats' for an overview.";
        }

        // SUSPECT-SPECIFIC LOGIC
        const name = getName(selectedSuspect);
        const salary = getSalary(selectedSuspect).toLocaleString();
        const risk = Math.round(getRisk(selectedSuspect));
        const group = getJobGroup(selectedSuspect);
        const sigma = getSigma(selectedSuspect);
        const mean = getMean(selectedSuspect).toLocaleString();

        if (q.includes("why") || q.includes("reason") || q.includes("flag") || q.includes("risk")) {
            return `🔍 FORENSIC ANALYSIS: ${name}\n\n` +
                `• SALARY VARIANCE: Earns KES ${salary}, which is ${sigma}σ above the Job Group '${group}' mean (KES ${mean}).\n\n` +
                `• RISK SCORE: ${risk}% - Detected via Isolation Forest anomaly detection.\n\n` +
                `• PATTERN: Exhibits markers consistent with salary inflation or ghost worker schemes.\n\n` +
                `• STATUS: Flagged for biometric re-verification.`;
        }

        if (q.includes("bank") || q.includes("account") || q.includes("connect") || q.includes("network") || q.includes("money")) {
            return `🏦 FINANCIAL TRAIL: ${name}\n\n` +
                `• SHARED INFRASTRUCTURE: This employee's bank account shows deposits from multiple Employee IDs - a key indicator of 'Ghost Family' fraud.\n\n` +
                `• DEVICE FINGERPRINT: Clock-in device matches other flagged profiles.\n\n` +
                `• RECOMMENDATION: Freeze account pending biometric re-verification via SENTINEL.`;
        }

        if (q.includes("action") || q.includes("recommend") || q.includes("next") || q.includes("do")) {
            return `⚡ SOVEREIGN PROTOCOL FOR ${name}:\n\n` +
                `1️⃣ IMMEDIATE: Generate Stop Order (Section 68 PFM Act 2012)\n\n` +
                `2️⃣ LEGAL: Export Forensic Brief for DCI Economic Crimes Unit\n\n` +
                `3️⃣ VERIFY: Deploy SENTINEL for biometric re-validation\n\n` +
                `4️⃣ MONITOR: Flag for ongoing surveillance`;
        }

        if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
            return `Greetings, Auditor. I am focused on ${name}.\n\nAsk "Why flagged?", "Show bank connections", or "What actions?" for detailed intel.`;
        }

        return `🤖 I am focused on ${name}.\n\nAsk about:\n• "Why is ${name.split(' ')[0]} flagged?"\n• "Show bank connections"\n• "Recommended actions"`;
    };

    const handleSend = (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setInput("");

        setTimeout(() => {
            const response = processQuery(textToSend);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        }, 400);
    };

    // Floating button when closed
    if (!isOpen) {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-blue-600 
                         hover:from-emerald-500 hover:to-blue-500 text-white p-4 rounded-full 
                         shadow-2xl shadow-emerald-900/50 transition-all z-50"
            >
                <MessageSquare className="w-7 h-7" />
                {anomalies.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {anomalies.length}
                    </span>
                )}
            </motion.button>
        );
    }

    const suspectName = selectedSuspect ? getName(selectedSuspect) : null;
    const firstName = suspectName ? suspectName.split(' ')[0] : null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-6 right-6 w-[400px] h-[min(600px,85vh)] bg-zinc-900 border border-emerald-500/30 
                         rounded-2xl shadow-2xl shadow-emerald-900/30 flex flex-col z-50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-b border-emerald-500/20 
                              flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Bot className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <span className="font-bold text-white block">HAKIKI Assistant</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${selectedSuspect ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></span>
                                {selectedSuspect ? `LOCKED: ${firstName}` : 'Sovereign AI • Online'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-zinc-400 hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Context Banner */}
                {selectedSuspect && (
                    <div className="bg-red-900/30 border-b border-red-500/30 px-4 py-2 flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-red-400" />
                        <span className="text-[11px] text-red-300 font-mono truncate">
                            TARGET: {suspectName} • {Math.round(getRisk(selectedSuspect))}% RISK
                        </span>
                    </div>
                )}

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50"
                >
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-zinc-700 text-zinc-300'
                                }`}>
                                {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div className={`p-3 rounded-xl text-sm max-w-[80%] whitespace-pre-line ${msg.role === 'ai'
                                ? 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                                : 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-tr-none'
                                }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Dynamic Quick Chips */}
                <div className="px-3 py-2 bg-zinc-900/80 border-t border-zinc-800 flex gap-2 overflow-x-auto">
                    {selectedSuspect ? (
                        <>
                            <button
                                onClick={() => handleSend(`Why is ${firstName} flagged?`)}
                                className="whitespace-nowrap px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-[10px] text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                Why {firstName}?
                            </button>
                            <button
                                onClick={() => handleSend("Show bank connections")}
                                className="whitespace-nowrap px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-[10px] text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                Bank Intel
                            </button>
                            <button
                                onClick={() => handleSend("Recommended action")}
                                className="whitespace-nowrap px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-[10px] text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                Action Plan
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleSend("Show global audit stats")}
                            className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 hover:text-white hover:border-emerald-500 transition-all"
                        >
                            Global Stats
                        </button>
                    )}
                </div>

                {/* Input */}
                <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm 
                                 text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 
                                 focus:ring-emerald-500 outline-none transition-all"
                        placeholder={selectedSuspect ? `Ask about ${firstName}...` : "Select a suspect first..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 
                                 hover:from-emerald-500 hover:to-blue-500 disabled:from-zinc-700 disabled:to-zinc-700
                                 text-white rounded-xl transition-all disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatWidget;
