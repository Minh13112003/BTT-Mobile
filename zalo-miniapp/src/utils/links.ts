import { openOutApp, openPhone } from "zmp-sdk/apis";

/** Mở link ngoài (web, Zalo, bản đồ...) — API của Zalo khi chạy trong app, rơi về tab mới khi xem bằng trình duyệt. */
export function openLink(url: string): void {
  openOutApp({ url }).catch(() => {
    window.open(url, "_blank");
  });
}

/** Gọi điện: màn hình cuộc gọi của Zalo; ngoài Zalo (trình duyệt) dùng liên kết `tel:`. */
export function callPhone(phoneNumber: string): void {
  const digits = phoneNumber.replace(/[^\d+]/g, "");
  openPhone({ phoneNumber: digits }).catch(() => {
    window.location.href = `tel:${digits}`;
  });
}

/** Gửi email bằng ứng dụng mail của máy. */
export function openMail(email: string): void {
  window.location.href = `mailto:${email}`;
}
