import { useTheme } from "@/context/Theme_Context";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";

interface AppLoadingScreenProps {
  message?: string;
}

export default function AppLoadingScreen({
  message = "Đang tải dữ liệu...",
}: AppLoadingScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bg = isDark ? "#111318" : "#F5F6FA";
  const ringColor = isDark ? "rgba(147,197,253,0.2)" : "rgba(208,2,27,0.12)";
  const spinColor = isDark ? "#93C5FD" : "#D0021B";
  const textColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeAnim,
      }}
    >
      {/* Outer spinning ring */}
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <Animated.View
          style={{
            width: 132,
            height: 132,
            borderRadius: 66,
            borderWidth: 3,
            borderColor: ringColor,
            borderTopColor: spinColor,
            transform: [{ rotate: spin }],
            position: "absolute",
          }}
        />
        {/* Logo container */}
        <Animated.View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: isDark ? 0.5 : 0.1,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
            elevation: 6,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Image
            source={require("../assets/images/Logo_BTT-2024.png")}
            style={{ width: 72, height: 72 }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: textColor,
          letterSpacing: 0.5,
          textAlign: "center",
          paddingHorizontal: 32,
        }}
      >
        {message}
      </Text>

      <Text
        style={{
          fontSize: 11,
          color: isDark ? "#475569" : "#94A3B8",
          marginTop: 6,
          fontWeight: "500",
        }}
      >
        BenThanh Tourist
      </Text>
    </Animated.View>
  );
}
