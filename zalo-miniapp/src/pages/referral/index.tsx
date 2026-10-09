import React, { useEffect, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";

import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getReferralStats } from "@/services/referral";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

const STEPS = [
  { step: "1", title: "Gửi mã giới thiệu", desc: "Sao chép mã giới thiệu phía trên và gửi cho bạn bè của bạn." },
  { step: "2", title: "Bạn bè đăng ký", desc: "Bạn bè nhập mã giới thiệu của bạn trong quá trình đăng ký tài khoản mới." },
  { step: "3", title: "Nhận điểm thưởng", desc: "Điểm thưởng sẽ cộng trực tiếp vào ví sau khi bạn bè hoàn thành chuyến đi đầu tiên." },
];

/** Port từ app/(root)/(profile)/referral.tsx. */
export default function ReferralPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const snackbar = useSnackbar();

  const [referralCode, setReferralCode] = useState("");
  const [successReferrals, setSuccessReferrals] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReferralStats(user?.lastName)
      .then((res) => {
        setReferralCode(res.data.referralCode);
        setSuccessReferrals(res.data.successReferrals);
        setEarnedPoints(res.data.earnedPoints);
      })
      .catch((err) => {
        console.error("Lỗi khi tải thống kê giới thiệu:", err);
        snackbar.openSnackbar({ text: "Không thể tải thông tin giới thiệu.", type: "error" });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      snackbar.openSnackbar({ text: `Đã sao chép mã giới thiệu: ${referralCode}`, type: "success" });
    } catch {
      snackbar.openSnackbar({ text: "Không thể sao chép mã.", type: "error" });
    }
  };

  const cardStyle = {
    borderRadius: RADIUS.xl,
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    boxShadow: isDark ? "none" : "0 8px 20px rgba(15,23,42,0.05)",
  };

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header title="Giới thiệu bạn bè" showBackButton />

      {loading ? (
        <div className="flex flex-col items-center" style={{ padding: 48 }}>
          <Spinner />
          <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.card }}>Đang tải thông tin...</div>
        </div>
      ) : (
        <div style={{ padding: "20px 24px 40px" }}>
          <div className="flex flex-col items-center text-center" style={{ ...cardStyle, padding: 24 }}>
            <div
              className="flex items-center justify-center"
              style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 16, fontSize: 28, background: isDark ? "#334155" : palette.brand }}
            >
              👥
            </div>
            <div className="font-black" style={{ fontSize: FONT_SIZE.lg, color: palette.textPrimary }}>Chia Sẻ Mã Giới Thiệu</div>
            <div style={{ marginTop: 4, color: palette.textMuted, fontSize: FONT_SIZE.xxs, lineHeight: "24px" }}>
              Chia sẻ mã giới thiệu của bạn cho bạn bè đăng ký tài khoản để cả hai cùng nhận được nhiều ưu đãi hấp dẫn.
            </div>

            <div
              className="w-full flex flex-col items-center"
              style={{ borderRadius: RADIUS.lg, padding: 16, margin: "24px 0", border: `1px dashed ${palette.border}`, background: palette.surfaceAlt }}
            >
              <div className="font-bold uppercase" style={{ fontSize: FONT_SIZE.card, color: palette.textMuted, letterSpacing: 0.5 }}>
                Mã giới thiệu của bạn
              </div>
              <div className="font-black uppercase" style={{ fontSize: FONT_SIZE.xxl, marginTop: 6, color: isDark ? "#93C5FD" : "#1E3A8A", letterSpacing: 2 }}>
                {referralCode}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="w-full text-white font-bold"
              style={{ borderRadius: RADIUS.lg, height: 56, background: isDark ? "#334155" : palette.brand, letterSpacing: 0.5, fontSize: FONT_SIZE.xxs }}
            >
              Sao chép mã chia sẻ
            </button>
          </div>

          <div style={{ ...cardStyle, padding: 24, marginTop: 24 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, marginBottom: 16 }}>Thống kê của bạn</div>
            <div className="flex">
              <div className="flex-1 text-center" style={{ borderRight: `1px solid ${palette.border}` }}>
                <div className="font-black" style={{ fontSize: FONT_SIZE.xxl, color: palette.textPrimary }}>{successReferrals}</div>
                <div className="font-bold uppercase" style={{ marginTop: 4, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Đã giới thiệu</div>
              </div>
              <div className="flex-1 text-center">
                <div className="font-black" style={{ fontSize: FONT_SIZE.xxl, color: "#F59E0B" }}>{earnedPoints.toLocaleString("vi-VN")}</div>
                <div className="font-bold uppercase" style={{ marginTop: 4, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Điểm nhận được</div>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 24, marginTop: 24 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, marginBottom: 16 }}>Quy trình hoạt động</div>
            {STEPS.map((item, i) => (
              <div key={i} className="flex items-start" style={{ marginBottom: i < STEPS.length - 1 ? 20 : 0, gap: 12 }}>
                <div
                  className="flex items-center justify-center flex-shrink-0 font-black"
                  style={{ width: 28, height: 28, borderRadius: 14, border: `1px solid ${isDark ? "#475569" : "#FECACA"}`, background: isDark ? "#334155" : "#FEF2F2", color: isDark ? "#93C5FD" : palette.brand, fontSize: FONT_SIZE.xxs }}
                >
                  {item.step}
                </div>
                <div>
                  <div className="font-bold" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>{item.title}</div>
                  <div style={{ marginTop: 4, color: palette.textMuted, fontSize: FONT_SIZE.xxs, lineHeight: "24px" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
