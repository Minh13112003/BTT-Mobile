import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Linking, TouchableOpacity } from "react-native";
import CustomAlert from "@/components/CustomAlert";

const ZALO_GROUP_URL = "https://zalo.me/237833859403376914";

interface ZaloFloatingButtonProps {
  /** Đẩy nút lên cao hơn vị trí mặc định — dùng khi nút "lên đầu trang" cũng đang hiển thị để 2 nút không đè nhau. */
  liftBy?: number;
  /** Vị trí `bottom` mặc định — dùng khi màn hình có thanh CTA dính đáy (vd BookingBar) cần né. */
  baseBottom?: number;
}

/**
 * Nút nổi liên hệ Zalo — luôn hiển thị, mờ đi (opacity) để không che chữ phía sau,
 * rung lắc định kỳ để thu hút chú ý. Nhấn vào sẽ hỏi xác nhận trước khi mở nhóm Zalo.
 */
export default function ZaloFloatingButton({ liftBy = 0, baseBottom = 30 }: ZaloFloatingButtonProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shakeAnim]);

  const rotate = shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: ["-10deg", "10deg"] });

  return (
    <>
      <Animated.View
        style={{
          position: "absolute",
          bottom: baseBottom + liftBy,
          right: 20,
          zIndex: 98,
          transform: [{ rotate }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setConfirmVisible(true)}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            overflow: "hidden",
            opacity: 0.6,
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Image
            source={require("../assets/images/logo-zalo-vector-35.jpg")}
            style={{ width: 50, height: 50 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </Animated.View>

      <CustomAlert
        visible={confirmVisible}
        type="confirm"
        title="Mở Zalo"
        message="Bạn có muốn mở Zalo để tham gia nhóm hỗ trợ của BenThanh Tourist không?"
        confirmText="Mở Zalo"
        cancelText="Để sau"
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => {
          Linking.openURL(ZALO_GROUP_URL).catch(() => {});
        }}
      />
    </>
  );
}
