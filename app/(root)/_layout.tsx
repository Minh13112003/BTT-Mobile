import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/Auth_Context';
import { ThemeProvider } from '@/context/Theme_Context';
import { NotificationProvider } from '@/context/Notification_Context';
import { ChatbotProvider } from '@/context/Chatbot_Context';
import { GuideProvider } from '@/context/Guide_Context';
import ChatbotHost from '@/components/chatbot/ChatbotHost';
import ProfileCompletionPrompt from '@/components/profile/ProfileCompletionPrompt';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ChatbotProvider>
            <GuideProvider>
              <Stack screenOptions={{ headerShown: false }} />
              <ChatbotHost />
              <ProfileCompletionPrompt />
            </GuideProvider>
          </ChatbotProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
