import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page, useSnackbar } from "zmp-ui";

import Header from "@/components/Header";
import { useTheme } from "@/context/ThemeContext";
import { booking, PaymentMethod } from "@/services/booking";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import PrimaryButton from "@/components/PrimaryButton";
import VoucherPickerSheet, { ExtendedVoucher } from "@/components/VoucherPickerSheet";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; detail: string }[] = [
  {
    id: "AT_OFFICE",
    label: "Tại Văn Phòng",
    icon: "🏢",
    detail:
      "CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH (BENTHANH TOURIST)\nTrụ sở: Số 03 - 05 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh\nTel: 028 3822 7788",
  },
  {
    id: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    icon: "🏦",
    detail:
      "THÔNG TIN THANH TOÁN CHUYỂN KHOẢN\n- Ngân hàng TMCP Ngoại Thương Việt Nam - CN TP.HCM (VCB)\n- Tên đơn vị hưởng: CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH\n- Số tài khoản VNĐ: 007.1001204617",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatFullDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function calculateDiscount(origPrice: number, voucher: ExtendedVoucher | null): number {
  if (!voucher) return 0;
  const percentMatch = voucher.title?.match(/(\d+)%/);
  if (percentMatch) {
    const percent = parseInt(percentMatch[1], 10);
    let discount = origPrice * (percent / 100);
    if (voucher.max) {
      discount = Math.min(discount, voucher.max);
    } else {
      const maxMatch = voucher.title?.match(/tối đa\s+(\d+)\s*(k|tr|triệu)/i);
      if (maxMatch) {
        const multiplier = /tr|triệu/i.test(maxMatch[2]) ? 1000000 : 1000;
        discount = Math.min(discount, parseInt(maxMatch[1], 10) * multiplier);
      }
    }
    return discount;
  }
  if (voucher.value) {
    if (voucher.value <= 100) {
      let discount = origPrice * (voucher.value / 100);
      if (voucher.max) discount = Math.min(discount, voucher.max);
      return discount;
    }
    return Math.min(voucher.value, origPrice);
  }
  return 0;
}

/**
 * Port từ app/(root)/checkout.tsx — giản lược phần xác nhận PIN (ngoài phạm
 * vi port, Zalo Mini App không có keychain/biometric cấp hệ điều hành như
 * SecureStore) thành 1 bước confirm đơn giản trước khi đặt tour.
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const snackbar = useSnackbar();

  const tourId = params.get("id") || "t1";
  const tourName = params.get("name") || "Tour du lịch";
  const tourCode = params.get("tourCode") || "";
  const tourImageUrl = params.get("imageUrl") || "";
  const tourPrice = params.get("price") ? parseFloat(params.get("price")!) : 0;
  const tourDuration = params.get("duration") || "";
  const tourHasVat = params.get("hasVat") === "true";
  const departureId = params.get("departureId") || "";
  const departureDate = params.get("departureDate") || "";
  const availableSeats = params.get("availableSeats") ? parseInt(params.get("availableSeats")!, 10) : Infinity;
  const isLaravelSource = params.get("source") === "LARAVEL" && !!params.get("tourKey");
  const tourKey = params.get("tourKey") || "";
  const departureKey = params.get("departureKey") || "";

  const maxTotal = availableSeats === Infinity ? 99 : availableSeats;

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<ExtendedVoucher | null>(null);
  const [showVoucherPicker, setShowVoucherPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const adultTotal = adults * tourPrice;
  const childTotal = children * tourPrice * 0.8;
  const infantTotal = infants * tourPrice * 0.4;
  const originalPrice = adultTotal + childTotal + infantTotal;
  const discountAmount = calculateDiscount(originalPrice, selectedVoucher);
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const performBooking = async () => {
    try {
      setSubmitting(true);
      const bookingData = isLaravelSource
        ? {
            tourKey,
            departureKey,
            departureDate: departureDate || undefined,
            unitPrice: tourPrice,
            adults,
            children,
            infants,
            paymentMethod: paymentMethod as PaymentMethod,
            voucherCode: selectedVoucher ? selectedVoucher.code : null,
            notice: notice || null,
          }
        : {
            idTour: tourId,
            departureId,
            adults,
            children,
            infants,
            paymentMethod: paymentMethod as PaymentMethod,
            voucherCode: selectedVoucher ? selectedVoucher.code : null,
            notice: notice || null,
          };

      const res = await booking(bookingData);
      if (res) {
        snackbar.openSnackbar({
          text: "Yêu cầu đăng ký tour đã được ghi nhận. Bộ phận chăm sóc khách hàng sẽ liên hệ sớm nhất!",
          type: "success",
          duration: 4000,
        });
        navigate("/history");
      }
    } catch (error: any) {
      console.error("Lỗi đặt tour:", error);
      snackbar.openSnackbar({
        text: error?.response?.data?.message || "Đặt tour không thành công. Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingSubmit = () => {
    const hasDeparture = isLaravelSource ? !!departureKey : !!departureId;
    if (!hasDeparture) return snackbar.openSnackbar({ text: "Vui lòng chọn ngày khởi hành", type: "warning" });
    if (!paymentMethod) return snackbar.openSnackbar({ text: "Vui lòng chọn phương thức thanh toán", type: "warning" });
    if (adults < 1) return snackbar.openSnackbar({ text: "Phải có ít nhất 1 người lớn", type: "warning" });
    const total = adults + children + infants;
    if (total > maxTotal) {
      return snackbar.openSnackbar({
        text: availableSeats === Infinity ? "Số lượng khách tối đa là 99 người" : `Chỉ còn ${availableSeats} chỗ cho chuyến đi này`,
        type: "warning",
      });
    }
    if (confirm("Bạn có chắc chắn muốn đặt chuyến đi này không?")) {
      performBooking();
    }
  };

  const GuestStepper = ({ label, sub, value, onChange, min = 0 }: { label: string; sub: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex items-center justify-between" style={{ padding: "12px 0" }}>
      <div>
        <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary }}>{label}</div>
        <div style={{ fontSize: 12, color: palette.textMuted }}>{sub}</div>
      </div>
      <div className="flex items-center" style={{ gap: 12 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex items-center justify-center font-black"
          style={{ width: 32, height: 32, borderRadius: 16, background: palette.surfaceAlt, color: palette.textSecondary }}
        >
          −
        </button>
        <span className="font-bold" style={{ minWidth: 20, textAlign: "center", color: palette.textPrimary }}>{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex items-center justify-center font-black text-white"
          style={{ width: 32, height: 32, borderRadius: 16, background: palette.brand }}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: 120 }}>
      <Header title="Thanh toán" showBackButton />

      <div style={{ padding: 16 }}>
        {/* Tóm tắt tour */}
        <div className="flex" style={{ gap: 12, padding: 12, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
          {tourImageUrl && (
            <img src={tourImageUrl} alt={tourName} style={{ width: 80, height: 80, borderRadius: RADIUS.md, objectFit: "cover", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, lineHeight: "22px" }}>
              {tourName}
            </div>
            {tourCode && <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>Mã: {tourCode}</div>}
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 2 }}>{tourDuration}</div>
            {departureDate && (
              <div style={{ fontSize: 12, color: palette.brand, fontWeight: 700, marginTop: 2 }}>
                Khởi hành: {formatFullDate(departureDate)}
              </div>
            )}
            {availableSeats !== Infinity && (
              <div style={{ fontSize: 12, color: palette.textSecondary, fontWeight: 700, marginTop: 2 }}>
                👥 Số chỗ còn: {availableSeats}
              </div>
            )}
          </div>
        </div>

        {/* Số lượng khách */}
        <div style={{ marginTop: 20 }}>
          <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 4 }}>
            Số lượng khách
          </div>
          <div style={{ padding: "0 4px" }}>
            <GuestStepper label="Người lớn" sub="Từ 12 tuổi" value={adults} onChange={setAdults} min={1} />
            <div style={{ height: 1, background: palette.border }} />
            <GuestStepper label="Trẻ em" sub="2 - 11 tuổi (80% giá)" value={children} onChange={setChildren} />
            <div style={{ height: 1, background: palette.border }} />
            <GuestStepper label="Em bé" sub="Dưới 2 tuổi (40% giá)" value={infants} onChange={setInfants} />
          </div>
          {availableSeats !== Infinity && adults + children + infants >= maxTotal && (
            <div style={{ marginTop: 10, fontSize: FONT_SIZE.xxs, color: "#F97316", fontWeight: 700 }}>
              ⚠️ Đã đặt tối đa {maxTotal} chỗ còn lại
            </div>
          )}
          {availableSeats !== Infinity && availableSeats <= 5 && adults + children + infants < maxTotal && (
            <div style={{ marginTop: 10, fontSize: FONT_SIZE.xxs, color: "#EAB308", fontWeight: 700 }}>
              ⓘ Chỉ còn {availableSeats} chỗ — đặt ngay!
            </div>
          )}
        </div>

        {/* Voucher — gọn kiểu Grab, bấm mở lớp phủ chọn voucher (VoucherPickerSheet) */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setShowVoucherPicker(true)}
            className="w-full flex items-center text-left"
            style={{
              padding: 16,
              borderRadius: RADIUS.md,
              border: `1px solid ${palette.border}`,
              background: palette.surface,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.sm,
                background: isDark ? palette.surfaceAlt : palette.brand,
                fontSize: 20,
              }}
            >
              🎁
            </div>
            <div style={{ marginLeft: 14, flex: 1, minWidth: 0 }}>
              <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary }}>
                Voucher
              </div>
              <div
                className={selectedVoucher ? "font-black" : undefined}
                style={{
                  marginTop: 2,
                  fontSize: FONT_SIZE.xxs,
                  color: selectedVoucher ? (isDark ? "#60A5FA" : palette.brand) : palette.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selectedVoucher ? selectedVoucher.title : "Chọn voucher ưu đãi"}
              </div>
            </div>
            <span style={{ fontSize: 22, color: palette.textMuted, marginLeft: 8 }}>›</span>
          </button>
        </div>

        {/* Phương thức thanh toán */}
        <div style={{ marginTop: 20 }}>
          <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
            Phương thức thanh toán
          </div>
          {PAYMENT_METHODS.map((pm) => {
            const active = paymentMethod === pm.id;
            return (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className="block w-full text-left"
                style={{
                  marginBottom: 10,
                  padding: 14,
                  borderRadius: RADIUS.lg,
                  border: `1.5px solid ${active ? palette.brand : palette.border}`,
                  background: active ? (isDark ? "rgba(208,2,27,0.15)" : "#FFF0EE") : palette.surface,
                }}
              >
                <div className="flex items-center" style={{ gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{pm.icon}</span>
                  <span className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary }}>{pm.label}</span>
                </div>
                {active && (
                  <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 8, whiteSpace: "pre-line" }}>
                    {pm.detail}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Ghi chú */}
        <div style={{ marginTop: 20 }}>
          <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
            Ghi chú (tuỳ chọn)
          </div>
          <textarea
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            placeholder="Yêu cầu đặc biệt, ghi chú cho chuyến đi..."
            rows={3}
            style={{
              width: "100%",
              borderRadius: RADIUS.md,
              border: `1px solid ${palette.border}`,
              background: palette.surface,
              color: palette.textPrimary,
              padding: 12,
              fontSize: FONT_SIZE.xxs,
              resize: "none",
              outline: "none",
            }}
          />
        </div>

        {/* Tóm tắt giá */}
        <div style={{ marginTop: 20, padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary }}>Tạm tính</span>
            <span style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, fontWeight: 700 }}>{formatCurrency(originalPrice)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: FONT_SIZE.xxs, color: "#16A34A" }}>Giảm giá</span>
              <span style={{ fontSize: FONT_SIZE.xxs, color: "#16A34A", fontWeight: 700 }}>−{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div style={{ height: 1, background: palette.border, margin: "10px 0" }} />
          <div className="flex items-center justify-between">
            <span className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary }}>Tổng cộng</span>
            <span className="font-black" style={{ fontSize: FONT_SIZE.lg, color: palette.brand }}>{formatCurrency(finalPrice)}</span>
          </div>
          {tourHasVat && (
            <div style={{ marginTop: 6, fontSize: 12, color: palette.textMuted }}>Đã bao gồm VAT</div>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0"
        style={{ padding: 16, paddingBottom: "max(16px, env(safe-area-inset-bottom))", background: palette.surface, borderTop: `1px solid ${palette.border}` }}
      >
        <PrimaryButton
          label={`Đặt tour ngay · ${formatCurrency(finalPrice)}`}
          onClick={handleBookingSubmit}
          loading={submitting}
          fullWidth
          trailingIcon={<span style={{ position: "relative", color: "#FFFFFF", fontSize: 16 }}>→</span>}
        />
      </div>

      {showVoucherPicker && (
        <VoucherPickerSheet
          selectedId={selectedVoucher?.id ?? null}
          onClose={() => setShowVoucherPicker(false)}
          onConfirm={(voucher) => {
            setSelectedVoucher(voucher);
            setShowVoucherPicker(false);
          }}
        />
      )}
    </Page>
  );
}
