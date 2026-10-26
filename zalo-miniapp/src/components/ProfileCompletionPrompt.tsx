import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Icon from "@/components/Icon";
import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { getPinStatus } from "@/services/pin";
import { getMe } from "@/services/user";

type Item = { key: "email" | "dob" | "pin"; label: string; hint: string; done: boolean };

/** Các trang chưa nên hiện lời nhắc (đang đăng nhập / đang tạo PIN ngay sau đăng nhập). */
const BLOCKED = ["/login", "/forgot-password", "/reset-password", "/setup-pin", "/change-pin"];

/**
 * Port từ components/profile/ProfileCompletionPrompt.tsx — lời nhắc hoàn thiện thông tin ngay SAU KHI ĐĂNG NHẬP
 * (không hiện mỗi lần mở app): nếu tài khoản còn thiếu email / ngày sinh / mã PIN (không nhắc CCCD) thì hiện danh
 * sách còn thiếu; "Điền ngay" -> Thông tin cá nhân (hoặc tạo PIN nếu chỉ thiếu PIN), "Để sau" -> đóng tới lần đăng
 * nhập kế. Gắn một lần ở App.tsx (trong ZMPRouter + AuthGate).
 */
export default function ProfileCompletionPrompt() {
  const { isLoggedIn } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const wasLoggedIn = useRef(isLoggedIn);
  const runId = useRef(0);
  const [pending, setPending] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);

  // Chỉ kích hoạt khi chuyển từ chưa đăng nhập -> đã đăng nhập trong phiên chạy này
  useEffect(() => {
    if (isLoggedIn && !wasLoggedIn.current) setPending(true);
    if (!isLoggedIn) {
      setPending(false);
      setItems(null);
    }
    wasLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  const blocked = BLOCKED.some((p) => pathname.includes(p));

  useEffect(() => {
    if (!pending || blocked) return;
    // Không dùng cờ "alive" trong cleanup: setPending(false) làm effect chạy lại và sẽ tự huỷ kết quả.
    // Thay vào đó so mã lượt chạy + còn đăng nhập hay không.
    const run = ++runId.current;
    setPending(false);
    (async () => {
      const [meRes, pinRes] = await Promise.allSettled([getMe(), getPinStatus()]);
      if (run !== runId.current || !wasLoggedIn.current) return;
      if (meRes.status !== "fulfilled") return; // không lấy được thông tin thì thôi, không làm phiền
      const d: any = meRes.value?.data;
      const me = d?.data ?? d?.user ?? d;
      if (!me) return;
      // Không gọi được trạng thái PIN -> coi như đã có, tránh nhắc sai
      const hasPin = pinRes.status === "fulfilled" ? !!pinRes.value.data?.hasPin : true;
      const list: Item[] = [
        { key: "email", label: "Email", hint: "Nhận xác nhận đặt tour, vé điện tử", done: !!String(me.email ?? "").trim() },
        { key: "dob", label: "Ngày sinh", hint: "Tính giá vé, làm bảo hiểm du lịch", done: !!me.dateOfBirth },
        { key: "pin", label: "Mã PIN 6 số", hint: "Xác nhận mỗi lần đặt tour", done: hasPin },
      ];
      if (list.some((i) => !i.done)) setItems(list);
    })();
  }, [pending, blocked]);

  if (!items) return null;

  const close = () => setItems(null);
  const missingProfile = items.some((i) => !i.done && i.key !== "pin");
  const fillNow = () => {
    close();
    navigate(missingProfile ? "/selfprofile" : "/setup-pin");
  };
  const openTerms = () => {
    close();
    navigate("/terms");
  };

  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#475569";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 3000, padding: 24 }}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 400,
          maxHeight: "100%",
          overflowY: "auto",
          padding: 20,
          borderRadius: RADIUS.xl,
          background: isDark ? "#1E222B" : "#FFFFFF",
          border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          className="flex items-center justify-center mx-auto"
          style={{ width: 56, height: 56, borderRadius: 28, marginBottom: 12, background: isDark ? "#2D1B1B" : "#FFF1F2" }}
        >
          <Icon name="person-circle-outline" size={32} color="#D0021B" />
        </div>
        <div className="font-black text-center" style={{ fontSize: FONT_SIZE.xl, color: textMain }}>
          Hoàn thiện thông tin để đặt tour dễ hơn
        </div>
        <div className="text-center" style={{ margin: "6px 0 16px", fontSize: FONT_SIZE.xs, lineHeight: "20px", color: textSub }}>
          Tài khoản của bạn còn thiếu vài thông tin. Điền một lần, các lần đặt tour sau ứng dụng sẽ tự điền giúp bạn.
        </div>

        {items.map((i) => (
          <div key={i.key} className="flex items-center" style={{ padding: "8px 0" }}>
            <Icon name={i.done ? "checkmark-circle" : "ellipse-outline"} size={20} color={i.done ? "#10B981" : "#D0021B"} />
            <div className="flex-1" style={{ marginLeft: 10, minWidth: 0 }}>
              <div className="font-bold" style={{ fontSize: FONT_SIZE.sm, color: textMain }}>
                {i.label}
              </div>
              <div style={{ fontSize: FONT_SIZE.xs, color: textSub }}>{i.hint}</div>
            </div>
            <span className="font-semibold" style={{ fontSize: FONT_SIZE.xs, color: i.done ? "#10B981" : "#D0021B" }}>
              {i.done ? "Đã có" : "Còn thiếu"}
            </span>
          </div>
        ))}

        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 16, background: isDark ? "#0F172A" : "#F8FAFC" }}>
          <div style={{ fontSize: FONT_SIZE.xs, lineHeight: "19px", color: textSub }}>
            Thông tin bạn cung cấp chỉ dùng để phục vụ việc đặt tour và làm thủ tục cho chuyến đi, không dùng vào mục đích khác (Điều
            2, Điều khoản & chính sách).{" "}
            <button onClick={openTerms} className="font-bold" style={{ color: "#D0021B", fontSize: FONT_SIZE.xs }}>
              Xem điều khoản
            </button>
          </div>
        </div>

        <div className="flex" style={{ marginTop: 16, gap: 10 }}>
          <button
            onClick={close}
            className="flex-1 font-bold"
            style={{
              height: 46,
              borderRadius: 16,
              fontSize: FONT_SIZE.sm,
              background: isDark ? "#334155" : "#F1F5F9",
              color: isDark ? "#CBD5E1" : "#475569",
            }}
          >
            Để sau
          </button>
          <div className="flex-1">
            <PrimaryButton label="Điền ngay" onClick={fillNow} fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
}
