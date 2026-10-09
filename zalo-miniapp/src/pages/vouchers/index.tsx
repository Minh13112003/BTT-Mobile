import React, { useEffect, useState } from "react";
import { Page, Spinner, useSnackbar } from "zmp-ui";

import Header from "@/components/Header";
import { useTheme } from "@/context/ThemeContext";
import { getVouchers, VoucherItem } from "@/services/voucher";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

/** Port từ app/(root)/(profile)/vouchers.tsx. */
export default function VouchersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const snackbar = useSnackbar();

  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVouchers(1, 20)
      .then((res: any) => setVouchers(Array.isArray(res.data?.items) ? res.data.items : []))
      .catch((err) => {
        console.error("Lỗi khi tải vouchers:", err);
        snackbar.openSnackbar({ text: "Không thể tải danh sách voucher.", type: "error" });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      snackbar.openSnackbar({ text: `Đã sao chép mã voucher: ${code}`, type: "success" });
    } catch {
      snackbar.openSnackbar({ text: "Không thể sao chép mã.", type: "error" });
    }
  };

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header title="Kho Voucher Của Bạn" showBackButton />

      {loading ? (
        <div className="flex flex-col items-center" style={{ padding: 48 }}>
          <Spinner />
          <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.card }}>
            Đang tải danh sách voucher...
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px 20px 40px" }}>
          {vouchers.map((item) => (
            <div
              key={item.id}
              style={{
                padding: 20,
                marginBottom: 20,
                borderRadius: RADIUS.xl,
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                boxShadow: isDark ? "none" : "0 8px 20px rgba(15,23,42,0.05)",
              }}
            >
              <div className="flex items-center">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 48, height: 48, borderRadius: RADIUS.md, background: isDark ? "#334155" : palette.brand, fontSize: 22 }}
                >
                  🎁
                </div>
                <div style={{ marginLeft: 16, flex: 1 }}>
                  <div className="font-black uppercase" style={{ fontSize: FONT_SIZE.xxs, color: palette.brand, letterSpacing: 0.5 }}>
                    {item.subtitle}
                  </div>
                  <div className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, marginTop: 2 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: FONT_SIZE.card, color: palette.textMuted, marginTop: 4 }}>{item.expiry}</div>
                </div>
              </div>

              <div style={{ marginTop: 16, color: palette.textSecondary, fontSize: FONT_SIZE.xxs, lineHeight: "24px" }}>
                {item.description}
              </div>

              <div style={{ height: 1, background: palette.border, margin: "16px 0" }} />

              <div
                className="flex items-center justify-between"
                style={{ padding: 12, borderRadius: RADIUS.md, background: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
              >
                <div>
                  <div className="font-bold uppercase" style={{ fontSize: FONT_SIZE.card, color: palette.textMuted }}>
                    Mã ưu đãi
                  </div>
                  <div className="font-black uppercase" style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#93C5FD" : "#1E3A8A", marginTop: 2 }}>
                    {item.code}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCode(item.code)}
                  className="text-white font-bold"
                  style={{ borderRadius: RADIUS.md, padding: "10px 16px", background: isDark ? "#334155" : palette.brand, fontSize: FONT_SIZE.xxs }}
                >
                  Sao chép mã
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
