import { useEffect, useRef } from "react";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerFcmToken } from "@/services/user";
import { useNotification } from "@/context/Notification_Context";

// Từ Expo SDK 53, Expo Go trên Android không còn hỗ trợ remote push notification
// (Google giới hạn quota FCM dùng chung của Expo Go) — gọi getExpoPushTokenAsync()
// trong trường hợp này sẽ crash ứng dụng. iOS qua Expo Go KHÔNG bị ảnh hưởng, và
// development/production build thật (không qua Expo Go) cũng không bị ảnh hưởng
// ở cả 2 nền tảng vì lúc đó dùng project Firebase riêng của app, không qua Expo Go.
// Xem: https://docs.expo.dev/develop/development-builds/introduction/
//
// Dùng appOwnership (dù đã deprecated) thay vì executionEnvironment được khuyến
// nghị thay thế: executionEnvironment chỉ có "storeClient" gộp chung Expo Go VÀ
// development build (expo-dev-client) làm một — nếu dùng nó để chặn thì
// development build (thứ cần dùng để test push thật) cũng bị chặn theo, sai mục
// đích. appOwnership === "expo" mới phân biệt đúng riêng Expo Go.
const isExpoGoAndroid =
  Constants.appOwnership === "expo" && Platform.OS === "android";

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
    // Bỏ qua hẳn trên Expo Go + Android — gọi bất kỳ API push nào ở tổ hợp này
    // đều crash app (xem giải thích ở isExpoGoAndroid phía trên). Development/
    // production build thật và Expo Go trên iOS vẫn chạy đầy đủ như cũ.
    if (isExpoGoAndroid) return;

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
