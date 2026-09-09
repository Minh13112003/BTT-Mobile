import { useEffect, useRef } from "react";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { registerFcmToken } from "@/services/user";
import { useNotification } from "@/context/Notification_Context";

// Từ Expo SDK 53, Expo Go trên Android không còn hỗ trợ remote push notification
// (Google giới hạn quota FCM dùng chung của Expo Go). Quan trọng: lỗi này KHÔNG
// xảy ra khi gọi 1 API cụ thể nào — bản thân package expo-notifications tự đăng
// ký 1 listener push ở top-level (file DevicePushTokenAutoRegistration.fx.js,
// export lại từ index.ts của package) ngay khi module được `import`, nên chỉ cần
// `import * as Notifications from "expo-notifications"` tĩnh ở đầu file là đã đủ
// crash app trên Expo Go Android — không có điều kiện nào trong code app kịp
// chặn được vì lỗi xảy ra trước khi code app chạy dòng nào.
// → Giải pháp: KHÔNG static import expo-notifications ở đầu file. Chỉ dynamic
// import (await import(...)) bên trong effect, sau khi đã kiểm tra không phải
// Expo Go Android — nhờ vậy module (và file .fx.js gây crash) không bao giờ
// được load trên tổ hợp này.
// Xem: https://docs.expo.dev/develop/development-builds/introduction/
//
// Dùng appOwnership (dù đã deprecated) thay vì executionEnvironment được khuyến
// nghị thay thế: executionEnvironment chỉ có "storeClient" gộp chung Expo Go VÀ
// development build (expo-dev-client) làm một — nếu dùng nó để chặn thì
// development build (thứ cần dùng để test push thật) cũng bị chặn theo, sai mục
// đích. appOwnership === "expo" mới phân biệt đúng riêng Expo Go.
const isExpoGoAndroid =
  Constants.appOwnership === "expo" && Platform.OS === "android";

export function usePushNotifications(isLoggedIn: boolean) {
  const listenerRef = useRef<{ remove: () => void } | null>(null);
  const { refreshUnread } = useNotification();

  useEffect(() => {
    if (!isLoggedIn) return;
    // Bỏ qua hẳn trên Expo Go + Android — xem giải thích chi tiết ở đầu file.
    // Development/production build thật và Expo Go trên iOS vẫn chạy đầy đủ.
    if (isExpoGoAndroid) return;

    let cancelled = false;

    async function setup() {
      // Dynamic import — chỉ load module (và kích hoạt file .fx.js bên trong nó)
      // khi chắc chắn không phải Expo Go Android, nhờ điều kiện early-return ở trên.
      const Notifications = await import("expo-notifications");

      // Hiển thị banner khi app đang mở (foreground)
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

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

      if (cancelled) return;

      // Khi nhận notification mới → cập nhật badge ngay lập tức
      listenerRef.current = Notifications.addNotificationReceivedListener(() => {
        refreshUnread();
      });
    }

    setup();

    return () => {
      cancelled = true;
      listenerRef.current?.remove();
    };
  }, [isLoggedIn, refreshUnread]);
}
