/**
 * SentinelApp - Biometric Verification with Live Camera
 * Phase 4: Added back button for dashboard navigation
 */
import { useState, useRef, useEffect } from 'react';
import { MapPin, ShieldCheck, UserCheck, ScanFace, Activity, CheckCircle, ChevronLeft, X } from 'lucide-react';

interface SentinelAppProps {
    onClose?: () => void;
    onBack?: () => void;
}

const SentinelApp: React.FC<SentinelAppProps> = ({ onClose, onBack }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [step, setStep] = useState<'SELECT' | 'SCAN_PASSIVE' | 'SCAN_ACTIVE' | 'SUCCESS'>('SELECT');
    const [status, setStatus] = useState("Initializing Secure Environment...");
    const [locationName, setLocationName] = useState("Triangulating...");
    const [instruction, setInstruction] = useState("");
    const [progress, setProgress] = useState(0);

    // Handle back/close - use onBack if provided, otherwise onClose
    const handleBack = () => {
        stopCamera();
        if (onBack) onBack();
        else if (onClose) onClose();
    };

    // 1. STARTUP: Get Location (Simulated JKUAT Lock)
    useEffect(() => {
        setTimeout(() => {
            setLocationName("JKUAT Main Campus, Juja (0.5m Accuracy)");
            setStatus("Geofence: SECURE");
        }, 1500);
    }, []);

    // 2. CAMERA LOGIC
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Camera Error: Please allow camera access for the demo.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // 3. PASSIVE SCAN (Moire Pattern)
    const startPassiveScan = () => {
        setStep('SCAN_PASSIVE');
        setProgress(0);
        startCamera();
        setStatus("Analyzing Moire Patterns...");

        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                completeVerification("Moire Pattern Analysis: ORGANIC");
            }
        }, 50);
    };

    // 4. ACTIVE SCAN (Gestures)
    const startActiveScan = () => {
        setStep('SCAN_ACTIVE');
        setProgress(0);
        startCamera();

        setStatus("Active Liveness Challenge");
        setInstruction("Please SMILE to verify vitality...");

        setTimeout(() => {
            setInstruction("Verifying Micro-Expressions...");
            setProgress(33);
        }, 2000);

        setTimeout(() => {
            setInstruction("Please TURN HEAD LEFT...");
            setProgress(66);
        }, 4000);

        setTimeout(() => {
            setInstruction("Analysis Complete.");
            setProgress(100);
            completeVerification("Biometric Vitality: CONFIRMED");
        }, 6000);
    };

    const completeVerification = (msg: string) => {
        stopCamera();
        setStep('SUCCESS');
        setStatus(msg);
    };

    const resetScan = () => {
        stopCamera();
        setStep('SELECT');
        setStatus("Geofence: SECURE");
        setProgress(0);
        setInstruction("");
    };

    return (
        <div className="bg-zinc-900 border border-emerald-500/30 w-[400px] h-[700px] rounded-[3rem] p-6 relative shadow-2xl mx-auto overflow-hidden flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

            {/* Close Button (X) */}
            {onClose && (
                <button
                    onClick={handleBack}
                    className="absolute top-8 right-4 p-2 text-zinc-400 hover:text-white z-30"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Header with Back Button */}
            <div className="mt-8 flex justify-between items-center mb-6">
                <div>
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors mb-1 text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" /> SENTINEL
                    </h2>
                </div>
                <div className="text-right mt-4">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span className="max-w-[100px] truncate">{locationName}</span>
                    </div>
                </div>
            </div>

            {/* --- SCREEN 1: SELECTION --- */}
            {step === 'SELECT' && (
                <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 text-center mb-4">
                        <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <h3 className="text-white font-bold">Identity Verification</h3>
                        <p className="text-xs text-zinc-400">Select a protocol to proceed.</p>
                    </div>

                    <button
                        onClick={startPassiveScan}
                        className="group relative bg-zinc-800 hover:bg-zinc-700 p-6 rounded-xl text-left transition-all border border-zinc-700 hover:border-emerald-500"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <ScanFace className="w-8 h-8 text-blue-400 group-hover:text-emerald-400 transition-colors" />
                            <span className="bg-blue-900/50 text-blue-400 text-[10px] px-2 py-1 rounded">FAST</span>
                        </div>
                        <h4 className="text-white font-bold">Passive Scan (Moire)</h4>
                        <p className="text-xs text-zinc-500 mt-1">Analyzes screen pixel patterns to detect spoofing.</p>
                    </button>

                    <button
                        onClick={startActiveScan}
                        className="group relative bg-zinc-800 hover:bg-zinc-700 p-6 rounded-xl text-left transition-all border border-zinc-700 hover:border-emerald-500"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Activity className="w-8 h-8 text-orange-400 group-hover:text-emerald-400 transition-colors" />
                            <span className="bg-orange-900/50 text-orange-400 text-[10px] px-2 py-1 rounded">HIGH SECURITY</span>
                        </div>
                        <h4 className="text-white font-bold">Active Challenge</h4>
                        <p className="text-xs text-zinc-500 mt-1">Interactive gesture verification (Smile / Turn).</p>
                    </button>
                </div>
            )}

            {/* --- SCREEN 2: CAMERA (Scanning) --- */}
            {(step === 'SCAN_PASSIVE' || step === 'SCAN_ACTIVE') && (
                <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-80"
                    />

                    {/* Overlay UI */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 z-10">
                        <div className="w-full bg-black/50 backdrop-blur-md p-3 rounded-lg text-center border border-white/10">
                            <p className="text-emerald-400 font-mono text-xs animate-pulse uppercase">{status}</p>
                        </div>

                        {step === 'SCAN_ACTIVE' && instruction && (
                            <div className="text-2xl font-bold text-white drop-shadow-lg text-center animate-bounce">
                                {instruction}
                            </div>
                        )}

                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-300 font-mono">
                                <span>CONFIDENCE</span>
                                <span>{(progress * 0.98).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${progress}%` }}
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Scanning Line Animation (Passive Only) */}
                    {step === 'SCAN_PASSIVE' && (
                        <div
                            className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_#10b981]"
                            style={{
                                animation: 'scan 2s ease-in-out infinite',
                                top: `${(progress % 100)}%`
                            }}
                        ></div>
                    )}
                </div>
            )}

            {/* --- SCREEN 3: SUCCESS --- */}
            {step === 'SUCCESS' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Identity Verified</h2>
                    <p className="text-sm text-zinc-400 mb-8 max-w-[200px]">{status}</p>

                    <div className="w-full bg-zinc-800 p-4 rounded-xl border border-zinc-700 text-left space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>DEVICE ID</span>
                            <span className="text-white font-mono">SENTINEL-JKUAT-01</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>TIMESTAMP</span>
                            <span className="text-white font-mono">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>GPS LOCK</span>
                            <span className="text-emerald-400 font-mono">VALID (JUJA)</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2 w-full">
                        <button
                            onClick={resetScan}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm transition-colors"
                        >
                            Start New Scan
                        </button>
                        <button
                            onClick={handleBack}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-sm transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* CSS for scanning animation */}
            <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
        </div>
    );
};

export default SentinelApp;
