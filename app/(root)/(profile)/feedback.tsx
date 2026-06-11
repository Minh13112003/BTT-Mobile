import { useAuth } from "@/context/Auth_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { postFeedback } from "@/services/feedback";
import { useTheme } from "@/context/Theme_Context";

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [sending, setSending] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ chủ đề và nội dung phản hồi.");
      return;
    }

    try {
      setSending(true);
      const res = await postFeedback({
        subject: subject.trim(),
        content: content.trim(),
      });

      if (res.success) {
        Alert.alert(
          "Thành công",
          res.message,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "Gửi phản hồi thất bại. Vui lòng thử lại sau!";
      Alert.alert("Thất bại", msg);
    } finally {
      setSending(false);
    }
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        {/* Header quay lại */}
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white/60"}`}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? "#93C5FD" : "#E51F27"} />
          </TouchableOpacity>
          <Text className={`text-xl font-black ml-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Gửi góp ý phản hồi
          </Text>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
          >
            {/* Thẻ mô tả */}
            <View className={`rounded-[24px] p-5 border ${
              isDark
                ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
            } mb-5`}>
              <Text className={`text-base font-bold leading-5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                BenThanh Tourist luôn sẵn sàng lắng nghe ý kiến đóng góp của Quý khách để không ngừng cải tiến và đem lại dịch vụ tốt nhất.
              </Text>
            </View>

            {/* Khung Form nhập liệu */}
            <View className={`rounded-[24px] p-5 border ${
              isDark
                ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
            }`}>
              {/* Họ và Tên (Prefilled) */}
              <Text className={`text-base font-bold mb-2 uppercase tracking-wider pl-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Người gửi
              </Text>
              <View className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                isDark
                  ? "bg-slate-900/40 border-slate-700/50"
                  : "bg-slate-100 border-slate-100"
              }`}>
                <Ionicons name="person-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
                <Text className={`ml-3 font-semibold text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Khách hàng"}
                </Text>
                <Ionicons name="lock-closed" size={16} color={isDark ? "#6B7280" : "#94A3B8"} style={{ marginLeft: "auto" }} />
              </View>

              {/* Email (Prefilled) */}
              <Text className={`text-base font-bold mb-2 uppercase tracking-wider pl-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Địa chỉ Email
              </Text>
              <View className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                isDark
                  ? "bg-slate-900/40 border-slate-700/50"
                  : "bg-slate-100 border-slate-100"
              }`}>
                <Ionicons name="mail-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
                <Text className={`ml-3 font-semibold text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {user?.email || "Chưa cập nhật"}
                </Text>
                <Ionicons name="lock-closed" size={16} color={isDark ? "#6B7280" : "#94A3B8"} style={{ marginLeft: "auto" }} />
              </View>

              {/* Chủ đề góp ý */}
              <Text className={`text-base font-bold mb-2 uppercase tracking-wider pl-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Chủ đề góp ý
              </Text>
              <View
                className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                  isDark
                    ? focusedField === "subject"
                      ? "border-blue-500 bg-slate-900/60"
                      : "border-slate-700/60 bg-slate-900/30"
                    : focusedField === "subject"
                      ? "border-blue-500 bg-white"
                      : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={focusedField === "subject" ? (isDark ? "#60A5FA" : "#3B82F6") : "#94A3B8"}
                />
                <TextInput
                  className={`flex-1 h-full ml-3 font-semibold text-base ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                  placeholder="Ví dụ: Đóng góp ý kiến dịch vụ Tour, App..."
                  placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                  value={subject}
                  onChangeText={setSubject}
                  onFocus={() => setFocusedField("subject")}
                  onBlur={() => setFocusedField("")}
                />
              </View>

              {/* Nội dung góp ý */}
              <Text className={`text-base font-bold mb-2 uppercase tracking-wider pl-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Nội dung góp ý chi tiết
              </Text>
              <View
                className={`rounded-2xl border-2 p-4 mb-4 ${
                  isDark
                    ? focusedField === "content"
                      ? "border-blue-500 bg-slate-900/60"
                      : "border-slate-700/60 bg-slate-900/30"
                    : focusedField === "content"
                      ? "border-blue-500 bg-white"
                      : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <TextInput
                  className={`w-full font-semibold text-base ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                  placeholder="Hãy chia sẻ ý kiến của bạn ở đây..."
                  placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                  value={content}
                  onChangeText={setContent}
                  onFocus={() => setFocusedField("content")}
                  onBlur={() => setFocusedField("")}
                />
              </View>

              {/* Nút gửi */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={sending}
                activeOpacity={0.8}
                className={`rounded-2xl h-14 items-center justify-center mt-2 shadow-md ${
                  isDark
                    ? "bg-slate-700 border border-slate-600 shadow-black/20"
                    : "bg-[#E51F27] shadow-red-500/20"
                } ${sending ? "opacity-70" : isDark ? "active:bg-slate-600" : "active:bg-red-600"}`}
              >
                {sending ? (
                  <ActivityIndicator color={isDark ? "#93C5FD" : "#FFFFFF"} size="small" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    Gửi góp ý ngay
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
