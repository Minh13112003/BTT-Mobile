import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

import AlertDialog, { AlertType } from "@/components/AlertDialog";
import SubPageHeader from "@/components/SubPageHeader";
import { useTheme } from "@/context/ThemeContext";
import { changePin, setPin, verifyPin } from "@/services/pin";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import logoUrl from "@/static/Logo_BTT-2024.png";

const PIN_LENGTH = 6;
const KEYPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "DEL"],
];

type Mode = "setup" | "change";
type Step = "current" | "new" | "confirm";

const STEP_TEXT: Record<Step, { title: string; subtitle: string }> = {
  current: { title: "Xác minh PIN hiện tại", subtitle: "Nhập mã PIN 6 chữ số hiện tại để xác minh" },
  new: { title: "Nhập mã PIN mới", subtitle: "Chọn mã PIN 6 chữ số dễ nhớ cho bạn" },
  confirm: { title: "Nhập lại mã PIN để xác nhận", subtitle: "Nhập lại mã PIN vừa tạo để xác nhận" },
};

/**
 * Tạo / đổi mã PIN 6 số (gộp setup-pin.tsx + change-pin.tsx bên app RN): bàn phím số tự vẽ, 6 chấm
 * hiển thị, rung khi sai. `setup`: nhập → nhập lại; `change`: PIN hiện tại → PIN mới → nhập lại.
 * Mã PIN dùng để xác nhận khi đặt tour; không bao giờ ghi vào log.
 */
function PinFlow({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [step, setStep] = useState<Step>(mode === "change" ? "current" : "new");
  const [values, setValues] = useState<Record<Step, string>>({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; type: AlertType } | null>(null);
  const afterAlert = useRef<() => void>(() => {});

  const active = values[step];
  const setValue = (s: Step, v: string) => setValues((prev) => ({ ...prev, [s]: v }));

  const showAlert = (title: string, message: string, type: AlertType, onClosed?: () => void) => {
    afterAlert.current = onClosed ?? (() => {});
    setAlert({ title, message, type });
  };

  const shake = (cb?: () => void) => {
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      cb?.();
    }, 320);
  };

  const restartNew = () => {
    setValues((prev) => ({ ...prev, new: "", confirm: "" }));
    setStep("new");
  };

  const verifyCurrent = async (pin: string) => {
    try {
      setLoading(true);
      await verifyPin(pin);
      setStep("new");
    } catch {
      shake(() => {
        setValue("current", "");
        showAlert("PIN không đúng", "Mã PIN hiện tại không chính xác. Vui lòng thử lại.", "error");
      });
    } finally {
      setLoading(false);
    }
  };

  const checkNew = (pin: string) => {
    if (mode === "change" && pin === values.current) {
      shake(() => {
        setValue("new", "");
        showAlert("PIN trùng nhau", "Mã PIN mới không được trùng với mã PIN hiện tại. Vui lòng chọn PIN khác.", "warning");
      });
      return;
    }
    setStep("confirm");
  };

  const submit = async (confirmed: string) => {
    if (confirmed !== values.new) {
      shake(() => {
        setValue("confirm", "");
        showAlert("Không khớp", "Mã PIN nhập lại không khớp. Vui lòng nhập lại PIN mới.", "error", restartNew);
      });
      return;
    }
    try {
      setLoading(true);
      if (mode === "change") await changePin(values.current, values.new);
      else await setPin(values.new);
      showAlert(
        "Thành công",
        mode === "change" ? "Mã PIN đã được đổi thành công." : "Mã PIN đã được thiết lập thành công! Bạn sẽ cần nhập PIN khi đặt tour.",
        "success",
        () => navigate(-1),
      );
    } catch (e: any) {
      showAlert("Lỗi", e?.response?.data?.message || "Không thể lưu mã PIN. Vui lòng thử lại.", "error", () => {
        if (mode === "change") {
          setValues({ current: "", new: "", confirm: "" });
          setStep("current");
        } else {
          restartNew();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const onKey = (key: string) => {
    if (loading || shaking) return;
    if (key === "DEL") {
      setValue(step, active.slice(0, -1));
      return;
    }
    if (!key || active.length >= PIN_LENGTH) return;
    const next = active + key;
    setValue(step, next);
    if (next.length !== PIN_LENGTH) return;
    if (step === "current") setTimeout(() => verifyCurrent(next), 200);
    else if (step === "new") setTimeout(() => checkNew(next), 200);
    else submit(next);
  };

  const textColor = isDark ? "#F1F5F9" : "#1E293B";
  const mutedColor = isDark ? "#64748B" : "#94A3B8";
  const dotActive = isDark ? "#93C5FD" : "#D0021B";
  const dotInactive = isDark ? "#334155" : "#E2E8F0";
  const keyBg = isDark ? "#1E293B" : "#F8FAFC";
  const keyBorder = isDark ? "#334155" : "#E2E8F0";

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
      <SubPageHeader title={mode === "change" ? "Đổi mã PIN" : "Thiết lập mã PIN"} />

      <div className="flex flex-col items-center" style={{ padding: "24px 24px 40px" }}>
        <img src={logoUrl} alt="" style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 20 }} />
        <div className="font-black text-center" style={{ fontSize: FONT_SIZE.md, color: textColor, marginBottom: 6 }}>
          {STEP_TEXT[step].title}
        </div>
        <div className="text-center" style={{ fontSize: FONT_SIZE.xs, color: mutedColor, marginBottom: 28 }}>
          {STEP_TEXT[step].subtitle}
        </div>

        <div
          className="flex"
          style={{ gap: 14, marginBottom: 36, transform: shaking ? "translateX(8px)" : "none", transition: "transform 0.08s" }}
          aria-label={`Đã nhập ${active.length} trên ${PIN_LENGTH} số`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              style={{ width: 18, height: 18, borderRadius: 9, background: i < active.length ? dotActive : dotInactive }}
            />
          ))}
        </div>

        <div style={{ width: "100%", maxWidth: 320 }}>
          {KEYPAD.map((row, r) => (
            <div key={r} className="flex justify-between" style={{ marginBottom: 14 }}>
              {row.map((k, c) =>
                k === "" ? (
                  <span key={c} style={{ width: 84, height: 64 }} />
                ) : (
                  <button
                    key={c}
                    onClick={() => onKey(k)}
                    aria-label={k === "DEL" ? "Xoá" : k}
                    className="font-black"
                    style={{
                      width: 84,
                      height: 64,
                      borderRadius: 20,
                      background: keyBg,
                      border: `1px solid ${keyBorder}`,
                      color: textColor,
                      fontSize: FONT_SIZE.xl,
                    }}
                  >
                    {k === "DEL" ? "⌫" : k}
                  </button>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertDialog
        visible={!!alert}
        type={alert?.type}
        title={alert?.title ?? ""}
        message={alert?.message}
        onClose={() => {
          setAlert(null);
          afterAlert.current();
        }}
      />
    </Page>
  );
}

export default function PinPage() {
  const { pathname } = useLocation();
  return <PinFlow key={pathname} mode={pathname === "/change-pin" ? "change" : "setup"} />;
}
