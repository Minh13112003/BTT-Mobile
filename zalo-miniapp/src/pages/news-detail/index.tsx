import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { getNewsById, NewsItem } from "@/services/news";
import { getPalette, RADIUS } from "@/constants/theme";
import { ArrowBackIcon, CloseIcon } from "@/components/icons";

/**
 * Port từ app/(root)/news/[id].tsx — `content` render thẳng qua
 * dangerouslySetInnerHTML (web xử lý <img> trong HTML tự nhiên, không cần
 * custom renderer như react-native-render-html bên RN).
 */
export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getNewsById(id)
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
            {item?.title ?? "Chi tiết tin tức"}
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
          <img
            src={item.imageUrl}
            alt={item.title}
            onClick={() => setZoomUrl(item.imageUrl)}
            style={{ width: "100%", height: 220, objectFit: "cover" }}
          />

          <div style={{ padding: 20 }}>
            <div className="flex items-center" style={{ marginBottom: 12, gap: 8 }}>
              <span
                className="font-bold"
                style={{ padding: "4px 10px", borderRadius: 999, background: isDark ? "#2D1B1B" : "#FFF1F2", color: palette.brand, fontSize: 12 }}
              >
                {item.categoryName ?? "Tin tức"}
              </span>
              <span style={{ fontSize: 13, color: palette.textMuted, fontWeight: 600 }}>📅 {item.date}</span>
            </div>

            <div className="font-black" style={{ fontSize: 22, color: palette.textPrimary, lineHeight: "30px", marginBottom: 14 }}>
              {item.title}
            </div>

            {!!item.excerpt && (
              <div
                style={{
                  padding: 14, marginBottom: 18, borderRadius: RADIUS.md, background: palette.surfaceAlt,
                  borderLeft: `3px solid ${palette.brand}`, color: palette.textSecondary, fontSize: 16, fontStyle: "italic", lineHeight: "24px",
                }}
              >
                {item.excerpt}
              </div>
            )}

            {!!item.content && (
              <div
                className="html-content"
                style={{ color: palette.textSecondary, fontSize: 17, lineHeight: "28px" }}
                dangerouslySetInnerHTML={{ __html: item.content }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "IMG") setZoomUrl((target as HTMLImageElement).src);
                }}
              />
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
