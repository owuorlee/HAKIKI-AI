/**
 * SentinelMobile - Mobile App Simulator for Attendance Verification
 * Fixed: GPS now correctly sends KICC coordinates for "Safe Zone"
 */
import { useState, useRef } from 'react';
import {
    X, Camera, MapPin, ShieldAlert, CheckCircle,
    Loader2, Smartphone, Signal, Battery, Fingerprint
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1';

// KICC Coordinates (Target Station)
const KICC_LAT = -1.2884;
const KICC_LON = 36.8233;

// Mock locations
const LOCATIONS = {
    SAFE: { lat: KICC_LAT, lon: KICC_LON, name: 'KICC, Nairobi (VALID)' },
    SPOOF: { lat: 0.0, lon: 0.0, name: 'Atlantic Ocean (SPOOF)' }
};

interface SentinelMobileProps {
    onClose: () => void;
}

interface VerificationResult {
    employee_id: string;
    sentinel_analysis: {
        status: string;
        liveness_verified: boolean;
        location_verified: boolean;
        trust_score: number;
        distance_from_station_km: number;
        moire_energy: number;
    };
    registered_station: string;
}

const SentinelMobile: React.FC<SentinelMobileProps> = ({ onClose }) => {
    const [gpsMode, setGpsMode] = useState<'SAFE' | 'SPOOF'>('SAFE');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
            setResult(null);
        }
    };

    const handleVerify = async () => {
        if (!file) {
            alert("Please capture a selfie first");
            return;
        }

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("employee_id", "EMP-DEMO-001");
        formData.append("image", file);

        // Send exact coordinates based on GPS mode
        const coords = LOCATIONS[gpsMode];
        formData.append("lat", coords.lat.toString());
        formData.append("lon", coords.lon.toString());

        try {
            const response = await fetch(`${API_BASE}/audit/sentinel/verify`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Verification failed');

            const data: VerificationResult = await response.json();
            setResult(data);
        } catch (e) {
            console.error('Verification error:', e);
            alert("Connection Error. Check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const isVerified = result?.sentinel_analysis?.status === 'VERIFIED';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Phone Frame */}
            <div
                className="bg-black border-4 border-zinc-700 w-[360px] rounded-[40px] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Phone Notch */}
                <div className="bg-black h-8 flex items-center justify-center relative">
                    <div className="absolute left-4 flex items-center gap-1">
                        <Signal className="w-3 h-3 text-white" />
                        <span className="text-[10px] text-white">5G</span>
                    </div>
                    <div className="w-24 h-5 bg-zinc-900 rounded-b-xl" />
                    <div className="absolute right-4 flex items-center gap-1">
                        <Battery className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* App Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-white" />
                        <span className="text-white font-bold">SENTINEL v2.0</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* App Content */}
                <div className="p-4 space-y-4 bg-zinc-950 min-h-[500px]">
                    {/* Camera Box */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-56 bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-700 
                                 flex items-center justify-center cursor-pointer hover:border-emerald-500/50 
                                 transition-colors overflow-hidden relative"
                    >
                        {preview ? (
                            <img src={preview} alt="Captured" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">Tap to Capture Face</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* GPS Toggle */}
                    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-zinc-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> GPS SIGNAL
                            </span>
                            <button
                                onClick={() => { setGpsMode(gpsMode === 'SAFE' ? 'SPOOF' : 'SAFE'); setResult(null); }}
                                className={`text-xs px-3 py-1 rounded font-bold transition-colors ${gpsMode === 'SAFE'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                    }`}
                            >
                                {gpsMode === 'SAFE' ? 'KICC (VALID)' : 'ATLANTIC (SPOOF)'}
                            </button>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                            Lat: {LOCATIONS[gpsMode].lat.toFixed(4)} | Lon: {LOCATIONS[gpsMode].lon.toFixed(4)}
                        </div>
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={handleVerify}
                        disabled={loading || !file}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-blue-600 
                                 hover:from-emerald-500 hover:to-blue-500 disabled:from-zinc-700 disabled:to-zinc-700
                                 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                ANALYZING...
                            </>
                        ) : (
                            <>
                                <Fingerprint className="w-5 h-5" />
                                CLOCK IN
                            </>
                        )}
                    </button>

                    {/* Results Area */}
                    {result && (
                        <div className={`p-4 rounded-lg border ${isVerified
                                ? 'bg-emerald-900/30 border-emerald-500/50'
                                : 'bg-red-900/30 border-red-500/50'
                            }`}>
                            <div className="flex items-center gap-2 mb-3">
                                {isVerified
                                    ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    : <ShieldAlert className="w-6 h-6 text-red-400" />
                                }
                                <span className={`font-bold text-lg ${isVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.sentinel_analysis.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="space-y-2 text-xs font-mono">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Trust Score:</span>
                                    <span className="text-white">{(result.sentinel_analysis.trust_score * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Distance:</span>
                                    <span className="text-white">{result.sentinel_analysis.distance_from_station_km.toFixed(2)} km</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Liveness:</span>
                                    <span className={result.sentinel_analysis.liveness_verified ? 'text-emerald-400' : 'text-red-400'}>
                                        {result.sentinel_analysis.liveness_verified ? "REAL HUMAN" : "SCREEN SPOOF"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Station:</span>
                                    <span className="text-white">{result.registered_station}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Bottom Bar */}
                <div className="h-6 bg-black flex items-center justify-center">
                    <div className="w-28 h-1 bg-white/30 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default SentinelMobile;
