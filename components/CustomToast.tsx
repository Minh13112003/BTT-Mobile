import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/Theme_Context";

interface CustomToastProps {
  visible: boolean;
  type: "booking_success" | "password_success";
  title?: string;
  message: string;
  onClose: () => void;
  onAction?: () => void; // for "XEM CHI TIẾT"
  actionLoading?: boolean;
}

export default function CustomToast({
  visible,
  type,
  title,
  message,
  onClose,
  onAction,
  actionLoading = false,
}: CustomToastProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Animation values
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in & Fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out & Fade out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!visible) return null;

  // Configuration based on type
  const isBooking = type === "booking_success";
  const defaultTitle = isBooking ? "Đặt tour thành công" : "Đổi mật khẩu thành công";
  const finalTitle = title || defaultTitle;

  const accentColor = isBooking ? "#007545" : "#005a34"; // green / dark green
  const iconName = isBooking ? "checkmark-circle" : "key";
  const iconBg = isDark
    ? isBooking
      ? "#00754525"
      : "#005a3425"
    : isBooking
    ? "#E6F2EC"
    : "#E6EFF0";

  return (
    <Animated.View
      style={[
        styles.absoluteContainer,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
            borderColor: isDark ? "#2D3748" : "#efeded",
            borderLeftColor: accentColor,
          },
        ]}
      >
        <View style={styles.contentRow}>
          {/* Circular Icon Container */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: iconBg,
              },
            ]}
          >
            <Ionicons name={iconName} size={20} color={accentColor} />
          </View>

          {/* Texts */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { color: isDark ? "#F8FAFC" : "#1b1c1c" },
              ]}
            >
              {finalTitle}
            </Text>
            <Text
              style={[
                styles.message,
                { color: isDark ? "#94A3B8" : "#5e3f3a" },
              ]}
            >
              {message}
            </Text>

            {/* Buttons for booking success */}
            {isBooking && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={onAction}
                  activeOpacity={0.7}
                  disabled={actionLoading}
                  style={styles.actionButton}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color={isDark ? "#FFA2A2" : "#a00000"} />
                  ) : (
                    <Text
                      style={[
                        styles.actionText,
                        { color: isDark ? "#FFA2A2" : "#a00000" },
                      ]}
                    >
                      XEM CHI TIẾT
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  style={styles.dismissButton}
                >
                  <Text
                    style={[
                      styles.dismissText,
                      { color: isDark ? "#94A3B8" : "#5e3f3a" },
                    ]}
                  >
                    BỎ QUA
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Close button for password success */}
        {!isBooking && (
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.6}
            style={styles.closeIconButton}
          >
            <Ionicons
              name="close"
              size={20}
              color={isDark ? "#64748B" : "#94A3B8"}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = {
  absoluteContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  } as ViewStyle,
  toastCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    position: "relative",
  } as ViewStyle,
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  } as ViewStyle,
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  } as ViewStyle,
  textContainer: {
    flex: 1,
    paddingRight: 16, // space for close button
  } as ViewStyle,
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  } as TextStyle,
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  } as TextStyle,
  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
  } as ViewStyle,
  actionButton: {
    paddingVertical: 4,
  } as ViewStyle,
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  } as TextStyle,
  dismissButton: {
    paddingVertical: 4,
  } as ViewStyle,
  dismissText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  } as TextStyle,
  closeIconButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  } as ViewStyle,
};
