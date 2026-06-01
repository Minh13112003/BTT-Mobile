import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/Auth_Context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}