import { useTheme } from "@/context/Theme_Context";
import { getPalette } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageStyle } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleProp, View } from "react-native";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1200;

/**
 * Ảnh tour có trạng thái chờ rõ ràng:
 * - Đang tải → nền xám nhạt + spinner (không để ô ảnh trống trơn trong khi
 *   thông tin tour đã hiện ra rồi).
 * - Tải xong → fade-in mượt (expo-image `transition`), có cache memory + disk nên
 *   lần sau hiện ngay.
 * - Lỗi mạng / server ảnh chậm → tự thử lại tối đa {@link MAX_RETRIES} lần, mỗi lần
 *   cách {@link RETRY_DELAY_MS}ms; hết lượt mới hiện icon ảnh hỏng.
 *
 * Dùng thay cho `<Image>` của react-native ở mọi nơi hiện ảnh tour từ API.
 */
export function TourImage({
  uri,
  style,
  contentFit = "cover",
}: {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain";
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đổi ảnh (vd FlatList tái sử dụng ô) → reset trạng thái.
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setAttempt(0);
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [uri]);

  const handleError = () => {
    if (attempt >= MAX_RETRIES) {
      setFailed(true);
      return;
    }
    retryTimer.current = setTimeout(() => setAttempt((a) => a + 1), RETRY_DELAY_MS);
  };

  const hasUri = !!uri && uri.length > 0;

  return (
    <View style={[{ backgroundColor: palette.surfaceAlt, overflow: "hidden" }, style as any]}>
      {hasUri && !failed && (
        <Image
          // key đổi theo attempt → expo-image tải lại từ đầu sau lỗi.
          key={attempt}
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit={contentFit}
          transition={350}
          cachePolicy="memory-disk"
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      )}

      {!loaded && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {failed || !hasUri ? (
            <Ionicons name="image-outline" size={36} color={palette.iconMuted} />
          ) : (
            <ActivityIndicator size="small" color={palette.spinner} />
          )}
        </View>
      )}
    </View>
  );
}
