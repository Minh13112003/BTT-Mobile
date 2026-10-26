import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import ChatMiniBar from "@/components/chatbot/ChatMiniBar";
import ChatSheet from "@/components/chatbot/ChatSheet";
import { firstDepartureDate, formatChatDuration } from "@/components/chatbot/ChatTourCard";
import CustomAlert from "@/components/CustomAlert";
import { useChatbot } from "@/context/Chatbot_Context";
import type { ChatBooking, ChatTour } from "@/services/chatbot";

/**
 * Gắn MỘT lần ở root layout: khung chat + thanh thu nhỏ dùng chung cho mọi màn hình.
 * Giữ cả `CustomAlert` ở đây (ngoài khung chat) để không bị che khi khung đã thu nhỏ.
 */
export default function ChatbotHost() {
  const router = useRouter();
  const { sheetVisible, minimize, registerCheckoutHandler } = useChatbot();
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  // Android: nút Back đóng (thu nhỏ) khung chat chứ không thoát màn hình.
  useEffect(() => {
    if (!sheetVisible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      minimize();
      return true;
    });
    return () => sub.remove();
  }, [sheetVisible, minimize]);

  const openTour = (tour: ChatTour) => {
    if (!tour.tour_key) {
      setAlert({
        title: "Chưa mở được tour",
        message: "Thông tin tour này chưa đầy đủ. Bạn hỏi lại trợ lý hoặc tìm tour trong tab Du lịch nhé.",
      });
      return;
    }
    const date = firstDepartureDate(tour.ngay_khoi_hanh);
    minimize();
    router.push({
      pathname: "/(root)/tour/[id]",
      params: {
        id: tour.tour_key,
        name: tour.ten,
        imageUrl: tour.anh ?? "",
        price: String(tour.gia ?? 0),
        duration: formatChatDuration(tour.so_ngay),
        rating: "0",
        reviewsCount: "0",
        hasVat: "false",
        searchDateMode: date ? "specific" : "",
        searchSpecificDate: date,
      },
    });
  };

  /**
   * Chatbot đã tự đặt tour xong trong khung chat (backend tạo booking luôn), nên ở đây chỉ việc mở trang
   * TRẠNG THÁI ĐƠN của đúng đơn vừa đặt — giống bấm "Chi tiết đơn" trong tab Lịch sử.
   */
  const openBooking = useCallback(
    (b: ChatBooking) => {
      if (!b.booking_id) {
        setAlert({ title: "Chưa mở được đơn", message: "Bạn xem đơn vừa đặt trong tab “Lịch sử” giúp mình nhé." });
        return;
      }
      minimize();
      router.push({ pathname: "/detailTour" as any, params: { id: b.booking_id } });
    },
    [minimize, router],
  );

  useEffect(() => {
    registerCheckoutHandler(openBooking);
    return () => registerCheckoutHandler(null);
  }, [registerCheckoutHandler, openBooking]);

  return (
    <>
      <ChatSheet onTourPress={openTour} onOpenBooking={openBooking} />
      <ChatMiniBar />
      <CustomAlert
        visible={!!alert}
        type="warning"
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        onClose={() => setAlert(null)}
      />
    </>
  );
}
