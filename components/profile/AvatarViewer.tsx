import { FONT_SIZE } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  avatarUrl?: string | null;
  initials: string;
  name: string;
  tierName: string;
}

/** Xem ảnh đại diện phóng to (bấm avatar ở tab Tài khoản). Bấm bất kỳ đâu hoặc nút X để đóng. */
export default function AvatarViewer({ visible, onClose, avatarUrl, initials, name, tierName }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.min(width - 48, 360);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        onPress={onClose}
        accessibilityLabel="Đóng ảnh đại diện"
        style={{ flex: 1, backgroundColor: "rgba(12,6,8,0.9)", alignItems: "center", justifyContent: "center" }}
      >
        <Pressable
          onPress={onClose}
          accessibilityLabel="Đóng"
          hitSlop={8}
          style={{
            position: "absolute",
            top: insets.top + 12,
            right: 18,
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.14)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>

        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 4,
            borderColor: "#F0C020",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#C9962B",
          }}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: size, height: size }} resizeMode="cover" />
          ) : (
            <Text className="text-white font-black" style={{ fontSize: size / 3.4 }}>
              {initials}
            </Text>
          )}
        </View>

        <Text className="text-white font-bold mt-5" style={{ fontSize: FONT_SIZE.lg }}>
          {name}
        </Text>
        <Text className="mt-1" style={{ fontSize: FONT_SIZE.xxs, color: "#FFF1B8" }}>
          Hạng {tierName}
        </Text>
        <Text className="absolute text-white/60" style={{ bottom: insets.bottom + 28, fontSize: FONT_SIZE.xxs }}>
          Chạm ra ngoài để đóng
        </Text>
      </Pressable>
    </Modal>
  );
}
