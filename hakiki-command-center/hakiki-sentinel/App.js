import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState(null);
  const [nationalId, setNationalId] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Request Location Permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sentinel requires location access to verify duty station.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: '#fff' }}>
          HAKIKI Sentinel requires camera access.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCheckIn = async () => {
    if (!nationalId) {
      Alert.alert("Missing ID", "Please enter your National ID.");
      return;
    }
    if (!cameraRef.current) return;

    setIsAuthenticating(true);

    try {
      // 1. Capture Face
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });

      // 2. Get Fresh Location
      const currentLocation = await Location.getCurrentPositionAsync({});

      const payload = {
        nationalId,
        photoUri: photo.uri,
        location: currentLocation.coords
      };

      console.log("🚀 AUTH PAYLOAD GENERATED:", JSON.stringify(payload, null, 2));

      // Simulate API Call delay
      setTimeout(() => {
        Alert.alert("✅ SUCCESS", "Sovereign Check-In Verified.\nLocation: " + currentLocation.coords.latitude + ", " + currentLocation.coords.longitude);
        setIsAuthenticating(false);
        setNationalId('');
      }, 1500);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Authentication Failed.");
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HAKIKI SENTINEL</Text>
        <Text style={styles.subtitle}>SOVEREIGN ACCESS TERMINAL</Text>
      </View>

      <View style={styles.content}>
        {/* Input Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NATIONAL ID / SERVICE NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter ID"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={nationalId}
            onChangeText={setNationalId}
          />
        </View>

        {/* Camera Section */}
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="front"
            ref={cameraRef}
          >
            <View style={styles.faceGuide} />
          </CameraView>
          <Text style={styles.caption}>Align face within box for biometric scan</Text>
        </View>

        {/* Action Section */}
        <TouchableOpacity
          style={[styles.authButton, isAuthenticating && styles.disabledButton]}
          onPress={handleCheckIn}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.authButtonText}>AUTHENTICATE & CHECK IN</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingTop: 40,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    alignItems: 'center',
  },
  title: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#666',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#888',
    fontSize: 10,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  cameraContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  faceGuide: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    borderRadius: 125,
    margin: 20,
  },
  caption: {
    color: '#444',
    fontSize: 10,
    marginTop: 12,
  },
  authButton: {
    backgroundColor: '#00ff00',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#005500',
  },
  authButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#00ff00',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold'
  }
});
