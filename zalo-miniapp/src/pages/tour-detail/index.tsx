import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useTourDetail } from "@/hooks/useTourDetail";
import type { Departure } from "@/services/departure";
import { addFavorite, isFavorited as checkIsFavorited, removeFavorite } from "@/services/favorite";
import { getNearestDeparture, formatDepartureDate } from "@/utils/tour";
import { formatPrice } from "@/helper/format";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon, CloseIcon, HeartIcon } from "@/components/icons";
import HighlightChips from "@/components/HighlightChips";
import PrimaryButton from "@/components/PrimaryButton";
import { DepartureSection, ScheduleTabs, ServiceTabs, TermsTabs } from "@/components/TourDetailSections";

/**
 * Port từ app/(root)/tour/[id].tsx — gộp 8 sub-component RN gốc (TourHero,
 * DeparturePicker, FeaturedHighlightsCard, TourScheduleHtmlAccordion,
 * PriceIncludedCard, TripInfoCard, TermsHtmlAccordion, HighlightChips) thành
 * các section inline trong 1 file cho v1, giữ nguyên luồng chọn ngày khởi
 * hành → đặt tour. Chọn ngày / lịch trình / dịch vụ / điều khoản dạng tab nằm ở
 * components/TourDetailSections.tsx (port mẫu mới 2026-10-26 bên RN).
 */
export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const { tour, loading, error, refetch } = useTourDetail(id);
  const [searchParams] = useSearchParams();
  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroScrollerRef = useRef<HTMLDivElement>(null);
  const images = tour?.imageUrl?.length ? tour.imageUrl : [];
  const snackbar = useSnackbar();
  const { isLoggedIn } = useAuth();

  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    setSelectedDeparture(null);
    setHeroIndex(0);
  }, [id]);

  // Đồng bộ trạng thái trái tim với server khi mở trang. AuthGate (App.tsx) đã
  // bắt buộc đăng nhập trước khi vào đây — check isLoggedIn chỉ là phòng hờ
  // khoảnh khắc vừa đăng xuất / token hết hạn, tránh gọi API favorites không token.
  useEffect(() => {
    if (!tour?.id || !isLoggedIn) {
      setIsFavorited(false);
      return;
    }
    let cancelled = false;
    checkIsFavorited(tour.id)
      .then((res) => {
        if (!cancelled) setIsFavorited(res.data.isFavorited);
      })
      .catch(() => {
        // Lỗi mạng — giữ mặc định chưa tim, không chặn trang.
      });
    return () => {
      cancelled = true;
    };
  }, [tour?.id, isLoggedIn]);

  const handleToggleFavorite = async () => {
    if (!tour || togglingFavorite) return;
    if (!isLoggedIn) {
      snackbar.openSnackbar({ text: "Vui lòng đăng nhập để lưu tour yêu thích", type: "warning" });
      return;
    }
    setTogglingFavorite(true);
    const nextFavorited = !isFavorited;
    setIsFavorited(nextFavorited); // optimistic
    try {
      if (nextFavorited) {
        const nearestDep = getNearestDeparture(tour.departures ?? []);
        await addFavorite({
          tourKey: tour.id,
          tourName: tour.name,
          tourImage: tour.imageUrl?.[0],
          durationText: tour.duration,
          unitPrice: nearestDep?.price,
          departureDate: nearestDep?.departureDate,
        });
      } else {
        await removeFavorite(tour.id);
      }
    } catch {
      setIsFavorited(!nextFavorited); // revert nếu API lỗi
      snackbar.openSnackbar({ text: "Không cập nhật được tour yêu thích, vui lòng thử lại", type: "error" });
    } finally {
      setTogglingFavorite(false);
    }
  };

  // Autoplay carousel ảnh hero — port từ ImageCarousel.tsx bên RN (autoPlayInterval=5000).
  // Dùng scrollTo trực tiếp (không scrollIntoView) để tránh kéo cả trang cuộn dọc theo.
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % images.length;
        const el = heroScrollerRef.current;
        const card = el?.children[next] as HTMLElement | undefined;
        if (el && card) el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Chọn sẵn đợt khởi hành khớp ngày được truyền sang (từ tìm kiếm theo ngày ở tab Du lịch hoặc từ
  // thẻ tour trong chatbot bttAI): ?searchDateMode=specific&searchSpecificDate=YYYY-MM-DD hoặc
  // ?searchDateMode=range&searchStartDate=...&searchEndDate=... — giống app React Native.
  const searchDateMode = searchParams.get("searchDateMode");
  const searchSpecificDate = searchParams.get("searchSpecificDate");
  const searchStartDate = searchParams.get("searchStartDate");
  const searchEndDate = searchParams.get("searchEndDate");
  useEffect(() => {
    if (!tour?.departures?.length) return;
    let matched: Departure | undefined;
    if (searchDateMode === "specific" && searchSpecificDate) {
      const target = new Date(searchSpecificDate);
      matched = tour.departures.find((dep) => {
        const d = new Date(dep.departureDate);
        return (
          d.getFullYear() === target.getFullYear() &&
          d.getMonth() === target.getMonth() &&
          d.getDate() === target.getDate()
        );
      });
    } else if (searchDateMode === "range" && (searchStartDate || searchEndDate)) {
      const start = searchStartDate ? new Date(searchStartDate) : new Date(0);
      const end = searchEndDate ? new Date(searchEndDate) : new Date(8640000000000000);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      matched = [...tour.departures]
        .sort((x, y) => new Date(x.departureDate).getTime() - new Date(y.departureDate).getTime())
        .find((dep) => {
          const d = new Date(dep.departureDate);
          return d >= start && d <= end;
        });
    }
    if (matched) setSelectedDeparture(matched);
  }, [tour, searchDateMode, searchSpecificDate, searchStartDate, searchEndDate]);

  const goCheckout = () => {
    if (!tour) return;
    if (!selectedDeparture) {
      snackbar.openSnackbar({ text: "Vui lòng chọn ngày khởi hành", type: "warning" });
      return;
    }
    // source=LARAVEL bắt buộc — checkout dựa vào nó để gửi payload booking
    // dạng Laravel (tourKey/departureKey/departureDate/unitPrice), khớp bản RN.
    const query = new URLSearchParams({
      id: tour.id,
      name: tour.name,
      imageUrl: tour.imageUrl[0] ?? "",
      tourCode: selectedDeparture.code ?? tour.code ?? "",
      price: String(selectedDeparture.price),
      duration: tour.duration,
      hasVat: String(tour.hasVat),
      departureId: selectedDeparture.id,
      departureDate: selectedDeparture.departureDate,
      availableSeats: String(selectedDeparture.availableSeats),
      source: "LARAVEL",
      tourKey: tour.id,
      departureKey: selectedDeparture.id,
    });
    navigate(`/checkout?${query.toString()}`);
  };

  if (loading) {
    return (
      <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "100vh" }}>
          <Spinner />
          <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.card }}>
            Đang tải chi tiết tour...
          </div>
        </div>
      </Page>
    );
  }

  if (error || !tour) {
    return (
      <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "100vh", padding: 32 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div className="font-bold" style={{ marginTop: 16, color: palette.textPrimary, fontSize: FONT_SIZE.xs }}>
            {error || "Không tìm thấy thông tin tour"}
          </div>
          <div className="flex" style={{ gap: 12, marginTop: 24 }}>
            <button
              onClick={() => navigate(-1)}
              className="font-bold"
              style={{ padding: "10px 24px", borderRadius: RADIUS.pill, border: `1px solid ${palette.border}`, color: palette.textSecondary }}
            >
              Quay lại
            </button>
            <button
              onClick={refetch}
              className="text-white font-bold"
              style={{ padding: "10px 24px", borderRadius: RADIUS.pill, background: palette.brand }}
            >
              Thử lại
            </button>
          </div>
        </div>
      </Page>
    );
  }

  const nearest = selectedDeparture ?? getNearestDeparture(tour.departures ?? []);
  const handleHeroScroll = () => {
    const el = heroScrollerRef.current;
    if (!el) return;
    const w = (el.children[0] as HTMLElement)?.offsetWidth || 1;
    setHeroIndex(Math.round(el.scrollLeft / w));
  };

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: 100 }}>
      {/* Hero — carousel ảnh, port từ ImageCarousel.tsx bên RN */}
      <div className="relative" style={{ height: 280, background: palette.surfaceAlt }}>
        <div
          ref={heroScrollerRef}
          onScroll={handleHeroScroll}
          className="flex overflow-x-auto"
          style={{ height: "100%", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
        >
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={tour.name}
              className="flex-shrink-0 object-cover"
              style={{ width: "100vw", height: "100%", scrollSnapAlign: "start" }}
              onClick={() => setZoomUrl(url)}
            />
          ))}
        </div>

        {/* Gradient che chân ảnh để badge/dot dễ đọc */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ height: 70, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55))", pointerEvents: "none" }}
        />

        <button
          onClick={() => navigate(-1)}
          className="absolute flex items-center justify-center rounded-full"
          style={{
            top: "calc(env(safe-area-inset-top) + 12px)",
            left: 14,
            width: 40,
            height: 40,
            background: "rgba(0,0,0,0.4)",
            zIndex: 2,
          }}
        >
          <ArrowBackIcon />
        </button>

        <button
          onClick={handleToggleFavorite}
          disabled={togglingFavorite}
          aria-label={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
          className="absolute flex items-center justify-center rounded-full"
          style={{
            top: "calc(env(safe-area-inset-top) + 12px)",
            right: 14,
            width: 40,
            height: 40,
            background: isFavorited ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.4)",
            zIndex: 2,
          }}
        >
          <HeartIcon active={isFavorited} color={isFavorited ? palette.brand : "#FFFFFF"} />
        </button>

        {/* Dot indicator — chỉ hiện khi có nhiều hơn 1 ảnh */}
        {images.length > 1 && (
          <div className="absolute flex justify-center items-center" style={{ left: 0, right: 0, bottom: 10, gap: 4 }}>
            {images.map((_, i) => (
              <div
                key={i}
                style={{
                  height: 6,
                  borderRadius: 3,
                  width: i === heroIndex ? 16 : 6,
                  background: i === heroIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  transition: "width 0.2s",
                }}
              />
            ))}
          </div>
        )}

        {/* Duration badge */}
        <div
          className="absolute font-black uppercase"
          style={{ left: 14, bottom: images.length > 1 ? 22 : 12, padding: "6px 12px", borderRadius: RADIUS.md, background: palette.brand, color: "#FFFFFF", fontSize: FONT_SIZE.xxs, letterSpacing: 0.5 }}
        >
          {tour.duration}
        </div>

        {/* Rating badge */}
        <div
          className="absolute flex items-center font-black"
          style={{ right: 14, bottom: images.length > 1 ? 22 : 12, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.92)", color: "#1E293B", fontSize: FONT_SIZE.xxs, gap: 4 }}
        >
          <span style={{ color: "#FBBF24" }}>★</span> {tour.rating} <span style={{ color: "#94A3B8", fontWeight: 400 }}>({tour.reviewsCount})</span>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div className="font-black" style={{ fontSize: FONT_SIZE.xl, color: palette.textPrimary, lineHeight: "32px" }}>
          {tour.name}
        </div>
        <div className="flex items-center flex-wrap" style={{ marginTop: 8, gap: 8 }}>
          {/* Mã tour đổi theo đợt khởi hành đã chọn (tour_days[].code) — giống bản RN */}
          <span style={{ color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
            {selectedDeparture?.code
              ? `Mã: ${selectedDeparture.code}`
              : "Vui lòng chọn ngày khởi hành để xem mã tour"}
          </span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: palette.textMuted }} />
          <span style={{ color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
            {tour.hasVat ? "Đã gồm VAT" : "Chưa gồm VAT"}
          </span>
        </div>

        <HighlightChips items={tour.highlights} />

        {/* Chọn ngày khởi hành — ô thứ/ngày/năm + bảng thông tin đợt đang chọn */}
        <DepartureSection
          departures={tour.departures ?? []}
          selected={selectedDeparture}
          onSelect={setSelectedDeparture}
          onSoldOut={(dep) =>
            snackbar.openSnackbar({
              text: `Ngày ${formatDepartureDate(dep.departureDate)} đã hết chỗ, xin vui lòng chọn ngày khác`,
              type: "warning",
            })
          }
        />

        {/* Điểm nổi bật */}
        {!!tour.htmlFeaturedDescription && (
          <div style={{ marginTop: 24 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
              Điểm nổi bật
            </div>
            <div
              className="html-content"
              style={{
                padding: 16,
                borderRadius: RADIUS.lg,
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.textSecondary,
                fontSize: FONT_SIZE.xxs,
              }}
              dangerouslySetInnerHTML={{ __html: tour.htmlFeaturedDescription }}
            />
          </div>
        )}

        {/* Lịch trình / dịch vụ / điều khoản dạng tab (mẫu "Hero cũ + nội dung kiểu Mẫu 2", 2026-10-26) */}
        <ScheduleTabs plans={tour.htmlPlans} />
        <ServiceTabs priceIncluded={tour.htmlPriceIncluded} priceNotIncluded={tour.htmlPriceNotIncluded} />
        <TermsTabs terms={tour.htmlTerms} />

        {/* Thông tin chuyến đi */}
        <div style={{ marginTop: 18, padding: "16px 18px", borderRadius: RADIUS.xl, background: palette.surface, border: `1px solid ${palette.border}` }}>
          <div className="flex justify-between" style={{ gap: 10, fontSize: FONT_SIZE.card }}>
            <span style={{ color: palette.textSecondary }}>Nơi khởi hành</span>
            <span className="font-bold" style={{ color: palette.textPrimary, textAlign: "right" }}>{tour.departureFrom}</span>
          </div>
          {!!tour.transport && (
            <div className="flex justify-between" style={{ gap: 10, fontSize: FONT_SIZE.card, marginTop: 10 }}>
              <span style={{ color: palette.textSecondary }}>Phương tiện</span>
              <span className="font-bold" style={{ color: palette.textPrimary, textAlign: "right" }}>{tour.transport}</span>
            </div>
          )}
          {!!tour.notes && (
            <div style={{ fontSize: FONT_SIZE.card, color: palette.textMuted, fontStyle: "italic", marginTop: 10 }}>
              {tour.notes}
            </div>
          )}
        </div>
      </div>

      {/* Thanh đặt tour cố định dưới */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
        style={{
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          background: palette.surface,
          borderTop: `1px solid ${palette.border}`,
          zIndex: 50,
        }}
      >
        <div>
          <div style={{ fontSize: FONT_SIZE.card, color: palette.textMuted }}>Giá từ</div>
          <div className="font-black" style={{ fontSize: FONT_SIZE.lg, color: palette.brand }}>
            {nearest ? formatPrice(nearest.price) : "Liên hệ"}
          </div>
        </div>
        <PrimaryButton label="Đặt tour" onClick={goCheckout} />
      </div>

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
