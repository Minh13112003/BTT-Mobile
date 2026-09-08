import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { logout as apiLogout } from "@/services/auth";
import { getPalette, getShadow, RADIUS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Tỉ lệ gốc của logo (cao / rộng) để co giãn mà không méo. */
const LOGO_ASPECT = 60 / 190;
/** Bề rộng tối đa của logo (để trên tablet không bị phóng quá to). */
const LOGO_MAX_WIDTH = 190;

interface HeaderProps {
  title?: string;
  showActions?: boolean;
  /** When false, skips the top safe-area inset (the parent already provides it). */
  safeArea?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function Header({
  title = "BENTHANH TOURIST",
  showActions = true,
  safeArea = true,
  showBackButton = false,
  onBackPress,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const { isLoggedIn, user, logout } = useAuth();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  // Logo co giãn theo bề ngang màn hình (≈48%), chặn trên ở LOGO_MAX_WIDTH,
  // giữ nguyên tỉ lệ -> không tràn trên máy nhỏ, không quá to trên tablet.
  const logoWidth = Math.min(LOGO_MAX_WIDTH, Math.round(screenWidth * 0.48));
  const logoHeight = Math.round(logoWidth * LOGO_ASPECT);

  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper
      style={{ backgroundColor: isDark ? palette.surface : palette.brand }}
      {...(safeArea ? { edges: ["top"] as const } : {})}
    >
      <View
        className={`flex-row items-center px-5 py-3.5 ${
          showActions ? "justify-between" : "justify-center"
        } ${isDark ? "border-b border-slate-800" : ""}`}
        style={{ backgroundColor: isDark ? palette.surface : palette.brand }}
      >
        <View className="flex-row items-center flex-1 mr-2">
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-3 rounded-full bg-white/10 items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {title === "BENTHANH TOURIST" ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace("/(root)/(tabs)" as any)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View style={{ marginRight: 8, alignItems: "flex-end" }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    fontSize: 20,
                    lineHeight: 20,
                    textAlign: "right",
                  }}
                >
                  BenThanh
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    fontSize: 20,
                    lineHeight: 20,
                    textAlign: "right",
                  }}
                >
                  Tourist
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: 8,
                    fontStyle: "italic",
                    marginTop: 2,
                    textAlign: "right",
                  }}
                >
                  journey to your heart
                </Text>
              </View>
              <Image
                source={require("../assets/images/Logo_BTT-2024.png")}
                style={{ width: 72, height: 72 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <Text
              numberOfLines={1}
              className="text-white font-black text-lg tracking-wider uppercase"
            >
              {title}
            </Text>
          )}
        </View>

        {showActions && (
          <View className="flex-row items-center flex-shrink-0 pl-3">
            {/* Nút chuyển đổi giao diện */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              className="rounded-full bg-white/10 items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Avatar của người sử dụng (kiểu Google) */}
            {isLoggedIn && user && (
              <TouchableOpacity
                onPress={() => setShowProfileCard(true)}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 1.5,
                  borderColor: "#FFFFFF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={{ width: 32, height: 32 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: isDark ? "#4B5563" : "#FFFFFF",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="person"
                      size={16}
                      color={isDark ? "#FFFFFF" : "#D0021B"}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Google Profile Card Modal */}
      {isLoggedIn && user && (
        <Modal
          visible={showProfileCard}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProfileCard(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
            activeOpacity={1}
            onPress={() => setShowProfileCard(false)}
          >
            <TouchableOpacity
              style={{
                width: "100%",
                maxWidth: 320,
                backgroundColor: palette.surface,
                borderRadius: RADIUS.xl,
                borderWidth: 1,
                borderColor: palette.border,
                padding: 24,
                alignItems: "center",
                ...getShadow(isDark, "lg"),
              }}
              activeOpacity={1}
            >
              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setShowProfileCard(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 44,
                  height: 44,
                  borderRadius: RADIUS.sm,
                  backgroundColor: palette.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color={palette.textSecondary} />
              </TouchableOpacity>

              {/* Email Header */}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: palette.textMuted,
                  marginBottom: 16,
                  marginTop: 8,
                }}
              >
                TÀI KHOẢN BENTHANH TOURIST
              </Text>

              {/* Big Avatar */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: palette.icon,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  backgroundColor: palette.surfaceAlt,
                }}
              >
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={{ width: 80, height: 80 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={36}
                    color={palette.icon}
                  />
                )}
              </View>

              {/* User Info */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: palette.textPrimary,
                  textAlign: "center",
                }}
              >
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : "Người dùng"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: palette.textSecondary,
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {user.email}
              </Text>

              {/* Phone row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: RADIUS.sm,
                  backgroundColor: palette.surfaceAlt,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="call-outline" size={16} color={palette.icon} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: palette.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  {user.phonenumber || "091234567"}
                </Text>
              </View>

              {/* Divider */}
              <View
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: palette.border,
                  marginVertical: 20,
                }}
              />

              {/* Logout Button */}
              <TouchableOpacity
                onPress={async () => {
                  setShowProfileCard(false);
                  try {
                    await apiLogout();
                  } catch (error) {
                    console.log("Header logout error, forcing redirect:", error);
                  } finally {
                    await logout();
                    router.replace("/login" as any);
                  }
                }}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: palette.danger,
                  borderRadius: RADIUS.md,
                  height: 48,
                  width: "100%",
                  ...getShadow(isDark, "md"),
                  ...(isDark ? {} : { shadowColor: "#EF4444" }),
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Đăng xuất tài khoản
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </Wrapper>
  );
}
