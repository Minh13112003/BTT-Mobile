import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

interface TabHeaderProps {
  title: string;
  subtitle?: string;
  /** Nút/hành động đặt bên phải tiêu đề (vd "Đọc tất cả"). */
  right?: React.ReactNode;
  /** Nội dung thêm bên dưới tiêu đề (vd ô tìm kiếm). */
  children?: React.ReactNode;
  /** false khi cha đã tự chừa safe-area phía trên (header nổi/collapsing). */
  safeArea?: boolean;
  /** Hiện nút quay lại bên trái tiêu đề. */
  onBack?: () => void;
}

/**
 * Header đỏ dùng chung cho các tab (Du lịch, Lịch sử, Thông báo): tiêu đề +
 * phụ đề, vòng tròn trang trí và logo in chìm góc phải, bo tròn đáy.
 */
export default function TabHeader({ title, subtitle, right, children, safeArea = true, onBack }: TabHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={isDark ? ["#2A2E38", "#1E222B", "#14161C"] : ["#B30014", "#8A0010", "#5C000B"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{
        paddingTop: (safeArea ? insets.top : 0) + 18,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: "hidden",
      }}
    >
      <Svg width={390} height={160} style={{ position: "absolute", top: 0, right: 0 }}>
        <Circle cx={360} cy={10} r={120} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
      </Svg>
      <Image
        source={require("@/assets/images/Logo_BTT-2018-02.png")}
        style={{ position: "absolute", right: -40, bottom: -14, width: 200, height: 100, opacity: 0.12 }}
        resizeMode="contain"
      />
      <View className="flex-row items-center justify-between">
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full items-center justify-center mr-3 border border-white/25 bg-white/15"
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
        <View className="flex-1 pr-3">
          <Text className="text-white font-black" style={{ fontSize: FONT_SIZE.xl }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-white/75 mt-0.5" style={{ fontSize: FONT_SIZE.xxs }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
}
