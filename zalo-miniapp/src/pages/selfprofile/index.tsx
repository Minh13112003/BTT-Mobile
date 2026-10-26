import React, { useEffect, useRef, useState } from "react";
import { Page, Spinner } from "zmp-ui";

import AlertDialog, { AlertType } from "@/components/AlertDialog";
import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import SubPageHeader from "@/components/SubPageHeader";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getMe, updateAvatar, updateProfile } from "@/services/user";
import { getItem, setItem } from "@/utils/storage";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

type Gender = "MALE" | "FEMALE" | "OTHER";
const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

/** ISO (2026-05-20 hoặc 2026-05-20T00:00:00Z) -> DD/MM/YYYY. */
function isoToDmy(iso?: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/** DD/MM/YYYY -> YYYY-MM-DD; null nếu rỗng, undefined nếu sai định dạng/ngày không có thật. */
function dmyToIso(dmy: string): string | null | undefined {
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
function maskDate(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Nhãn ô nhập. Khai báo ở ngoài trang: component định nghĩa trong thân trang sẽ bị tạo lại mỗi lần gõ phím và làm ô nhập mất focus. */
function Label({ children, hint }: { children: string; hint?: string }) {
  const { theme } = useTheme();
  const textMuted = theme === "dark" ? "#94A3B8" : "#64748B";
  return (
    <div className="flex items-baseline" style={{ marginBottom: 6, paddingLeft: 4 }}>
      <span className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: textMuted }}>
        {children}
      </span>
      {hint ? <span style={{ marginLeft: 8, fontSize: FONT_SIZE.xxs, color: textMuted }}>{hint}</span> : null}
    </div>
  );
}

/** Khối thẻ có tiêu đề (cũng khai báo ngoài trang vì lý do trên). */
function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      style={{
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        background: isDark ? "rgba(30,41,59,0.9)" : "#FFFFFF",
        border: `1px solid ${isDark ? "rgba(51,65,85,0.5)" : "#F1F5F9"}`,
      }}
    >
      <div className="flex items-center" style={{ marginBottom: 16 }}>
        <span className="font-black" style={{ fontSize: FONT_SIZE.xs, color: isDark ? "#F1F5F9" : "#1E293B" }}>
          {title}
        </span>
        {badge ? (
          <span className="text-white font-bold" style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "#C2410C", fontSize: FONT_SIZE.xxs }}>
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/**
 * Port từ app/(root)/(profile)/selfprofile.tsx (bản thiết kế lại): ảnh đại diện có nút máy ảnh,
 * Thông tin cơ bản (họ, tên, ngày sinh, giới tính), Liên hệ (SĐT chỉ đọc, email), Giấy tờ tuỳ thân
 * (CCCD, hộ chiếu + ngày hết hạn) — lưu cả vào NestJS. Đổi mật khẩu/PIN nằm ở trang "Mật khẩu & mã PIN".
 */
export default function SelfProfilePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [focused, setFocused] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<{ title: string; message: string; type: AlertType } | null>(null);

  const fillForm = (u: any) => {
    setFirstName(u?.firstName ?? "");
    setLastName(u?.lastName ?? "");
    setDob(isoToDmy(u?.dateOfBirth));
    setGender((u?.gender as Gender) ?? null);
    setEmail(u?.email ?? "");
    setNationalId(u?.nationalId ?? "");
    setPassportNumber(u?.passportNumber ?? "");
    setPassportExpiry(isoToDmy(u?.passportExpiry));
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Luôn gọi API: cache cũ có thể thiếu các trường mới (ngày sinh, CCCD, hộ chiếu).
        const res = await getMe();
        const data = (res.data as any)?.user || res.data;
        if (data) {
          await setItem("user_profile", JSON.stringify(data));
          setProfile(data);
          fillForm(data);
          return;
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
      }
      try {
        const cached = await getItem("user_profile");
        const data = cached ? JSON.parse(cached) : user;
        setProfile(data);
        fillForm(data);
      } catch {
        fillForm(user);
      }
    };
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayUser = profile || user;
  const avatarUri = localAvatarUrl ?? displayUser?.avatarUrl ?? null;
  const initials = `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase() || "BT";

  const handleSave = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Vui lòng nhập đầy đủ Họ, Tên và Email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không đúng định dạng.");
      return;
    }
    const dobIso = dmyToIso(dob);
    if (dobIso === undefined) {
      setError("Ngày sinh không hợp lệ. Nhập theo dạng DD/MM/YYYY.");
      return;
    }
    // [TẠM TẮT — chủ dự án chưa cần CCCD/hộ chiếu] không kiểm tra, cũng KHÔNG gửi 3 trường này (gửi null sẽ xoá dữ liệu đã lưu)
    // const expiryIso = dmyToIso(passportExpiry);
    // if (expiryIso === undefined) {
    //   setError("Ngày hết hạn hộ chiếu không hợp lệ. Nhập theo dạng DD/MM/YYYY.");
    //   return;
    // }
    // const nid = nationalId.trim();
    // if (nid && !/^(\d{9}|\d{12})$/.test(nid)) {
    //   setError("Số CCCD gồm 9 hoặc 12 chữ số.");
    //   return;
    // }

    try {
      setSaving(true);
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        dateOfBirth: dobIso,
        gender,
        // nationalId: nid || null,
        // passportNumber: passportNumber.trim() ? passportNumber.trim().toUpperCase() : null,
        // passportExpiry: expiryIso,
      });
      const updated = (res.data as any)?.user || res.data;
      if (updated) {
        await setItem("user_profile", JSON.stringify(updated));
        setProfile(updated);
        fillForm(updated);
      }
      setAlert({ title: "Đã lưu", message: "Thông tin cá nhân của bạn đã được cập nhật.", type: "success" });
    } catch (err: any) {
      const raw = err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin.";
      setError(Array.isArray(raw) ? raw.join(", ") : String(raw));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAlert({ title: "Ảnh không hợp lệ", message: "Vui lòng chọn một file ảnh.", type: "warning" });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setLocalAvatarUrl(previewUrl);
    try {
      setUploadingAvatar(true);
      const res = await updateAvatar(file);
      const updated = (res.data as any)?.user ?? res.data;
      if (updated) {
        await setItem("user_profile", JSON.stringify(updated));
        setProfile(updated);
      }
      setAlert({ title: "Thành công", message: "Ảnh đại diện đã được cập nhật.", type: "success" });
    } catch {
      setAlert({ title: "Lỗi", message: "Không thể tải ảnh lên. Vui lòng thử lại.", type: "error" });
      setLocalAvatarUrl(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const textMain = isDark ? "#F1F5F9" : "#1E293B";
  const textMuted = isDark ? "#94A3B8" : "#64748B";

  const inputWrapStyle = (key: string, readonly = false): React.CSSProperties => ({
    height: 56,
    padding: "0 16px",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    background: readonly ? (isDark ? "rgba(30,41,59,0.5)" : "#F1F5F9") : isDark ? "#1E293B" : "#FFFFFF",
    border: `2px solid ${
      readonly
        ? isDark
          ? "#334155"
          : "#F1F5F9"
        : focused === key
          ? isDark
            ? "#F87171"
            : "#D0021B"
          : isDark
            ? "#334155"
            : "#E2E8F0"
    }`,
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontWeight: 500,
    color: textMain,
    fontSize: FONT_SIZE.xs,
  };

  const field = (
    key: string,
    value: string,
    onChange: (v: string) => void,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    mb = 0,
  ) => (
    <div style={{ ...inputWrapStyle(key), marginBottom: mb }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(key)}
        onBlur={() => setFocused("")}
        style={inputStyle}
        {...props}
      />
    </div>
  );

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
      <SubPageHeader title="Thông tin cá nhân" />

      {loading ? (
        <div className="flex items-center justify-center" style={{ padding: 60 }}>
          <Spinner />
        </div>
      ) : (
        <div style={{ padding: "8px 16px 40px" }}>
          {/* Ảnh đại diện */}
          <div className="flex flex-col items-center" style={{ marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 52,
                  overflow: "hidden",
                  background: "#FDECEE",
                  border: `4px solid ${isDark ? "#334155" : "#FFFFFF"}`,
                  position: "relative",
                }}
              >
                {avatarUri ? (
                  <img src={avatarUri} alt="" style={{ width: 104, height: 104, objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: FONT_SIZE.xxl, fontWeight: 800, color: "#B30014" }}>{initials}</span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
                    <Spinner />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Đổi ảnh đại diện"
                className="absolute flex items-center justify-center"
                style={{ right: -2, bottom: 0, width: 44, height: 44, borderRadius: 22, background: "#D0021B", border: "2px solid #FFFFFF" }}
              >
                <Icon name="camera-outline" size={20} color="#FFFFFF" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: "none" }} />
            </div>
            <div style={{ marginTop: 12, fontSize: FONT_SIZE.xxs, color: textMuted }}>Bấm nút máy ảnh để đổi ảnh đại diện</div>
          </div>

          <Section title="Thông tin cơ bản">
            <div className="flex" style={{ gap: 12, marginBottom: 16 }}>
              <div className="flex-1 min-w-0">
                <Label>Họ</Label>
                {field("first", firstName, setFirstName, { placeholder: "Họ" })}
              </div>
              <div className="flex-1 min-w-0">
                <Label>Tên</Label>
                {field("last", lastName, setLastName, { placeholder: "Tên" })}
              </div>
            </div>

            <Label hint="DD/MM/YYYY">Ngày sinh</Label>
            {field("dob", dob, (t) => setDob(maskDate(t)), { placeholder: "20/05/1990", inputMode: "numeric", maxLength: 10 }, 16)}

            <Label>Giới tính</Label>
            <div className="flex" style={{ gap: 8 }}>
              {GENDERS.map((g) => {
                const active = gender === g.value;
                return (
                  <button
                    key={g.value}
                    onClick={() => setGender(active ? null : g.value)}
                    className="flex-1 font-bold"
                    style={{
                      height: 48,
                      borderRadius: 16,
                      fontSize: FONT_SIZE.xxs,
                      color: active ? "#FFFFFF" : textMuted,
                      background: active ? "#D0021B" : isDark ? "#1E293B" : "#FFFFFF",
                      border: `2px solid ${active ? "#D0021B" : isDark ? "#334155" : "#E2E8F0"}`,
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Liên hệ">
            <Label hint="Đăng nhập bằng số này">Số điện thoại</Label>
            <div style={{ ...inputWrapStyle("phone", true), marginBottom: 16 }}>
              <span style={{ fontSize: FONT_SIZE.xs, color: textMuted }}>{displayUser?.phonenumber || "Chưa có"}</span>
            </div>
            <Label>Email</Label>
            {field("email", email, setEmail, { placeholder: "email@example.com", type: "email", autoCapitalize: "none" })}
          </Section>

          {/* [TẠM TẮT — chủ dự án chưa cần CCCD/hộ chiếu] bỏ comment cả khối để bật lại (cùng 2 khối cùng ghi chú ở handleSave)
          <Section title="Giấy tờ tuỳ thân" badge="Mới">
            <Label>Số CCCD</Label>
            {field("nid", nationalId, (t) => setNationalId(t.replace(/\D/g, "").slice(0, 12)), { placeholder: "12 chữ số", inputMode: "numeric" }, 16)}
            <Label>Số hộ chiếu</Label>
            {field("pp", passportNumber, (t) => setPassportNumber(t.toUpperCase().slice(0, 20)), { placeholder: "C1234567", autoCapitalize: "characters" }, 16)}
            <Label hint="DD/MM/YYYY">Ngày hết hạn</Label>
            {field("ppx", passportExpiry, (t) => setPassportExpiry(maskDate(t)), { placeholder: "15/01/2032", inputMode: "numeric", maxLength: 10 }, 12)}
            <div style={{ lineHeight: "22px", fontSize: FONT_SIZE.xxs, color: textMuted }}>
              Chỉ dùng để làm thủ tục tour (vé máy bay, visa). Hộ chiếu cần còn hạn ít nhất 6 tháng tính từ ngày về.
            </div>
          </Section>
          */}

          {error ? (
            <div
              className="font-medium"
              style={{ padding: 14, borderRadius: 16, marginBottom: 16, background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: FONT_SIZE.xxs }}
            >
              {error}
            </div>
          ) : null}

          <PrimaryButton label="Lưu thay đổi" onClick={handleSave} loading={saving} fullWidth />
        </div>
      )}

      <AlertDialog
        visible={!!alert}
        type={alert?.type}
        title={alert?.title ?? ""}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />
    </Page>
  );
}
