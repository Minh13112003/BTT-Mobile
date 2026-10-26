import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

import Icon from "@/components/Icon";
import { FAQ_CATEGORIES } from "@/constants/faqContent";
import { useTheme } from "@/context/ThemeContext";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { callPhone, openLink } from "@/utils/links";

const ALL = "all";
const ZALO_URL = "https://zalo.me/237833859403376914";

/** Bỏ dấu + hạ chữ thường để tìm kiếm tiếng Việt không phân biệt dấu. */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

/** Port từ app/(root)/(profile)/faq.tsx — câu hỏi thường gặp, tìm kiếm, lọc theo nhóm, mở/đóng từng câu. */
export default function FaqPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>(ALL);
  const [openKey, setOpenKey] = useState<string | null>("dat-tour-0");

  const sections = useMemo(() => {
    const q = fold(query.trim());
    return FAQ_CATEGORIES.filter((c) => cat === ALL || c.id === cat)
      .map((c) => ({
        ...c,
        items: c.items
          .map((item, idx) => ({ item, idx }))
          .filter(({ item }) => !q || fold(item.q).includes(q) || item.a.some((t) => fold(t).includes(q))),
      }))
      .filter((c) => c.items.length > 0);
  }, [query, cat]);

  const textMain = isDark ? "#F1F5F9" : "#1A1A2E";
  const textBody = isDark ? "#CBD5E1" : "#475569";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const groupBg = isDark ? "#1A1F2B" : "#FFFFFF";
  const groupBorder = isDark ? "#272D3C" : "#F1F5F9";

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh", paddingBottom: 40 }}>
      {/* Header đỏ có ô tìm kiếm */}
      <div
        style={{
          padding: "calc(env(safe-area-inset-top) + 8px) 16px 20px",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          background: isDark
            ? "linear-gradient(165deg, #2A2E38, #1E222B)"
            : "linear-gradient(165deg, #B30014 0%, #8A0010 50%, #5C000B 100%)",
        }}
      >
        <div className="flex items-center" style={{ marginBottom: 16 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
            className="flex items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: 22, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.15)" }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="text-white font-bold" style={{ marginLeft: 12, fontSize: FONT_SIZE.md }}>
            Câu hỏi thường gặp
          </div>
        </div>
        <div className="flex items-center" style={{ height: 48, borderRadius: 16, background: "#FFFFFF", padding: "0 14px" }}>
          <Icon name="search-outline" size={18} color="#C00119" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm câu hỏi…"
            style={{ flex: 1, minWidth: 0, marginLeft: 10, border: "none", outline: "none", background: "transparent", color: "#1E293B", fontSize: FONT_SIZE.xxs }}
          />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Xoá" style={{ padding: 4, minHeight: 0 }}>
              <Icon name="close-circle-outline" size={18} color="#94A3B8" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Nhóm câu hỏi */}
      <div className="flex overflow-x-auto" style={{ gap: 8, padding: "16px 16px 0" }}>
        {[{ id: ALL, title: "Tất cả" }, ...FAQ_CATEGORIES].map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className="font-bold flex-shrink-0"
              style={{
                height: 44,
                padding: "0 16px",
                borderRadius: 22,
                fontSize: FONT_SIZE.xxs,
                background: active ? (isDark ? "#F1F5F9" : "#1A1A2E") : groupBg,
                color: active ? (isDark ? "#0F172A" : "#FFFFFF") : textMuted,
                border: `1px solid ${active ? (isDark ? "#F1F5F9" : "#1A1A2E") : isDark ? "#272D3C" : "#E2E8F0"}`,
              }}
            >
              {c.title}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        <div
          style={{
            borderRadius: 16,
            padding: 14,
            fontSize: FONT_SIZE.xxs,
            background: isDark ? "rgba(99,102,241,0.1)" : "#EEF2FF",
            border: `1px solid ${isDark ? "rgba(129,140,248,0.2)" : "#E0E7FF"}`,
            color: isDark ? "#C7D2FE" : "#312E81",
          }}
        >
          Câu hỏi và trả lời do AI soạn từ website benthanhtourist.com, đang chờ công ty duyệt.
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center text-center" style={{ padding: "48px 32px" }}>
          <Icon name="search-outline" size={36} color="#94A3B8" />
          <div className="font-bold" style={{ marginTop: 12, fontSize: FONT_SIZE.xs, color: textMain }}>
            Không tìm thấy câu hỏi phù hợp
          </div>
          <div style={{ marginTop: 4, fontSize: FONT_SIZE.xxs, color: textMuted }}>
            Thử từ khoá khác hoặc gọi tổng đài 1900 6668 để được hỗ trợ.
          </div>
        </div>
      ) : (
        sections.map((sec) => (
          <div key={sec.id} style={{ padding: "20px 16px 0" }}>
            <div className="font-bold uppercase" style={{ marginBottom: 8, paddingLeft: 4, letterSpacing: 1, fontSize: FONT_SIZE.xxs, color: textMuted }}>
              {sec.title}
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", background: groupBg, border: `1px solid ${groupBorder}` }}>
              {sec.items.map(({ item, idx }, i) => {
                const key = `${sec.id}-${idx}`;
                const open = openKey === key;
                const last = i === sec.items.length - 1;
                return (
                  <div
                    key={key}
                    style={{
                      borderBottom: last ? "none" : `1px solid ${isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9"}`,
                      background: open ? (isDark ? "rgba(30,41,59,0.6)" : "#FFF7F8") : "transparent",
                    }}
                  >
                    <button
                      onClick={() => setOpenKey(open ? null : key)}
                      aria-expanded={open}
                      className="flex items-center w-full text-left"
                      style={{ padding: "14px 16px", minHeight: 60 }}
                    >
                      <span
                        className="flex-1 font-semibold"
                        style={{ paddingRight: 12, fontSize: FONT_SIZE.xxs, color: open ? "#B30118" : textMain }}
                      >
                        {item.q}
                      </span>
                      <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={open ? "#B30118" : "#8A8E9A"} />
                    </button>
                    {open && (
                      <div style={{ padding: "0 16px 16px" }}>
                        {item.a.map((t, k) => (
                          <div key={k} style={{ marginTop: k > 0 ? 8 : 0, lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textBody }}>
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Cần hỗ trợ thêm */}
      <div style={{ padding: "24px 16px 0" }}>
        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: isDark ? "rgba(30,41,59,0.7)" : "#FFF1F2",
            border: `1px solid ${isDark ? "rgba(51,65,85,0.6)" : "#F7CDD2"}`,
          }}
        >
          <div className="font-bold" style={{ fontSize: FONT_SIZE.xs, color: textMain }}>
            Chưa tìm thấy câu trả lời?
          </div>
          <div style={{ marginTop: 4, marginBottom: 14, fontSize: FONT_SIZE.xxs, color: textMuted }}>
            Nhân viên BenThanh Tourist luôn sẵn sàng hỗ trợ bạn.
          </div>
          <div className="flex" style={{ gap: 10 }}>
            <button
              onClick={() => callPhone("19006668")}
              className="flex-1 flex items-center justify-center text-white font-extrabold"
              style={{ height: 48, borderRadius: 24, gap: 6, background: "#D0021B", border: "1px solid rgba(255,255,255,0.4)", fontSize: FONT_SIZE.xxs }}
            >
              <Icon name="call-outline" size={16} color="#FFFFFF" />
              1900 6668
            </button>
            <button
              onClick={() => openLink(ZALO_URL)}
              className="flex-1 flex items-center justify-center font-bold"
              style={{
                height: 48,
                borderRadius: 24,
                gap: 6,
                fontSize: FONT_SIZE.xxs,
                background: isDark ? "#1E293B" : "#FFFFFF",
                border: `1.5px solid ${isDark ? "#475569" : "#F3C4CA"}`,
                color: isDark ? "#FCA5A5" : "#B30118",
              }}
            >
              <Icon name="chatbubble-outline" size={16} color={isDark ? "#FCA5A5" : "#B30118"} />
              Nhắn Zalo
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}
