import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";

import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { changePassword, getMe, updateAvatar, updateProfile } from "@/services/user";
import { getItem, setItem } from "@/utils/storage";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { UserIcon } from "@/components/icons";

/**
 * Port từ app/(root)/(profile)/selfprofile.tsx — gộp các khối Alert.alert
 * thành snackbar, upload avatar dùng input file thật của trình duyệt thay vì
 * expo-image-picker.
 */
export default function SelfProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const snackbar = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAge, setEditAge] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const cached = await getItem("user_profile");
        if (cached) {
          setProfile(JSON.parse(cached));
        } else {
          const res = await getMe();
          const userData = (res.data as any)?.user || res.data;
          if (userData) {
            await setItem("user_profile", JSON.stringify(userData));
            setProfile(userData);
          }
        }
      } catch (err) {
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
    setIsEditing(true);
  };

  const handleUpdateProfile = async () => {
    setProfileError("");
    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      return setProfileError("Vui lòng nhập đầy đủ thông tin Họ, Tên và Email.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      return setProfileError("Email không đúng định dạng.");
    }
    let ageVal: number | undefined;
    if (editAge.trim()) {
      const parsed = parseInt(editAge.trim(), 10);
      if (isNaN(parsed) || parsed <= 0) return setProfileError("Tuổi phải là số nguyên dương hợp lệ.");
      ageVal = parsed;
    }

    try {
      setUpdatingProfile(true);
      const res = await updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        age: ageVal,
      } as any);
      const updatedUser = (res.data as any)?.user || res.data;
      const finalUser = updatedUser || { ...displayUser, firstName: editFirstName.trim(), lastName: editLastName.trim(), email: editEmail.trim(), age: ageVal };
      await setItem("user_profile", JSON.stringify(finalUser));
      setProfile(finalUser);
      snackbar.openSnackbar({ text: "Cập nhật thông tin tài khoản thành công!", type: "success" });
      setIsEditing(false);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin.";
      setProfileError(Array.isArray(rawMsg) ? rawMsg.join(", ") : String(rawMsg));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return setPwError("Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.");
    if (newPassword.length < 6) return setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");

    try {
      setUpdatingPassword(true);
      setPwError("");
      await changePassword({ currentPassword: oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      // Giống bản RN — buộc đăng xuất sau khi đổi mật khẩu thành công để session
      // cũ (token đang có trong tay người khác, nếu có) không còn hiệu lực.
      snackbar.openSnackbar({
        text: "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.",
        type: "success",
        duration: 3000,
        onClose: async () => {
          await logout();
          navigate("/login", { replace: true });
        },
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const rawMsg = err?.response?.data?.message;
      const msg =
        status === 400 || status === 401
          ? "Sai mật khẩu cũ, xin vui lòng nhập đúng mật khẩu cũ của bạn."
          : Array.isArray(rawMsg)
          ? rawMsg.join(", ")
          : rawMsg || "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.";
      setPwError(msg);
      snackbar.openSnackbar({ text: msg, type: "error" });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handlePickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setLocalAvatarUrl(previewUrl);
    try {
      setUploadingAvatar(true);
      const res = await updateAvatar(file);
      const updatedUser = (res.data as any)?.user ?? res.data;
      if (updatedUser) {
        await setItem("user_profile", JSON.stringify(updatedUser));
        setProfile(updatedUser);
      }
      snackbar.openSnackbar({ text: "Ảnh đại diện đã được cập nhật!", type: "success" });
    } catch (err) {
      console.error(err);
      snackbar.openSnackbar({ text: "Không thể tải ảnh lên. Vui lòng thử lại.", type: "error" });
      setLocalAvatarUrl(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const fieldStyle = { borderRadius: RADIUS.lg, border: `1.5px solid ${palette.border}`, background: palette.surfaceAlt, padding: "0 14px", height: 50, color: palette.textPrimary, fontSize: FONT_SIZE.xxs, outline: "none", width: "100%" };
  const labelStyle = { fontSize: FONT_SIZE.card, fontWeight: 700, color: palette.textMuted, marginBottom: 6, textTransform: "uppercase" as const };

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header title="Hồ sơ cá nhân" showBackButton />

      <div style={{ padding: "20px 24px 40px" }}>
        <div style={{ padding: 20, borderRadius: RADIUS.xl, background: palette.surface, border: `1px solid ${palette.border}` }}>
          {/* Avatar */}
          <div className="flex flex-col items-center" style={{ marginBottom: 20 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative flex items-center justify-center"
              style={{ width: 160, height: 160, borderRadius: 80, border: `3px solid ${isDark ? "#3B82F6" : palette.brand}`, overflow: "hidden", background: palette.surfaceAlt }}
            >
              {localAvatarUrl || displayUser?.avatarUrl ? (
                <img src={localAvatarUrl ?? displayUser?.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UserIcon active color={palette.icon} size={64} />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <Spinner />
                </div>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickAvatar} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ marginTop: 10, color: palette.brand, fontWeight: 700, fontSize: FONT_SIZE.xxs }}>
              Đổi ảnh đại diện
            </button>
          </div>

          {!isEditing ? (
            <>
              <div style={{ fontSize: FONT_SIZE.xl, fontWeight: 900, color: palette.textPrimary, textAlign: "center" }}>
                {displayUser?.firstName} {displayUser?.lastName}
              </div>
              <div style={{ textAlign: "center", color: palette.textMuted, marginTop: 4, fontSize: FONT_SIZE.xxs }}>{displayUser?.email}</div>

              <div style={{ marginTop: 20 }}>
                <div className="flex items-center justify-between" style={{ padding: "12px 0", borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Số điện thoại</span>
                  <span style={{ color: palette.textPrimary, fontWeight: 700, fontSize: FONT_SIZE.xxs }}>{displayUser?.phonenumber || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center justify-between" style={{ padding: "12px 0", borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Tuổi</span>
                  <span style={{ color: palette.textPrimary, fontWeight: 700, fontSize: FONT_SIZE.xxs }}>{displayUser?.age || "Chưa cập nhật"}</span>
                </div>
              </div>

              <button
                onClick={startEditing}
                className="w-full text-white font-bold"
                style={{ marginTop: 20, borderRadius: RADIUS.lg, height: 50, background: palette.brand, fontSize: FONT_SIZE.xxs }}
              >
                Chỉnh sửa thông tin
              </button>
            </>
          ) : (
            <>
              <div style={labelStyle}>Họ</div>
              <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} style={{ ...fieldStyle, marginBottom: 14 }} />
              <div style={labelStyle}>Tên</div>
              <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} style={{ ...fieldStyle, marginBottom: 14 }} />
              <div style={labelStyle}>Email</div>
              <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ ...fieldStyle, marginBottom: 14 }} />
              <div style={labelStyle}>Tuổi (tuỳ chọn)</div>
              <input value={editAge} onChange={(e) => setEditAge(e.target.value)} inputMode="numeric" style={{ ...fieldStyle, marginBottom: 14 }} />

              {profileError && (
                <div style={{ color: "#EF4444", fontSize: FONT_SIZE.xxs, marginBottom: 14 }}>{profileError}</div>
              )}

              <div className="flex" style={{ gap: 10 }}>
                <button onClick={() => setIsEditing(false)} className="flex-1 font-bold" style={{ borderRadius: RADIUS.lg, height: 50, border: `1px solid ${palette.border}`, color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}>
                  Hủy
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile}
                  className="flex-1 text-white font-bold"
                  style={{ borderRadius: RADIUS.lg, height: 50, background: palette.brand, opacity: updatingProfile ? 0.7 : 1, fontSize: FONT_SIZE.xxs }}
                >
                  {updatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Đổi mật khẩu */}
        <div style={{ padding: 20, borderRadius: RADIUS.xl, background: palette.surface, border: `1px solid ${palette.border}`, marginTop: 20 }}>
          <div className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, marginBottom: 14 }}>Đổi mật khẩu</div>

          <div style={labelStyle}>Mật khẩu hiện tại</div>
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={{ ...fieldStyle, marginBottom: 14 }} />
          <div style={labelStyle}>Mật khẩu mới</div>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...fieldStyle, marginBottom: 14 }} />

          {pwError && <div style={{ color: "#EF4444", fontSize: FONT_SIZE.xxs, marginBottom: 14 }}>{pwError}</div>}

          <button
            onClick={handleChangePassword}
            disabled={updatingPassword}
            className="w-full text-white font-bold"
            style={{ borderRadius: RADIUS.lg, height: 50, background: isDark ? "#334155" : "#1E293B", opacity: updatingPassword ? 0.7 : 1, fontSize: FONT_SIZE.xxs }}
          >
            {updatingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </Page>
  );
}
