import { COMPANY, OFFICES_OVERSEAS, OFFICES_VN, Office } from "@/constants/companyInfo";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Image, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dial = (number: string) => Linking.openURL(`tel:${number.replace(/[^\d+]/g, "")}`).catch(() => {});
const openMap = (address: string) =>
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  ).catch(() => {});

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [pickOffice, setPickOffice] = useState<Office | null>(null);

  const textMain = isDark ? "text-slate-100" : "text-[#1A1A2E]";
  const textBody = isDark ? "text-slate-300" : "text-slate-600";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const groupCls = isDark ? "bg-[#1A1F2B] border-[#272D3C]" : "bg-white border-slate-100";
  const divider = isDark ? "border-slate-700/60" : "border-slate-100";
  const iconBg = isDark ? "bg-slate-700" : "bg-[#FDECEE]";
  const iconColor = isDark ? "#FCA5A5" : "#C00119";

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const SectionLabel = ({ children }: { children: string }) => (
    <Text
      className={`font-bold uppercase tracking-wider mb-2 pl-1 ${textMuted}`}
      style={{ fontSize: FONT_SIZE.xxs }}
    >
      {children}
    </Text>
  );

  const InfoRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
    <View className={`px-4 py-3 ${last ? "" : `border-b ${divider}`}`}>
      <Text className={textMuted} style={{ fontSize: FONT_SIZE.xxs }}>
        {label}
      </Text>
      <Text className={`font-semibold mt-0.5 ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
        {value}
      </Text>
    </View>
  );

  const LinkRow = ({
    icon,
    label,
    value,
    onPress,
    last,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onPress: () => void;
    last?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center px-4 ${last ? "" : `border-b ${divider}`}`}
      style={{ minHeight: 58 }}
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3.5 ${iconBg}`}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1 py-2">
        <Text className={textMuted} style={{ fontSize: FONT_SIZE.xxs }}>
          {label}
        </Text>
        <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={isDark ? "#6B7280" : "#A3A8B5"} />
    </TouchableOpacity>
  );

  const OfficeRow = ({ office, last }: { office: Office; last?: boolean }) => (
    <View className={`flex-row items-center px-4 py-3 ${last ? "" : `border-b ${divider}`}`}>
      <View className="flex-1 pr-2">
        <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {office.name}
        </Text>
        <Text className={`mt-0.5 leading-5 ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {office.address}
        </Text>
        {office.phones.map((p) => (
          <Text key={p.label + p.number} className="font-semibold mt-0.5 text-[#B30118]" style={{ fontSize: FONT_SIZE.xxs }}>
            <Text className={`font-medium ${textMuted}`}>{p.label} </Text>
            {p.number}
          </Text>
        ))}
      </View>
      {office.phones.length > 0 && (
        <TouchableOpacity
          accessibilityLabel={`Gọi ${office.name}`}
          onPress={() => (office.phones.length === 1 ? dial(office.phones[0].number) : setPickOffice(office))}
          className={`w-10 h-10 rounded-full items-center justify-center mr-2 border-[1.5px] ${
            isDark ? "bg-slate-800 border-slate-600" : "bg-white border-[#F3C4CA]"
          }`}
        >
          <Ionicons name="call-outline" size={18} color={isDark ? "#FCA5A5" : "#B30118"} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        accessibilityLabel={`Chỉ đường đến ${office.name}`}
        onPress={() => openMap(office.address)}
        className="w-10 h-10 rounded-full items-center justify-center bg-[#D0021B] border border-white/40"
      >
        <Ionicons name="location-outline" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111318" : "#F5F6FA" }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={isDark ? ["#2A2E38", "#1E222B", "#14161C"] : ["#B30014", "#8A0010", "#5C000B"]}
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: 28,
            paddingHorizontal: 16,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center border border-white/25 bg-white/15"
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white font-bold ml-3" style={{ fontSize: FONT_SIZE.md }}>
              Về BenThanh Tourist
            </Text>
          </View>
          <View className="items-center">
            <Image
              source={require("@/assets/images/Logo_BTT-2018-02.png")}
              style={{ width: 250, height: 125 }}
              resizeMode="contain"
            />
          </View>
          <View className="flex-row mt-3 rounded-2xl bg-white/12 border border-white/15 py-3">
            {COMPANY.stats.map((s, i) => (
              <View
                key={s.label}
                className={`flex-1 items-center ${i > 0 ? "border-l border-white/20" : ""}`}
              >
                <Text className="text-white font-black" style={{ fontSize: FONT_SIZE.lg }}>
                  {s.value}
                </Text>
                <Text className="text-white/80" style={{ fontSize: FONT_SIZE.xxs }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View className="px-4 pt-6 gap-6">
          <View>
            <SectionLabel>Giới thiệu</SectionLabel>
            <View className={`rounded-[20px] p-4 border ${groupCls}`}>
              {COMPANY.intro.map((t, i) => (
                <Text key={i} className={`leading-6 ${i > 0 ? "mt-3" : ""} ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  {t}
                </Text>
              ))}
              <Text className={`font-bold mt-4 mb-2 ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
                Lĩnh vực hoạt động
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {COMPANY.businessLines.map((b) => (
                  <View
                    key={b}
                    className={`px-3 py-1.5 rounded-full border ${
                      isDark ? "bg-slate-700 border-slate-600" : "bg-[#FFF1F3] border-[#F7CDD2]"
                    }`}
                  >
                    <Text
                      className="font-semibold"
                      style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#FCA5A5" : "#9A0012" }}
                    >
                      {b}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View>
            <SectionLabel>Thông tin doanh nghiệp</SectionLabel>
            <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>
              <InfoRow label="Tên doanh nghiệp" value={COMPANY.name} />
              <InfoRow label="Tên thương hiệu" value={COMPANY.brand} />
              <InfoRow label="Tổng Giám đốc" value={COMPANY.ceo} />
              <InfoRow label="Mã số thuế" value={COMPANY.taxCode} />
              <InfoRow label="Giấy phép kinh doanh" value={COMPANY.license} />
              <InfoRow label="Giấy phép kinh doanh lữ hành quốc tế" value={COMPANY.travelLicense} />
              <InfoRow label="Trụ sở chính" value={COMPANY.hq} last />
            </View>
          </View>

          <View>
            <SectionLabel>Liên hệ</SectionLabel>
            <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>
              <LinkRow icon="call-outline" label="Tổng đài" value={COMPANY.hotline} onPress={() => dial(COMPANY.hotline)} />
              <LinkRow icon="call-outline" label="Điện thoại" value={COMPANY.tel} onPress={() => dial(COMPANY.tel)} />
              <LinkRow
                icon="mail-outline"
                label="Email"
                value={COMPANY.email}
                onPress={() => Linking.openURL(`mailto:${COMPANY.email}`).catch(() => {})}
              />
              <LinkRow
                icon="globe-outline"
                label="Website"
                value={COMPANY.website}
                onPress={() => Linking.openURL(`https://${COMPANY.website}`).catch(() => {})}
                last
              />
            </View>
          </View>

          <View>
            <SectionLabel>Đường dây theo dịch vụ</SectionLabel>
            <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>
              {COMPANY.serviceLines.map((l, i) => (
                <TouchableOpacity
                  key={l.label}
                  activeOpacity={0.7}
                  onPress={() => dial(l.number)}
                  className={`flex-row items-center px-4 ${
                    i === COMPANY.serviceLines.length - 1 ? "" : `border-b ${divider}`
                  }`}
                  style={{ minHeight: 54 }}
                >
                  <Text className={`flex-1 font-semibold ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
                    {l.label}
                  </Text>
                  <Text className="font-bold text-[#B30118]" style={{ fontSize: FONT_SIZE.xxs }}>
                    {l.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <SectionLabel>Văn phòng & chi nhánh</SectionLabel>
            <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>
              {OFFICES_VN.map((o, i) => (
                <OfficeRow key={o.name} office={o} last={i === OFFICES_VN.length - 1} />
              ))}
            </View>
          </View>

          <View>
            <SectionLabel>Đại lý du lịch ở nước ngoài</SectionLabel>
            <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>
              {OFFICES_OVERSEAS.map((o, i) => (
                <OfficeRow key={o.name} office={o} last={i === OFFICES_OVERSEAS.length - 1} />
              ))}
            </View>
          </View>

          <View>
            <SectionLabel>Thành viên các hiệp hội</SectionLabel>
            <View className={`rounded-[20px] p-4 gap-2.5 border ${groupCls}`}>
              {COMPANY.associations.map((a) => (
                <View key={a.code} className="flex-row items-center">
                  <View
                    className={`h-7 rounded-lg items-center justify-center px-2 mr-3 ${
                      isDark ? "bg-slate-700" : "bg-slate-100"
                    }`}
                    style={{ minWidth: 52 }}
                  >
                    <Text className={`font-extrabold ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
                      {a.code}
                    </Text>
                  </View>
                  <Text className={`flex-1 ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
                    {a.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <SectionLabel>Pháp lý</SectionLabel>
            <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>
              <LinkRow
                icon="document-text-outline"
                label="Văn bản"
                value="Điều khoản & chính sách"
                onPress={() => router.push("/(root)/(profile)/terms" as any)}
                last
              />
            </View>
          </View>

          <View className="items-center pt-2">
            <Text className={`font-semibold ${textBody}`} style={{ fontSize: FONT_SIZE.xxs }}>
              Phiên bản {version}
            </Text>
            <Text className={textMuted} style={{ fontSize: FONT_SIZE.xxs }}>
              © 2026 BenThanh Tourist Service Corporation
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Chọn số khi chi nhánh có nhiều số */}
      <Modal visible={!!pickOffice} transparent animationType="fade" onRequestClose={() => setPickOffice(null)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPickOffice(null)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
        >
          <View
            className={`rounded-t-[28px] p-5 ${isDark ? "bg-[#1A1F2B]" : "bg-white"}`}
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <Text className={`font-black mb-1 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
              Gọi {pickOffice?.name}
            </Text>
            <Text className={`mb-3 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
              Chọn số muốn gọi
            </Text>
            {pickOffice?.phones.map((p) => (
              <TouchableOpacity
                key={p.label + p.number}
                activeOpacity={0.8}
                onPress={() => {
                  dial(p.number);
                  setPickOffice(null);
                }}
                className={`flex-row items-center h-14 rounded-2xl px-4 mb-2 ${
                  isDark ? "bg-slate-800" : "bg-[#FFF1F2]"
                }`}
              >
                <Ionicons name="call" size={18} color={iconColor} />
                <Text className={`ml-3 flex-1 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  {p.label}
                </Text>
                <Text className="font-bold text-[#B30118]" style={{ fontSize: FONT_SIZE.xs }}>
                  {p.number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
