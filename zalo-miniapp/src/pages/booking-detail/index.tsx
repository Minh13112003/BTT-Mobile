import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Spinner, useSnackbar } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { getBookingById } from "@/services/booking";
import { getTourItemMapped, splitTopLevelListItems, type TourDetail } from "@/services/tour";
import { formatDepartureDate } from "@/utils/tour";
import { formatDateTime } from "@/helper/datetime_helper";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { ArrowBackIcon, CloseIcon } from "@/components/icons";
import HighlightChips from "@/components/HighlightChips";

interface BookingDetail {
  id: string;
  tour: TourDetail;
  departure?: {
    id?: string;
    tourCode?: string;
    departureDate?: string;
    price?: number;
    availableSeats?: number;
  };
  quantity: number;
  source?: string;
  tourKey?: string | null;
  passengers?: {
    adults?: number;
    children?: number;
    infants?: number;
  };
  originalPrice?: number;
  discountAmount?: number;
  price: number;
  voucher?: { code: string };
  notice?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

const MAP_STATUS_VN: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PAID: "Đã thanh toán",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const GREEN_STATUSES = ["Đã thanh toán", "Đã xác nhận", "Đã hoàn thành"];
const RED_STATUSES = ["Đã hủy", "Đã hoàn tiền"];

function statusTone(statusVn: string, isDark: boolean) {
  if (GREEN_STATUSES.includes(statusVn)) return isDark ? { bg: "#334155", text: "#6EE7B7" } : { bg: "#F0FDF4", text: "#15803D" };
  if (RED_STATUSES.includes(statusVn)) return isDark ? { bg: "#334155", text: "#FCA5A5" } : { bg: "#FEF2F2", text: "#DC2626" };
  return isDark ? { bg: "#334155", text: "#FCD34D" } : { bg: "#FFF3DC", text: "#B5710A" };
}

/**
 * Port từ app/(root)/detailTour.tsx — trang xem lại 1 đơn đã đặt (khác với
 * tour-detail/index.tsx, nơi khách CHƯA đặt). Giữ nguyên hành vi DEMO Laravel:
 * khi booking.source === "LARAVEL", gọi lại getTourItemMapped(tourKey) để lấy
 * hero/lịch trình/điều khoản đầy đủ, merge vào snapshot NestJS (giữ code/VAT
 * theo đúng thời điểm đặt).
 */
export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState("");
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fetchDetail = async () => {
    if (!id) {
      setError("Mã đơn hàng không hợp lệ");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res: any = await getBookingById(id);
      if (res?.data) {
        const data: BookingDetail = res.data;
        if (data.source === "LARAVEL" && data.tourKey) {
          try {
            const laravelTour = await getTourItemMapped(data.tourKey);
            data.tour = {
              ...laravelTour,
              code: data.tour?.code ?? laravelTour.code,
              hasVat: data.tour?.hasVat ?? laravelTour.hasVat,
            };
          } catch (e) {
            console.warn("Không tải được chi tiết tour Laravel, dùng snapshot:", e);
          }
        }
        setBooking(data);
      } else {
        setError("Không tìm thấy thông tin đơn hàng");
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      setError("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  const handleCopyTourCode = () => {
    const code = booking?.departure?.tourCode ?? booking?.tour?.code;
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => snackbar.openSnackbar({ text: `Đã sao chép mã tour: ${code}`, type: "success" }));
  };

  const handleContactSupport = () => {
    snackbar.openSnackbar({
      text: "Vui lòng gọi hotline 1900 6668 hoặc gửi email tới benthanh@benthanhtourist.com để được trợ giúp sớm nhất.",
      type: "warning",
      duration: 5000,
    });
  };

  const Header = ({ title }: { title: string }) => (
    <div className="flex items-center" style={{ padding: "13px 16px", paddingTop: "calc(env(safe-area-inset-top) + 13px)" }}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 36, height: 36, borderRadius: 18, background: isDark ? "#1E222B" : "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.12)", marginRight: 12 }}
      >
        <ArrowBackIcon color={isDark ? "#93C5FD" : "#D0021B"} size={20} />
      </button>
      <span className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.card }}>{title}</span>
    </div>
  );

  if (loading) {
    return (
      <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
        <Header title="Chi Tiết Đơn Hàng" />
        <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
          <Spinner />
          <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Đang tải thông tin chi tiết...</div>
        </div>
      </Page>
    );
  }

  if (error || !booking) {
    return (
      <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
        <Header title="Chi Tiết Đơn Hàng" />
        <div className="flex flex-col items-center text-center" style={{ paddingTop: 60, padding: "0 32px" }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div className="font-bold" style={{ marginTop: 16, color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>
            {error || "Đã xảy ra lỗi khi tải dữ liệu"}
          </div>
          <button
            onClick={fetchDetail}
            className="text-white font-bold"
            style={{ marginTop: 24, padding: "10px 24px", borderRadius: RADIUS.pill, background: palette.brand }}
          >
            Thử lại
          </button>
        </div>
      </Page>
    );
  }

  const statusVn = MAP_STATUS_VN[booking.status] || booking.status;
  const tone = statusTone(statusVn, isDark);
  const heroImage = booking.tour.imageUrl?.[0];
  const priceIncludedItems = booking.tour.htmlPriceIncluded ? splitTopLevelListItems(booking.tour.htmlPriceIncluded) : [];
  const priceNotIncludedItems = booking.tour.htmlPriceNotIncluded ? splitTopLevelListItems(booking.tour.htmlPriceNotIncluded) : [];

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <>
      <div style={{ height: 1, background: palette.border, margin: "2px 0" }} />
      <div style={{ padding: "13px 0" }}>
        <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, fontWeight: 600, marginBottom: 6 }}>{label}</div>
        {children}
      </div>
    </>
  );

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh", paddingBottom: 40 }}>
      {/* Hero */}
      <div className="relative" style={{ height: 240, background: palette.surfaceAlt }}>
        {heroImage && (
          <img src={heroImage} alt={booking.tour.name} className="w-full h-full object-cover" onClick={() => setZoomUrl(heroImage)} />
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute flex items-center justify-center rounded-full"
          style={{ top: "calc(env(safe-area-inset-top) + 12px)", left: 14, width: 40, height: 40, background: "rgba(0,0,0,0.4)" }}
        >
          <ArrowBackIcon />
        </button>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Tên tour + giá */}
        <div className="font-black" style={{ fontSize: FONT_SIZE.xl, color: palette.textPrimary, lineHeight: "32px" }}>
          {booking.tour.name}
        </div>
        <div className="font-black" style={{ color: palette.brand, marginTop: 4, fontSize: FONT_SIZE.xxs }}>
          {booking.tour.hasVat ? "Đã gồm VAT" : "Chưa gồm VAT"}
        </div>
        <div className="flex items-baseline" style={{ marginTop: 8, gap: 6 }}>
          <span style={{ color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Đơn giá trọn gói</span>
          <span className="font-black" style={{ color: palette.brand, fontSize: FONT_SIZE.lg }}>{formatCurrency(booking.price)}</span>
        </div>

        {/* Order details card */}
        <div style={{ marginTop: 20, padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
          <div className="font-black uppercase" style={{ color: palette.textSecondary, fontSize: 12, letterSpacing: 1 }}>
            Thông tin giao dịch
          </div>

          <div style={{ padding: "13px 0 0" }}>
            <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, fontWeight: 600, marginBottom: 6 }}>Trạng thái đơn hàng</div>
            <span className="font-black uppercase" style={{ borderRadius: RADIUS.pill, padding: "5px 12px", fontSize: 12, background: tone.bg, color: tone.text }}>
              {statusVn}
            </span>
          </div>

          <Row label="Mã Tour">
            <button onClick={handleCopyTourCode} className="flex items-center font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs, gap: 6 }}>
              {booking.departure?.tourCode ?? booking.tour.code ?? "-"} 📋
            </button>
          </Row>

          <Row label="Ngày khởi hành">
            <div className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>
              {booking.departure?.departureDate ? formatDepartureDate(booking.departure.departureDate) : "Chưa cập nhật"}
            </div>
          </Row>

          <Row label="Số lượng đặt">
            <div className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs, marginBottom: booking.passengers ? 8 : 0 }}>
              {booking.quantity} khách
            </div>
            {booking.passengers && (
              <div className="flex flex-wrap" style={{ gap: 12, padding: "8px 10px", borderRadius: RADIUS.md, background: palette.surfaceAlt }}>
                {(booking.passengers.adults ?? 0) > 0 && (
                  <span style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary }}>
                    Người lớn: <strong>{booking.passengers.adults}</strong>
                  </span>
                )}
                {(booking.passengers.children ?? 0) > 0 && (
                  <span style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary }}>
                    Trẻ em: <strong>{booking.passengers.children}</strong>
                  </span>
                )}
                {(booking.passengers.infants ?? 0) > 0 && (
                  <span style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary }}>
                    Em bé: <strong>{booking.passengers.infants}</strong>
                  </span>
                )}
              </div>
            )}
          </Row>

          {booking.originalPrice !== undefined && (
            <Row label="Tạm tính">
              <div className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>{formatCurrency(booking.originalPrice)}</div>
            </Row>
          )}

          {!!booking.discountAmount && booking.discountAmount > 0 && (
            <Row label="Giảm giá voucher">
              <div className="font-black" style={{ color: "#16A34A", fontSize: FONT_SIZE.xxs }}>-{formatCurrency(booking.discountAmount)}</div>
            </Row>
          )}

          {booking.voucher && (
            <Row label="Voucher đã áp dụng">
              <div className="font-black" style={{ color: isDark ? "#93C5FD" : "#D0021B", fontSize: FONT_SIZE.xxs }}>🎁 {booking.voucher.code}</div>
            </Row>
          )}

          {!!booking.notice && (
            <Row label="Ghi chú đặt tour">
              <div style={{ fontStyle: "italic", color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}>{booking.notice}</div>
            </Row>
          )}

          <Row label="Tổng thanh toán">
            <div className="font-black" style={{ color: palette.brand, fontSize: FONT_SIZE.xxs }}>{formatCurrency(booking.price)}</div>
          </Row>

          <Row label="Thời gian đặt">
            <div className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>{formatDateTime(booking.createdAt)}</div>
          </Row>

          <Row label="Cập nhật cuối">
            <div className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>{formatDateTime(booking.updatedAt)}</div>
          </Row>

          {booking.paymentMethod && (
            <Row label="Phương thức thanh toán">
              <div className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>
                {booking.paymentMethod === "AT_OFFICE" ? "🏢 Tại Văn Phòng" : "🏦 Chuyển khoản"}
              </div>
              {booking.paymentMethod === "AT_OFFICE" && (
                <div style={{ marginTop: 10, padding: 12, borderRadius: RADIUS.md, background: isDark ? "#111318" : "#FEF2F2", fontSize: FONT_SIZE.xxs, color: palette.textSecondary, lineHeight: "22px" }}>
                  CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH (BENTHANH TOURIST)
                  <br />
                  Trụ sở: Số 03 - 05 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh
                  <br />
                  Tel: 028 3822 7788
                </div>
              )}
            </Row>
          )}
        </div>

        {/* Highlights */}
        {!!booking.tour.highlights?.length && (
          <div style={{ marginTop: 20, padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
            <HighlightChips items={booking.tour.highlights} />
          </div>
        )}

        {/* Điểm nổi bật (Laravel) */}
        {booking.source === "LARAVEL" && !!booking.tour.htmlFeaturedDescription && (
          <div style={{ marginTop: 20 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>Điểm nổi bật</div>
            <div
              className="html-content"
              style={{ padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}`, color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}
              dangerouslySetInnerHTML={{ __html: booking.tour.htmlFeaturedDescription }}
            />
          </div>
        )}

        {/* Lịch trình (Laravel HTML) */}
        {booking.source === "LARAVEL" && !!booking.tour.htmlPlans?.length && (
          <div style={{ marginTop: 20 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>Lịch trình chuyến đi</div>
            {booking.tour.htmlPlans.map((plan, i) => (
              <details key={i} open={i === 0} style={{ marginBottom: 10, borderRadius: RADIUS.lg, border: `1px solid ${palette.border}`, background: palette.surface, overflow: "hidden" }}>
                <summary className="font-bold" style={{ padding: 14, cursor: "pointer", color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>
                  {plan.day}: {plan.title}
                </summary>
                <div className="html-content" style={{ padding: "0 14px 14px", color: palette.textSecondary, fontSize: FONT_SIZE.xxs }} dangerouslySetInnerHTML={{ __html: plan.content }} />
              </details>
            ))}
          </div>
        )}

        {/* Lịch trình dự kiến (NestJS) */}
        {booking.source !== "LARAVEL" && !!booking.tour.schedules?.length && (
          <div style={{ marginTop: 20 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>Lịch trình dự kiến</div>
            {booking.tour.schedules.map((s) => (
              <details key={s.id} style={{ marginBottom: 10, borderRadius: RADIUS.lg, border: `1px solid ${palette.border}`, background: palette.surface, overflow: "hidden" }}>
                <summary className="font-bold" style={{ padding: 14, cursor: "pointer", color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>
                  Ngày {s.dayNumber}: {s.title}
                </summary>
                <div style={{ padding: "0 14px 14px", color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}>
                  {s.morning && <div style={{ marginBottom: 6 }}>🌅 Sáng: {s.morning}</div>}
                  {s.noon && <div style={{ marginBottom: 6 }}>☀️ Trưa: {s.noon}</div>}
                  {s.afternoon && <div style={{ marginBottom: 6 }}>🌤️ Chiều: {s.afternoon}</div>}
                  {s.evening && <div style={{ marginBottom: 6 }}>🌆 Tối: {s.evening}</div>}
                  {s.night && <div>🌙 Đêm: {s.night}</div>}
                </div>
              </details>
            ))}
            <div style={{ marginTop: 10, padding: 12, borderRadius: RADIUS.md, background: isDark ? "rgba(217,119,6,0.12)" : "#FFFBEB", color: isDark ? "#FCD34D" : "#B45309", fontSize: FONT_SIZE.xxs, fontStyle: "italic" }}>
              ⚠️ Lưu ý: Đây là lịch trình dự kiến, lịch trình chi tiết sẽ được cập nhật trước ngày khởi hành 3 ngày.
            </div>
          </div>
        )}

        {/* Dịch vụ tour (Laravel) */}
        {(priceIncludedItems.length > 0 || priceNotIncludedItems.length > 0) && (
          <div style={{ marginTop: 20 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>Dịch vụ tour</div>
            <div style={{ padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
              {priceIncludedItems.length > 0 && (
                <>
                  <div className="font-black uppercase" style={{ color: palette.textSecondary, fontSize: 12, letterSpacing: 0.5, marginBottom: 8 }}>
                    Dịch vụ bao gồm
                  </div>
                  {priceIncludedItems.map((html, i) => (
                    <div key={`inc-${i}`} className="flex items-start" style={{ marginBottom: 8, gap: 8 }}>
                      <span style={{ color: "#16A34A", flexShrink: 0 }}>✓</span>
                      <span className="html-content" style={{ color: palette.textSecondary, fontSize: FONT_SIZE.xxs }} dangerouslySetInnerHTML={{ __html: html }} />
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
                      <span className="html-content" style={{ color: palette.textSecondary, fontSize: FONT_SIZE.xxs }} dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Thông tin chuyến đi */}
        <div style={{ marginTop: 20, padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
          <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>Thông tin chuyến đi</div>
          <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, marginBottom: 8 }}>📍 Khởi hành từ: <strong>{booking.tour.departureFrom}</strong></div>
          <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, marginBottom: 8 }}>✈️ Phương tiện: <strong>{booking.tour.transport}</strong></div>
          {!!booking.tour.notes && <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textMuted, fontStyle: "italic" }}>{booking.tour.notes}</div>}
        </div>

        {/* Điều khoản & lưu ý */}
        {booking.source === "LARAVEL" && booking.tour.htmlTerms && (
          <div style={{ marginTop: 20 }}>
            <div className="font-black" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary, marginBottom: 10 }}>Điều khoản &amp; Lưu ý chung</div>
            {[
              { title: "Lưu ý", html: booking.tour.htmlTerms.warningNote },
              { title: "Lưu ý visa", html: booking.tour.htmlTerms.warningNoteVisa },
              { title: "Chính sách hủy đặt chỗ", html: booking.tour.htmlTerms.cancelBooking },
              { title: "Hướng dẫn thanh toán", html: booking.tour.htmlTerms.paymentInstructions },
              { title: "Phạt hủy tour", html: booking.tour.htmlTerms.cancelPenalty },
            ]
              .filter((s) => !!s.html?.trim())
              .map((section) => (
                <details key={section.title} style={{ marginBottom: 10, borderRadius: RADIUS.lg, border: `1px solid ${palette.border}`, background: palette.surface, overflow: "hidden" }}>
                  <summary className="font-bold" style={{ padding: 14, cursor: "pointer", color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}>{section.title}</summary>
                  <div className="html-content" style={{ padding: "0 14px 14px", color: palette.textSecondary, fontSize: FONT_SIZE.xxs }} dangerouslySetInnerHTML={{ __html: section.html }} />
                </details>
              ))}
          </div>
        )}

        {/* Đánh giá — placeholder khi hoàn thành */}
        {booking.status === "COMPLETED" && (
          <div style={{ marginTop: 20, padding: 16, borderRadius: RADIUS.lg, border: `1px dashed ${palette.border}`, textAlign: "center" }}>
            <div style={{ color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Tính năng đánh giá sẽ được cập nhật sớm.</div>
          </div>
        )}

        {/* Liên hệ hỗ trợ */}
        <button
          onClick={handleContactSupport}
          className="flex items-center justify-center w-full font-black"
          style={{ marginTop: 20, padding: 16, borderRadius: RADIUS.lg, border: `1px dashed ${palette.border}`, color: palette.textSecondary, fontSize: FONT_SIZE.xxs, gap: 8 }}
        >
          💬 Bạn cần hỗ trợ về đơn hàng này?
        </button>
      </div>

      {zoomUrl && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.95)", zIndex: 2000 }} onClick={() => setZoomUrl(null)}>
          <button onClick={() => setZoomUrl(null)} className="absolute flex items-center justify-center" style={{ top: "calc(env(safe-area-inset-top) + 10px)", right: 20, width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.2)" }}>
            <CloseIcon color="#FFFFFF" />
          </button>
          <img src={zoomUrl} alt="" style={{ width: "100%", height: "85%", objectFit: "contain" }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed flex items-center justify-center"
          style={{ bottom: 154, right: 20, width: 50, height: 50, borderRadius: 25, background: palette.brand, color: "#FFFFFF", boxShadow: "0 4px 8px rgba(0,0,0,0.25)", zIndex: 99 }}
        >
          ↑
        </button>
      )}
    </Page>
  );
}
