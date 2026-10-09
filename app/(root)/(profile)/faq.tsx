import { FAQ_CATEGORIES } from "@/constants/faqContent";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL = "all";

/** Bỏ dấu + hạ chữ thường để tìm kiếm tiếng Việt không phân biệt dấu. */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

export default function FaqScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>(ALL);
  const [openKey, setOpenKey] = useState<string | null>("dat-tour-0");

  const sections = useMemo(() => {
    const q = fold(query.trim());
    return FAQ_CATEGORIES.filter((c) => cat === ALL || c.id === cat)
      .map((c) => ({
        ...c,
        items: c.items
          .map((item, idx) => ({ item, idx }))
          .filter(({ item }) => !q || fold(item.q).includes(q) || item.a.some((t) => fold(t).includes(q))),
      }))
      .filter((c) => c.items.length > 0);
  }, [query, cat]);

  const textMain = isDark ? "text-slate-100" : "text-[#1A1A2E]";
  const textBody = isDark ? "text-slate-300" : "text-slate-600";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const groupCls = isDark ? "bg-[#1A1F2B] border-[#272D3C]" : "bg-white border-slate-100";

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <StatusBar style="light" />
      {/* Header đỏ có ô tìm kiếm */}
      <LinearGradient
        colors={isDark ? ["#2A2E38", "#1E222B"] : ["#B30014", "#8A0010", "#5C000B"]}
        style={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-4 pt-2 pb-5">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center border border-white/25 bg-white/15"
              >
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-white font-bold ml-3" style={{ fontSize: FONT_SIZE.md }}>
                Câu hỏi thường gặp
              </Text>
            </View>
            <View className="flex-row items-center h-12 rounded-2xl bg-white px-3.5">
              <Ionicons name="search" size={18} color="#C00119" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Tìm câu hỏi…"
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2.5 text-slate-800"
                style={{ fontSize: FONT_SIZE.xxs }}
              />
              {query ? (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, gap: 8 }}
        >
          {[{ id: ALL, title: "Tất cả" }, ...FAQ_CATEGORIES].map((c) => {
            const active = cat === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.8}
                onPress={() => setCat(c.id)}
                className={`h-10 px-4 rounded-full items-center justify-center border ${
                  active
                    ? isDark
                      ? "bg-slate-100 border-slate-100"
                      : "bg-[#1A1A2E] border-[#1A1A2E]"
                    : isDark
                      ? "bg-[#1A1F2B] border-[#272D3C]"
                      : "bg-white border-slate-200"
                }`}
              >
                <Text
                  className={`font-bold ${
                    active ? (isDark ? "text-slate-900" : "text-white") : textMuted
                  }`}
                  style={{ fontSize: FONT_SIZE.xxs }}
                >
                  {c.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="px-4 pt-3.5">
          <View
            className={`rounded-2xl p-3.5 border ${
              isDark ? "bg-indigo-500/10 border-indigo-400/20" : "bg-indigo-50 border-indigo-100"
            }`}
          >
            <Text className={isDark ? "text-indigo-200" : "text-indigo-900"} style={{ fontSize: FONT_SIZE.xxs }}>
              Câu hỏi và trả lời do AI soạn từ website benthanhtourist.com, đang chờ công ty duyệt.
            </Text>
          </View>
        </View>

        {sections.length === 0 ? (
          <View className="items-center px-8 py-12">
            <Ionicons name="search-outline" size={36} color="#94A3B8" />
            <Text className={`font-bold mt-3 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
              Không tìm thấy câu hỏi phù hợp
            </Text>
            <Text className={`text-center mt-1 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
              Thử từ khoá khác hoặc gọi tổng đài 1900 6668 để được hỗ trợ.
            </Text>
          </View>
        ) : (
          sections.map((sec) => (
            <View key={sec.id} className="px-4 pt-5">
              <Text
                className={`font-bold uppercase tracking-wider mb-2 pl-1 ${textMuted}`}
                style={{ fontSize: FONT_SIZE.xxs }}
              >
                {sec.title}
              </Text>
              <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>
                {sec.items.map(({ item, idx }, i) => {
                  const key = `${sec.id}-${idx}`;
                  const open = openKey === key;
                  const last = i === sec.items.length - 1;
                  return (
                    <View
                      key={key}
                      className={`${last ? "" : `border-b ${isDark ? "border-slate-700/60" : "border-slate-100"}`} ${
                        open ? (isDark ? "bg-slate-800/60" : "bg-[#FFF7F8]") : ""
                      }`}
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setOpenKey(open ? null : key)}
                        className="flex-row items-center px-4 py-3.5"
                        style={{ minHeight: 60 }}
                      >
                        <Text
                          className={`flex-1 font-semibold pr-3 ${open ? "text-[#B30118]" : textMain}`}
                          style={{ fontSize: FONT_SIZE.xxs }}
                        >
                          {item.q}
                        </Text>
                        <Ionicons
                          name={open ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={open ? "#B30118" : "#8A8E9A"}
                        />
                      </TouchableOpacity>
                      {open && (
                        <View className="px-4 pb-4">
                          {item.a.map((t, k) => (
                            <Text
                              key={k}
                              className={`leading-6 ${k > 0 ? "mt-2" : ""} ${textBody}`}
                              style={{ fontSize: FONT_SIZE.xxs }}
                            >
                              {t}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {/* Cần hỗ trợ thêm */}
        <View className="px-4 pt-6">
          <View
            className={`rounded-[20px] p-4 border ${
              isDark ? "bg-slate-800/70 border-slate-700/60" : "bg-[#FFF1F2] border-[#F7CDD2]"
            }`}
          >
            <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
              Chưa tìm thấy câu trả lời?
            </Text>
            <Text className={`mt-1 mb-3.5 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
              Nhân viên BenThanh Tourist luôn sẵn sàng hỗ trợ bạn.
            </Text>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Linking.openURL("tel:19006668").catch(() => {})}
                className="flex-1 h-12 rounded-full flex-row items-center justify-center bg-[#D0021B] border border-white/40"
              >
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text className="text-white font-extrabold ml-1.5" style={{ fontSize: FONT_SIZE.xxs }}>
                  1900 6668
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Linking.openURL("https://zalo.me/237833859403376914").catch(() => {})}
                className={`flex-1 h-12 rounded-full flex-row items-center justify-center border-[1.5px] ${
                  isDark ? "bg-slate-800 border-slate-600" : "bg-white border-[#F3C4CA]"
                }`}
              >
                <Ionicons name="chatbubble-outline" size={16} color={isDark ? "#FCA5A5" : "#B30118"} />
                <Text
                  className="font-bold ml-1.5"
                  style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#FCA5A5" : "#B30118" }}
                >
                  Nhắn Zalo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
