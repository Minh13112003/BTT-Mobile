import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { logout as apiLogout } from "@/services/auth";
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
      className={isDark ? "bg-[#1E222B]" : "bg-[#D0021B]"}
      {...(safeArea ? { edges: ["top"] as const } : {})}
    >
      <View
        className={`flex-row items-center px-5 py-3.5 ${
          showActions ? "justify-between" : "justify-center"
        } ${
          isDark ? "bg-[#1E222B] border-b border-slate-800" : "bg-[#D0021B]"
        }`}
      >
        <View className="flex-row items-center flex-1 mr-2">
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              className="mr-3 p-1 rounded-full bg-white/10"
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
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
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
                backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
                borderRadius: 28,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#E2E8F0",
                padding: 24,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 10,
              }}
              activeOpacity={1}
            >
              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setShowProfileCard(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  padding: 4,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#2D3748" : "#F1F5F9",
                }}
              >
                <Ionicons name="close" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>

              {/* Email Header */}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isDark ? "#64748B" : "#94A3B8",
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
                  borderColor: isDark ? "#93C5FD" : "#D0021B",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  backgroundColor: isDark ? "#2D3748" : "#F8FAFC",
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
                    color={isDark ? "#93C5FD" : "#D0021B"}
                  />
                )}
              </View>

              {/* User Info */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: isDark ? "#F8FAFC" : "#0F172A",
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
                  color: isDark ? "#94A3B8" : "#64748B",
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
                  borderRadius: 12,
                  backgroundColor: isDark ? "#2D3748" : "#F8FAFC",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="call-outline" size={16} color={isDark ? "#93C5FD" : "#D0021B"} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: isDark ? "#CBD5E1" : "#475569",
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
                  backgroundColor: isDark ? "#334155" : "#E2E8F0",
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
                  backgroundColor: isDark ? "#991B1B" : "#EF4444",
                  borderRadius: 16,
                  height: 48,
                  width: "100%",
                  shadowColor: "#EF4444",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
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
