import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page } from "zmp-ui";

import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

const PAYMENT_LABEL: Record<string, string> = {
  AT_OFFICE: "Tại văn phòng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const toInt = (v: string | null) => {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * Port từ app/(root)/booking-success.tsx — trang đặt tour thành công. checkout `navigate(..., { replace: true })`
 * sang đây sau khi booking() trả về; thông tin hiển thị đi theo query (không gọi lại API) nên mở lại từ
 * lịch sử không dùng trang này. Hai nút: "Đến lịch sử" và "Đến trang chủ".
 * Zalo không có sự kiện Back phần cứng riêng như RN nên nghe `popstate` để Back cũng về trang chủ.
 */
export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const tourName = params.get("tourName") || "";
  const tourCode = params.get("tourCode") || "";
  const departureDate = params.get("departureDate") || "";
  const adults = toInt(params.get("adults"));
  const children = toInt(params.get("children"));
  const infants = toInt(params.get("infants"));
  const total = Number(params.get("total"));
  const paymentMethod = params.get("paymentMethod") || "";

  const guests = [
    adults > 0 ? `${adults} người lớn` : "",
    children > 0 ? `${children} trẻ em` : "",
    infants > 0 ? `${infants} em bé` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const rows: [string, string][] = [
    ...(tourCode ? ([["Mã tour", tourCode]] as [string, string][]) : []),
    ...(departureDate ? ([["Ngày khởi hành", formatFullDate(departureDate)]] as [string, string][]) : []),
    ...(guests ? ([["Số khách", guests]] as [string, string][]) : []),
    ...(PAYMENT_LABEL[paymentMethod] ? ([["Thanh toán", PAYMENT_LABEL[paymentMethod]]] as [string, string][]) : []),
  ];

  const goHome = () => navigate("/", { replace: true });

  // Nút Back của Zalo/trình duyệt (popstate) cũng về trang chủ, giống BackHandler bên RN,
  // để khách không lùi lại màn tour/đặt tour vừa hoàn tất.
  useEffect(() => {
    const onPop = () => navigate("/", { replace: true });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [navigate]);
  const goHistory = () => navigate("/history", { replace: true });

  const brandOutline = isDark ? "#F87171" : "#D0021B";

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
      <div
        className="flex flex-col justify-center"
        style={{ minHeight: "100vh", padding: "24px 16px 150px", maxWidth: 560, margin: "0 auto" }}
      >
        <div className="flex flex-col items-center">
          <div
            className="booking-success-check flex items-center justify-center"
            style={{ width: 96, height: 96, borderRadius: 48, background: isDark ? "rgba(0,117,69,0.15)" : "#E6F2EC" }}
          >
            <Icon name="checkmark-circle" size={64} color="#007545" strokeWidth={1.7} />
          </div>

          <div className="font-black text-center" style={{ marginTop: 20, fontSize: FONT_SIZE.xl + 2, color: palette.textPrimary }}>
            Đặt tour thành công
          </div>
          <div
            className="text-center"
            style={{ marginTop: 8, maxWidth: 340, fontSize: FONT_SIZE.sm, lineHeight: "22px", color: palette.textSecondary }}
          >
            Yêu cầu đặt tour của bạn đã được ghi nhận và đang chờ xác nhận. Nhân viên chăm sóc khách hàng sẽ liên hệ với bạn trong
            thời gian sớm nhất.
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: RADIUS.lg,
            background: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          {tourName ? (
            <div className="font-black" style={{ fontSize: FONT_SIZE.md, lineHeight: "24px", color: palette.textPrimary }}>
              {tourName}
            </div>
          ) : null}
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between" style={{ marginTop: 10, gap: 12 }}>
              <span style={{ fontSize: FONT_SIZE.sm, color: palette.textSecondary }}>{k}</span>
              <span className="font-semibold flex-1 text-right" style={{ fontSize: FONT_SIZE.sm, color: palette.textPrimary }}>
                {v}
              </span>
            </div>
          ))}
          {Number.isFinite(total) && total > 0 ? (
            <div
              className="flex justify-between items-center"
              style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${palette.border}` }}
            >
              <span className="font-bold" style={{ fontSize: FONT_SIZE.sm, color: palette.textPrimary }}>
                Tổng tiền tạm tính
              </span>
              <span className="font-black" style={{ fontSize: FONT_SIZE.lg, color: "#D0021B" }}>
                {formatCurrency(total)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col" style={{ marginTop: 24, gap: 10 }}>
          <PrimaryButton
            label="Đến lịch sử"
            onClick={goHistory}
            fullWidth
            trailingIcon={<Icon name="receipt-outline" size={18} color="#FFFFFF" />}
          />
          <button
            onClick={goHome}
            className="flex items-center justify-center font-bold"
            style={{
              height: 50,
              gap: 8,
              borderRadius: RADIUS.pill,
              border: `1.5px solid ${brandOutline}`,
              background: isDark ? "transparent" : "#FFFFFF",
              color: brandOutline,
              fontSize: FONT_SIZE.md,
            }}
          >
            <Icon name="home-outline" size={18} color={brandOutline} />
            Đến trang chủ
          </button>
        </div>
      </div>
    </Page>
  );
}
