import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/Auth_Context';
import { ThemeProvider } from '@/context/Theme_Context';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  );
}