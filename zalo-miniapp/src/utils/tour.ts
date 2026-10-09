import type { Departure } from "@/services/departure";

/** Lấy departure gần nhất (>= hôm nay) từ danh sách đã nhúng trong tour */
export function getNearestDeparture(departures: Departure[]): Departure | null {
  if (!departures?.length) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = departures
    .filter((d) => new Date(d.departureDate) >= today)
    .sort(
      (a, b) =>
        new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime(),
    );
  return upcoming[0] ?? null;
}

/** Format giá tiền an toàn — không bao giờ crash */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "Liên hệ";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

/** Format ngày khởi hành an toàn — trả về dd/mm/yyyy hoặc "Liên hệ" */
export function formatDepartureDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Liên hệ";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Liên hệ";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${date.getFullYear()}`;
  } catch {
    return "Liên hệ";
  }
}
