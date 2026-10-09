import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { getTipById, TravelTip } from "@/services/tips";
import { getPalette, RADIUS } from "@/constants/theme";
import { ArrowBackIcon, CloseIcon } from "@/components/icons";

/** Port từ app/(root)/tips/[id].tsx — content render qua dangerouslySetInnerHTML. */
export default function TipsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [item, setItem] = useState<TravelTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getTipById(id)
      .then((res) => setItem(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
          <span className="truncate" style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}>
            {item?.title ?? "Mẹo du lịch"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: 60 }}>
          <Spinner />
        </div>
      ) : !item ? (
        <div className="flex flex-col items-center" style={{ paddingTop: 60 }}>
          <div style={{ fontSize: 40 }}>😕</div>
          <div className="font-bold" style={{ marginTop: 12, color: palette.textSecondary }}>Không tìm thấy bài viết</div>
        </div>
      ) : (
        <div style={{ paddingBottom: 40 }}>
          <img src={item.imageUrl} alt={item.title} onClick={() => setZoomUrl(item.imageUrl)} style={{ width: "100%", height: 220, objectFit: "cover" }} />

          <div style={{ padding: 20 }}>
            <div className="flex items-center flex-wrap" style={{ marginBottom: 12, gap: 8 }}>
              <span className="font-bold" style={{ padding: "4px 10px", borderRadius: 999, background: isDark ? "#2D1B1B" : "#FFF1F2", color: palette.brand, fontSize: 12 }}>
                📍 {item.destination}
              </span>
              <span style={{ fontSize: 13, color: palette.textMuted, fontWeight: 600 }}>📅 {item.date}</span>
            </div>

            {item.tags.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 16 }}>
                {item.tags.map((tag) => (
                  <span key={tag} style={{ padding: "3px 8px", borderRadius: 6, background: isDark ? "#1F2937" : "#F1F5F9", color: palette.textMuted, fontSize: 12, fontWeight: 600 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="font-black" style={{ fontSize: 22, color: palette.textPrimary, lineHeight: "30px", marginBottom: 14 }}>
              {item.title}
            </div>

            {!!item.excerpt && (
              <div style={{ padding: 14, marginBottom: 20, borderRadius: 10, background: isDark ? "#2A2315" : "#FFFDF5", borderLeft: "4px solid #825500" }}>
                <div style={{ fontSize: 18, fontWeight: 600, fontStyle: "italic", color: isDark ? "#FCD34D" : "#825500", lineHeight: "28px" }}>
                  {item.excerpt}
                </div>
              </div>
            )}

            <div style={{ height: 1, background: palette.border, marginBottom: 18 }} />

            {!!item.content && (
              <div
                className="html-content"
                style={{ color: palette.textSecondary, fontSize: 18, lineHeight: "28px" }}
                dangerouslySetInnerHTML={{ __html: item.content }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "IMG") setZoomUrl((target as HTMLImageElement).src);
                }}
              />
            )}

            {!!item.relatedSearchQuery && (
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent(item.relatedSearchQuery!)}`)}
                className="w-full text-left"
                style={{
                  marginTop: 20, borderRadius: RADIUS.lg, background: isDark ? "#2D1B1B" : "#FFF1F2",
                  border: `1.5px solid ${palette.brand}`, padding: 18,
                }}
              >
                <div className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>🗺️</span>
                  <span className="font-black" style={{ color: palette.brand, fontSize: 17 }}>
                    Xem tour {item.destination}
                  </span>
                </div>
                <div style={{ color: palette.textSecondary, fontSize: 14 }}>
                  Khám phá các tour du lịch liên quan đến bài viết này →
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {zoomUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)", zIndex: 2000 }}
          onClick={() => setZoomUrl(null)}
        >
          <button
            onClick={() => setZoomUrl(null)}
            className="absolute flex items-center justify-center"
            style={{ top: "calc(env(safe-area-inset-top) + 10px)", right: 20, width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.2)" }}
          >
            <CloseIcon color="#FFFFFF" />
          </button>
          <img src={zoomUrl} alt="" style={{ width: "100%", height: "85%", objectFit: "contain" }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </Page>
  );
}
