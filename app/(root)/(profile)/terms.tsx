import {
  TERMS_ACCOUNT,
  TERMS_AI_NOTICE,
  TERMS_CONTACT,
  TERMS_RESPONSIBILITY,
  TERMS_SCOPE,
  TERMS_UPDATED_AT,
  TERMS_VOUCHER,
  TOUR_TERMS,
  TourKind,
} from "@/constants/termsContent";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


/** Một điều khoản đóng/mở. Tự viết (không dùng Accordion) để nội dung chiếm trọn bề ngang, không bị thụt lề. */
function TermsSection({
  number,
  title,
  defaultOpen = false,
  children,
}: {
  number: number;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View
      className={`rounded-2xl mb-2.5 overflow-hidden border ${
        isDark ? "bg-[#1A1F2B] border-[#272D3C]" : "bg-white border-slate-100"
      }`}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center px-3.5 py-3.5"
        style={{ minHeight: 52 }}
      >
        <View className="w-7 h-7 rounded-lg items-center justify-center mr-2.5 bg-[#D0021B]/15">
          <Text style={{ fontSize: FONT_SIZE.xxs }} className="font-black text-[#D0021B]">
            {number}
          </Text>
        </View>
        <Text
          style={{ fontSize: FONT_SIZE.xs }}
          className={`flex-1 font-bold pr-2 ${isDark ? "text-slate-100" : "text-slate-800"}`}
        >
          {title}
        </Text>
        <Ionicons name={open ? "chevron-down" : "chevron-forward"} size={16} color={isDark ? "#7E8597" : "#94A3B8"} />
      </TouchableOpacity>
      {open && <View className="px-3.5 pb-3.5">{children}</View>}
    </View>
  );
}

type MainTab = "terms" | "privacy";

const PERCENT_RE = /(\d+%\s(?:tiền cọc tour|tiền tour|giá tour(?: du lịch)?|trên giá tour du lịch))/g;

export default function TermsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mainTab, setMainTab] = useState<MainTab>("terms");
  const [kind, setKind] = useState<TourKind>("domestic");

  const textMain = isDark ? "text-slate-100" : "text-slate-800";
  const textBody = isDark ? "text-slate-300" : "text-slate-600";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-100";

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

  const Bullet = ({ text }: { text: string }) => (
    <Text className={`leading-6 mb-2 ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
      <Text className="font-black text-[#D0021B]">{"•  "}</Text>
      {text}
    </Text>
  );

  const Bullets = ({ items }: { items: string[] }) => (
    <View>
      {items.map((t, i) => (
        <Bullet key={i} text={t} />
      ))}
    </View>
  );

  const SubTitle = ({ children }: { children: string }) => (
    <Text
      className={`font-bold uppercase tracking-wider mb-2 ${textMuted}`}
      style={{ fontSize: FONT_SIZE.xxs }}
    >
      {children}
    </Text>
  );

  const AiBadge = ({ label = "Thông tin do AI soạn" }: { label?: string }) => (
    <View
      className={`self-start rounded-full px-2.5 py-1 mb-2 border ${
        isDark ? "bg-indigo-500/15 border-indigo-400/30" : "bg-indigo-50 border-indigo-100"
      }`}
    >
      <Text
        className={`font-bold ${isDark ? "text-indigo-300" : "text-indigo-700"}`}
        style={{ fontSize: FONT_SIZE.xxs }}
      >
        {label}
      </Text>
    </View>
  );

  /** Tô đậm phần trăm phí trong câu nguyên văn của công ty. */
  const FeeLine = ({ text }: { text: string }) => {
    const parts = text.split(PERCENT_RE);
    return (
      <View className={`px-3.5 py-3 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
        <Text className={`leading-6 ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {parts.map((p, i) =>
            i % 2 === 1 ? (
              <Text key={i} className="font-bold text-[#D0021B]">
                {p}
              </Text>
            ) : (
              p
            )
          )}
        </Text>
      </View>
    );
  };

  const renderTourTerms = () => {
    const d = TOUR_TERMS[kind];
    return (
      <View>
        <View className="mb-4">
          <SubTitle>Thanh toán</SubTitle>
          {d.pay.map((t, i) => (
            <Text key={i} className={`leading-6 mb-2 ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
              <Text className={`font-black ${textMain}`}>{`${i + 1}.  `}</Text>
              {t}
            </Text>
          ))}
        </View>

        <View className="mb-4">
          <SubTitle>Thủ tục chuyển / huỷ tour</SubTitle>
          <Bullets items={d.procedure} />
        </View>

        <View className="mb-4">
          <SubTitle>Phí chuyển / huỷ tour</SubTitle>
          <View
            className={`rounded-2xl overflow-hidden border ${
              isDark ? "border-slate-700/60 bg-slate-900/40" : "border-slate-100 bg-white"
            }`}
          >
            {d.fees.map((t, i) => (
              <FeeLine key={i} text={t} />
            ))}
          </View>
          <Text className={`mt-2 leading-5 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
            {d.feeNote}
          </Text>
        </View>

        <SubTitle>Lưu ý khi đăng ký tour</SubTitle>
        {d.groups.map((g) => (
          <View key={g.title} className="mb-3">
            <Text className={`font-bold mb-2 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
              {g.title}
            </Text>
            <Bullets items={g.items} />
          </View>
        ))}
      </View>
    );
  };

  const renderTierTable = () => (
    <View
      className={`rounded-2xl overflow-hidden border mb-3 ${
        isDark ? "border-slate-700/60 bg-slate-900/40" : "border-slate-100 bg-white"
      }`}
    >
      {TERMS_VOUCHER.tiers.map((t, i) => (
        <View
          key={t.tier}
          className={`flex-row items-center px-3.5 py-3 ${
            i > 0 ? `border-t ${isDark ? "border-slate-700/60" : "border-slate-100"}` : ""
          }`}
        >
          <View className="flex-1">
            <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
              {t.tier}
            </Text>
            <Text className="font-bold text-[#B30118]" style={{ fontSize: FONT_SIZE.xxs }} selectable>
              {t.code}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
              Giảm {t.percent}
            </Text>
            <Text className={textMuted} style={{ fontSize: FONT_SIZE.xxs }}>
              tối đa {t.perYear}/năm
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTerms = () => (
    <View>
      <View
        className={`rounded-2xl p-3.5 mb-3 border ${
          isDark ? "bg-indigo-500/10 border-indigo-400/20" : "bg-indigo-50 border-indigo-100"
        }`}
      >
        <AiBadge />
        <Text className={`leading-5 ${isDark ? "text-indigo-200" : "text-indigo-900"}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {TERMS_AI_NOTICE}
        </Text>
      </View>
      <Text className={`mb-3 pl-1 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
        Cập nhật lần cuối: {TERMS_UPDATED_AT}
      </Text>

      <TermsSection number={1} title="Phạm vi áp dụng" defaultOpen>
        <AiBadge />
        <Text className={`leading-6 mb-3 ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {TERMS_SCOPE.intro}
        </Text>
        <Bullets items={TERMS_SCOPE.bullets} />
      </TermsSection>

      <TermsSection number={2} title="Tài khoản người dùng">
        <AiBadge />
        <Bullets items={TERMS_ACCOUNT} />
      </TermsSection>

      <TermsSection number={3} title="Điều kiện đặt tour, thanh toán và huỷ tour">
        <Text className={`leading-6 mb-3 ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
          Điều kiện khác nhau giữa tour trong nước và tour nước ngoài. Mỗi loại áp dụng chung cho mọi tour thuộc loại đó.
        </Text>
        <View className={`flex-row p-1 rounded-2xl mb-3 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
          {(
            [
              ["domestic", "Trong nước"],
              ["foreign", "Nước ngoài"],
            ] as const
          ).map(([k, label]) => {
            const active = kind === k;
            return (
              <TouchableOpacity
                key={k}
                activeOpacity={0.8}
                onPress={() => setKind(k)}
                className={`flex-1 h-10 rounded-xl items-center justify-center ${
                  active ? (isDark ? "bg-slate-700" : "bg-white") : ""
                }`}
              >
                <Text
                  className={`font-bold ${
                    active ? (isDark ? "text-white" : "text-[#B30118]") : textMuted
                  }`}
                  style={{ fontSize: FONT_SIZE.xxs }}
                >
                  Tour {label.toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {renderTourTerms()}
      </TermsSection>

      <TermsSection number={4} title="Voucher và khuyến mãi">
        <AiBadge />
        <Text className={`font-bold mb-1.5 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
          4.1 Voucher phát hành trong năm
        </Text>
        <Bullet text={TERMS_VOUCHER.yearly} />

        <View className="flex-row items-center flex-wrap mt-2 mb-1.5">
          <Text className={`font-bold mr-2 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
            4.2 Voucher theo hạng thành viên
          </Text>
        </View>
        <AiBadge label="Dự kiến, công ty chưa chốt" />
        <Bullet text={TERMS_VOUCHER.tierIntro} />
        {renderTierTable()}

        <Text className={`font-bold mt-2 mb-1.5 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
          4.3 Voucher đặt mua (cá nhân, công ty, doanh nghiệp)
        </Text>
        <Bullets items={TERMS_VOUCHER.purchased} />
        <View
          className={`rounded-2xl p-3.5 border ${
            isDark ? "bg-emerald-500/10 border-emerald-400/20" : "bg-emerald-50 border-emerald-100"
          }`}
        >
          <Text className={`font-bold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-800"}`} style={{ fontSize: FONT_SIZE.xxs }}>
            Ví dụ
          </Text>
          {TERMS_VOUCHER.example.map((t, i) => (
            <Text
              key={i}
              className={`leading-6 ${i > 0 ? "mt-1.5" : ""} ${isDark ? "text-emerald-100" : "text-emerald-900"}`}
              style={{ fontSize: FONT_SIZE.xxs }}
            >
              {"•  "}
              {t}
            </Text>
          ))}
        </View>
      </TermsSection>

      <TermsSection number={5} title="Trách nhiệm của các bên">
        <AiBadge />
        <Bullets items={TERMS_RESPONSIBILITY} />
      </TermsSection>

      <TermsSection number={6} title="Liên hệ">
        <Bullets items={TERMS_CONTACT} />
      </TermsSection>
    </View>
  );

  const renderPrivacy = () => (
    <View className={`rounded-2xl p-5 items-center border ${cardBg}`}>
      <Ionicons name="shield-checkmark-outline" size={36} color={isDark ? "#94A3B8" : "#94A3B8"} />
      <Text className={`font-bold mt-3 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
        Chính sách bảo mật
      </Text>
      <Text className={`text-center mt-1 leading-6 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
        Nội dung đang được công ty cập nhật.
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white/60"}`}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? "#93C5FD" : "#D0021B"} />
          </TouchableOpacity>
          <Text className={`text-xl font-black ml-4 ${textMain}`}>Điều khoản & chính sách</Text>
        </View>

        <View className={`flex-row p-1 mx-4 mt-2 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-200/70"}`}>
          {(
            [
              ["terms", "Điều khoản sử dụng"],
              ["privacy", "Chính sách bảo mật"],
            ] as const
          ).map(([k, label]) => {
            const active = mainTab === k;
            return (
              <TouchableOpacity
                key={k}
                activeOpacity={0.8}
                onPress={() => setMainTab(k)}
                className={`flex-1 h-11 rounded-xl items-center justify-center ${
                  active ? (isDark ? "bg-slate-600" : "bg-white") : ""
                }`}
              >
                <Text
                  className={`font-bold ${
                    active ? (isDark ? "text-white" : "text-[#B30118]") : textMuted
                  }`}
                  style={{ fontSize: FONT_SIZE.xxs }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
          {mainTab === "terms" ? renderTerms() : renderPrivacy()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
