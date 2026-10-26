import React, { useEffect, useState } from "react";

import { useTheme } from "@/context/ThemeContext";
import { getPalette, RADIUS, type Palette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { formatPrice } from "@/helper/format";
import type { Departure } from "@/services/departure";
import { splitTopLevelListItems, type TourPlanLaravel, type TourTermsLaravel } from "@/services/tour";

/**
 * Port từ components/tour/{DeparturePicker, TourScheduleTabs, PriceIncludedTabs, TermsTabs}.tsx
 * bên app RN — mẫu "Hero cũ + nội dung kiểu Mẫu 2" (2026-10-26): chọn ngày dạng ô thứ/ngày/năm,
 * lịch trình theo tab "Ngày N", dịch vụ 2 tab, điều khoản lưới nút kèm số ý lớn.
 */

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const pad = (n: number) => String(n).padStart(2, "0");
const toDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};
const weekday = (iso: string) => {
  const d = toDate(iso);
  return d ? WEEKDAYS[d.getDay()] : "";
};
const dayMonth = (iso: string) => {
  const d = toDate(iso);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` : iso;
};
const fullDate = (iso: string) => {
  const d = toDate(iso);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : iso;
};

// Slug → nhãn, giống EAT_LABELS / VEHICLE_LABELS bên RN.
const EAT_LABELS: Record<string, string> = {
  "an-sang": "Ăn sáng",
  "an-trua": "Ăn trưa",
  "an-chieu": "Ăn chiều",
  "an-toi": "Ăn tối",
  "bua-phu": "Bữa phụ",
};
const VEHICLE_LABELS: Record<string, string> = {
  "may-bay": "Máy bay",
  "xe-oto": "Xe ô tô",
  "tau-hoa": "Tàu hỏa",
  "tau-thuy": "Tàu thủy",
};

const TERM_SECTIONS: { key: keyof TourTermsLaravel; title: string }[] = [
  { key: "paymentInstructions", title: "Hướng dẫn thanh toán" },
  { key: "cancelBooking", title: "Điều kiện hủy/đổi tour" },
  { key: "cancelPenalty", title: "Phí phạt hủy tour" },
  { key: "warningNote", title: "Lưu ý quan trọng" },
  { key: "warningNoteVisa", title: "Lưu ý visa" },
];

function cardStyle(palette: Palette): React.CSSProperties {
  return {
    marginTop: 18,
    padding: 18,
    borderRadius: RADIUS.xl,
    background: palette.surface,
    border: `1px solid ${palette.isDark ? palette.border : "#F1F5F9"}`,
    boxShadow: palette.isDark ? "none" : "0 18px 40px -16px rgba(15,23,42,0.22), 0 2px 6px rgba(15,23,42,0.05)",
  };
}

function CardHeader({ title, right, palette }: { title: string; right?: string; palette: Palette }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
      <div className="font-black" style={{ fontSize: FONT_SIZE.md, color: palette.textPrimary }}>
        {title}
      </div>
      {right && <span style={{ fontSize: FONT_SIZE.card, color: palette.textSecondary }}>{right}</span>}
    </div>
  );
}

const panelStyle = (palette: Palette): React.CSSProperties => ({
  marginTop: 14,
  padding: 14,
  borderRadius: RADIUS.md,
  background: palette.isDark ? "rgba(30,41,59,0.6)" : "#F8FAFC",
});

/** Nút chọn — `solid` (nền đỏ, tab ngày) hoặc `outline` (viền đỏ, mục điều khoản). */
function ChoiceButton({
  label,
  selected,
  onClick,
  variant = "solid",
  style,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: "solid" | "outline";
  style?: React.CSSProperties;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const sel =
    variant === "solid"
      ? {
          background: isDark ? "#B30118" : palette.brand,
          border: "none",
          color: "#FFFFFF",
          fontWeight: 900,
          boxShadow: isDark ? "none" : "0 6px 14px rgba(208,2,27,0.35)",
        }
      : {
          background: isDark ? "#3A1D22" : "#FFF6F7",
          border: `2px solid ${isDark ? "#F87171" : palette.brand}`,
          color: isDark ? "#FCA5A5" : "#B30118",
          fontWeight: 700,
        };
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      style={{
        minHeight: variant === "solid" ? 44 : 52,
        padding: "8px 10px",
        borderRadius: 14,
        fontSize: FONT_SIZE.card,
        textAlign: variant === "solid" ? "center" : "left",
        ...(selected
          ? sel
          : {
              background: isDark ? "#1E293B" : "#F8FAFC",
              border: `1px solid ${palette.border}`,
              color: isDark ? "#CBD5E1" : "#334155",
              fontWeight: 600,
            }),
        ...style,
      }}
    >
      {label}
    </button>
  );
}

export function DepartureSection({
  departures,
  selected,
  onSelect,
  onSoldOut,
}: {
  departures: Departure[];
  selected: Departure | null;
  onSelect: (d: Departure) => void;
  onSoldOut: (d: Departure) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const red = isDark ? "#F87171" : palette.brand;

  const row = (label: string, value: string, color?: string, weight = 700) => (
    <div className="flex justify-between" style={{ gap: 10, fontSize: FONT_SIZE.card }}>
      <span style={{ color: palette.textSecondary }}>{label}</span>
      <span style={{ fontWeight: weight, color: color ?? palette.textPrimary, textAlign: "right" }}>{value}</span>
    </div>
  );

  return (
    <section style={cardStyle(palette)}>
      <CardHeader title="Ngày khởi hành" right={departures.length ? `${departures.length} đợt` : undefined} palette={palette} />
      {departures.length === 0 ? (
        <div style={{ fontSize: FONT_SIZE.xs, color: palette.textSecondary }}>
          Hiện chưa có lịch khởi hành. Vui lòng liên hệ tổng đài để được tư vấn.
        </div>
      ) : (
        <>
          {/* Luôn thấy 3 ô rưỡi: ô thứ 4 bị cắt nửa ở mép thẻ (hàng tràn ra sát mép, bù padding 18 của thẻ)
              để khách biết phải vuốt — không thêm dòng gợi ý, tiết kiệm chiều dài trang. */}
          <div
            className="flex overflow-x-auto"
            style={{ gap: 10, paddingBottom: 2, marginRight: -18, paddingRight: 18, scrollbarWidth: "none" }}
          >
            {departures.map((dep) => {
              const active = selected?.id === dep.id;
              const soldOut = (dep.availableSeats ?? 0) <= 0;
              return (
                <button
                  key={dep.id}
                  onClick={() => (soldOut ? onSoldOut(dep) : onSelect(dep))}
                  aria-pressed={active}
                  className="flex flex-col items-center flex-shrink-0"
                  style={{
                    flex: "0 0 calc((100% - 30px) / 3.5)",
                    minWidth: 0,
                    padding: "10px 6px",
                    gap: 2,
                    borderRadius: RADIUS.md,
                    border: active ? `2px solid ${red}` : `1px solid ${palette.border}`,
                    background: active ? (isDark ? "#3A1D22" : "#FFF6F7") : isDark ? "#1E293B" : "#F8FAFC",
                    boxShadow: active && !isDark ? "0 6px 14px -6px rgba(208,2,27,0.45)" : "none",
                    opacity: soldOut ? 0.6 : 1,
                  }}
                >
                  <span style={{ fontSize: FONT_SIZE.card, fontWeight: 700, color: active ? red : palette.textSecondary }}>
                    {soldOut ? "HẾT CHỖ" : weekday(dep.departureDate)}
                  </span>
                  <span
                    className="font-black"
                    style={{
                      fontSize: FONT_SIZE.lg,
                      lineHeight: "26px",
                      color: soldOut ? palette.textMuted : palette.textPrimary,
                      textDecoration: soldOut ? "line-through" : "none",
                    }}
                  >
                    {dayMonth(dep.departureDate)}
                  </span>
                  {/* Năm đã có ở bảng bên dưới — dòng này ghi số chỗ còn lại */}
                  <span style={{ fontSize: FONT_SIZE.card, color: palette.textMuted, whiteSpace: "nowrap" }}>
                    {soldOut ? "—" : `Còn ${dep.availableSeats}`}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col" style={{ ...panelStyle(palette), gap: 8 }}>
            {selected ? (
              <>
                {row("Khởi hành", `${weekday(selected.departureDate)}, ${fullDate(selected.departureDate)}`)}
                {selected.returnDate && row("Ngày về", `${weekday(selected.returnDate)}, ${fullDate(selected.returnDate)}`)}
                {row("Chỗ trống", `Còn ${selected.availableSeats} chỗ`, isDark ? "#34D399" : "#047857")}
                {row("Giá", `${formatPrice(selected.price)} / người`, red, 900)}
              </>
            ) : (
              <span style={{ fontSize: FONT_SIZE.card, color: palette.textSecondary }}>
                Chọn một ngày ở trên để xem ngày về, số chỗ và giá.
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export function ScheduleTabs({ plans }: { plans?: TourPlanLaravel[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const [index, setIndex] = useState(0);
  const count = plans?.length ?? 0;

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (!plans?.length) return null;
  const plan = plans[Math.min(index, count - 1)];
  const label = (p: TourPlanLaravel, i: number) => `Ngày ${p.day || i + 1}`;
  const meals = (plan.eats ?? []).map((s) => EAT_LABELS[s] ?? s);
  const vehicles = (plan.main_vehicles ?? []).map((s) => VEHICLE_LABELS[s] ?? s);
  const tag = (text: string, kind: "meal" | "veh", key: string) => (
    <span
      key={key}
      style={{
        padding: "3px 10px",
        borderRadius: 8,
        fontSize: FONT_SIZE.card,
        background: isDark ? "rgba(30,41,59,0.8)" : "#FFFFFF",
        border: `1px solid ${kind === "meal" ? (isDark ? "#78350F" : "#FDE2C3") : isDark ? "#1E3A8A" : "#DBEAFE"}`,
        color: kind === "meal" ? (isDark ? "#FCD34D" : "#9A4A00") : isDark ? "#93C5FD" : "#1D4ED8",
      }}
    >
      {text}
    </span>
  );

  return (
    <section style={cardStyle(palette)}>
      <CardHeader title="Lịch trình" right={`${count} ngày`} palette={palette} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {plans.map((p, i) => (
          <ChoiceButton key={`${p.day}-${i}`} label={label(p, i)} selected={i === index} onClick={() => setIndex(i)} />
        ))}
      </div>

      <div className="flex flex-col" style={{ ...panelStyle(palette), padding: 16, gap: 10 }}>
        <span style={{ fontSize: FONT_SIZE.card, fontWeight: 700, color: isDark ? "#F87171" : palette.brand }}>
          {label(plan, index)}
        </span>
        {!!plan.title && (
          <span className="font-black" style={{ fontSize: FONT_SIZE.md, lineHeight: "26px", color: palette.textPrimary }}>
            {plan.title}
          </span>
        )}
        {(meals.length > 0 || vehicles.length > 0) && (
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {vehicles.map((v, i) => tag(v, "veh", `v${i}`))}
            {meals.map((m, i) => tag(m, "meal", `m${i}`))}
          </div>
        )}
        <div
          className="html-content"
          style={{ fontSize: FONT_SIZE.card, lineHeight: "24px", color: palette.textSecondary }}
          dangerouslySetInnerHTML={{ __html: plan.content || "" }}
        />
      </div>

      {count > 1 && (
        <div className="flex" style={{ gap: 10, marginTop: 12 }}>
          <button
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="flex-1 font-bold"
            style={{
              minHeight: 44,
              borderRadius: 14,
              border: `1px solid ${palette.border}`,
              background: palette.surface,
              color: palette.textPrimary,
              fontSize: FONT_SIZE.card,
            }}
          >
            ‹ Ngày trước
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="flex-1 font-bold"
            style={{
              minHeight: 44,
              borderRadius: 14,
              border: `1px solid ${isDark ? "#F87171" : palette.brand}`,
              background: isDark ? "#3A1D22" : "#FFF6F7",
              color: isDark ? "#FCA5A5" : palette.brand,
              fontSize: FONT_SIZE.card,
            }}
          >
            Ngày sau ›
          </button>
        </div>
      )}
    </section>
  );
}

/** `<ul><li>` → từng dòng; HTML viết bằng `<p>` thì giữ nguyên thành 1 dòng. */
function toItems(html?: string): string[] {
  if (!html?.trim()) return [];
  const items = splitTopLevelListItems(html);
  return items.length > 0 ? items : [html];
}

export function ServiceTabs({ priceIncluded, priceNotIncluded }: { priceIncluded?: string; priceNotIncluded?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const inc = toItems(priceIncluded);
  // VAT thường nằm cuối danh sách "bao gồm" — chuẩn hoá thành "Bao gồm VAT" (giống PriceIncludedCard bên RN).
  for (let i = inc.length - 1; i >= 0; i--) {
    if (/vat/i.test(inc[i])) {
      inc[i] = "Bao gồm VAT";
      break;
    }
  }
  const exc = toItems(priceNotIncluded);
  const [tab, setTab] = useState<"inc" | "exc">(inc.length > 0 ? "inc" : "exc");
  if (inc.length === 0 && exc.length === 0) return null;

  const items = tab === "inc" ? inc : exc;
  const tabs = [
    { key: "inc" as const, label: "Bao gồm", count: inc.length, color: isDark ? "#4ADE80" : "#166534" },
    { key: "exc" as const, label: "Chưa bao gồm", count: exc.length, color: isDark ? "#FCA5A5" : "#991B1B" },
  ];

  return (
    <section style={cardStyle(palette)}>
      <CardHeader title="Dịch vụ tour" palette={palette} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 4,
          padding: 4,
          borderRadius: 14,
          background: isDark ? "#1E293B" : "#F1F5F9",
        }}
      >
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              disabled={t.count === 0}
              aria-pressed={active}
              style={{
                minHeight: 44,
                borderRadius: 11,
                border: "none",
                fontSize: FONT_SIZE.card,
                fontWeight: active ? 700 : 600,
                background: active ? (isDark ? "#475569" : "#FFFFFF") : "transparent",
                color: active ? t.color : palette.textSecondary,
                boxShadow: active && !isDark ? "0 2px 6px rgba(15,23,42,0.1)" : "none",
                opacity: t.count === 0 ? 0.5 : 1,
              }}
            >
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>
      <div className="flex flex-col" style={{ gap: 10, marginTop: 14 }}>
        {items.map((html, i) => (
          <div key={`${tab}-${i}`} className="flex items-start" style={{ gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: 20,
                fontWeight: 900,
                fontSize: FONT_SIZE.card,
                color: tab === "inc" ? "#16A34A" : palette.danger,
              }}
            >
              {tab === "inc" ? "✓" : "✕"}
            </span>
            <span
              className="html-content"
              style={{ fontSize: FONT_SIZE.card, lineHeight: "24px", color: palette.textSecondary, minWidth: 0 }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TermsTabs({ terms }: { terms?: TourTermsLaravel }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const [index, setIndex] = useState(0);

  const sections = terms ? TERM_SECTIONS.filter((s) => terms[s.key]?.trim()) : [];
  if (!terms || sections.length === 0) return null;
  const current = sections[Math.min(index, sections.length - 1)];

  return (
    <section style={cardStyle(palette)}>
      <CardHeader title="Điều khoản & lưu ý" palette={palette} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {sections.map((s, i) => {
          // Chỉ đếm ý lớn (<li> cấp ngoài cùng); 1 ý thì không ghi số.
          const n = splitTopLevelListItems(terms[s.key]).length;
          return (
            <ChoiceButton
              key={s.key}
              label={n > 1 ? `${s.title} (${n})` : s.title}
              selected={s.key === current.key}
              onClick={() => setIndex(i)}
              variant="outline"
            />
          );
        })}
      </div>
      <div
        className="html-content"
        style={{ ...panelStyle(palette), fontSize: FONT_SIZE.card, lineHeight: "24px", color: palette.textSecondary }}
        dangerouslySetInnerHTML={{ __html: terms[current.key] || "" }}
      />
    </section>
  );
}
