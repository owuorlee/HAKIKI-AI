'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, Cpu, ShieldCheck } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai' | 'system';
    timestamp: string;
}

export default function InvestigationPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'SOVEREIGN ASSISTANT V2.0 // ONLINE',
            sender: 'system',
            timestamp: new Date().toLocaleTimeString()
        },
        {
            id: 2,
            text: 'Secure connection established. Waiting for command...',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Call the Local Sovereign Backend
            const res = await fetch('http://localhost:8081/api/chat/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMsg.text,
                    context: "Current Page: Investigation Console. User is an Auditor."
                }),
            });

            const data = await res.json();

            setIsThinking(false);

            if (res.ok) {
                const aiMsg: Message = {
                    id: Date.now() + 1,
                    text: data.response,
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error(data.detail || "Connection Failed");
            }

        } catch (error) {
            setIsThinking(false);
            const errorMsg: Message = {
                id: Date.now() + 1,
                text: `CONNECTION ERROR: ${error instanceof Error ? error.message : "Sovereign Link Down"}`,
                sender: 'system',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] bg-slate-950 text-slate-200 font-sans overflow-hidden relative">

            {/* BACKGROUND ELEMENTS */}
            <div className="absolute top-0 right-0 p-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded border border-slate-700">
                        <Cpu className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-100 tracking-wider flex items-center gap-2">
                            SOVEREIGN ASSISTANT
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                                V2.0
                            </span>
                        </h1>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            SYSTEM ONLINE // ENCRYPTED
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-slate-600" />
                        NO EXTERNAL LEAKS
                    </div>
                    <div className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-slate-600" />
                        ROOT ACCESS
                    </div>
                </div>
            </div>

            {/* CHAT WINDOW */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
            >
                {messages.map((msg) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    const isUser = msg.sender === 'user';

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] relative group ${isUser ? 'items-end' : 'items-start'
                                }`}>
                                <div className={`px-5 py-3 shadow-lg backdrop-blur-sm relative z-10 text-sm leading-relaxed ${isUser
                                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                    : 'bg-slate-800/80 text-amber-400 border-l-2 border-amber-500/50 rounded-2xl rounded-tl-sm font-mono'
                                    }`}>
                                    {msg.text}
                                </div>
                                <div className={`text-[10px] font-mono text-slate-600 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'
                                    }`}>
                                    {msg.timestamp}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Thinking Indicator */}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/50 border-l-2 border-amber-500/20 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                            <span className="text-xs font-mono text-amber-500/70 animate-pulse">
                                CONTACTING LOCAL INTELLIGENCE (OLLAMA)...
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="max-w-4xl mx-auto relative flex items-center gap-2">
                    <div className="absolute left-4 text-slate-500">
                        <Terminal className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Query the Sovereign Database..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-12 pr-12 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono text-sm transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-600 font-mono">
                        SECURE CHANNEL: E2EE ENABLED
                    </span>
                </div>
            </div>

        </div>
    );
}
