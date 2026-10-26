import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import {
  BLOG_CATEGORY_COMPANY_NEWS,
  BLOG_CATEGORY_TRAVEL_EXPERIENCE,
  BLOG_CATEGORY_TRAVEL_GUIDE,
  getBlogCategoryMapped,
  NewsItem,
} from "@/services/news";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon } from "@/components/icons";

const CATEGORIES = [
  { key: "company", label: "Tin tức hoạt động công ty", categoryId: BLOG_CATEGORY_COMPANY_NEWS },
  { key: "guide", label: "Cẩm nang du lịch", categoryId: BLOG_CATEGORY_TRAVEL_GUIDE },
  { key: "experience", label: "Kinh nghiệm du lịch", categoryId: BLOG_CATEGORY_TRAVEL_EXPERIENCE },
] as const;
type CategoryKey = (typeof CATEGORIES)[number]["key"];

/** Port từ app/(root)/news/index.tsx. */
export default function NewsListPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Trang chủ mở thẳng mục đang xem (?category=company|guide) từ nút "Xem tất cả" của "Tin tức & cẩm nang".
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<CategoryKey>(
    CATEGORIES.find((c) => c.key === searchParams.get("category"))?.key ?? CATEGORIES[0].key,
  );
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const activeCategoryId = CATEGORIES.find((c) => c.key === category)!.categoryId;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items, meta } = await getBlogCategoryMapped(activeCategoryId, 1);
      setNews(items);
      setHasNext(meta ? meta.current_page < meta.last_page : false);
      setPage(1);
    } catch {
      setNews([]);
      setHasNext(false);
    }
    setLoading(false);
  }, [activeCategoryId]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (!hasNext || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const { items, meta } = await getBlogCategoryMapped(activeCategoryId, next);
      setNews((prev) => [...prev, ...items]);
      setHasNext(meta ? meta.current_page < meta.last_page : false);
      setPage(next);
    } catch {
      // ignore
    }
    setLoadingMore(false);
  };

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
      <div style={{ background: isDark ? "#1E222B" : "#D0021B", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center" style={{ padding: "13px 16px" }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.15)", marginRight: 12 }}
          >
            <ArrowBackIcon size={20} />
          </button>
          <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Tin tức
          </span>
        </div>
      </div>

      <div style={{ background: isDark ? "#161B25" : "#FFFFFF", borderBottom: `1px solid ${isDark ? "#2D3748" : "#E5E8F3"}`, padding: "10px 0" }}>
        <div className="flex overflow-x-auto" style={{ padding: "0 16px", gap: 8 }}>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="font-bold flex-shrink-0"
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: `1px solid ${active ? palette.brand : isDark ? "#374151" : "#E2E8F0"}`,
                  background: active ? palette.brand : isDark ? "#1E222B" : "#FFFFFF",
                  color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#475569",
                  fontSize: FONT_SIZE.xxs,
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: 60 }}>
          <Spinner />
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center" style={{ paddingTop: 60 }}>
          <div style={{ fontSize: 40 }}>📰</div>
          <div className="font-bold" style={{ marginTop: 12, color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}>
            Chưa có tin tức trong mục này
          </div>
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          {news.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/news/${item.id}`)}
              className="block w-full text-left overflow-hidden"
              style={{
                borderRadius: RADIUS.md,
                marginBottom: 16,
                background: palette.surface,
                boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.07)",
              }}
            >
              <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              <div style={{ padding: 14 }}>
                <div
                  className="font-bold"
                  style={{
                    fontSize: 22, color: palette.textPrimary, lineHeight: "30px", marginBottom: 6,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}
                >
                  {item.title}
                </div>
                {!!item.excerpt && (
                  <div
                    style={{
                      fontSize: 18, color: palette.textMuted, lineHeight: "26px", marginBottom: 10,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                  >
                    {item.excerpt}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: FONT_SIZE.card, color: palette.textMuted, fontWeight: 600 }}>📅 {item.date}</span>
                  <span style={{ fontSize: FONT_SIZE.card, fontWeight: 800, color: palette.brand }}>Xem chi tiết →</span>
                </div>
              </div>
            </button>
          ))}

          {loadingMore ? (
            <div className="flex justify-center" style={{ padding: 16 }}>
              <Spinner />
            </div>
          ) : hasNext ? (
            <button
              onClick={loadMore}
              className="font-bold w-full"
              style={{ borderRadius: RADIUS.md, padding: "14px 0", minHeight: 44, background: palette.surfaceAlt, color: palette.textSecondary, fontSize: FONT_SIZE.xxs, marginBottom: 12 }}
            >
              Xem thêm
            </button>
          ) : null}

          <Footer />
        </div>
      )}
    </Page>
  );
}
