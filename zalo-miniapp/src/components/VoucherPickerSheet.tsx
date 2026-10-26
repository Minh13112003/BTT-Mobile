import React, { useEffect, useState } from "react";
import { Spinner } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { getVouchers } from "@/services/voucher";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon } from "@/components/icons";
import PrimaryButton from "@/components/PrimaryButton";

/** API voucher trả nhiều field hơn VoucherItem gốc — dùng chung cho checkout + picker. */
export interface ExtendedVoucher {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  expiry: string;
  tag: string;
  description: string;
  value?: number;
  max?: number;
}

/**
 * Port từ app/(root)/voucher-picker.tsx bên app React Native (chọn voucher kiểu
 * Grab: nhập mã tay hoặc chọn 1 voucher trong danh sách rồi bấm OK).
 *
 * Bản RN là 1 màn riêng + bridge module-level (services/voucherSelection.ts)
 * vì Expo Router không có "navigate rồi nhận kết quả về". Trên web làm lớp phủ
 * toàn màn hình ngay TRONG checkout là tự nhiên hơn: không đổi route nên form
 * checkout (số khách, phương thức thanh toán, ghi chú) không bị reset, và kết
 * quả trả thẳng qua callback `onConfirm` — không cần bridge.
 */
export default function VoucherPickerSheet({
  selectedId: initialSelectedId,
  onConfirm,
  onClose,
}: {
  selectedId: string | null;
  onConfirm: (voucher: ExtendedVoucher | null) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [vouchers, setVouchers] = useState<ExtendedVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  useEffect(() => {
    getVouchers(1, 50)
      .then((res: any) => setVouchers(Array.isArray(res.data?.items) ? res.data.items : []))
      .catch((err) => console.error("Lỗi tải vouchers trong voucher picker:", err))
      .finally(() => setLoading(false));
  }, []);

  // Khoá cuộn trang checkout phía sau khi lớp phủ đang mở.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleApplyTypedCode = () => {
    const voucher = vouchers.find(
      (v) => v.code.trim().toLowerCase() === voucherCode.trim().toLowerCase(),
    );
    if (!voucher) {
      setCodeError("Mã voucher không tồn tại hoặc không khả dụng.");
      return;
    }
    setCodeError("");
    onConfirm(voucher);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 1000, background: isDark ? "#111318" : "#F5F6FA" }}
    >
      {/* Header */}
      <div
        className="flex items-center"
        style={{
          padding: "8px 16px",
          paddingTop: "calc(env(safe-area-inset-top) + 8px)",
          background: isDark ? palette.surface : palette.brand,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Quay lại"
          className="flex items-center justify-center rounded-full"
          style={{ width: 44, height: 44, background: "rgba(255,255,255,0.12)" }}
        >
          <ArrowBackIcon />
        </button>
        <div className="font-black" style={{ marginLeft: 12, fontSize: FONT_SIZE.xl, color: "#FFFFFF" }}>
          Chọn voucher
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: "16px 20px 24px" }}>
        {/* Nhập mã tay */}
        <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, marginBottom: 8 }}>
          Nhập mã ưu đãi
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <input
            value={voucherCode}
            onChange={(e) => {
              setVoucherCode(e.target.value.toUpperCase());
              if (codeError) setCodeError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApplyTypedCode()}
            placeholder="Ví dụ: SUMMER2026"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 48,
              borderRadius: RADIUS.sm,
              border: `1px solid ${codeError ? palette.danger : palette.border}`,
              background: palette.surface,
              color: palette.textPrimary,
              padding: "0 14px",
              fontSize: FONT_SIZE.xxs,
              outline: "none",
            }}
          />
          <button
            onClick={handleApplyTypedCode}
            disabled={!voucherCode.trim()}
            className="font-bold text-white"
            style={{
              minHeight: 48,
              padding: "0 16px",
              borderRadius: RADIUS.sm,
              background: palette.brand,
              fontSize: FONT_SIZE.xxs,
              opacity: voucherCode.trim() ? 1 : 0.6,
            }}
          >
            Áp dụng
          </button>
        </div>
        {!!codeError && (
          <div style={{ marginTop: 8, color: palette.danger, fontSize: FONT_SIZE.xxs }}>{codeError}</div>
        )}

        <div style={{ margin: "16px 0 8px", color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
          Hoặc chọn một voucher bên dưới (bấm lần nữa để bỏ chọn)
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: 24 }}>
            <Spinner />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center" style={{ padding: "16px 0", color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
            Không tìm thấy voucher nào khả dụng
          </div>
        ) : (
          vouchers.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                // Kiểu Grab: bấm để chọn, bấm lần nữa vào đúng voucher đó để bỏ chọn.
                onClick={() => setSelectedId((prev) => (prev === item.id ? null : item.id))}
                className="block w-full text-left"
                style={{
                  marginBottom: 12,
                  padding: 16,
                  borderRadius: RADIUS.md,
                  border: `1.5px solid ${
                    isSelected ? (isDark ? "#60A5FA" : palette.brand) : palette.border
                  }`,
                  background: isSelected ? (isDark ? palette.surfaceAlt : "#FEF2F2") : palette.surface,
                }}
              >
                <div className="flex items-center">
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
                    <div
                      className="font-black uppercase"
                      style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#60A5FA" : palette.brand, letterSpacing: 0.8 }}
                    >
                      {item.subtitle}
                    </div>
                    <div className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, marginTop: 2 }}>
                      {item.title}
                    </div>
                    <div className="font-semibold" style={{ fontSize: FONT_SIZE.card, color: palette.textMuted, marginTop: 2 }}>
                      {item.expiry}
                    </div>
                  </div>
                  {/* Dấu tích tròn — checkmark-circle / ellipse-outline bên RN */}
                  <span className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24, display: "flex" }}>
                    {isSelected ? (
                      <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="11" fill={palette.brand} />
                        <path d="m7 12.5 3.4 3.4L17 9" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" fill="none" stroke={isDark ? "#475569" : "#CBD5E1"} strokeWidth={2} />
                      </svg>
                    )}
                  </span>
                </div>
                {!!item.description && (
                  <div style={{ marginTop: 12, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: palette.textSecondary }}>
                    {item.description}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Nút OK */}
      <div
        style={{
          padding: "8px 20px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          background: isDark ? "#111318" : "#F5F6FA",
        }}
      >
        <PrimaryButton
          label="OK"
          fullWidth
          onClick={() => {
            const chosen = selectedId ? vouchers.find((v) => v.id === selectedId) ?? null : null;
            onConfirm(chosen);
          }}
        />
      </div>
    </div>
  );
}
