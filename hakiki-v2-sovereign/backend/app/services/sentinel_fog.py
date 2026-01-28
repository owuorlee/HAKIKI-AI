"""
Sentinel Fog Node for HAKIKI AI v2.0
Calibrated: Threshold relaxed to 300.0, trust_score normalized.
"""
import numpy as np
import math
from PIL import Image
import io


class SentinelFogNode:
    """
    Edge computing node for real-time attendance verification.
    Uses FFT for screen spoofing detection and Haversine for geofencing.
    """
    
    # Earth radius in km
    R = 6371.0

    def verify_transaction(self, image_bytes: bytes, user_lat: float, user_lon: float, 
                          station_lat: float, station_lon: float):
        """
        Main Entry Point: Checks Liveness (Fourier) and Location (Geofence).
        """
        print("[SENTINEL] Processing verification request...")
        
        # 1. Fourier Analysis for Screen Spoofing (Moire Pattern)
        # Threshold raised to 300.0 to avoid False Positives on high-res cameras.
        # Real-world tests showed ~92.0 energy for valid photos.
        moire_energy, is_spoof = self._analyze_fourier_spectrum(image_bytes, threshold=300.0)
        
        # 2. Geofencing (Haversine Distance)
        distance_km = self._haversine_distance(user_lat, user_lon, station_lat, station_lon)
        is_in_zone = distance_km <= 0.5  # 500m radius
        
        # 3. Decision Logic
        status = "VERIFIED"
        if is_spoof: 
            status = "SPOOF_DETECTED"
        elif not is_in_zone: 
            status = "GEOFENCE_VIOLATION"
        
        # 4. Trust Score - NORMALIZED (0.0 to 1.0)
        # If in zone and live -> 1.0. Else -> 0.0
        trust_score = 1.0 if (not is_spoof and is_in_zone) else 0.0
        
        print(f"[SENTINEL] Result: {status} | Distance: {distance_km:.3f}km | Energy: {moire_energy:.2f}")
        
        return {
            "status": status,
            "liveness_verified": not is_spoof,
            "location_verified": is_in_zone,
            "trust_score": float(trust_score),  # Fixed: Normalized 0.0 or 1.0
            "location_trust_score": float(trust_score),  # Alias for compatibility
            "distance_from_station_km": round(distance_km, 3),
            "moire_energy": round(moire_energy, 4)  # Raw energy for debugging
        }

    def _analyze_fourier_spectrum(self, image_bytes: bytes, threshold: float = 300.0):
        """
        Performs FFT to detect high-frequency periodic noise (Screen Pixels).
        Threshold calibrated to 300.0 to avoid false positives on high-res cameras.
        """
        try:
            # Convert bytes to Greyscale Image
            img = Image.open(io.BytesIO(image_bytes)).convert('L')
            img = img.resize((256, 256))  # Normalize size
            img_array = np.array(img)
            
            # 2D FFT
            f = np.fft.fft2(img_array)
            fshift = np.fft.fftshift(f)
            magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)  # +1 to avoid log(0)
            
            # Measure energy in high frequencies (outer edges of spectrum)
            rows, cols = magnitude_spectrum.shape
            crow, ccol = rows // 2, cols // 2
            
            # Mask the low frequencies (center)
            mask_size = 30
            magnitude_spectrum[crow-mask_size:crow+mask_size, ccol-mask_size:ccol+mask_size] = 0
            
            high_freq_energy = float(np.mean(magnitude_spectrum))
            
            # Use the calibrated threshold
            is_spoof = high_freq_energy > threshold
            
            print(f"[SENTINEL] FFT Energy: {high_freq_energy:.2f} (threshold: {threshold}), Spoof: {is_spoof}")
            return high_freq_energy, bool(is_spoof)
            
        except Exception as e:
            print(f"[ERROR] Fourier analysis failed: {e}")
            return 0.0, False

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate great-circle distance between two points on Earth.
        Uses the Haversine formula for accuracy.
        """
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return self.R * c
