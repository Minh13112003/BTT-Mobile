import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { login } from "@/services/auth";
import { FONT_SIZE } from "@/constants/typography";
import { SunIcon, MoonIcon, PhoneIcon, LockIcon, EyeIcon } from "@/components/icons";
import PrimaryButton from "@/components/PrimaryButton";
import watermarkLogoUrl from "@/static/Logo_BTT-2018-02.png";

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.65)",
  marginBottom: 8,
};

/**
 * Port từ app/(root)/(auth)/login.tsx (bản redesign: nền gradient đỏ đậm, vòng
 * cung trang trí, logo in chìm, form kính mờ). Khác bản RN:
 * - Bỏ bước kiểm tra/điều hướng PIN sau đăng nhập (ngoài phạm vi port).
 * - LinearGradient/react-native-svg → CSS linear-gradient + SVG inline.
 * - KeyboardAvoidingView không cần — webview tự đẩy nội dung khi bàn phím mở.
 * - Giữ thông báo lỗi riêng khi không kết nối được server (không có response).
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn, saveAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identity || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res: any = await login({ identifier: identity, password });
      await saveAuth(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate("/", { replace: true });
    } catch (err: any) {
      if (err?.response) {
        setError(err.response.data?.message || "Email hoặc mật khẩu không đúng");
      } else {
        // Không có response = request bị chặn trước khi tới được server (CORS,
        // sai IP/port, backend không chạy...) — không phải sai mật khẩu.
        setError("Không kết nối được tới server. Kiểm tra lại địa chỉ backend (VITE_API_URL) và mạng.");
      }
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = isDark
    ? "linear-gradient(160deg, #2A2E38 0%, #1E222B 50%, #14161C 100%)"
    : "linear-gradient(160deg, #B30014 0%, #8A0010 50%, #5C000B 100%)";

  const inputBox = (field: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    borderRadius: 16,
    background: "rgba(255,255,255,0.97)",
    padding: "0 16px",
    height: 54,
    border: `1.5px solid ${focusedField === field ? (isDark ? "#60A5FA" : "#FFFFFF") : "transparent"}`,
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: "100%",
    marginLeft: 12,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: FONT_SIZE.xs,
    fontWeight: 600,
    color: "#1A1A2E",
    minWidth: 0,
  };

  return (
    <Page
      className="relative flex flex-col"
      style={{ minHeight: "100vh", background: bgGradient, overflowX: "hidden" }}
    >
      {/* Vòng cung trang trí */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        className="absolute"
        style={{ top: 0, left: 0, pointerEvents: "none" }}
      >
        <circle cx={340} cy={90} r={190} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
        <circle cx={340} cy={90} r={260} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1.5} />
        <circle cx={20} cy={760} r={150} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
      </svg>

      {/* Thanh trên — nút đổi theme */}
      <div
        className="relative flex justify-end"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)", paddingLeft: 20, paddingRight: 20 }}
      >
        <button
          onClick={toggleTheme}
          aria-label="Đổi giao diện sáng/tối"
          className="flex items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.12)" }}
        >
          {isDark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
        </button>
      </div>

      {/* Brand */}
      <div className="relative" style={{ padding: "18px 28px 0" }}>
        <div style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 900, letterSpacing: -0.6 }}>
          Chào mừng trở lại
        </div>
        <div style={{ color: "rgba(255,255,255,0.72)", fontSize: FONT_SIZE.xs, marginTop: 10, fontWeight: 500 }}>
          Đăng nhập để tiếp tục hành trình của bạn
        </div>
      </div>

      {/* Logo công ty in chìm, mờ — co giãn lấp khoảng trống giữa brand và form */}
      <div className="relative flex flex-1 items-center justify-center" style={{ minHeight: 90, marginTop: 8 }}>
        <img
          src={watermarkLogoUrl}
          alt=""
          style={{ width: 340, maxWidth: "88%", height: 170, objectFit: "contain", opacity: 0.16 }}
        />
      </div>

      {/* Form sheet — kính mờ */}
      <div
        className="relative"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          border: "1px solid rgba(255,255,255,0.14)",
          borderBottom: "none",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "30px 24px",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)",
        }}
      >
        <div style={LABEL_STYLE}>Số điện thoại</div>
        <div style={{ ...inputBox("identity"), marginBottom: 16 }}>
          <PhoneIcon size={18} color="#B30014" />
          <input
            type="tel"
            inputMode="tel"
            autoComplete="username"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            onFocus={() => setFocusedField("identity")}
            onBlur={() => setFocusedField("")}
            placeholder="0123456789"
            style={inputStyle}
          />
        </div>

        <div style={LABEL_STYLE}>Mật khẩu</div>
        <div style={inputBox("password")}>
          <LockIcon size={18} color="#B30014" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField("")}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={inputStyle}
          />
          <button
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="flex items-center justify-center"
            style={{ width: 36, height: 44, marginRight: -8 }}
          >
            <EyeIcon active={showPassword} color="#926E6A" />
          </button>
        </div>

        <div style={{ textAlign: "right", marginTop: 12 }}>
          <button
            onClick={() => navigate("/forgot-password")}
            style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", minHeight: 32 }}
          >
            Quên mật khẩu?
          </button>
        </div>

        {error && (
          <div
            className="flex items-center"
            style={{
              borderRadius: 12,
              marginTop: 14,
              padding: 12,
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ fontSize: 16, color: "#FCA5A5" }}>⚠</span>
            <span style={{ fontSize: FONT_SIZE.xs, fontWeight: 500, color: "#FCA5A5", marginLeft: 8, flex: 1 }}>
              {error}
            </span>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <PrimaryButton label="Đăng nhập" onClick={handleLogin} loading={loading} fullWidth />
        </div>

        {/* Footer — chìm trên nền đỏ, cùng tông chữ với form */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: FONT_SIZE.card,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "rgba(255,255,255,0.55)",
              textTransform: "uppercase",
              lineHeight: "22px",
            }}
          >
            © 2026 BenThanh Tourist Service Corporation
          </div>
          <div style={{ fontSize: FONT_SIZE.card, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            HOTLINE: <strong style={{ color: "rgba(255,255,255,0.65)" }}>1900 6668</strong>
          </div>
          <div style={{ fontSize: FONT_SIZE.card, color: "rgba(255,255,255,0.45)", marginTop: 4, wordBreak: "break-word" }}>
            Email: <strong style={{ color: "rgba(255,255,255,0.65)" }}>benthanh@benthanhtourist.com</strong>
          </div>
        </div>
      </div>
    </Page>
  );
}
