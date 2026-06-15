import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        setHasToken(!!token);
      } catch (error) {
        console.error("Lỗi kiểm tra token tại index:", error);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F6FA" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (hasToken) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return <Redirect href="/(root)/(auth)/login" />;
}
