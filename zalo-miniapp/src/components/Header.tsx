import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { logout as apiLogout } from "@/services/auth";
import { getPalette, RADIUS } from "@/constants/theme";
import {
  ArrowBackIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  CloseIcon,
  PhoneIcon,
  LogoutIcon,
} from "@/components/icons";
import logoUrl from "@/static/Logo_BTT-2024.png";

interface HeaderProps {
  title?: string;
  showActions?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

/** Port từ components/Header.tsx bên app React Native — cùng layout, cùng logo/wordmark. */
export default function Header({
  title = "BENTHANH TOURIST",
  showActions = true,
  showBackButton = false,
  onBackPress,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const { isLoggedIn, user, logout } = useAuth();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    navigate(-1);
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? palette.surface : palette.brand,
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        className={`flex items-center px-5 py-3.5 ${
          showActions ? "justify-between" : "justify-center"
        }`}
        style={{
          backgroundColor: isDark ? palette.surface : palette.brand,
          borderBottom: isDark ? `1px solid ${palette.border}` : "none",
        }}
      >
        <div className="flex items-center flex-1 mr-2 min-w-0">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="mr-3 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)" }}
            >
              <ArrowBackIcon />
            </button>
          )}
          {title === "BENTHANH TOURIST" ? (
            <button
              onClick={() => navigate("/")}
              className="flex items-center"
              style={{ background: "none" }}
            >
              <div style={{ marginRight: 8, textAlign: "right" }}>
                <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 20, lineHeight: "20px" }}>
                  BenThanh
                </div>
                <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 20, lineHeight: "20px" }}>
                  Tourist
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 8,
                    fontStyle: "italic",
                    marginTop: 2,
                  }}
                >
                  journey to your heart
                </div>
              </div>
              <img src={logoUrl} alt="BenThanh Tourist" style={{ width: 72, height: 72, objectFit: "contain" }} />
            </button>
          ) : (
            <button onClick={() => navigate("/")} className="flex items-center min-w-0" style={{ gap: 10 }}>
              <img src={logoUrl} alt="" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
              <div
                className="text-white font-black text-lg uppercase truncate"
                style={{ letterSpacing: 1 }}
              >
                {title}
              </div>
            </button>
          )}
        </div>

        {showActions && (
          <div className="flex items-center flex-shrink-0 pl-3">
            <button
              onClick={toggleTheme}
              className="rounded-full flex items-center justify-center"
              style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)" }}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {isLoggedIn && user && (
              <button
                onClick={() => setShowProfileCard(true)}
                className="flex items-center justify-center overflow-hidden rounded-full ml-2"
                style={{
                  width: 32,
                  height: 32,
                  border: "1.5px solid #FFFFFF",
                  background: isDark ? "#4B5563" : "#FFFFFF",
                }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" style={{ width: 32, height: 32, objectFit: "cover" }} />
                ) : (
                  <UserIcon active color={isDark ? "#FFFFFF" : "#D0021B"} size={16} />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {isLoggedIn && user && showProfileCard && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
          onClick={() => setShowProfileCard(false)}
        >
          <div
            className="w-full relative flex flex-col items-center"
            style={{
              maxWidth: 320,
              background: palette.surface,
              borderRadius: RADIUS.xl,
              border: `1px solid ${palette.border}`,
              padding: 24,
              boxShadow: isDark ? "none" : "0 8px 20px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowProfileCard(false)}
              className="absolute flex items-center justify-center"
              style={{
                top: 12,
                right: 12,
                width: 44,
                height: 44,
                borderRadius: RADIUS.sm,
                background: palette.surfaceAlt,
              }}
            >
              <CloseIcon color={palette.textSecondary} />
            </button>

            <div style={{ fontSize: 12, fontWeight: 600, color: palette.textMuted, marginBottom: 16, marginTop: 8 }}>
              TÀI KHOẢN BENTHANH TOURIST
            </div>

            <div
              className="flex items-center justify-center overflow-hidden"
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                border: `3px solid ${palette.icon}`,
                marginBottom: 16,
                background: palette.surfaceAlt,
              }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: 80, height: 80, objectFit: "cover" }} />
              ) : (
                <UserIcon active color={palette.icon} size={36} />
              )}
            </div>

            <div style={{ fontSize: 20, fontWeight: 800, color: palette.textPrimary, textAlign: "center" }}>
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Người dùng"}
            </div>
            <div style={{ fontSize: 14, color: palette.textSecondary, textAlign: "center", marginTop: 2 }}>
              {user.email}
            </div>

            <div
              className="flex items-center justify-center w-full"
              style={{
                marginTop: 12,
                padding: "8px 16px",
                borderRadius: RADIUS.sm,
                background: palette.surfaceAlt,
              }}
            >
              <PhoneIcon color={palette.icon} />
              <span style={{ fontSize: 14, fontWeight: 600, color: palette.textSecondary, marginLeft: 8 }}>
                {user.phonenumber || "091234567"}
              </span>
            </div>

            <div style={{ width: "100%", height: 1, background: palette.border, margin: "20px 0" }} />

            <button
              onClick={async () => {
                setShowProfileCard(false);
                try {
                  await apiLogout();
                } catch (error) {
                  console.log("Header logout error, forcing redirect:", error);
                } finally {
                  await logout();
                  navigate("/login", { replace: true });
                }
              }}
              className="flex items-center justify-center w-full"
              style={{
                background: palette.danger,
                borderRadius: RADIUS.md,
                height: 48,
              }}
            >
              <LogoutIcon />
              <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 15, marginLeft: 8 }}>
                Đăng xuất tài khoản
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
