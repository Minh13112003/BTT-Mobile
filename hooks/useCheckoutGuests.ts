import { getRelatives, Relative } from "@/services/relative";
import { getMe } from "@/services/user";
import { emptyGuest, GuestForm, payloadToForm } from "@/utils/guest";
import { useCallback, useEffect, useState } from "react";

/**
 * State thông tin từng hành khách ở màn thanh toán.
 * - Số thẻ luôn bằng `total` (người lớn + trẻ em + em bé); tăng thì thêm thẻ trống, giảm thì cắt bớt.
 * - Khách 1 = người đặt: tự điền từ Thông tin cá nhân (chỉ lần đầu, người dùng sửa được cho riêng chuyến này).
 * - Từ khách 2: chọn từ thân nhân (điền sẵn, vẫn sửa được) hoặc nhập tay (có thể tick lưu vào thân nhân).
 */
export function useCheckoutGuests(total: number, prefillRelativeIds: string[] = []) {
  const [guests, setGuests] = useState<GuestForm[]>([emptyGuest()]);
  /** id thân nhân đã chọn cho từng khách (null = nhập tay). */
  const [picked, setPicked] = useState<(string | null)[]>([null]);
  const [saveFlags, setSaveFlags] = useState<boolean[]>([false]);
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [relativesError, setRelativesError] = useState(false);

  // Đồng bộ số thẻ với số khách
  useEffect(() => {
    const fit = <T,>(arr: T[], make: () => T): T[] =>
      arr.length === total ? arr : arr.length > total ? arr.slice(0, total) : [...arr, ...Array.from({ length: total - arr.length }, make)];
    setGuests((g) => fit(g, emptyGuest));
    setPicked((p) => fit(p, () => null));
    setSaveFlags((s) => fit(s, () => false));
  }, [total]);

  // Tải thân nhân + thông tin chính chủ (một lần)
  useEffect(() => {
    let alive = true;
    (async () => {
      const [rel, me] = await Promise.allSettled([getRelatives(), getMe()]);
      if (!alive) return;
      if (rel.status === "fulfilled") {
        const list = rel.value.data ?? [];
        setRelatives(list);
        // Điền sẵn thân nhân do chatbot chọn: người lớn tuổi xếp trước (rơi vào ô người lớn), trẻ nhỏ xếp sau.
        const chosen = prefillRelativeIds
          .map((id) => list.find((r) => r.id === id))
          .filter((r): r is Relative => !!r)
          .sort((a, b) => a.dateOfBirth.localeCompare(b.dateOfBirth));
        if (chosen.length > 0) {
          setGuests((g) => g.map((x, idx) => (idx >= 1 && idx <= chosen.length ? payloadToForm(chosen[idx - 1]) : x)));
          setPicked((p) => p.map((x, idx) => (idx >= 1 && idx <= chosen.length ? chosen[idx - 1].id : x)));
        }
      } else setRelativesError(true);
      if (me.status === "fulfilled") {
        const u = (me.value.data as any)?.user || me.value.data;
        if (u) {
          const owner = payloadToForm({
            fullName: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
            dateOfBirth: u.dateOfBirth,
            nationalId: u.nationalId,
            phone: u.phonenumber,
            passportNumber: u.passportNumber,
          });
          // Chỉ điền khi khách 1 còn trống để không ghi đè nếu người dùng đã gõ
          setGuests((g) => (g[0] && !g[0].fullName && !g[0].dob ? [owner, ...g.slice(1)] : g));
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((i: number, patch: Partial<GuestForm>) => {
    setGuests((g) => g.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }, []);

  const pick = useCallback((i: number, rel: Relative | null) => {
    setPicked((p) => p.map((x, idx) => (idx === i ? rel?.id ?? null : x)));
    setSaveFlags((s) => s.map((x, idx) => (idx === i ? false : x)));
    setGuests((g) => g.map((x, idx) => (idx === i ? (rel ? payloadToForm(rel) : emptyGuest()) : x)));
  }, []);

  const setSave = useCallback((i: number, v: boolean) => {
    setSaveFlags((s) => s.map((x, idx) => (idx === i ? v : x)));
  }, []);

  return { guests, picked, saveFlags, relatives, relativesError, update, pick, setSave };
}

export type CheckoutGuests = ReturnType<typeof useCheckoutGuests>;
