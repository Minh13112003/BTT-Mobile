import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useTourDetail } from "@/hooks/useTourDetail";
import type { Departure } from "@/services/departure";
import { addFavorite, isFavorited as checkIsFavorited, removeFavorite } from "@/services/favorite";
import { splitTopLevelListItems } from "@/services/tour";
import { getNearestDeparture, formatDepartureDate } from "@/utils/tour";
import { formatPrice } from "@/helper/format";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon, CloseIcon, HeartIcon } from "@/components/icons";
import HighlightChips from "@/components/HighlightChips";
import PrimaryButton from "@/components/PrimaryButton";

/**
 * Port từ app/(root)/tour/[id].tsx — gộp 8 sub-component RN gốc (TourHero,
 * DeparturePicker, FeaturedHighlightsCard, TourScheduleHtmlAccordion,
 * PriceIncludedCard, TripInfoCard, TermsHtmlAccordion, HighlightChips) thành
 * các section inline trong 1 file cho v1, giữ nguyên luồng chọn ngày khởi
 * hành → đặt tour. Dùng thẻ <details> HTML cho các khối điều khoản thay vì
 * tự viết lại Accordion — nhẹ hơn và là pattern chuẩn trên web.
 */
export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const { tour, loading, error, refetch } = useTourDetail(id);
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
  const priceIncludedItems = tour.htmlPriceIncluded ? splitTopLevelListItems(tour.htmlPriceIncluded) : [];
  // VAT thường nằm cuối danh sách "bao gồm" — duyệt ngược, chuẩn hoá nguyên dòng
  // đó thành "Bao gồm VAT" thay vì giữ chi tiết % / điều kiện gốc (giống PriceIncludedCard bên RN).
  for (let i = priceIncludedItems.length - 1; i >= 0; i--) {
    if (/vat/i.test(priceIncludedItems[i])) {
      priceIncludedItems[i] = "Bao gồm VAT";
      break;
    }
  }
  const priceNotIncludedItems = tour.htmlPriceNotIncluded ? splitTopLevelListItems(tour.htmlPriceNotIncluded) : [];

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

        {/* Chọn ngày khởi hành */}
        {!!tour.departures?.length && (
          <div style={{ marginTop: 20 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
              Chọn ngày khởi hành
            </div>
            <div className="flex overflow-x-auto" style={{ gap: 10 }}>
              {tour.departures.map((dep) => {
                const active = selectedDeparture?.id === dep.id;
                const soldOut = (dep.availableSeats ?? 0) <= 0;
                return (
                  <button
                    key={dep.id}
                    onClick={() => !soldOut && setSelectedDeparture(dep)}
                    disabled={soldOut}
                    className="flex-shrink-0 text-left"
                    style={{
                      borderRadius: RADIUS.lg,
                      padding: 14,
                      minWidth: 150,
                      border: `1.5px solid ${active ? palette.brand : palette.border}`,
                      background: active ? (isDark ? "rgba(208,2,27,0.15)" : "#FFF0EE") : palette.surface,
                      opacity: soldOut ? 0.5 : 1,
                    }}
                  >
                    <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary }}>
                      {formatDepartureDate(dep.departureDate)}
                    </div>
                    <div className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: palette.brand, marginTop: 6 }}>
                      {formatPrice(dep.price)}
                    </div>
                    <div style={{ fontSize: 12, color: soldOut ? palette.danger : palette.textMuted, marginTop: 4, fontWeight: soldOut ? 700 : 400 }}>
                      {soldOut ? "HẾT CHỖ" : `Còn ${dep.availableSeats} chỗ`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

        {/* Lịch trình */}
        {!!tour.htmlPlans?.length && (
          <div style={{ marginTop: 24 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
              Lịch trình chuyến đi
            </div>
            {tour.htmlPlans.map((plan, i) => (
              <details
                key={i}
                open={i === 0}
                style={{
                  marginBottom: 10,
                  borderRadius: RADIUS.lg,
                  border: `1px solid ${palette.border}`,
                  background: palette.surface,
                  overflow: "hidden",
                }}
              >
                <summary
                  className="font-bold"
                  style={{ padding: 14, cursor: "pointer", color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}
                >
                  {plan.day}: {plan.title}
                </summary>
                <div
                  className="html-content"
                  style={{ padding: "0 14px 14px", color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}
                  dangerouslySetInnerHTML={{ __html: plan.content }}
                />
              </details>
            ))}
          </div>
        )}

        {/* Dịch vụ tour */}
        {(priceIncludedItems.length > 0 || priceNotIncludedItems.length > 0) && (
          <div style={{ marginTop: 24 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
              Dịch vụ tour
            </div>
            <div style={{ padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
              {priceIncludedItems.length > 0 && (
                <>
                  <div className="font-black uppercase" style={{ color: palette.textSecondary, fontSize: 12, letterSpacing: 0.5, marginBottom: 8 }}>
                    Dịch vụ bao gồm
                  </div>
                  {priceIncludedItems.map((html, i) => (
                    <div key={`inc-${i}`} className="flex items-start" style={{ marginBottom: 8, gap: 8 }}>
                      <span style={{ color: "#16A34A", flexShrink: 0 }}>✓</span>
                      <span
                        className="html-content"
                        style={{ color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </div>
                  ))}
                </>
              )}
              {priceNotIncludedItems.length > 0 && (
                <>
                  <div className="font-black uppercase" style={{ color: palette.textSecondary, fontSize: 12, letterSpacing: 0.5, marginTop: priceIncludedItems.length > 0 ? 14 : 0, marginBottom: 8 }}>
                    Chưa bao gồm
                  </div>
                  {priceNotIncludedItems.map((html, i) => (
                    <div key={`exc-${i}`} className="flex items-start" style={{ marginBottom: 8, gap: 8 }}>
                      <span style={{ color: palette.danger, flexShrink: 0 }}>✗</span>
                      <span
                        className="html-content"
                        style={{ color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Thông tin chuyến đi */}
        <div style={{ marginTop: 24 }}>
          <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
            Thông tin chuyến đi
          </div>
          <div style={{ padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
            <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, marginBottom: 8 }}>
              📍 Khởi hành từ: <strong>{tour.departureFrom}</strong>
            </div>
            <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, marginBottom: 8 }}>
              ✈️ Phương tiện: <strong>{tour.transport}</strong>
            </div>
            {!!tour.notes && (
              <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textMuted, fontStyle: "italic" }}>
                {tour.notes}
              </div>
            )}
          </div>
        </div>

        {/* Điều khoản & lưu ý */}
        {tour.htmlTerms && (
          <div style={{ marginTop: 24 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>
              Điều khoản &amp; Lưu ý chung
            </div>
            {[
              { title: "Lưu ý", html: tour.htmlTerms.warningNote },
              { title: "Lưu ý visa", html: tour.htmlTerms.warningNoteVisa },
              { title: "Chính sách hủy đặt chỗ", html: tour.htmlTerms.cancelBooking },
              { title: "Hướng dẫn thanh toán", html: tour.htmlTerms.paymentInstructions },
              { title: "Phạt hủy tour", html: tour.htmlTerms.cancelPenalty },
            ]
              .filter((s) => !!s.html?.trim())
              .map((section) => (
                <details
                  key={section.title}
                  style={{
                    marginBottom: 10,
                    borderRadius: RADIUS.lg,
                    border: `1px solid ${palette.border}`,
                    background: palette.surface,
                    overflow: "hidden",
                  }}
                >
                  <summary
                    className="font-bold"
                    style={{ padding: 14, cursor: "pointer", color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}
                  >
                    {section.title}
                  </summary>
                  <div
                    className="html-content"
                    style={{ padding: "0 14px 14px", color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                </details>
              ))}
          </div>
        )}
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
