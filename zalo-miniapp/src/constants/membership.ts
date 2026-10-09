/**
 * Dữ liệu hạng thành viên — tách ra từ pages/membership/index.tsx để dùng
 * chung với MemberCard (hiển thị ở cả Trang chủ và trang Thẻ thành viên).
 * Port 1:1 từ app/(root)/membership.tsx.
 */
export interface Tier {
  name: string;
  min: number;
  text: string;
  icon: string;
}

export const TIERS: Tier[] = [
  { name: "Ruby", min: 500_000_000, text: "#fff", icon: "👑" },
  { name: "Kim Cương", min: 200_000_000, text: "#fff", icon: "💎" },
  { name: "Bạch Kim", min: 100_000_000, text: "#fff", icon: "🌟" },
  { name: "Vàng", min: 50_000_000, text: "#fff", icon: "🥇" },
  { name: "Bạc", min: 10_000_000, text: "#fff", icon: "🥈" },
  { name: "Đồng", min: 0, text: "#fff", icon: "🥉" },
];

export const MILESTONES = [0, 10_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000];

export function getTier(earnedPoints: number): Tier {
  return TIERS.find((t) => earnedPoints >= t.min) ?? TIERS[TIERS.length - 1];
}
export function getNextMilestone(earnedPoints: number): number | null {
  return MILESTONES.find((m) => m > earnedPoints) ?? null;
}
export function compact(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} triệu`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export const DISPLAY_NAMES = ["Đồng", "Bạc", "Vàng", "Bạch Kim", "Kim Cương", "Ruby"] as const;
export type TierName = (typeof DISPLAY_NAMES)[number];

export const BENEFITS: Record<TierName, string[]> = {
  Đồng: [
    "Tích lũy điểm thưởng từ mỗi chuyến đi",
    "Nhận thông báo ưu đãi sớm nhất",
    "Hỗ trợ đặt tour 24/7 qua app",
    "Xem lịch sử chuyến đi đầy đủ",
    "Nhận quà tặng sinh nhật (voucher 100k)",
  ],
  Bạc: [
    "Tất cả quyền lợi hạng Đồng",
    "Ưu tiên xử lý đặt tour trong 2 giờ",
    "Giảm 3% trên tổng giá tour",
    "Miễn phí đổi ngày khởi hành 1 lần/tour",
    "Quà tặng sinh nhật nâng cao (voucher 300k)",
    "Hỗ trợ HDV riêng khi đoàn ≥ 5 người",
  ],
  Vàng: [
    "Tất cả quyền lợi hạng Bạc",
    "Giảm 5% trên tổng giá tour",
    "Ưu tiên check-in sớm tại khách sạn",
    "Miễn phụ thu phòng đơn 1 lần/năm",
    "Tặng hành lý xách tay thêm 5kg (tour quốc tế)",
    "Chuyên viên tư vấn riêng qua Zalo/Hotline",
    "Quà tặng sinh nhật Premium (voucher 500k)",
  ],
  "Bạch Kim": [
    "Tất cả quyền lợi hạng Vàng",
    "Giảm 8% trên tổng giá tour",
    "Ưu tiên đặt phòng khách sạn hạng cao hơn (upgrade)",
    "Miễn phí hủy tour trước 7 ngày (1 lần/năm)",
    "Tặng bảo hiểm du lịch cao cấp tự động",
    "Tặng gói Welcome Amenity tại khách sạn",
    "Mời tham dự sự kiện du lịch VIP hàng năm",
    "Quà tặng sinh nhật VIP (voucher 1 triệu)",
  ],
  "Kim Cương": [
    "Tất cả quyền lợi hạng Bạch Kim",
    "Giảm 12% trên tổng giá tour",
    "Đặt tour ưu tiên số 1 — không bao giờ hết chỗ",
    "Trợ lý du lịch cá nhân riêng 24/7",
    "Tặng tour nội địa 2N1Đ miễn phí (1 lần/năm)",
    "Phòng khách sạn tự động upgrade lên Suite",
    "Được mời trải nghiệm tour mới trước khi ra mắt",
    "Quà tặng sinh nhật đặc biệt (voucher 2 triệu)",
  ],
  Ruby: [
    "Tất cả quyền lợi hạng Kim Cương",
    "Giảm 15% trên tổng giá tour — mức tối đa",
    "Concierge du lịch cá nhân — phục vụ 24/7",
    "Tặng 1 tour quốc tế ngắn ngày miễn phí (1 lần/năm)",
    "Ghế hạng Thương gia (Business Class) ưu tiên",
    "Check-in/out khách sạn theo giờ tùy chọn",
    "Tham gia Hội đồng cố vấn khách hàng BenThanh Tourist",
    "Quà tặng sinh nhật Ruby (voucher 5 triệu + quà cao cấp)",
    "Thư cảm ơn và đặc quyền Ruby suốt đời",
  ],
};

export const PROGRESS_COLORS: Record<string, [string, string]> = {
  Đồng: ["#FFD080", "#F0A030"],
  Bạc: ["#D0E8F8", "#80B0CC"],
  Vàng: ["#FFF0A0", "#F0C020"],
  "Bạch Kim": ["#A8DCFF", "#58AADC"],
  "Kim Cương": ["#FFFFFF", "#80C8F8"],
  Ruby: ["#FFAAAA", "#FF3050"],
};
export const CARD_BG: Record<string, [string, string]> = {
  Đồng: ["#C8650E", "#7A3208"],
  Bạc: ["#6E8496", "#2C3E4E"],
  Vàng: ["#B87C08", "#604008"],
  "Bạch Kim": ["#234E6E", "#0A2436"],
  "Kim Cương": ["#0E3868", "#041440"],
  Ruby: ["#7A0818", "#38000C"],
};
export const TIER_ACCENT: Record<string, string> = {
  Đồng: "#FFD080",
  Bạc: "#D0E8F8",
  Vàng: "#FFF0A0",
  "Bạch Kim": "#A8DCFF",
  "Kim Cương": "#FFFFFF",
  Ruby: "#FFAAAA",
};
export const TIER_TEXT: Record<string, { main: string; muted: string; sub: string }> = {
  Đồng: { main: "#FFF0D0", muted: "rgba(255,224,160,0.75)", sub: "rgba(255,210,130,0.40)" },
  Bạc: { main: "#EEF4FF", muted: "rgba(196,222,248,0.75)", sub: "rgba(176,208,240,0.40)" },
  Vàng: { main: "#FFFBE8", muted: "rgba(255,236,148,0.75)", sub: "rgba(255,216,100,0.40)" },
  "Bạch Kim": { main: "#E8F4FF", muted: "rgba(164,218,255,0.75)", sub: "rgba(136,198,248,0.40)" },
  "Kim Cương": { main: "#EBF2FF", muted: "rgba(152,196,255,0.75)", sub: "rgba(120,172,255,0.40)" },
  Ruby: { main: "#FFE8EC", muted: "rgba(255,184,196,0.75)", sub: "rgba(255,152,168,0.40)" },
};
