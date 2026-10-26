import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { GuestForm, maskDate } from "@/utils/guest";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

interface Props {
  value: GuestForm;
  onChange: (patch: Partial<GuestForm>) => void;
  /** Khách 1 (người đặt): số điện thoại bắt buộc. */
  requirePhone?: boolean;
  /** Tour nước ngoài: hộ chiếu + visa bắt buộc. */
  requireVisa?: boolean;
  /** Hiện nhắc ngày sinh/CCCD ở nhãn. */
  hintAge?: boolean;
}

/** Bộ ô nhập thông tin một người (thân nhân hoặc hành khách khi đặt tour). Component ở file riêng để ô nhập không bị mất focus khi gõ. */
export default function GuestFields({ value, onChange, requirePhone, requireVisa, hintAge = true }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [focused, setFocused] = useState("");

  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const placeholderColor = isDark ? "#64748B" : "#94A3B8";
  const inputText = `font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`;
  const wrap = (key: string) =>
    `rounded-2xl border-2 px-4 h-[52px] justify-center mb-4 ${
      focused === key
        ? isDark
          ? "bg-slate-800 border-red-400"
          : "bg-white border-[#D0021B]"
        : isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
    }`;

  const field = (
    key: keyof GuestForm,
    label: string,
    opts: { required?: boolean; hint?: string; placeholder?: string; keyboard?: "default" | "number-pad" | "phone-pad"; max?: number; mask?: boolean; caps?: boolean } = {},
  ) => (
    <View key={key}>
      <View className="flex-row items-baseline mb-1.5 pl-1">
        <Text className={`font-bold ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {label}
          {opts.required ? <Text style={{ color: "#D0021B" }}> *</Text> : null}
        </Text>
        {opts.hint ? (
          <Text className={`ml-2 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
            {opts.hint}
          </Text>
        ) : null}
      </View>
      <View className={wrap(key)}>
        <TextInput
          value={value[key]}
          onChangeText={(t) => onChange({ [key]: opts.mask ? maskDate(t) : t } as Partial<GuestForm>)}
          onFocus={() => setFocused(key)}
          onBlur={() => setFocused("")}
          placeholder={opts.placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={opts.keyboard ?? "default"}
          maxLength={opts.max}
          autoCapitalize={opts.caps ? "words" : "none"}
          className={inputText}
          style={{ fontSize: FONT_SIZE.xs }}
        />
      </View>
    </View>
  );

  return (
    <View>
      {field("fullName", "Họ và tên", { required: true, placeholder: "Như trên giấy tờ", caps: true, max: 100 })}
      {field("dob", "Ngày sinh", { required: true, hint: "DD/MM/YYYY", placeholder: "20/05/1990", keyboard: "number-pad", max: 10, mask: true })}
      {field("nationalId", "Số CCCD", {
        hint: hintAge ? "bắt buộc từ đủ 14 tuổi" : undefined,
        placeholder: "12 chữ số",
        keyboard: "number-pad",
        max: 20,
      })}
      {field("phone", "Số điện thoại", {
        required: requirePhone,
        hint: requirePhone ? undefined : "không bắt buộc",
        placeholder: "0901234567",
        keyboard: "phone-pad",
        max: 20,
      })}
      {field("passportNumber", "Số hộ chiếu", {
        required: requireVisa,
        hint: requireVisa ? undefined : "tuỳ chọn",
        placeholder: "Ví dụ: C1234567",
        max: 20,
      })}
      {field("visaNumber", "Số visa", {
        required: requireVisa,
        hint: requireVisa ? undefined : "tuỳ chọn",
        placeholder: "Nếu đã có",
        max: 30,
      })}
    </View>
  );
}
