'use client';

import Link from 'next/link';
import { Users, FileSearch, ShieldCheck, ArrowRight, ChevronRight, Binary } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex flex-col">

            {/* HERO SECTION */}
            <header className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden border-b border-slate-900">

                {/* Background FX */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950 z-0"></div>
                <div className="absolute inset-0 opacity-20 z-0" style={{
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] animate-pulse-slow"></div>

                {/* Content */}
                <div className="relative z-10 text-center space-y-8 px-4 max-w-5xl mx-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 backdrop-blur-md text-xs font-mono text-amber-500 tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        HAKIKI SYSTEM V2.0 // ONLINE
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        RESTORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">INTEGRITY.</span><br />
                        PROTECT THE <span className="text-slate-500">SOVEREIGN.</span>
                    </h1>

                    {/* Subhead */}
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        The first AI-powered forensic engine designed specifically for Government Payroll Assurance.
                        Eliminate ghost workers, detect fraud, and secure the public ledger.
                    </p>

                    {/* CTA Button - CRITICAL LINK TO LOGIN */}
                    <div className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Link
                            href="/auth/login"
                            className="group relative inline-flex items-center gap-3 bg-amber-500 text-slate-950 px-8 py-4 rounded-lg font-bold text-lg tracking-wide hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] active:scale-95"
                        >
                            INITIALIZE SYSTEM
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                            {/* Inner Border */}
                            <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                        </Link>
                    </div>

                </div>

                {/* Decorative Scroll Indicator */}
                <div className="absolute bottom-12 animate-bounce text-slate-600">
                    <ChevronRight className="w-6 h-6 rotate-90" />
                </div>
            </header>

            {/* MISSION GRID */}
            <section className="py-24 bg-slate-950 border-b border-slate-900 relative">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">

                    {/* Card 1 */}
                    <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 hover:bg-slate-900 transition-all group">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">GHOST DETECTION</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Eliminate nonexistent workers using deterministic graph analysis and cross-reference checks against the Civil Registry.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 hover:bg-slate-900 transition-all group">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                            <FileSearch className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">AUTO-FORENSICS</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Generate court-ready evidence dossiers in milliseconds, identifying duplicates, ID fraud, and allowance theft.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 hover:bg-slate-900 transition-all group">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">SOVEREIGN DATA</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Air-gapped architecture ensures no data leaves the Ministry. Full sovereignty over all payroll intelligence.
                        </p>
                    </div>

                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 bg-slate-950 text-center border-t border-slate-900">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <Binary className="w-4 h-4" />
                    <span className="text-xs font-mono tracking-widest text-slate-500">SYSTEM SECURE</span>
                </div>
                <p className="text-slate-600 text-sm">
                    Restricted Access. Ministry of Public Service Use Only.
                </p>
                <p className="text-slate-700 text-xs mt-2">
                    © 2026 HAKIKI AI. All Rights Reserved.
                </p>
            </footer>

        </div>
    );
}
