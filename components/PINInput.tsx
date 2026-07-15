import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";

interface PINInputProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}

const PIN_LENGTH = 6;

export default function PINInput({
  visible,
  title = "Nhập mã PIN",
  subtitle = "Vui lòng nhập mã PIN 6 chữ số để xác nhận",
  loading = false,
  error,
  onSubmit,
  onClose,
}: PINInputProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [pin, setPin] = useState("");
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setPin("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  useEffect(() => {
    if (error) {
      setPin("");
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => setTimeout(() => inputRef.current?.focus(), 100));
    }
  }, [error]);

  const handleChangeText = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(digits);
    if (digits.length === PIN_LENGTH) {
      inputRef.current?.blur();
      onSubmit(digits);
    }
  };

  const handleKeypadPress = (key: string) => {
    if (loading) return;
    if (key === "DEL") {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < PIN_LENGTH) {
      const next = pin + key;
      setPin(next);
      if (next.length === PIN_LENGTH) {
        onSubmit(next);
      }
    }
  };

  const KEYPAD = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "DEL"],
  ];

  const bg = isDark ? "#1E222B" : "#FFFFFF";
  const textColor = isDark ? "#F1F5F9" : "#1E293B";
  const mutedColor = isDark ? "#64748B" : "#94A3B8";
  const dotActive = isDark ? "#93C5FD" : "#D0021B";
  const dotInactive = isDark ? "#334155" : "#E2E8F0";
  const keyBg = isDark ? "#1E293B" : "#F8FAFC";
  const keyBorder = isDark ? "#334155" : "#E2E8F0";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: bg,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 12,
            paddingBottom: 40,
            paddingHorizontal: 24,
          }}
        >
          {/* Handle bar */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: mutedColor }} />
          </View>

          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <Image
              source={require("../assets/images/Logo_BTT-2018.png")}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={{ fontSize: FONT_SIZE.lg, fontWeight: "900", color: textColor, textAlign: "center", marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ fontSize: FONT_SIZE.xs, color: mutedColor, textAlign: "center", marginBottom: 28 }}>
            {subtitle}
          </Text>

          {/* Hidden TextInput chỉ để giữ focus/state, KHÔNG bật bàn phím hệ thống
              (đã có bàn phím số custom bên dưới — bật cả hai gây đè bàn phím trên iOS) */}
          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handleChangeText}
            keyboardType="number-pad"
            maxLength={PIN_LENGTH}
            secureTextEntry
            showSoftInputOnFocus={false}
            caretHidden
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
          />

          {/* PIN dots */}
          <Animated.View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: error ? 8 : 28,
              gap: 14,
              transform: [{ translateX: shakeAnim }],
            }}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: i < pin.length ? dotActive : dotInactive,
                  borderWidth: i < pin.length ? 0 : 1.5,
                  borderColor: dotInactive,
                }}
              />
            ))}
          </Animated.View>

          {/* Error message */}
          {!!error && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={{ color: "#EF4444", fontSize: FONT_SIZE.xs, marginLeft: 6, fontWeight: "600" }}>
                {error}
              </Text>
            </View>
          )}

          {/* Custom Keypad */}
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={dotActive} />
              <Text style={{ color: mutedColor, marginTop: 12, fontSize: FONT_SIZE.xs }}>Đang xác thực...</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {KEYPAD.map((row, ri) => (
                <View key={ri} style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
                  {row.map((key, ki) => {
                    if (!key) return <View key={ki} style={{ width: 80, height: 64 }} />;
                    return (
                      <TouchableOpacity
                        key={ki}
                        onPress={() => handleKeypadPress(key)}
                        activeOpacity={0.7}
                        style={{
                          width: 80,
                          height: 64,
                          borderRadius: 16,
                          backgroundColor: keyBg,
                          borderWidth: 1,
                          borderColor: keyBorder,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {key === "DEL" ? (
                          <Ionicons name="backspace-outline" size={24} color={textColor} />
                        ) : (
                          <Text style={{ fontSize: 24, fontWeight: "700", color: textColor }}>{key}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* Hủy */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={{ alignItems: "center", marginTop: 20 }}
            disabled={loading}
          >
            <Text style={{ color: mutedColor, fontSize: FONT_SIZE.xs, fontWeight: "600" }}>Hủy bỏ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
