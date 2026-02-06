// HAKIKI SENTINEL - Root Layout with Stack Navigation
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerTintColor: Colors.white,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: Colors.background,
                    },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'HAKIKI SENTINEL',
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="dashboard"
                    options={{
                        title: 'Duty Station',
                        headerBackVisible: false,
                    }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
