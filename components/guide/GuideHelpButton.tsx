import { GuideTab } from "@/constants/guideSteps";
import { useAuth } from "@/context/Auth_Context";
import { useGuideStart, useGuideTarget } from "@/context/Guide_Context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

/**
 * Nút ? trên header của từng tab — bấm để xem lại hướng dẫn của tab đó.
 * Cùng kiểu nút tròn trắng mờ trên nền đỏ (44 ở Trang chủ cạnh chuông, 40 trên TabHeader). Ẩn khi chưa đăng nhập.
 */
export default function GuideHelpButton({ tab, size = 40 }: { tab: GuideTab; size?: number }) {
  const { isLoggedIn } = useAuth();
  const start = useGuideStart();
  const guideRef = useGuideTarget(`${tab}.help`);
  if (!isLoggedIn) return null;

  return (
    <TouchableOpacity
      ref={guideRef}
      onPress={() => start(tab)}
      activeOpacity={0.8}
      accessibilityLabel="Xem hướng dẫn sử dụng"
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      className="rounded-full items-center justify-center border border-white/25 bg-white/15"
      style={{ width: size, height: size }}
    >
      <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
