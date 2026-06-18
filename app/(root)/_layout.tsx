import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/Auth_Context';
import { ThemeProvider } from '@/context/Theme_Context';
import { NotificationProvider } from '@/context/Notification_Context';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}