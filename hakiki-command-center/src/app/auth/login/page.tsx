'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint, Lock, ShieldCheck, User, Eye, EyeOff, ScanLine, Key } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'biometric' | 'manual'>('biometric');
    const [isScanning, setIsScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Mock Login Credentials
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleBiometricScan = () => {
        setIsScanning(true);

        // Simulate Scan Delay
        setTimeout(() => {
            setIsScanning(false);
            setScanSuccess(true);

            // Redirect after success
            setTimeout(() => {
                router.push('/audit/dashboard');
            }, 800);
        }, 2000);
    };

    const handleManualLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthenticating(true);

        // Simulate Auth Delay
        setTimeout(() => {
            router.push('/audit/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Background Grid/Data Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}></div>

            {/* Security Card */}
            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800/50 text-center">
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-amber-500 shadow-lg shadow-amber-500/10">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-slate-100 tracking-wide">
                        HAKIKI SECURITY GATEWAY
                    </h1>
                    <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-widest">
                        Official Access Point v2.0
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800/50">
                    <button
                        onClick={() => setMode('biometric')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative ${mode === 'biometric'
                                ? 'text-amber-500 bg-slate-800/30'
                                : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/10'
                            }`}
                    >
                        <Fingerprint className="w-4 h-4" />
                        BIO-SCAN
                        {mode === 'biometric' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative ${mode === 'manual'
                                ? 'text-amber-500 bg-slate-800/30'
                                : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/10'
                            }`}
                    >
                        <Key className="w-4 h-4" />
                        MANUAL ENTRY
                        {mode === 'manual' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-8 min-h-[300px] flex items-center justify-center">

                    {/* MODE A: BIOMETRIC SCAN */}
                    {mode === 'biometric' && (
                        <div className="text-center w-full">
                            <button
                                onClick={handleBiometricScan}
                                disabled={isScanning || scanSuccess}
                                className={`group relative w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-500 ${scanSuccess
                                        ? 'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                                        : isScanning
                                            ? 'bg-amber-500/10 border-2 border-amber-500 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                                            : 'bg-slate-800 border-2 border-slate-600 text-slate-500 hover:border-amber-500 hover:text-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                    }`}
                            >
                                <Fingerprint className={`w-12 h-12 transition-all ${isScanning ? 'animate-pulse' : ''}`} />

                                {/* Scan Line Animation */}
                                {isScanning && (
                                    <div className="absolute inset-0 w-full h-full overflow-hidden rounded-full">
                                        <div className="w-full h-1 bg-amber-400 absolute top-0 animate-[scan_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                                    </div>
                                )}
                            </button>

                            <div className="h-8">
                                {isScanning ? (
                                    <span className="text-amber-500 font-mono text-sm uppercase tracking-wider animate-pulse">
                                        Scanning Biometrics...
                                    </span>
                                ) : scanSuccess ? (
                                    <span className="text-emerald-500 font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                                        <ScanLine className="w-4 h-4" />
                                        Identity Verified
                                    </span>
                                ) : (
                                    <span className="text-slate-400 font-mono text-sm">
                                        Touch Sensor to Authenticate
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MODE B: MANUAL ENTRY */}
                    {mode === 'manual' && (
                        <form onSubmit={handleManualLogin} className="w-full space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-slate-500 uppercase">Officer ID / Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                                        placeholder="officer@ps.go.ke"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-mono text-slate-500 uppercase">Secure Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-10 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isAuthenticating}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isAuthenticating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-slate-900/50 border-t-slate-900 rounded-full animate-spin"></span>
                                        VERIFYING...
                                    </span>
                                ) : (
                                    "AUTHENTICATE AGENT"
                                )}
                            </button>
                        </form>
                    )}

                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-950/50 border-t border-slate-800/50 text-center">
                    <p className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3" />
                        SECURE CONNECTION // 256-BIT ENCRYPTION
                    </p>
                </div>

            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
