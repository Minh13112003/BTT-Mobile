import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

import AlertDialog from "@/components/AlertDialog";
import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import SubPageHeader from "@/components/SubPageHeader";
import { useTheme } from "@/context/ThemeContext";
import { getPinStatus } from "@/services/pin";
import { changePassword } from "@/services/user";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

/**
 * Port từ app/(root)/(profile)/security.tsx: thiết lập/đổi mã PIN xác nhận đặt tour + đổi mật khẩu.
 */
export default function SecurityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Mỗi lần quay lại trang (sau khi tạo/đổi PIN) tải lại trạng thái PIN.
  useEffect(() => {
    getPinStatus()
      .then((res) => setHasPin(res.data?.hasPin ?? false))
      .catch(() => setHasPin(false));
  }, [location.key]);

  const handleChangePassword = async () => {
    setError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      setSaving(true);
      await changePassword({ currentPassword: oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setDone(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const raw = err?.response?.data?.message;
      let msg = "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.";
      if (status === 400 || status === 401) msg = "Mật khẩu hiện tại chưa đúng.";
      else if (raw) msg = Array.isArray(raw) ? raw.join(", ") : String(raw);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const textMain = isDark ? "#F1F5F9" : "#1E293B";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const card: React.CSSProperties = {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    background: isDark ? "rgba(30,41,59,0.9)" : "#FFFFFF",
    border: `1px solid ${isDark ? "rgba(51,65,85,0.5)" : "#F1F5F9"}`,
  };

  const field = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <div style={{ marginBottom: 16 }}>
      <div className="font-bold" style={{ marginBottom: 6, paddingLeft: 4, fontSize: FONT_SIZE.xxs, color: textMuted }}>
        {label}
      </div>
      <div
        className="flex items-center"
        style={{
          height: 56,
          padding: "0 16px",
          borderRadius: 16,
          background: isDark ? "#1E293B" : "#FFFFFF",
          border: `2px solid ${focused === id ? (isDark ? "#F87171" : "#D0021B") : isDark ? "#334155" : "#E2E8F0"}`,
        }}
      >
        <Icon name="lock-closed-outline" size={20} color="#94A3B8" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused("")}
          type={showPw ? "text" : "password"}
          autoCapitalize="none"
          placeholder="••••••"
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: 12,
            border: "none",
            outline: "none",
            background: "transparent",
            color: textMain,
            fontSize: FONT_SIZE.xs,
          }}
        />
        <button
          onClick={() => setShowPw((v) => !v)}
          aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          style={{ padding: 4, minHeight: 0 }}
        >
          <Icon name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
        </button>
      </div>
    </div>
  );

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
      <SubPageHeader title="Mật khẩu & mã PIN" />

      <div style={{ padding: "8px 16px 40px" }}>
        {/* Mã PIN */}
        <div style={card}>
          <div className="font-black" style={{ marginBottom: 12, fontSize: FONT_SIZE.xs, color: textMain }}>
            Mã PIN xác nhận đặt tour
          </div>
          <div style={{ marginBottom: 16, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textMuted }}>
            Mã PIN gồm 6 số, dùng để xác nhận khi đặt tour. Không chia sẻ mã này cho bất kỳ ai.
          </div>
          <div
            className="flex items-center"
            style={{
              padding: 14,
              borderRadius: 16,
              marginBottom: 16,
              background: hasPin
                ? isDark
                  ? "rgba(16,185,129,0.1)"
                  : "#ECFDF5"
                : isDark
                  ? "rgba(245,158,11,0.1)"
                  : "#FFFBEB",
            }}
          >
            <Icon name={hasPin ? "shield-checkmark" : "shield-outline"} size={22} color={hasPin ? "#10B981" : "#F59E0B"} />
            <span className="font-bold" style={{ marginLeft: 10, fontSize: FONT_SIZE.xxs, color: hasPin ? "#047857" : "#B45309" }}>
              {hasPin === null ? "Đang kiểm tra…" : hasPin ? "Đã thiết lập mã PIN" : "Chưa thiết lập mã PIN"}
            </span>
          </div>
          <PrimaryButton
            label={hasPin ? "Đổi mã PIN" : "Tạo mã PIN"}
            fullWidth
            onClick={() => navigate(hasPin ? "/change-pin" : "/setup-pin")}
          />
        </div>

        {/* Đổi mật khẩu */}
        <div style={card}>
          <div className="font-black" style={{ marginBottom: 16, fontSize: FONT_SIZE.xs, color: textMain }}>
            Đổi mật khẩu
          </div>
          {field("old", "Mật khẩu hiện tại", oldPassword, setOldPassword)}
          {field("new", "Mật khẩu mới (ít nhất 6 ký tự)", newPassword, setNewPassword)}
          {field("confirm", "Nhập lại mật khẩu mới", confirmPassword, setConfirmPassword)}
          {error ? (
            <div
              className="font-medium"
              style={{ padding: 14, borderRadius: 16, marginBottom: 16, background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: FONT_SIZE.xxs }}
            >
              {error}
            </div>
          ) : null}
          <PrimaryButton label="Cập nhật mật khẩu" onClick={handleChangePassword} loading={saving} fullWidth />
        </div>
      </div>

      <AlertDialog
        visible={done}
        type="success"
        title="Đã đổi mật khẩu"
        message="Nếu bạn không thực hiện thao tác này, vui lòng liên hệ tổng đài 1900 6668 ngay."
        onClose={() => setDone(false)}
      />
    </Page>
  );
}
