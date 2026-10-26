import { getShadow, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { getPinStatus } from "@/services/pin";
import { getMe } from "@/services/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type Item = { key: "email" | "dob" | "pin"; label: string; hint: string; done: boolean };

/** Các màn chưa nên hiện lời nhắc (đang đăng nhập / đang tạo PIN ngay sau đăng nhập). */
const BLOCKED = ["login", "forgot-password", "reset-password", "setup-pin", "change-pin"];

/**
 * Lời nhắc hoàn thiện thông tin ngay SAU KHI ĐĂNG NHẬP (không hiện mỗi lần mở app):
 * nếu tài khoản còn thiếu email / ngày sinh / mã PIN (không nhắc CCCD: khách ít muốn nhập, nhập lúc đặt tour) thì hiện danh sách còn thiếu,
 * "Điền ngay" -> Thông tin cá nhân (hoặc tạo PIN nếu chỉ thiếu PIN), "Để sau" -> đóng tới lần đăng nhập kế.
 * Gắn một lần ở app/(root)/_layout.tsx (trong AuthProvider).
 */
export default function ProfileCompletionPrompt() {
  const { isLoggedIn } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const pathname = usePathname();

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
    router.push((missingProfile ? "/(root)/(profile)/selfprofile" : "/(root)/(profile)/setup-pin") as any);
  };
  const openTerms = () => {
    close();
    router.push("/(root)/(profile)/terms" as any);
  };

  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#475569";

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          className="w-full p-5"
          style={[
            { maxWidth: 400, backgroundColor: isDark ? "#1E222B" : "#FFFFFF", borderWidth: 1, borderColor: isDark ? "#334155" : "#E2E8F0", borderRadius: RADIUS.xl },
            getShadow(isDark, "lg"),
          ]}
        >
          <View className="w-14 h-14 rounded-full items-center justify-center self-center mb-3" style={{ backgroundColor: isDark ? "#2D1B1B" : "#FFF1F2" }}>
            <Ionicons name="person-circle-outline" size={32} color="#D0021B" />
          </View>
          <Text className="font-black text-center" style={{ color: textMain, fontSize: FONT_SIZE.xl }}>
            Hoàn thiện thông tin để đặt tour dễ hơn
          </Text>
          <Text className="text-center mt-1.5 mb-4" style={{ color: textSub, fontSize: FONT_SIZE.xs, lineHeight: 20 }}>
            Tài khoản của bạn còn thiếu vài thông tin. Điền một lần, các lần đặt tour sau ứng dụng sẽ tự điền giúp bạn.
          </Text>

          {items.map((i) => (
            <View key={i.key} className="flex-row items-center py-2">
              <Ionicons
                name={i.done ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={i.done ? "#10B981" : "#D0021B"}
              />
              <View className="flex-1 ml-2.5">
                <Text className="font-bold" style={{ color: textMain, fontSize: FONT_SIZE.sm }}>
                  {i.label}
                </Text>
                <Text style={{ color: textSub, fontSize: FONT_SIZE.xs }}>{i.hint}</Text>
              </View>
              <Text className="font-semibold" style={{ color: i.done ? "#10B981" : "#D0021B", fontSize: FONT_SIZE.xs }}>
                {i.done ? "Đã có" : "Còn thiếu"}
              </Text>
            </View>
          ))}

          <View className="rounded-2xl px-3.5 py-3 mt-3" style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
            <Text style={{ color: textSub, fontSize: FONT_SIZE.xs, lineHeight: 19 }}>
              Thông tin bạn cung cấp chỉ dùng để phục vụ việc đặt tour và làm thủ tục cho chuyến đi, không dùng vào mục đích khác (Điều 2, Điều khoản & chính sách).{" "}
              <Text className="font-bold text-[#D0021B]" onPress={openTerms} accessibilityRole="link">
                Xem điều khoản
              </Text>
            </Text>
          </View>

          <View className="flex-row mt-4" style={{ gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={close}
              className="flex-1 items-center justify-center rounded-2xl"
              style={{ height: 46, backgroundColor: isDark ? "#334155" : "#F1F5F9" }}
            >
              <Text className="font-bold" style={{ color: isDark ? "#CBD5E1" : "#475569", fontSize: FONT_SIZE.sm }}>
                Để sau
              </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={fillNow} className="flex-1">
              <LinearGradient
                colors={isDark ? ["#7F1D1D", "#991B1B"] : ["#D0021B", "#B30118"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center" }}
              >
                <Text className="font-bold text-white" style={{ fontSize: FONT_SIZE.sm }}>
                  Điền ngay
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
