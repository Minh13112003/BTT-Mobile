import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerFcmToken } from "@/services/user";
import { useNotification } from "@/context/Notification_Context";

// Hiển thị banner khi app đang mở (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(isLoggedIn: boolean) {
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);
  const { refreshUnread } = useNotification();

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    async function setup() {
      // Xin quyền
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return;

      // Android cần tạo channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Thông báo BenThanh Tourist",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#D0021B",
        });
      }

      // Lấy Expo Push Token (hoạt động cả trên giả lập có Google Play Services)
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: "da12616e-cd82-4ea6-8c64-f6912c4d4e87",
        });
        if (cancelled) return;
        await registerFcmToken(tokenData.data);
      } catch {
        // Giả lập không có Google Play Services → bỏ qua, không ảnh hưởng luồng chính
      }
    }

    setup();

    // Khi nhận notification mới → cập nhật badge ngay lập tức
    listenerRef.current = Notifications.addNotificationReceivedListener(() => {
      refreshUnread();
    });

    return () => {
      cancelled = true;
      listenerRef.current?.remove();
    };
  }, [isLoggedIn, refreshUnread]);
}
