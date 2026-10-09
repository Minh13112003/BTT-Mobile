import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { getTips, TravelTip } from "@/services/tips";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon } from "@/components/icons";

/** Port từ app/(root)/tips/index.tsx. */
export default function TipsListPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [tips, setTips] = useState<TravelTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTips()
      .then((res) => setTips(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
      <div style={{ background: isDark ? "#1E222B" : "#D0021B", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center" style={{ padding: "13px 16px" }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.15)", marginRight: 12 }}
          >
            <ArrowBackIcon size={20} />
          </button>
          <div>
            <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Mẹo du lịch
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 }}>
              Kinh nghiệm đi tour từ chuyên gia
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: 60 }}>
          <Spinner />
        </div>
      ) : tips.length === 0 ? (
        <div className="flex flex-col items-center" style={{ paddingTop: 60 }}>
          <div style={{ fontSize: 40 }}>💡</div>
          <div className="font-bold" style={{ marginTop: 12, color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}>
            Chưa có mẹo du lịch nào
          </div>
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          {tips.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden"
              style={{ borderRadius: RADIUS.md, marginBottom: 16, background: palette.surface, boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.07)" }}
            >
              <button onClick={() => navigate(`/tips/${item.id}`)} className="block w-full relative">
                <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                <span
                  className="absolute font-bold"
                  style={{ top: 10, left: 10, padding: "4px 10px", borderRadius: 999, background: "rgba(208,2,27,0.9)", color: "#FFFFFF", fontSize: 12 }}
                >
                  📍 {item.destination}
                </span>
              </button>

              <div style={{ padding: 14 }}>
                <button onClick={() => navigate(`/tips/${item.id}`)} className="block text-left w-full">
                  <div
                    className="font-bold"
                    style={{
                      fontSize: 22, color: palette.textPrimary, lineHeight: "30px", marginBottom: 6,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 18, color: palette.textMuted, lineHeight: "26px", marginBottom: 12,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                  >
                    {item.excerpt}
                  </div>
                </button>

                {item.tags.length > 0 && (
                  <div className="flex overflow-x-auto" style={{ marginBottom: 12, gap: 6 }}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex-shrink-0"
                        style={{ padding: "3px 8px", borderRadius: 6, background: isDark ? "#1F2937" : "#F1F5F9", color: palette.textMuted, fontSize: 12, fontWeight: 600 }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex" style={{ gap: 8 }}>
                  {!!item.relatedSearchQuery && (
                    <button
                      onClick={() => navigate(`/search?q=${encodeURIComponent(item.relatedSearchQuery ?? item.destination)}`)}
                      className="flex-1 font-bold text-center"
                      style={{ padding: "9px 0", borderRadius: 10, border: `1.5px solid ${palette.brand}`, color: palette.brand, fontSize: FONT_SIZE.card }}
                    >
                      🗺️ Tour {item.destination}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/tips/${item.id}`)}
                    className="flex-1 font-bold text-center text-white"
                    style={{ padding: "9px 0", borderRadius: 10, background: palette.brand, fontSize: FONT_SIZE.card }}
                  >
                    Đọc tiếp →
                  </button>
                </div>
              </div>
            </div>
          ))}
          <Footer />
        </div>
      )}
    </Page>
  );
}
