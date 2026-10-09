import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon } from "@/components/icons";
import logoUrl from "@/static/Logo_BTT-2024.png";
import PrimaryButton from "@/components/PrimaryButton";

/** Port từ app/(root)/(auth)/reset-password.tsx — vẫn dùng mock đổi mật khẩu (TODO gốc bên RN, chưa có backend thật). */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get("phone") ?? "";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formBg = isDark ? "#1E222B" : "#FFFFFF";
  const inputBg = isDark ? "#111318" : "#FFFFFF";
  const labelColor = isDark ? "#9CA3AF" : "#5D3F3C";
  const inputBorder = isDark ? "#2D3748" : "#E7BDB8";

  const handleReset = async () => {
    setError("");
    if (!newPassword || !confirmPassword) return setError("Vui lòng nhập đầy đủ thông tin.");
    if (newPassword.length < 6) return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp.");

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    alert("Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.");
    navigate("/login");
  };

  return (
    <Page style={{ background: isDark ? "#1E222B" : "#F9F9FF", minHeight: "100vh" }}>
      <div
        className="relative flex flex-col items-center"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 32px)",
          paddingBottom: 60,
          background: isDark ? "linear-gradient(180deg, #3E4451, #1E222B)" : "linear-gradient(180deg, #C0001A, #D0021B)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute flex items-center justify-center"
          style={{ top: "calc(env(safe-area-inset-top) + 12px)", left: 20, width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.15)" }}
        >
          <ArrowBackIcon />
        </button>

        <div className="flex items-center justify-center" style={{ width: 90, height: 90, borderRadius: 45, background: "#FFFFFF", marginBottom: 16, boxShadow: "0 8px 16px rgba(0,0,0,0.25)", padding: 10 }}>
          <img src={logoUrl} alt="" style={{ width: 66, height: 66, objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.5 }}>Đặt mật khẩu mới</div>
        {!!phone && (
          <div style={{ fontSize: FONT_SIZE.xs, color: "rgba(255,255,255,0.85)", marginTop: 6, fontStyle: "italic" }}>
            Tài khoản: {phone}
          </div>
        )}
      </div>

      <div style={{ marginTop: -40, borderTopLeftRadius: 40, borderTopRightRadius: 40, background: formBg, padding: "32px 24px 40px", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: FONT_SIZE.card, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: labelColor, marginBottom: 8 }}>
          Mật khẩu mới
        </div>
        <div className="flex items-center" style={{ borderRadius: 14, border: `1.5px solid ${inputBorder}`, background: inputBg, padding: "0 14px", height: 54, marginBottom: 20 }}>
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới (≥ 6 ký tự)"
            style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent", color: isDark ? "#F1F5F9" : "#181C23", fontSize: FONT_SIZE.xs, fontWeight: 600 }}
          />
          <button onClick={() => setShowNew((v) => !v)} style={{ color: isDark ? "#6B7280" : "#926E6A", fontSize: 18 }}>
            {showNew ? "🙈" : "👁"}
          </button>
        </div>

        <div style={{ fontSize: FONT_SIZE.card, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: labelColor, marginBottom: 8 }}>
          Xác nhận mật khẩu
        </div>
        <div className="flex items-center" style={{ borderRadius: 14, border: `1.5px solid ${inputBorder}`, background: inputBg, padding: "0 14px", height: 54, marginBottom: 8 }}>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent", color: isDark ? "#F1F5F9" : "#181C23", fontSize: FONT_SIZE.xs, fontWeight: 600 }}
          />
          <button onClick={() => setShowConfirm((v) => !v)} style={{ color: isDark ? "#6B7280" : "#926E6A", fontSize: 18 }}>
            {showConfirm ? "🙈" : "👁"}
          </button>
        </div>

        {confirmPassword.length > 0 && (
          <div style={{ marginBottom: 12, fontSize: FONT_SIZE.xs, fontWeight: 600, color: newPassword === confirmPassword ? "#22C55E" : "#EF4444" }}>
            {newPassword === confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
          </div>
        )}

        {error && (
          <div className="flex items-center" style={{ borderRadius: 12, marginBottom: 14, padding: 12, background: isDark ? "rgba(185,28,28,0.15)" : "#FEF2F2", border: `1px solid ${isDark ? "#7F1D1D" : "#FECACA"}` }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: FONT_SIZE.xs, color: "#EF4444", marginLeft: 8 }}>{error}</span>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <PrimaryButton label="Đặt lại mật khẩu" onClick={handleReset} loading={loading} fullWidth />
        </div>
      </div>
    </Page>
  );
}
