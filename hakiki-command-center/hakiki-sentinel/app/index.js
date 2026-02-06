// HAKIKI SENTINEL - Login Screen
import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export default function LoginScreen() {
    const router = useRouter();
    const [nationalId, setNationalId] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        // Basic validation: 8-digit National ID
        if (!nationalId || nationalId.length < 7) {
            setError('Enter a valid National ID (7-8 digits)');
            return;
        }

        // Store ID and navigate to dashboard
        router.push({
            pathname: '/dashboard',
            params: { nationalId }
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Logo / Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>🛡️</Text>
                </View>
                <Text style={styles.title}>HAKIKI SENTINEL</Text>
                <Text style={styles.subtitle}>Proof of Presence System</Text>
                <Text style={styles.tagline}>Republic of Kenya • Civil Service</Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
                <Text style={styles.label}>NATIONAL ID NUMBER</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 12345678"
                    placeholderTextColor={Colors.lightGray}
                    value={nationalId}
                    onChangeText={(text) => {
                        setNationalId(text.replace(/[^0-9]/g, ''));
                        setError('');
                    }}
                    keyboardType="numeric"
                    maxLength={8}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>LOGIN TO DUTY STATION</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    🔒 Sovereign System • Offline-Capable
                </Text>
                <Text style={styles.version}>v2.0.0-alpha</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 24,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: Colors.gold,
    },
    logoIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    tagline: {
        fontSize: 11,
        color: Colors.lightGray,
        marginTop: 8,
        letterSpacing: 1,
    },
    form: {
        backgroundColor: Colors.card,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    label: {
        fontSize: 12,
        color: Colors.gold,
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: Colors.darkGray,
        borderWidth: 1,
        borderColor: Colors.mediumGray,
        borderRadius: 8,
        padding: 16,
        fontSize: 20,
        color: Colors.white,
        textAlign: 'center',
        letterSpacing: 4,
        fontWeight: 'bold',
    },
    error: {
        color: Colors.danger,
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 8,
        marginTop: 24,
        borderWidth: 1,
        borderColor: Colors.primaryLight,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        color: Colors.lightGray,
        fontSize: 12,
    },
    version: {
        color: Colors.mediumGray,
        fontSize: 10,
        marginTop: 4,
    },
});
