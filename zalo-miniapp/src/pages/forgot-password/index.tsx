import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon, SunIcon, MoonIcon } from "@/components/icons";
import logoUrl from "@/static/Logo_BTT-2024.png";
import PrimaryButton from "@/components/PrimaryButton";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/** Port từ app/(root)/(auth)/forgot-password.tsx — vẫn dùng mock gửi/xác minh OTP (TODO gốc bên RN, chưa có backend thật). */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.trim().length < 9) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setOtpSent(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    startCountdown();
    setTimeout(() => otpRefs.current[0]?.focus(), 200);
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 600));
    setVerifying(false);
    navigate(`/reset-password?phone=${encodeURIComponent(phone.trim())}`);
  };

  const formBg = isDark ? "#1E222B" : "#FFFFFF";
  const inputBg = isDark ? "#111318" : "#FFFFFF";
  const labelColor = isDark ? "#9CA3AF" : "#5D3F3C";
  const isPhoneValid = phone.trim().length >= 9;
  const isOtpFull = otp.every((d) => d !== "");

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
        <button
          onClick={toggleTheme}
          className="absolute flex items-center justify-center"
          style={{ top: "calc(env(safe-area-inset-top) + 12px)", right: 20, width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.15)" }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="flex items-center justify-center" style={{ width: 90, height: 90, borderRadius: 45, background: "#FFFFFF", marginBottom: 16, boxShadow: "0 8px 16px rgba(0,0,0,0.25)", padding: 10 }}>
          <img src={logoUrl} alt="" style={{ width: 66, height: 66, objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.5 }}>Quên mật khẩu</div>
        <div style={{ fontSize: FONT_SIZE.xs, color: "rgba(255,255,255,0.85)", marginTop: 6, fontStyle: "italic" }}>
          {otpSent ? `Nhập mã OTP gửi về ${phone}` : "Nhập số điện thoại để nhận mã OTP"}
        </div>
      </div>

      <div style={{ marginTop: -40, borderTopLeftRadius: 40, borderTopRightRadius: 40, background: formBg, padding: "32px 24px 40px", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: FONT_SIZE.card, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: labelColor, marginBottom: 8 }}>
          Số điện thoại
        </div>
        <div className="flex items-center" style={{ borderRadius: 14, border: `1.5px solid ${isDark ? "#2D3748" : "#E7BDB8"}`, background: inputBg, padding: "0 14px", height: 54, marginBottom: 16 }}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={otpSent}
            placeholder="Nhập số điện thoại của bạn"
            style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent", color: isDark ? "#F1F5F9" : "#181C23", fontSize: FONT_SIZE.xs, fontWeight: 600 }}
          />
          {otpSent && (
            <button onClick={() => { setOtpSent(false); setOtp(Array(OTP_LENGTH).fill("")); setOtpError(""); }} style={{ color: isDark ? "#60A5FA" : "#005AC1" }}>
              ✎
            </button>
          )}
        </div>

        {!otpSent && (
          <PrimaryButton
            label="Gửi mã OTP"
            onClick={handleSendOtp}
            loading={sending}
            disabled={!isPhoneValid}
            fullWidth
          />
        )}

        {otpSent && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: labelColor, marginBottom: 12 }}>
              Mã OTP (6 chữ số)
            </div>
            <div className="flex justify-between" style={{ marginBottom: 8 }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(r) => { otpRefs.current[idx] = r; }}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e.key, idx)}
                  maxLength={1}
                  inputMode="numeric"
                  style={{
                    width: 46,
                    height: 56,
                    borderRadius: 12,
                    border: `2px solid ${digit ? (isDark ? "#60A5FA" : "#D0021B") : otpError ? "#EF4444" : isDark ? "#2D3748" : "#E7BDB8"}`,
                    background: inputBg,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: isDark ? "#F1F5F9" : "#181C23",
                    outline: "none",
                  }}
                />
              ))}
            </div>

            {otpError && (
              <div className="flex items-center" style={{ borderRadius: 12, padding: 10, marginBottom: 10, background: isDark ? "rgba(185,28,28,0.15)" : "#FEF2F2", border: `1px solid ${isDark ? "#7F1D1D" : "#FECACA"}` }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: FONT_SIZE.xs, color: "#EF4444", marginLeft: 6 }}>{otpError}</span>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              {countdown > 0 ? (
                <span style={{ fontSize: FONT_SIZE.xs, color: isDark ? "#6B7280" : "#9CA3AF" }}>
                  Gửi lại mã sau <span style={{ fontWeight: 700, color: isDark ? "#60A5FA" : "#D0021B" }}>{countdown}s</span>
                </span>
              ) : (
                <button onClick={handleSendOtp} disabled={sending} style={{ fontSize: FONT_SIZE.xs, fontWeight: 700, color: isDark ? "#60A5FA" : "#D0021B" }}>
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <PrimaryButton
              label="Xác nhận OTP"
              onClick={handleVerifyOtp}
              loading={verifying}
              disabled={!isOtpFull}
              fullWidth
            />
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => navigate(-1)} style={{ fontSize: FONT_SIZE.xs, color: isDark ? "#6B7280" : "#9CA3AF" }}>
            Quay lại <span style={{ fontWeight: 700, color: isDark ? "#60A5FA" : "#005AC1" }}>Đăng nhập</span>
          </button>
        </div>
      </div>
    </Page>
  );
}
