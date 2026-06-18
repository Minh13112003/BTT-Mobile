import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerFcmToken } from "@/services/user";

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

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    async function setup() {
      // Chỉ chạy trên thiết bị thật (không phải simulator)
      if (!Device.isDevice) return;

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

      // Lấy Expo Push Token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      if (cancelled) return;

      // Gửi token lên backend
      try {
        await registerFcmToken(tokenData.data);
      } catch {
        // Bỏ qua lỗi — không ảnh hưởng đến luồng chính
      }
    }

    setup();

    // Lắng nghe notification khi app đang mở
    listenerRef.current = Notifications.addNotificationReceivedListener(() => {
      // Expo tự hiển thị banner, không cần làm gì thêm
    });

    return () => {
      cancelled = true;
      listenerRef.current?.remove();
    };
  }, [isLoggedIn]);
}
