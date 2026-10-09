import CustomAlert from "@/components/CustomAlert";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { getMe, updateAvatar, updateProfile } from "@/services/user";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  LogBox,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

LogBox.ignoreLogs(["AxiosError"]);

type Gender = "MALE" | "FEMALE" | "OTHER";
const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

/** ISO (2026-05-20 hoặc 2026-05-20T00:00:00Z) -> DD/MM/YYYY. */
function isoToDmy(iso?: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/** DD/MM/YYYY -> YYYY-MM-DD; null nếu rỗng, undefined nếu sai định dạng/ngày không có thật. */
function dmyToIso(dmy: string): string | null | undefined {
  const v = dmy.trim();
  if (!v) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return undefined;
  const [, dd, mm, yyyy] = m;
  const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  if (isNaN(d.getTime()) || d.getDate() !== Number(dd) || d.getMonth() + 1 !== Number(mm)) return undefined;
  return `${yyyy}-${mm}-${dd}`;
}

/** Tự chèn dấu "/" khi gõ ngày. */
function maskDate(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function SelfProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [focused, setFocused] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [error, setError] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "confirm">("success");

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "confirm" = "success",
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const fillForm = (u: any) => {
    setFirstName(u?.firstName ?? "");
    setLastName(u?.lastName ?? "");
    setDob(isoToDmy(u?.dateOfBirth));
    setGender((u?.gender as Gender) ?? null);
    setEmail(u?.email ?? "");
    setNationalId(u?.nationalId ?? "");
    setPassportNumber(u?.passportNumber ?? "");
    setPassportExpiry(isoToDmy(u?.passportExpiry));
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Luôn gọi API: cache cũ có thể thiếu các trường mới (ngày sinh, CCCD, hộ chiếu).
        const res = await getMe();
        const data = res.data?.user || res.data;
        if (data) {
          await SecureStore.setItemAsync("user_profile", JSON.stringify(data));
          setProfile(data);
          fillForm(data);
          return;
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
      }
      try {
        const cached = await SecureStore.getItemAsync("user_profile");
        const data = cached ? JSON.parse(cached) : user;
        setProfile(data);
        fillForm(data);
      } catch {
        fillForm(user);
      } finally {
        setLoading(false);
      }
    };
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayUser = profile || user;
  const avatarUri = localAvatarUri ?? displayUser?.avatarUrl ?? null;
  const initials =
    `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase() || "BT";

  const handleSave = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Vui lòng nhập đầy đủ Họ, Tên và Email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không đúng định dạng.");
      return;
    }
    const dobIso = dmyToIso(dob);
    if (dobIso === undefined) {
      setError("Ngày sinh không hợp lệ. Nhập theo dạng DD/MM/YYYY.");
      return;
    }
    const expiryIso = dmyToIso(passportExpiry);
    if (expiryIso === undefined) {
      setError("Ngày hết hạn hộ chiếu không hợp lệ. Nhập theo dạng DD/MM/YYYY.");
      return;
    }
    const nid = nationalId.trim();
    if (nid && !/^(\d{9}|\d{12})$/.test(nid)) {
      setError("Số CCCD gồm 9 hoặc 12 chữ số.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        dateOfBirth: dobIso,
        gender,
        nationalId: nid || null,
        passportNumber: passportNumber.trim() ? passportNumber.trim().toUpperCase() : null,
        passportExpiry: expiryIso,
      });
      const updated = res.data?.user || res.data;
      if (updated) {
        await SecureStore.setItemAsync("user_profile", JSON.stringify(updated));
        setProfile(updated);
        fillForm(updated);
      }
      showAlert("Đã lưu", "Thông tin cá nhân của bạn đã được cập nhật.", "success");
    } catch (err: any) {
      const raw = err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin.";
      setError(Array.isArray(raw) ? raw.join(", ") : String(raw));
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert("Quyền truy cập", "Cần cho phép truy cập thư viện ảnh để đổi ảnh đại diện.", "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setLocalAvatarUri(asset.uri);
    try {
      setUploadingAvatar(true);
      const res = await updateAvatar(
        asset.uri,
        asset.fileName ?? `avatar_${Date.now()}.jpg`,
        asset.mimeType ?? "image/jpeg",
      );
      const updated = res.data?.user ?? res.data;
      if (updated) {
        await SecureStore.setItemAsync("user_profile", JSON.stringify(updated));
        setProfile(updated);
      }
      showAlert("Thành công", "Ảnh đại diện đã được cập nhật.", "success");
    } catch {
      showAlert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.", "error");
      setLocalAvatarUri(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

  const textMain = isDark ? "text-slate-100" : "text-slate-800";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const inputWrap = (key: string, readonly = false) =>
    `rounded-2xl border-2 px-4 h-14 justify-center ${
      readonly
        ? isDark
          ? "bg-slate-800/50 border-slate-700"
          : "bg-slate-100 border-slate-100"
        : focused === key
          ? isDark
            ? "bg-slate-800 border-red-400"
            : "bg-white border-[#D0021B]"
          : isDark
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
    }`;

  const Label = ({ children, hint }: { children: string; hint?: string }) => (
    <View className="flex-row items-baseline mb-1.5 pl-1">
      <Text className={`font-bold ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
        {children}
      </Text>
      {hint ? (
        <Text className={`ml-2 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );

  const Section = ({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) => (
    <View
      className={`rounded-[24px] p-5 mb-4 border ${
        isDark ? "bg-slate-800/90 border-slate-700/50" : "bg-white border-slate-100"
      }`}
    >
      <View className="flex-row items-center mb-4">
        <Text className={`font-black ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
          {title}
        </Text>
        {badge ? (
          <View className="bg-orange-700 rounded-full px-2 py-0.5 ml-2">
            <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xxs }}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );

  const inputText = `font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`;
  const placeholderColor = isDark ? "#64748B" : "#94A3B8";

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
          <Text className={`text-xl font-black ml-4 ${textMain}`}>Thông tin cá nhân</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#D0021B" />
          </View>
        ) : (
          <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
            >
              {/* Ảnh đại diện */}
              <View className="items-center mb-5">
                <View>
                  <View
                    className="items-center justify-center overflow-hidden"
                    style={{
                      width: 104,
                      height: 104,
                      borderRadius: 52,
                      backgroundColor: "#FDECEE",
                      borderWidth: 4,
                      borderColor: isDark ? "#334155" : "#FFFFFF",
                    }}
                  >
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={{ width: 104, height: 104 }} resizeMode="cover" />
                    ) : (
                      <Text style={{ fontSize: FONT_SIZE.xxl, fontWeight: "800", color: "#B30014" }}>
                        {initials}
                      </Text>
                    )}
                    {uploadingAvatar && (
                      <View
                        className="absolute inset-0 items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                      >
                        <ActivityIndicator color="#fff" />
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={handlePickAvatar}
                    disabled={uploadingAvatar}
                    activeOpacity={0.85}
                    className="absolute items-center justify-center bg-[#D0021B]"
                    style={{
                      right: -2,
                      bottom: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <Ionicons name="camera" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text className={`mt-3 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  Bấm nút máy ảnh để đổi ảnh đại diện
                </Text>
              </View>

              <Section title="Thông tin cơ bản">
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <Label>Họ</Label>
                    <View className={inputWrap("first")}>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        onFocus={() => setFocused("first")}
                        onBlur={() => setFocused("")}
                        placeholder="Họ"
                        placeholderTextColor={placeholderColor}
                        className={inputText}
                        style={{ fontSize: FONT_SIZE.xs }}
                      />
                    </View>
                  </View>
                  <View className="flex-1">
                    <Label>Tên</Label>
                    <View className={inputWrap("last")}>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        onFocus={() => setFocused("last")}
                        onBlur={() => setFocused("")}
                        placeholder="Tên"
                        placeholderTextColor={placeholderColor}
                        className={inputText}
                        style={{ fontSize: FONT_SIZE.xs }}
                      />
                    </View>
                  </View>
                </View>

                <Label hint="DD/MM/YYYY">Ngày sinh</Label>
                <View className={`${inputWrap("dob")} mb-4`}>
                  <TextInput
                    value={dob}
                    onChangeText={(t) => setDob(maskDate(t))}
                    onFocus={() => setFocused("dob")}
                    onBlur={() => setFocused("")}
                    placeholder="20/05/1990"
                    placeholderTextColor={placeholderColor}
                    keyboardType="number-pad"
                    maxLength={10}
                    className={inputText}
                    style={{ fontSize: FONT_SIZE.xs }}
                  />
                </View>

                <Label>Giới tính</Label>
                <View className="flex-row gap-2">
                  {GENDERS.map((g) => {
                    const active = gender === g.value;
                    return (
                      <TouchableOpacity
                        key={g.value}
                        activeOpacity={0.8}
                        onPress={() => setGender(active ? null : g.value)}
                        className={`flex-1 h-12 rounded-2xl items-center justify-center border-2 ${
                          active
                            ? "bg-[#D0021B] border-[#D0021B]"
                            : isDark
                              ? "bg-slate-800 border-slate-700"
                              : "bg-white border-slate-200"
                        }`}
                      >
                        <Text
                          className={`font-bold ${active ? "text-white" : textMuted}`}
                          style={{ fontSize: FONT_SIZE.xxs }}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Section>

              <Section title="Liên hệ">
                <Label hint="Đăng nhập bằng số này">Số điện thoại</Label>
                <View className={`${inputWrap("phone", true)} mb-4`}>
                  <Text className={textMuted} style={{ fontSize: FONT_SIZE.xs }}>
                    {displayUser?.phonenumber || "Chưa có"}
                  </Text>
                </View>
                <Label>Email</Label>
                <View className={inputWrap("email")}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    placeholder="email@example.com"
                    placeholderTextColor={placeholderColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={inputText}
                    style={{ fontSize: FONT_SIZE.xs }}
                  />
                </View>
              </Section>

              <Section title="Giấy tờ tuỳ thân" badge="Mới">
                <Label>Số CCCD</Label>
                <View className={`${inputWrap("nid")} mb-4`}>
                  <TextInput
                    value={nationalId}
                    onChangeText={(t) => setNationalId(t.replace(/\D/g, "").slice(0, 12))}
                    onFocus={() => setFocused("nid")}
                    onBlur={() => setFocused("")}
                    placeholder="12 chữ số"
                    placeholderTextColor={placeholderColor}
                    keyboardType="number-pad"
                    className={inputText}
                    style={{ fontSize: FONT_SIZE.xs }}
                  />
                </View>
                <Label>Số hộ chiếu</Label>
                <View className={`${inputWrap("pp")} mb-4`}>
                  <TextInput
                    value={passportNumber}
                    onChangeText={(t) => setPassportNumber(t.toUpperCase().slice(0, 20))}
                    onFocus={() => setFocused("pp")}
                    onBlur={() => setFocused("")}
                    placeholder="C1234567"
                    placeholderTextColor={placeholderColor}
                    autoCapitalize="characters"
                    className={inputText}
                    style={{ fontSize: FONT_SIZE.xs }}
                  />
                </View>
                <Label hint="DD/MM/YYYY">Ngày hết hạn</Label>
                <View className={`${inputWrap("ppx")} mb-3`}>
                  <TextInput
                    value={passportExpiry}
                    onChangeText={(t) => setPassportExpiry(maskDate(t))}
                    onFocus={() => setFocused("ppx")}
                    onBlur={() => setFocused("")}
                    placeholder="15/01/2032"
                    placeholderTextColor={placeholderColor}
                    keyboardType="number-pad"
                    maxLength={10}
                    className={inputText}
                    style={{ fontSize: FONT_SIZE.xs }}
                  />
                </View>
                <Text className={`leading-5 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  Chỉ dùng để làm thủ tục tour (vé máy bay, visa). Hộ chiếu cần còn hạn ít nhất 6 tháng tính từ ngày về.
                </Text>
              </Section>

              {error ? (
                <View className="rounded-2xl p-3.5 mb-4 bg-red-50 border border-red-200">
                  <Text className="text-red-700 font-medium" style={{ fontSize: FONT_SIZE.xxs }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <PrimaryButton label="Lưu thay đổi" onPress={handleSave} loading={saving} fullWidth />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
      <ZaloFloatingButton />
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}
