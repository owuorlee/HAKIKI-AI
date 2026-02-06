// HAKIKI SENTINEL - Dashboard with GPS, Camera, and Offline Storage
import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Modal
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';

// DUTY STATION: Your Current Location (1°05'08.0"S 37°01'08.5"E)
const DUTY_STATION = {
    name: "Duty Station Alpha",
    lat: -1.0856,
    long: 37.0190,
    radiusMeters: 500, // 500m geofence
};

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

export default function DashboardScreen() {
    const { nationalId } = useLocalSearchParams();
    const cameraRef = useRef(null);

    // States
    const [status, setStatus] = useState('INACTIVE');
    const [locationStatus, setLocationStatus] = useState(null); // null | 'ON_SITE' | 'OFF_SITE'
    const [currentLocation, setCurrentLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [logs, setLogs] = useState([]);
    const [permission, requestPermission] = useCameraPermissions();

    // Load logs on mount
    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const stored = await AsyncStorage.getItem('duty_logs');
            if (stored) {
                setLogs(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load logs:', e);
        }
    };

    const saveLogs = async (newLogs) => {
        try {
            await AsyncStorage.setItem('duty_logs', JSON.stringify(newLogs));
            setLogs(newLogs);
        } catch (e) {
            console.error('Failed to save logs:', e);
        }
    };

    // GPS Location Check
    const checkLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location access is required for duty verification.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;
            setCurrentLocation({ lat: latitude, long: longitude });

            const dist = calculateDistance(
                latitude, longitude,
                DUTY_STATION.lat, DUTY_STATION.long
            );
            setDistance(Math.round(dist));

            if (dist <= DUTY_STATION.radiusMeters) {
                setLocationStatus('ON_SITE');
                setStatus('LOCATION VERIFIED');
            } else {
                setLocationStatus('OFF_SITE');
                setStatus('LOCATION FAILED');
            }
        } catch (error) {
            Alert.alert('GPS Error', error.message);
        }
    };

    // Camera & Clock-In Flow
    const startClockIn = async () => {
        if (locationStatus !== 'ON_SITE') {
            Alert.alert('Location Required', 'Please verify your location first.');
            return;
        }

        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permission Denied', 'Camera access is required for verification.');
                return;
            }
        }

        setShowCamera(true);
    };

    const capturePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: false,
                });

                // Create log entry
                const logEntry = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    national_id: nationalId,
                    gps: currentLocation,
                    distance_meters: distance,
                    photo_uri: photo.uri,
                    is_offline: true, // Assuming offline for Alpha
                    duty_station: DUTY_STATION.name,
                };

                // Save to AsyncStorage
                const newLogs = [logEntry, ...logs].slice(0, 10); // Keep last 10
                await saveLogs(newLogs);

                setShowCamera(false);
                setStatus('CLOCKED IN ✓');
                Alert.alert(
                    '✅ Clock-In Successful',
                    `Duty verified at ${DUTY_STATION.name}\nTime: ${new Date().toLocaleTimeString()}`
                );
            } catch (error) {
                Alert.alert('Camera Error', error.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Worker ID Card */}
                <View style={styles.idCard}>
                    <Text style={styles.idLabel}>NATIONAL ID</Text>
                    <Text style={styles.idNumber}>{nationalId || '--------'}</Text>
                </View>

                {/* Status Card */}
                <View style={[
                    styles.statusCard,
                    status.includes('CLOCKED') && styles.statusSuccess,
                    status.includes('FAILED') && styles.statusDanger,
                ]}>
                    <Text style={styles.statusLabel}>WORKER STATUS</Text>
                    <Text style={styles.statusText}>{status}</Text>
                </View>

                {/* Location Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 GEOFENCE CHECK</Text>

                    <View style={styles.locationInfo}>
                        <Text style={styles.dutyStation}>
                            Duty Station: {DUTY_STATION.name}
                        </Text>
                        {distance !== null && (
                            <Text style={styles.distance}>
                                Distance: {distance}m {distance <= DUTY_STATION.radiusMeters ? '(Within Range)' : '(Too Far)'}
                            </Text>
                        )}
                    </View>

                    {locationStatus && (
                        <View style={[
                            styles.badge,
                            locationStatus === 'ON_SITE' ? styles.badgeSuccess : styles.badgeDanger
                        ]}>
                            <Text style={styles.badgeText}>
                                {locationStatus === 'ON_SITE' ? '✅ ON SITE' : '❌ OFF SITE'}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={checkLocation}>
                        <Text style={styles.buttonText}>VERIFY LOCATION</Text>
                    </TouchableOpacity>
                </View>

                {/* Clock In Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📸 CLOCK IN</Text>
                    <Text style={styles.sectionHint}>
                        Capture selfie to verify presence
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.clockInButton,
                            locationStatus !== 'ON_SITE' && styles.buttonDisabled
                        ]}
                        onPress={startClockIn}
                        disabled={locationStatus !== 'ON_SITE'}
                    >
                        <Text style={styles.clockInText}>🔐 CLOCK IN NOW</Text>
                    </TouchableOpacity>
                </View>

                {/* Duty Logs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 RECENT LOGS</Text>
                    {logs.length === 0 ? (
                        <Text style={styles.emptyLogs}>No clock-ins recorded yet</Text>
                    ) : (
                        logs.slice(0, 3).map((log) => (
                            <View key={log.id} style={styles.logItem}>
                                <Text style={styles.logTime}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </Text>
                                <Text style={styles.logDetails}>
                                    📍 {log.duty_station} • {log.distance_meters}m
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Camera Modal */}
            <Modal visible={showCamera} animationType="slide">
                <View style={styles.cameraContainer}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="front"
                    >
                        <View style={styles.cameraOverlay}>
                            <Text style={styles.cameraHint}>
                                Look at the camera and hold still
                            </Text>
                            <View style={styles.cameraGuide} />
                        </View>
                    </CameraView>

                    <View style={styles.cameraControls}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowCamera(false)}
                        >
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={capturePhoto}
                        >
                            <Text style={styles.captureText}>📸 CAPTURE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    idCard: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.gold,
        alignItems: 'center',
        marginBottom: 16,
    },
    idLabel: {
        fontSize: 11,
        color: Colors.gold,
        letterSpacing: 2,
    },
    idNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 4,
        marginTop: 4,
    },
    statusCard: {
        backgroundColor: Colors.mediumGray,
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    statusSuccess: {
        backgroundColor: Colors.primary,
    },
    statusDanger: {
        backgroundColor: Colors.danger,
    },
    statusLabel: {
        fontSize: 11,
        color: Colors.lightGray,
        letterSpacing: 2,
    },
    statusText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
        marginTop: 8,
    },
    section: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.gold,
        marginBottom: 12,
        letterSpacing: 1,
    },
    sectionHint: {
        fontSize: 12,
        color: Colors.lightGray,
        marginBottom: 12,
    },
    locationInfo: {
        marginBottom: 12,
    },
    dutyStation: {
        fontSize: 13,
        color: Colors.white,
    },
    distance: {
        fontSize: 12,
        color: Colors.lightGray,
        marginTop: 4,
    },
    badge: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeSuccess: {
        backgroundColor: 'rgba(0, 170, 0, 0.2)',
        borderWidth: 1,
        borderColor: Colors.success,
    },
    badgeDanger: {
        backgroundColor: 'rgba(204, 0, 0, 0.2)',
        borderWidth: 1,
        borderColor: Colors.danger,
    },
    badgeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    clockInButton: {
        backgroundColor: Colors.gold,
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
    },
    clockInText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    emptyLogs: {
        color: Colors.lightGray,
        fontSize: 12,
        textAlign: 'center',
        paddingVertical: 16,
    },
    logItem: {
        backgroundColor: Colors.darkGray,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    logTime: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: '600',
    },
    logDetails: {
        fontSize: 11,
        color: Colors.lightGray,
        marginTop: 4,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraHint: {
        color: Colors.white,
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    cameraGuide: {
        width: 200,
        height: 260,
        borderWidth: 3,
        borderColor: Colors.gold,
        borderRadius: 120,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: Colors.darkGray,
    },
    cancelButton: {
        padding: 16,
        backgroundColor: Colors.mediumGray,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    captureButton: {
        padding: 16,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    captureText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
