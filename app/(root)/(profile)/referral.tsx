import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReferralStats } from "@/services/referral";
import { useTheme } from "@/context/Theme_Context";

export default function ReferralScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [referralCode, setReferralCode] = useState("");
  const [successReferrals, setSuccessReferrals] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getReferralStats(user?.lastName);
        setReferralCode(res.data.referralCode);
        setSuccessReferrals(res.data.successReferrals);
        setEarnedPoints(res.data.earnedPoints);
      } catch (error) {
        console.error("Lỗi khi tải thống kê giới thiệu:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin giới thiệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert("Thành công", `Đã sao chép mã giới thiệu: ${referralCode}`);
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

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
            <Ionicons name="arrow-back" size={24} color={isDark ? "#93C5FD" : "#D0021B"} />
          </TouchableOpacity>
          <Text className={`text-xl font-black ml-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Giới thiệu bạn bè
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={isDark ? "#94A3B8" : "#D0021B"} />
            <Text className={`font-medium mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              style={{ fontSize: FONT_SIZE.xs }}>
              Đang tải thông tin...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
          >
            {/* Card Mã giới thiệu */}
            <View className={`rounded-[24px] p-6 items-center border ${
              isDark
                ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
            }`}>
              <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 shadow-lg ${
                isDark
                  ? "bg-slate-700 border border-slate-600 shadow-black/20"
                  : "bg-[#D0021B] shadow-red-500/20"
              }`}>
                <Ionicons name="people" size={32} color={isDark ? "#93C5FD" : "#FFFFFF"} />
              </View>
              <Text className={`text-lg font-black tracking-tight text-center ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}>
                Chia Sẻ Mã Giới Thiệu
              </Text>
              <Text className={`text-center mt-1 leading-6 ${
                isDark ? "text-slate-400" : "text-slate-400"
              }`}
                style={{ fontSize: FONT_SIZE.xs }}>
                Chia sẻ mã giới thiệu của bạn cho bạn bè đăng ký tài khoản để cả hai cùng nhận được nhiều ưu đãi hấp dẫn.
              </Text>

              {/* Khung hiển thị mã */}
              <View className={`w-full rounded-[20px] p-4 items-center justify-center my-6 border border-dashed ${
                isDark
                  ? "bg-slate-900/60 border-slate-700"
                  : "bg-slate-50 border-slate-300"
              }`}>
                <Text className={`font-bold uppercase tracking-wide ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
                  style={{ fontSize: FONT_SIZE.card }}>
                  Mã giới thiệu của bạn
                </Text>
                <Text className={`text-2xl font-black mt-1.5 uppercase tracking-widest ${
                  isDark ? "text-blue-400" : "text-[#1E3A8A]"
                }`}>
                  {referralCode}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCopyCode}
                activeOpacity={0.8}
                className={`w-full rounded-2xl h-14 items-center justify-center shadow-md ${
                  isDark
                    ? "bg-slate-750 bg-slate-700 active:bg-slate-600 border border-slate-600 shadow-black/20"
                    : "bg-[#D0021B] shadow-red-500/20"
                }`}
              >
                <Text className="text-white font-bold tracking-wide" style={{ fontSize: FONT_SIZE.xs }}>
                  Sao chép mã chia sẻ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Card Thống kê giới thiệu */}
            <View className={`rounded-[24px] p-6 mt-6 border ${
              isDark
                ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
            }`}>
              <Text className={`font-black tracking-tight mb-4 ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
                style={{ fontSize: FONT_SIZE.xs }}>
                Thống kê của bạn
              </Text>

              <View className="flex-row justify-between mb-2">
                <View className={`items-center flex-1 border-r ${
                  isDark ? "border-slate-700" : "border-slate-100"
                }`}>
                  <Text className={`text-2xl font-black ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}>
                    {successReferrals}
                  </Text>
                  <Text className={`font-bold uppercase mt-1 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                    style={{ fontSize: FONT_SIZE.xs }}>
                    Đã giới thiệu
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className={`text-2xl font-black ${
                    isDark ? "text-amber-400" : "text-amber-500"
                  }`}>
                    {earnedPoints.toLocaleString("vi-VN")}
                  </Text>
                  <Text className={`font-bold uppercase mt-1 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                    style={{ fontSize: FONT_SIZE.xs }}>
                    Điểm nhận được
                  </Text>
                </View>
              </View>
            </View>

            {/* Quy trình hoạt động */}
            <View className={`rounded-[24px] p-6 mt-6 border ${
              isDark
                ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
            }`}>
              <Text className={`font-black tracking-tight mb-4 ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
                style={{ fontSize: FONT_SIZE.xs }}>
                Quy trình hoạt động
              </Text>

              {[
                {
                  step: "1",
                  title: "Gửi mã giới thiệu",
                  desc: "Sao chép mã giới thiệu phía trên và gửi cho bạn bè của bạn.",
                },
                {
                  step: "2",
                  title: "Bạn bè đăng ký",
                  desc: "Bạn bè nhập mã giới thiệu của bạn trong quá trình đăng ký tài khoản mới.",
                },
                {
                  step: "3",
                  title: "Nhận điểm thưởng",
                  desc: "Điểm thưởng sẽ cộng trực tiếp vào ví sau khi bạn bè hoàn thành chuyến đi đầu tiên.",
                },
              ].map((item, index) => (
                <View key={index} className="flex-row items-start mb-5 last:mb-0">
                  <View className={`w-7 h-7 rounded-full border items-center justify-center mr-3 mt-0.5 ${
                    isDark
                      ? "bg-slate-700 border-slate-600"
                      : "bg-red-50 border-red-100"
                  }`}>
                    <Text className={`font-black ${
                      isDark ? "text-blue-400" : "text-[#D0021B]"
                    }`}
                      style={{ fontSize: FONT_SIZE.xs }}>
                      {item.step}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                      style={{ fontSize: FONT_SIZE.xs }}>
                      {item.title}
                    </Text>
                    <Text className={`mt-1 leading-6 ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                      style={{ fontSize: FONT_SIZE.xs }}>
                      {item.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

