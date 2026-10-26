import React, { useState } from "react";
import { Page } from "zmp-ui";

import Icon from "@/components/Icon";
import SubPageHeader from "@/components/SubPageHeader";
import {
  TERMS_ACCOUNT,
  TERMS_AI_NOTICE,
  TERMS_CONTACT,
  TERMS_RESPONSIBILITY,
  TERMS_SCOPE,
  TERMS_UPDATED_AT,
  TERMS_VOUCHER,
  TOUR_TERMS,
  TourKind,
} from "@/constants/termsContent";
import { useTheme } from "@/context/ThemeContext";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

type MainTab = "terms" | "privacy";

const PERCENT_RE = /(\d+%\s(?:tiền cọc tour|tiền tour|giá tour(?: du lịch)?|trên giá tour du lịch))/g;

/** Một điều khoản đóng/mở (khai báo ở ngoài trang để giữ trạng thái đóng/mở khi trang vẽ lại, vd đổi tab Trong nước / Nước ngoài). */
function Section({ number, title, defaultOpen = false, children }: { number: number; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textMain = isDark ? "#F1F5F9" : "#1E293B";
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        borderRadius: 16,
        marginBottom: 10,
        overflow: "hidden",
        background: isDark ? "#1A1F2B" : "#FFFFFF",
        border: `1px solid ${isDark ? "#272D3C" : "#F1F5F9"}`,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center w-full text-left"
        style={{ padding: "14px", minHeight: 52 }}
      >
        <span
          className="flex items-center justify-center font-black flex-shrink-0"
          style={{ width: 28, height: 28, borderRadius: 8, marginRight: 10, fontSize: FONT_SIZE.xxs, color: "#D0021B", background: "rgba(208,2,27,0.15)" }}
        >
          {number}
        </span>
        <span className="flex-1 font-bold" style={{ paddingRight: 8, fontSize: FONT_SIZE.xs, color: textMain }}>
          {title}
        </span>
        <Icon name={open ? "chevron-down" : "chevron-forward"} size={16} color={isDark ? "#7E8597" : "#94A3B8"} />
      </button>
      {open && <div style={{ padding: "0 14px 14px" }}>{children}</div>}
    </div>
  );
}

/**
 * Port từ app/(root)/(profile)/terms.tsx — Điều khoản & chính sách: 2 tab (Điều khoản sử dụng /
 * Chính sách bảo mật), 6 điều đóng/mở được (Điều 1 mở sẵn), Điều 3 có 2 tab Trong nước / Nước ngoài.
 */
export default function TermsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [mainTab, setMainTab] = useState<MainTab>("terms");
  const [kind, setKind] = useState<TourKind>("domestic");

  const textMain = isDark ? "#F1F5F9" : "#1E293B";
  const textBody = isDark ? "#CBD5E1" : "#475569";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const line = isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9";

  const Bullet = ({ text }: { text: string }) => (
    <div style={{ marginBottom: 8, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textBody, display: "flex", gap: 8 }}>
      <span className="font-black" style={{ color: "#D0021B", flexShrink: 0 }}>
        •
      </span>
      <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{text}</span>
    </div>
  );

  const Bullets = ({ items }: { items: string[] }) => (
    <div>
      {items.map((t, i) => (
        <Bullet key={i} text={t} />
      ))}
    </div>
  );

  const SubTitle = ({ children }: { children: string }) => (
    <div className="font-bold uppercase" style={{ marginBottom: 8, letterSpacing: 1, fontSize: FONT_SIZE.xxs, color: textMuted }}>
      {children}
    </div>
  );

  const AiBadge = ({ label = "Thông tin do AI soạn" }: { label?: string }) => (
    <div
      className="font-bold"
      style={{
        display: "inline-block",
        marginBottom: 8,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: FONT_SIZE.xxs,
        background: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
        border: `1px solid ${isDark ? "rgba(129,140,248,0.3)" : "#E0E7FF"}`,
        color: isDark ? "#A5B4FC" : "#4338CA",
      }}
    >
      {label}
    </div>
  );

  /** Tô đậm phần trăm phí trong câu nguyên văn của công ty. */
  const FeeLine = ({ text }: { text: string }) => {
    const parts = text.split(PERCENT_RE);
    return (
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${line}`, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textBody }}>
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <span key={i} className="font-bold" style={{ color: "#D0021B" }}>
              {p}
            </span>
          ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
          ),
        )}
      </div>
    );
  };

  const renderTourTerms = () => {
    const d = TOUR_TERMS[kind];
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <SubTitle>Thanh toán</SubTitle>
          {d.pay.map((t, i) => (
            <div key={i} style={{ marginBottom: 8, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textBody }}>
              <span className="font-black" style={{ color: textMain }}>{`${i + 1}.  `}</span>
              {t}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <SubTitle>Thủ tục chuyển / huỷ tour</SubTitle>
          <Bullets items={d.procedure} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <SubTitle>Phí chuyển / huỷ tour</SubTitle>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: isDark ? "rgba(15,23,42,0.4)" : "#FFFFFF",
              border: `1px solid ${isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9"}`,
            }}
          >
            {d.fees.map((t, i) => (
              <FeeLine key={i} text={t} />
            ))}
          </div>
          <div style={{ marginTop: 8, lineHeight: "22px", fontSize: FONT_SIZE.xxs, color: textMuted }}>{d.feeNote}</div>
        </div>

        <SubTitle>Lưu ý khi đăng ký tour</SubTitle>
        {d.groups.map((g) => (
          <div key={g.title} style={{ marginBottom: 12 }}>
            <div className="font-bold" style={{ marginBottom: 8, fontSize: FONT_SIZE.xs, color: textMain }}>
              {g.title}
            </div>
            <Bullets items={g.items} />
          </div>
        ))}
      </div>
    );
  };

  const renderTierTable = () => (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
        background: isDark ? "rgba(15,23,42,0.4)" : "#FFFFFF",
        border: `1px solid ${isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9"}`,
      }}
    >
      {TERMS_VOUCHER.tiers.map((t, i) => (
        <div key={t.tier} className="flex items-center" style={{ padding: "12px 14px", borderTop: i > 0 ? `1px solid ${line}` : "none" }}>
          <div className="flex-1 min-w-0">
            <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: textMain }}>
              {t.tier}
            </div>
            <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: "#B30118", userSelect: "text" }}>
              {t.code}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: textMain }}>
              Giảm {t.percent}
            </div>
            <div style={{ fontSize: FONT_SIZE.xxs, color: textMuted }}>tối đa {t.perYear}/năm</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTerms = () => (
    <div>
      <div
        style={{
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          background: isDark ? "rgba(99,102,241,0.1)" : "#EEF2FF",
          border: `1px solid ${isDark ? "rgba(129,140,248,0.2)" : "#E0E7FF"}`,
        }}
      >
        <AiBadge />
        <div style={{ lineHeight: "22px", fontSize: FONT_SIZE.xxs, color: isDark ? "#C7D2FE" : "#312E81" }}>{TERMS_AI_NOTICE}</div>
      </div>
      <div style={{ marginBottom: 12, paddingLeft: 4, fontSize: FONT_SIZE.xxs, color: textMuted }}>Cập nhật lần cuối: {TERMS_UPDATED_AT}</div>

      <Section number={1} title="Phạm vi áp dụng" defaultOpen>
        <AiBadge />
        <div style={{ marginBottom: 12, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textBody }}>{TERMS_SCOPE.intro}</div>
        <Bullets items={TERMS_SCOPE.bullets} />
      </Section>

      <Section number={2} title="Tài khoản người dùng">
        <AiBadge />
        <Bullets items={TERMS_ACCOUNT} />
      </Section>

      <Section number={3} title="Điều kiện đặt tour, thanh toán và huỷ tour">
        <div style={{ marginBottom: 12, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textBody }}>
          Điều kiện khác nhau giữa tour trong nước và tour nước ngoài. Mỗi loại áp dụng chung cho mọi tour thuộc loại đó.
        </div>
        <div className="flex" style={{ padding: 4, borderRadius: 16, marginBottom: 12, background: isDark ? "#0F172A" : "#F1F5F9" }}>
          {(
            [
              ["domestic", "Trong nước"],
              ["foreign", "Nước ngoài"],
            ] as const
          ).map(([k, label]) => {
            const active = kind === k;
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="flex-1 font-bold"
                style={{
                  height: 44,
                  borderRadius: 12,
                  fontSize: FONT_SIZE.xxs,
                  background: active ? (isDark ? "#334155" : "#FFFFFF") : "transparent",
                  color: active ? (isDark ? "#FFFFFF" : "#B30118") : textMuted,
                }}
              >
                Tour {label.toLowerCase()}
              </button>
            );
          })}
        </div>
        {renderTourTerms()}
      </Section>

      <Section number={4} title="Voucher và khuyến mãi">
        <AiBadge />
        <div className="font-bold" style={{ marginBottom: 6, fontSize: FONT_SIZE.xs, color: textMain }}>
          4.1 Voucher phát hành trong năm
        </div>
        <Bullet text={TERMS_VOUCHER.yearly} />

        <div className="font-bold" style={{ margin: "8px 0 6px", fontSize: FONT_SIZE.xs, color: textMain }}>
          4.2 Voucher theo hạng thành viên
        </div>
        <AiBadge label="Dự kiến, công ty chưa chốt" />
        <Bullet text={TERMS_VOUCHER.tierIntro} />
        {renderTierTable()}

        <div className="font-bold" style={{ margin: "8px 0 6px", fontSize: FONT_SIZE.xs, color: textMain }}>
          4.3 Voucher đặt mua (cá nhân, công ty, doanh nghiệp)
        </div>
        <Bullets items={TERMS_VOUCHER.purchased} />
        <div
          style={{
            borderRadius: 16,
            padding: 14,
            background: isDark ? "rgba(16,185,129,0.1)" : "#ECFDF5",
            border: `1px solid ${isDark ? "rgba(52,211,153,0.2)" : "#D1FAE5"}`,
          }}
        >
          <div className="font-bold" style={{ marginBottom: 4, fontSize: FONT_SIZE.xxs, color: isDark ? "#6EE7B7" : "#065F46" }}>
            Ví dụ
          </div>
          {TERMS_VOUCHER.example.map((t, i) => (
            <div
              key={i}
              style={{ marginTop: i > 0 ? 6 : 0, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: isDark ? "#D1FAE5" : "#064E3B", display: "flex", gap: 8 }}
            >
              <span style={{ flexShrink: 0 }}>•</span>
              <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{t}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section number={5} title="Trách nhiệm của các bên">
        <AiBadge />
        <Bullets items={TERMS_RESPONSIBILITY} />
      </Section>

      <Section number={6} title="Liên hệ">
        <Bullets items={TERMS_CONTACT} />
      </Section>
    </div>
  );

  const renderPrivacy = () => (
    <div
      className="flex flex-col items-center text-center"
      style={{
        borderRadius: 16,
        padding: 20,
        background: isDark ? "rgba(30,41,59,0.6)" : "#F8FAFC",
        border: `1px solid ${isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9"}`,
      }}
    >
      <Icon name="shield-checkmark" size={36} color="#94A3B8" />
      <div className="font-bold" style={{ marginTop: 12, fontSize: FONT_SIZE.xs, color: textMain }}>
        Chính sách bảo mật
      </div>
      <div style={{ marginTop: 4, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textMuted }}>Nội dung đang được công ty cập nhật.</div>
    </div>
  );

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh", paddingBottom: 40 }}>
      <SubPageHeader title="Điều khoản & chính sách" />

      <div className="flex" style={{ padding: 4, margin: "8px 16px 0", borderRadius: 16, background: isDark ? "#1E293B" : "rgba(226,232,240,0.7)" }}>
        {(
          [
            ["terms", "Điều khoản sử dụng"],
            ["privacy", "Chính sách bảo mật"],
          ] as const
        ).map(([k, label]) => {
          const active = mainTab === k;
          return (
            <button
              key={k}
              onClick={() => setMainTab(k)}
              className="flex-1 font-bold"
              style={{
                height: 44,
                borderRadius: 12,
                fontSize: FONT_SIZE.xxs,
                background: active ? (isDark ? "#475569" : "#FFFFFF") : "transparent",
                color: active ? (isDark ? "#FFFFFF" : "#B30118") : textMuted,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "16px 16px 0" }}>{mainTab === "terms" ? renderTerms() : renderPrivacy()}</div>
    </Page>
  );
}
