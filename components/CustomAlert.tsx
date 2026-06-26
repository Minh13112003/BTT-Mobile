import { FONT_SIZE } from "@/constants/typography";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/Theme_Context";

const { width } = Dimensions.get("window");

interface CustomAlertProps {
  visible: boolean;
  type: "success" | "error" | "warning" | "confirm";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomAlert({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Hủy",
}: CustomAlertProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!visible) return null;

  // Icon and Colors Configuration
  let iconName: keyof typeof Ionicons.prototype.styles | any = "information-circle";
  let iconColor = "#D0021B"; // Brand Red
  let iconBg = isDark ? "#2D1B1B" : "#FFF1F2";

  if (type === "success") {
    iconName = "checkmark-circle";
    iconColor = "#10B981"; // Green
    iconBg = isDark ? "#143C2E" : "#ECFDF5";
  } else if (type === "error") {
    iconName = "close-circle";
    iconColor = "#EF4444"; // Red
    iconBg = isDark ? "#2D1B1B" : "#FFF1F2";
  } else if (type === "warning") {
    iconName = "warning";
    iconColor = "#F59E0B"; // Amber
    iconBg = isDark ? "#3A2A1A" : "#FEF3C7";
  } else if (type === "confirm") {
    iconName = "help-circle";
    iconColor = "#3B82F6"; // Blue
    iconBg = isDark ? "#1E293B" : "#EFF6FF";
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.alertBox,
            {
              backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            },
          ]}
        >
          {/* Header Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={32} color={iconColor} />
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: FONT_SIZE.xl },
            ]}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={[
              styles.message,
              { color: isDark ? "#94A3B8" : "#475569", fontSize: FONT_SIZE.xs },
            ]}
          >
            {message}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {type === "confirm" ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: isDark ? "#CBD5E1" : "#475569", fontSize: FONT_SIZE.xs },
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    if (onConfirm) onConfirm();
                  }}
                  style={[styles.button, styles.confirmButton]}
                >
                  <Text style={[styles.buttonText, styles.confirmButtonText, { fontSize: FONT_SIZE.xs }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={[styles.button, styles.singleButton]}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText, { fontSize: FONT_SIZE.xs }]}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  } as ViewStyle,
  alertBox: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  } as ViewStyle,
  title: {
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.25,
  } as TextStyle,
  message: {
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  } as TextStyle,
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  } as ViewStyle,
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  singleButton: {
    backgroundColor: "#D0021B", // Brand Red
  } as ViewStyle,
  confirmButton: {
    backgroundColor: "#D0021B", // Brand Red
  } as ViewStyle,
  cancelButton: {},
  buttonText: {
    fontWeight: "700",
  } as TextStyle,
  confirmButtonText: {
    color: "#FFFFFF",
  } as TextStyle,
});
