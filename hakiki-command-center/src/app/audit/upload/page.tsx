'use client';

// ... imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, ShieldCheck, Lock } from 'lucide-react';
import { uploadPayrollFile } from '@/lib/api';

export default function SecureUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const router = useRouter();

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            startUpload(e.dataTransfer.files[0]);
        }
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            startUpload(e.target.files[0]);
        }
    };

    const startUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setStatus('Transmitting to Sovereign Brain...');
        setProgress(30);

        try {
            setProgress(60);
            setStatus('Analyzing Forensic Patterns...');

            // Actual API Call
            const data = await uploadPayrollFile(uploadedFile);

            setProgress(100);
            setStatus('Complete');

            sessionStorage.setItem('scanResults', JSON.stringify(data));

            setTimeout(() => {
                router.push('/audit/dashboard');
            }, 500);

        } catch (error) {
            console.error(error);
            setStatus('UPLOAD FAILED: Secure Connection Rejected');
            setFile(null); // Reset or Keep validation state
            alert("UPLOAD FAILED: Secure Connection Rejected\n" + (error instanceof Error ? error.message : String(error)));
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden relative">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

                {/* Header */}
                <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" />
                            SECURE DATA INGESTION
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Protocol: End-to-End Encryption Enabled</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <Lock className="text-slate-500 w-5 h-5" />
                    </div>
                </div>

                <div className="p-12">
                    {!file ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all group relative"
                        >
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleSelect}
                            />
                            <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-400" />
                            </div>
                            <p className="text-lg text-slate-300 font-medium group-hover:text-white transition-colors">
                                Drag Ministry Payroll File (CSV/XLSX)
                            </p>
                            <p className="text-sm text-slate-500 mt-2">Max File Size: 500MB | FIPS-140-2 Compliant</p>
                        </div>
                    ) : (
                        <div className="space-y-8 py-8">
                            <div className="flex items-center justify-between text-slate-300 mb-2 px-1">
                                <span className="font-mono text-sm bg-slate-800 px-2 py-1 rounded text-slate-400">{file.name}</span>
                                <span className="text-emerald-400 font-bold font-mono">{progress}%</span>
                            </div>

                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="flex justify-center">
                                <div className="flex items-center gap-2 text-emerald-500/90 font-mono text-sm bg-emerald-500/10 px-4 py-2 rounded-md border border-emerald-500/20 animate-pulse">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                    {status}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-950 p-4 border-t border-slate-800/50 text-center flex justify-between items-center px-6">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                        Sovereign Stack v2.0
                    </p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                        Official Use Only
                    </p>
                </div>
            </div>
        </div>
    );
}
