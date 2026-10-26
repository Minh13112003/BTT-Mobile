import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

import AlertDialog, { AlertType } from "@/components/AlertDialog";
import Header from "@/components/Header";
import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { postFeedback } from "@/services/feedback";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

/** Port từ app/(root)/(profile)/feedback.tsx. */
export default function FeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; type: AlertType; goBack: boolean } | null>(null);
  const showAlert = (title: string, message: string, type: AlertType, goBack = false) =>
    setAlert({ title, message, type, goBack });

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      return showAlert("Thiếu thông tin", "Vui lòng nhập đầy đủ chủ đề và nội dung phản hồi.", "warning");
    }
    try {
      setSending(true);
      const res = await postFeedback({ subject: subject.trim(), content: content.trim() });
      if (res.success) {
        showAlert("Đã gửi góp ý", res.message, "success", true);
      }
    } catch (error: any) {
      console.error(error);
      showAlert("Gửi thất bại", error.message || "Gửi phản hồi thất bại. Vui lòng thử lại sau!", "error");
    } finally {
      setSending(false);
    }
  };

  const fieldBox = (focused: boolean) => ({
    borderRadius: RADIUS.lg,
    border: `2px solid ${focused ? "#D0021B" : palette.border}`,
    background: palette.surfaceAlt,
    padding: "0 16px",
    height: 56,
    marginBottom: 16,
  });

  const labelStyle = { fontSize: FONT_SIZE.xxs, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5, color: palette.textMuted, marginBottom: 8 };

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header title="Gửi góp ý phản hồi" showBackButton />

      <div style={{ padding: "20px 24px 40px" }}>
        <div style={{ padding: 20, marginBottom: 20, borderRadius: RADIUS.xl, background: palette.surface, border: `1px solid ${palette.border}` }}>
          <div style={{ fontSize: FONT_SIZE.xxs, fontWeight: 700, color: palette.textSecondary, lineHeight: "24px" }}>
            BenThanh Tourist luôn sẵn sàng lắng nghe ý kiến đóng góp của Quý khách để không ngừng cải tiến và đem lại dịch vụ tốt nhất.
          </div>
        </div>

        <div style={{ padding: 20, borderRadius: RADIUS.xl, background: palette.surface, border: `1px solid ${palette.border}` }}>
          <div style={labelStyle}>Người gửi</div>
          <div className="flex items-center" style={{ ...fieldBox(false), background: palette.surfaceAlt }}>
            <span>👤</span>
            <span style={{ marginLeft: 12, color: palette.textMuted, fontWeight: 600, fontSize: FONT_SIZE.xxs }}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Khách hàng"}
            </span>
            <span style={{ marginLeft: "auto", color: palette.textMuted }}>🔒</span>
          </div>

          <div style={labelStyle}>Địa chỉ Email</div>
          <div className="flex items-center" style={{ ...fieldBox(false), background: palette.surfaceAlt }}>
            <span>✉️</span>
            <span style={{ marginLeft: 12, color: palette.textMuted, fontWeight: 600, fontSize: FONT_SIZE.xxs }}>
              {user?.email || "Chưa cập nhật"}
            </span>
            <span style={{ marginLeft: "auto", color: palette.textMuted }}>🔒</span>
          </div>

          <div style={labelStyle}>Chủ đề góp ý</div>
          <div style={fieldBox(false)}>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ví dụ: Đóng góp ý kiến dịch vụ Tour, App..."
              style={{ width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", color: palette.textPrimary, fontWeight: 600, fontSize: FONT_SIZE.xxs }}
            />
          </div>

          <div style={labelStyle}>Nội dung góp ý chi tiết</div>
          <div style={{ borderRadius: RADIUS.lg, border: `2px solid ${palette.border}`, background: palette.surfaceAlt, padding: 16, marginBottom: 16 }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy chia sẻ ý kiến của bạn ở đây..."
              rows={6}
              style={{ width: "100%", border: "none", outline: "none", background: "transparent", color: palette.textPrimary, fontWeight: 600, fontSize: FONT_SIZE.xxs, resize: "none" }}
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <PrimaryButton label="Gửi góp ý ngay" onClick={handleSubmit} loading={sending} fullWidth />
          </div>
        </div>
      </div>
      <AlertDialog
        visible={!!alert}
        type={alert?.type}
        title={alert?.title ?? ""}
        message={alert?.message}
        onClose={() => {
          const goBack = alert?.goBack;
          setAlert(null);
          if (goBack) navigate(-1);
        }}
      />
    </Page>
  );
}
