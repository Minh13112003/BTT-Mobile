// Hành khách / thân nhân: định dạng ngày và kiểm tra theo quy tắc đặt tour.
// Quy tắc phải khớp backend (src/modules/bookings/guest-rules.ts) — backend là nơi quyết định cuối cùng.

/** Dữ liệu một hành khách / thân nhân trong form (ngày sinh dạng DD/MM/YYYY). */
export interface GuestForm {
  fullName: string;
  dob: string;
  nationalId: string;
  phone: string;
  passportNumber: string;
  visaNumber: string;
}

/** Dữ liệu gửi lên API (ngày sinh YYYY-MM-DD). */
export interface GuestPayload {
  fullName: string;
  dateOfBirth: string;
  nationalId?: string;
  phone?: string;
  passportNumber?: string;
  visaNumber?: string;
}

export const emptyGuest = (): GuestForm => ({
  fullName: "",
  dob: "",
  nationalId: "",
  phone: "",
  passportNumber: "",
  visaNumber: "",
});

/** ISO (2026-05-20 hoặc 2026-05-20T00:00:00Z) -> DD/MM/YYYY. */
export function isoToDmy(iso?: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/** DD/MM/YYYY -> YYYY-MM-DD; null nếu rỗng, undefined nếu sai định dạng/ngày không có thật. */
export function dmyToIso(dmy: string): string | null | undefined {
  const v = dmy.trim();
  if (!v) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return undefined;
  const [, dd, mm, yyyy] = m;
  const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  if (isNaN(d.getTime()) || d.getDate() !== Number(dd) || d.getMonth() + 1 !== Number(mm)) return undefined;
  return `${yyyy}-${mm}-${dd}`;
}

/** Tự chèn dấu "/" khi gõ ngày. */
export function maskDate(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Tuổi tại ngày `ref`; null nếu ngày sinh không hợp lệ hoặc ở tương lai. */
export function ageOn(dobIso: string, ref: Date = new Date()): number | null {
  const d = new Date(`${dobIso}T00:00:00`);
  if (isNaN(d.getTime()) || d.getTime() > ref.getTime()) return null;
  let age = ref.getFullYear() - d.getFullYear();
  const m = ref.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < d.getDate())) age--;
  return age;
}

export function formToPayload(f: GuestForm): GuestPayload {
  const t = (v: string) => v.trim() || undefined;
  return {
    fullName: f.fullName.trim(),
    dateOfBirth: dmyToIso(f.dob) ?? "",
    nationalId: t(f.nationalId),
    phone: t(f.phone),
    passportNumber: t(f.passportNumber),
    visaNumber: t(f.visaNumber),
  };
}

export function payloadToForm(p: {
  fullName?: string | null;
  dateOfBirth?: string | null;
  nationalId?: string | null;
  phone?: string | null;
  passportNumber?: string | null;
  visaNumber?: string | null;
}): GuestForm {
  return {
    fullName: p.fullName ?? "",
    dob: isoToDmy(p.dateOfBirth),
    nationalId: p.nationalId ?? "",
    phone: p.phone ?? "",
    passportNumber: p.passportNumber ?? "",
    visaNumber: p.visaNumber ?? "",
  };
}

export interface GuestRules {
  /** Số thứ tự hiển thị trong thông báo lỗi ("Khách 2"); bỏ trống khi dùng cho thân nhân. */
  label?: string;
  /** Khách 1 (người đặt) bắt buộc có số điện thoại. */
  requirePhone?: boolean;
  /** Tour nước ngoài: bắt buộc số hộ chiếu + số visa. */
  requireVisa?: boolean;
  /** Ngày tính tuổi (ngày khởi hành); mặc định hôm nay. */
  refDate?: Date;
}

/** Trả về câu báo lỗi đầu tiên, hoặc null nếu hợp lệ. */
export function validateGuestForm(f: GuestForm, rules: GuestRules = {}): string | null {
  const who = rules.label ? `${rules.label}: ` : "";
  if (!f.fullName.trim()) return `${who}vui lòng nhập họ và tên.`;
  const iso = dmyToIso(f.dob);
  if (!iso) return `${who}ngày sinh không hợp lệ (nhập theo dạng DD/MM/YYYY).`;
  const age = ageOn(iso, rules.refDate);
  if (age === null) return `${who}ngày sinh không hợp lệ.`;
  if (age >= 14 && !f.nationalId.trim()) return `${who}vui lòng nhập số CCCD (từ đủ 14 tuổi).`;
  if (rules.requirePhone && !f.phone.trim()) return `${who}vui lòng nhập số điện thoại người đặt tour.`;
  if (rules.requireVisa) {
    if (!f.passportNumber.trim()) return `${who}tour nước ngoài cần số hộ chiếu.`;
    if (!f.visaNumber.trim()) return `${who}tour nước ngoài cần số visa.`;
  }
  return null;
}

/** Che CCCD: chỉ hiện 4 số cuối. */
export const maskId = (id?: string | null): string => (id ? `••••••${id.slice(-4)}` : "");
