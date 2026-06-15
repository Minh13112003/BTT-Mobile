import { useAuth } from "@/context/Auth_Context";
import { formatDateTime } from "@/helper/datetime_helper";
import { changePassword, getMe, updateProfile } from "@/services/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/Theme_Context";

export default function SelfProfileScreen() {
  const router = useRouter();

  // Lấy chính xác object 'user' từ Auth_Context ra làm fallback
  const { user } = useAuth();

  // Các state quản lý thông tin profile và cache
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // State chỉnh sửa thông tin
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAge, setEditAge] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Các state quản lý form đổi mật khẩu
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Lấy thông tin user từ cache hoặc gọi API getMe()
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const cached = await SecureStore.getItemAsync("user_profile");
        if (cached) {
          setProfile(JSON.parse(cached));
        } else {
          const res = await getMe();
          // API getMe trả về dữ liệu người dùng
          const userData = res.data?.user || res.data;
          if (userData) {
            await SecureStore.setItemAsync(
              "user_profile",
              JSON.stringify(userData),
            );
            setProfile(userData);
          }
        }
      } catch (err: any) {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const displayUser = profile || user;

  const startEditing = () => {
    setEditFirstName(displayUser?.firstName || "");
    setEditLastName(displayUser?.lastName || "");
    setEditEmail(displayUser?.email || "");
    setEditAge(displayUser?.age?.toString() || "");
    setProfileError("");
    setIsEditingProfile(true);
  };

  // Xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = async () => {
    setProfileError("");
    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      setProfileError("Vui lòng nhập đầy đủ thông tin Họ, Tên và Email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      setProfileError("Email không đúng định dạng.");
      return;
    }

    let ageVal: number | undefined = undefined;
    if (editAge.trim()) {
      const parsed = parseInt(editAge.trim(), 10);
      if (isNaN(parsed) || parsed <= 0) {
        setProfileError("Tuổi phải là số nguyên dương hợp lệ.");
        return;
      }
      ageVal = parsed;
    }

    try {
      setUpdatingProfile(true);
      const res = await updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        age: ageVal,
      });

      const updatedUser = res.data?.user || res.data;
      if (updatedUser) {
        await SecureStore.setItemAsync(
          "user_profile",
          JSON.stringify(updatedUser),
        );
        setProfile(updatedUser);
      } else {
        const fallbackUser = {
          ...displayUser,
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          email: editEmail.trim(),
          age: ageVal,
          updatedAt: new Date().toISOString(),
        };
        await SecureStore.setItemAsync(
          "user_profile",
          JSON.stringify(fallbackUser),
        );
        setProfile(fallbackUser);
      }

      Alert.alert("Thành công", "Cập nhật thông tin tài khoản thành công!");
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error(err);
      const rawMsg =
        err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin.";
      const displayMsg = Array.isArray(rawMsg)
        ? rawMsg.join(", ")
        : rawMsg.toString();
      setProfileError(displayMsg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin mật khẩu cũ và mới.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setUpdatingPassword(true);
      setErrorMsg("");
      setSuccessMsg("");

      await changePassword({
        oldPassword,
        newPassword,
      });

      setSuccessMsg("Cập nhật mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      Alert.alert("Thành công", "Cập nhật mật khẩu thành công!");

      // Ẩn form sau khi thành công
      setTimeout(() => {
        setShowChangePassword(false);
        setSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật mật khẩu.";
      setErrorMsg(msg);
      Alert.alert("Thất bại", msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        {/* Nút Back quay lại */}
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white/60"}`}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? "#93C5FD" : "#1E3A8A"} />
          </TouchableOpacity>
          <Text className={`text-xl font-black ml-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Hồ sơ cá nhân
          </Text>
          {loadingProfile && (
            <ActivityIndicator size="small" color={isDark ? "#93C5FD" : "#3B82F6"} className="ml-3" />
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          {/* Card thông tin cá nhân */}
          <View className={`rounded-[24px] p-5 border ${
            isDark
              ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
              : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
          }`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`font-bold text-lg ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                Thông tin tài khoản
              </Text>
              {!isEditingProfile && (
                <TouchableOpacity
                  onPress={startEditing}
                  className={`flex-row items-center px-3 py-1.5 rounded-full ${isDark ? "bg-slate-700 border border-slate-600" : "bg-blue-50"}`}
                >
                  <Ionicons name="create-outline" size={16} color={isDark ? "#93C5FD" : "#3B82F6"} />
                  <Text className={`font-bold text-base ml-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    Chỉnh sửa
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditingProfile ? (
              // CHẾ ĐỘ CHỈNH SỬA
              <View>
                {/* Mục Họ và Tên (chia làm 2 ô) */}
                <View className="flex-row mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                      Họ
                    </Text>
                    <View
                      className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
                        isDark
                          ? focusedField === "firstName"
                            ? "border-blue-500 bg-slate-900/60"
                            : "border-slate-700/60 bg-slate-900/30"
                          : focusedField === "firstName"
                            ? "border-blue-500 bg-white"
                            : "border-slate-100 bg-slate-50/50"
                      }`}
                    >
                      <TextInput
                        className={`flex-1 h-full font-semibold text-base ${isDark ? "text-slate-100" : "text-slate-800"}`}
                        placeholder="Họ"
                        placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                        value={editFirstName}
                        onChangeText={setEditFirstName}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => setFocusedField("")}
                      />
                    </View>
                  </View>

                  <View className="flex-1 ml-2">
                    <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                      Tên
                    </Text>
                    <View
                      className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
                        isDark
                          ? focusedField === "lastName"
                            ? "border-blue-500 bg-slate-900/60"
                            : "border-slate-700/60 bg-slate-900/30"
                          : focusedField === "lastName"
                            ? "border-blue-500 bg-white"
                            : "border-slate-100 bg-slate-50/50"
                      }`}
                    >
                      <TextInput
                        className={`flex-1 h-full font-semibold text-base ${isDark ? "text-slate-100" : "text-slate-800"}`}
                        placeholder="Tên"
                        placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                        value={editLastName}
                        onChangeText={setEditLastName}
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={() => setFocusedField("")}
                      />
                    </View>
                  </View>
                </View>

                {/* Mục Email */}
                <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                  Địa chỉ Email
                </Text>
                <View
                  className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                    isDark
                      ? focusedField === "email"
                        ? "border-blue-500 bg-slate-900/60"
                        : "border-slate-700/60 bg-slate-900/30"
                      : focusedField === "email"
                        ? "border-blue-500 bg-white"
                        : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedField === "email" ? (isDark ? "#60A5FA" : "#3B82F6") : "#94A3B8"}
                  />
                  <TextInput
                    className={`flex-1 h-full ml-3 font-semibold text-base ${isDark ? "text-slate-100" : "text-slate-800"}`}
                    placeholder="Địa chỉ Email"
                    placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={editEmail}
                    onChangeText={setEditEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                  />
                </View>

                {/* Mục Tuổi */}
                <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                  Tuổi
                </Text>
                <View
                  className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                    isDark
                      ? focusedField === "age"
                        ? "border-blue-500 bg-slate-900/60"
                        : "border-slate-700/60 bg-slate-900/30"
                      : focusedField === "age"
                        ? "border-blue-500 bg-white"
                        : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <Ionicons
                    name="calendar-number-outline"
                    size={20}
                    color={focusedField === "age" ? (isDark ? "#60A5FA" : "#3B82F6") : "#94A3B8"}
                  />
                  <TextInput
                    className={`flex-1 h-full ml-3 font-semibold text-base ${isDark ? "text-slate-100" : "text-slate-800"}`}
                    placeholder="Nhập tuổi"
                    placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                    keyboardType="numeric"
                    value={editAge}
                    onChangeText={setEditAge}
                    onFocus={() => setFocusedField("age")}
                    onBlur={() => setFocusedField("")}
                  />
                </View>

                {/* Thông báo lỗi khi cập nhật thông tin */}
                {profileError ? (
                  <View className={`flex-row items-center border rounded-xl mb-4 p-3 ${
                    isDark ? "bg-red-950/30 border-red-900/50" : "bg-red-50 border-red-100"
                  }`}>
                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    <Text className="text-red-600 text-base font-medium ml-2 flex-1">
                      {profileError}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              // CHẾ ĐỘ HIỂN THỊ
              <View>
                {/* Mục Họ và tên */}
                <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                  Họ và tên
                </Text>
                <View className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                  isDark ? "bg-slate-900/40 border-slate-700/50" : "bg-slate-50/50 border-slate-100"
                }`}>
                  <Ionicons name="person-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
                  <Text className={`ml-3 font-semibold text-base ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {displayUser?.firstName && displayUser?.lastName
                      ? `${displayUser.firstName} ${displayUser.lastName}`
                      : "Chưa cập nhật"}
                  </Text>
                </View>

                {/* Mục Email */}
                <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                  Địa chỉ Email
                </Text>
                <View className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                  isDark ? "bg-slate-900/40 border-slate-700/50" : "bg-slate-50/50 border-slate-100"
                }`}>
                  <Ionicons name="mail-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
                  <Text className={`ml-3 font-semibold text-base ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {displayUser?.email || "Chưa cập nhật"}
                  </Text>
                </View>

                {/* Mục Tuổi */}
                <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                  Tuổi
                </Text>
                <View className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                  isDark ? "bg-slate-900/40 border-slate-700/50" : "bg-slate-50/50 border-slate-100"
                }`}>
                  <Ionicons
                    name="calendar-number-outline"
                    size={20}
                    color={isDark ? "#6B7280" : "#94A3B8"}
                  />
                  <Text className={`ml-3 font-semibold text-base ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {displayUser?.age
                      ? `${displayUser.age} tuổi`
                      : "Chưa cập nhật"}
                  </Text>
                </View>
              </View>
            )}

            {/* Các mục không cho phép sửa (hiển thị giống nhau ở cả 2 chế độ, nhưng thêm icon khóa ở chế độ chỉnh sửa) */}
            {/* Mục Chức vụ / Vai trò */}
            <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
              Quyền hạn hệ thống
            </Text>
            <View
              className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                isEditingProfile
                  ? isDark ? "bg-slate-900/60 border-slate-700/50" : "bg-slate-100 border-slate-100"
                  : isDark ? "bg-slate-900/40 border-slate-700/50" : "bg-slate-50/50 border-slate-100"
              }`}
            >
              <Ionicons name="shield-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
              <Text
                className={`ml-3 text-base ${
                  isEditingProfile
                    ? "text-slate-500 font-semibold"
                    : isDark ? "text-blue-400 font-bold" : "text-blue-600 font-bold"
                }`}
              >
                {displayUser?.role || "Thành viên"}
              </Text>
              {isEditingProfile && (
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={isDark ? "#6B7280" : "#94A3B8"}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </View>

            {/* Mục Ngày tạo tài khoản */}
            <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
              Ngày tạo tài khoản
            </Text>
            <View
              className={`flex-row items-center rounded-2xl border-2 px-4 h-14 mb-4 ${
                isEditingProfile
                  ? isDark ? "bg-slate-900/60 border-slate-700/50" : "bg-slate-100 border-slate-100"
                  : isDark ? "bg-slate-900/40 border-slate-700/50" : "bg-slate-50/50 border-slate-100"
              }`}
            >
              <Ionicons name="calendar-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
              <Text
                className={`ml-3 text-base ${
                  isEditingProfile
                    ? "text-slate-500 font-semibold"
                    : isDark ? "text-slate-300 font-semibold" : "text-slate-700 font-semibold"
                }`}
              >
                {formatDateTime(displayUser?.createdAt)}
              </Text>
              {isEditingProfile && (
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={isDark ? "#6B7280" : "#94A3B8"}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </View>

            {/* Mục Cập nhật tài khoản gần nhất */}
            <Text className="text-slate-400 text-base font-bold mb-2 uppercase tracking-wider pl-1">
              Cập nhật gần nhất
            </Text>
            <View
              className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
                isEditingProfile
                  ? isDark ? "bg-slate-900/60 border-slate-700/50" : "bg-slate-100 border-slate-100"
                  : isDark ? "bg-slate-900/40 border-slate-700/50" : "bg-slate-50/50 border-slate-100"
              }`}
            >
              <Ionicons name="refresh-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
              <Text
                className={`ml-3 text-base ${
                  isEditingProfile
                    ? "text-slate-500 font-semibold"
                    : isDark ? "text-slate-300 font-semibold" : "text-slate-700 font-semibold"
                }`}
              >
                {formatDateTime(displayUser?.updatedAt)}
              </Text>
              {isEditingProfile && (
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={isDark ? "#6B7280" : "#94A3B8"}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </View>

            {/* Nút bấm Lưu / Hủy trong chế độ chỉnh sửa */}
            {isEditingProfile && (
              <View className="flex-row mt-6">
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(false)}
                  disabled={updatingProfile}
                  activeOpacity={0.7}
                  className={`flex-1 mr-2 border-2 rounded-2xl h-14 items-center justify-center ${
                    isDark
                      ? "bg-slate-800 border-slate-700 active:bg-slate-750"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text className={`font-bold text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdateProfile}
                  disabled={updatingProfile}
                  activeOpacity={0.8}
                  className={`flex-1 ml-2 rounded-2xl h-14 items-center justify-center ${
                    isDark
                      ? "bg-slate-700 active:bg-slate-600 border border-slate-600 shadow-black/20"
                      : "bg-blue-500 active:bg-blue-600"
                  } ${updatingProfile ? "opacity-70" : ""}`}
                >
                  {updatingProfile ? (
                    <ActivityIndicator color={isDark ? "#93C5FD" : "#FFFFFF"} size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base">Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Card Đổi Mật Khẩu */}
          <View className={`rounded-[24px] p-5 mt-6 border ${
            isDark
              ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
              : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
          }`}>
            <TouchableOpacity
              onPress={() => {
                setShowChangePassword(!showChangePassword);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              activeOpacity={0.7}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                  isDark ? "bg-slate-700 border border-slate-600" : "bg-blue-50"
                }`}>
                  <Ionicons name="key-outline" size={20} color={isDark ? "#93C5FD" : "#3B82F6"} />
                </View>
                <Text className={`font-bold text-base ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Đổi mật khẩu bảo mật
                </Text>
              </View>
              <Ionicons
                name={showChangePassword ? "chevron-up" : "chevron-down"}
                size={20}
                color={isDark ? "#94A3B8" : "#64748B"}
              />
            </TouchableOpacity>

            {showChangePassword && (
              <View className="mt-5">
                <View className={`h-[1px] mb-5 ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`} />

                {/* Mật khẩu cũ */}
                <Text className="text-slate-500 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                  Mật khẩu cũ
                </Text>
                <View
                  className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
                    isDark
                      ? focusedField === "oldPassword"
                        ? "border-blue-500 bg-slate-900/60"
                        : "border-slate-700/60 bg-slate-900/30"
                      : focusedField === "oldPassword"
                        ? "border-blue-500 bg-white"
                        : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      focusedField === "oldPassword" ? (isDark ? "#60A5FA" : "#3B82F6") : "#94A3B8"
                    }
                  />
                  <TextInput
                    className={`flex-1 h-full ml-3 font-semibold text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    placeholder="Nhập mật khẩu cũ"
                    placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                    secureTextEntry={!showOldPassword}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    onFocus={() => setFocusedField("oldPassword")}
                    onBlur={() => setFocusedField("")}
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    activeOpacity={0.5}
                    className="p-1"
                  >
                    <Ionicons
                      name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={isDark ? "#6B7280" : "#94A3B8"}
                    />
                  </TouchableOpacity>
                </View>

                <View className="h-4" />

                {/* Mật khẩu mới */}
                <Text className="text-slate-500 text-base font-bold mb-2 uppercase tracking-wider pl-1">
                  Mật khẩu mới
                </Text>
                <View
                  className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
                    isDark
                      ? focusedField === "newPassword"
                        ? "border-blue-500 bg-slate-900/60"
                        : "border-slate-700/60 bg-slate-900/30"
                      : focusedField === "newPassword"
                        ? "border-blue-500 bg-white"
                        : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      focusedField === "newPassword" ? (isDark ? "#60A5FA" : "#3B82F6") : "#94A3B8"
                    }
                  />
                  <TextInput
                    className={`flex-1 h-full ml-3 font-semibold text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    placeholder="Nhập mật khẩu mới"
                    placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setFocusedField("newPassword")}
                    onBlur={() => setFocusedField("")}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.5}
                    className="p-1"
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={isDark ? "#6B7280" : "#94A3B8"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Thông báo lỗi */}
                {errorMsg ? (
                  <View className={`flex-row items-center border rounded-xl mt-4 p-3 ${
                    isDark ? "bg-red-950/30 border-red-900/50" : "bg-red-50 border-red-100"
                  }`}>
                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    <Text className="text-red-600 text-base font-medium ml-2 flex-1">
                      {errorMsg}
                    </Text>
                  </View>
                ) : null}

                {/* Thông báo thành công */}
                {successMsg ? (
                  <View className={`flex-row items-center border rounded-xl mt-4 p-3 ${
                    isDark ? "bg-emerald-950/30 border-emerald-900/50" : "bg-green-50 border-green-100"
                  }`}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#10B981"
                    />
                    <Text className="text-green-600 text-base font-medium ml-2 flex-1">
                      {successMsg}
                    </Text>
                  </View>
                ) : null}

                {/* Nút bấm Submit */}
                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={updatingPassword}
                  activeOpacity={0.8}
                  className={`rounded-2xl h-14 items-center justify-center mt-5 shadow-md ${
                    isDark
                      ? "bg-slate-700 active:bg-slate-600 border border-slate-600 shadow-black/20"
                      : "bg-blue-500 active:bg-blue-600 shadow-blue-500/20"
                  } ${updatingPassword ? "opacity-70" : ""}`}
                >
                  {updatingPassword ? (
                    <ActivityIndicator color={isDark ? "#93C5FD" : "#FFFFFF"} size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base tracking-wide">
                      Xác nhận đổi mật khẩu
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
