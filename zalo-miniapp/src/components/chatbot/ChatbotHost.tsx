import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AlertDialog from "@/components/AlertDialog";
import ChatbotFloatingButton from "@/components/chatbot/ChatbotFloatingButton";
import ChatMiniBar from "@/components/chatbot/ChatMiniBar";
import ChatSheet from "@/components/chatbot/ChatSheet";
import { firstDepartureDate } from "@/components/chatbot/ChatTourCard";
import { useChatbot } from "@/context/ChatbotContext";
import type { ChatBooking, ChatTour } from "@/services/chatbot";

/**
 * Gắn MỘT lần ở App.tsx: nút nổi + khung chat + thanh thu nhỏ dùng chung cho mọi trang. Giữ cả hộp
 * thoại cảnh báo ở đây (ngoài khung chat) để không bị che khi khung đã thu nhỏ.
 */
export default function ChatbotHost() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sheetVisible, minimize, registerCheckoutHandler } = useChatbot();
  const [alertVisible, setAlertVisible] = useState(false);
  const [checkoutAlert, setCheckoutAlert] = useState<string | null>(null);

  // Nút Back của máy / chuyển trang trong lúc khung chat đang mở → thu nhỏ khung chat (không để nó
  // phủ lên trang mới). Bỏ qua lần render đầu.
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== firstPath.current) {
      firstPath.current = pathname;
      if (sheetVisible) minimize();
    }
  }, [pathname, sheetVisible, minimize]);

  const openTour = (tour: ChatTour) => {
    if (!tour.tour_key) {
      setAlertVisible(true);
      return;
    }
    const date = firstDepartureDate(tour.ngay_khoi_hanh);
    minimize();
    // Mở trang tour với ĐÚNG đợt khởi hành ghi trên thẻ (trang tour tự chọn sẵn đợt khớp ngày).
    const query = date ? `?searchDateMode=specific&searchSpecificDate=${date}` : "";
    navigate(`/tour/${encodeURIComponent(tour.tour_key)}${query}`);
  };

  /**
   * Chatbot đã tự đặt tour xong trong khung chat (backend tạo booking luôn), nên ở đây chỉ mở trang
   * TRẠNG THÁI ĐƠN của đúng đơn vừa đặt — giống bấm vào đơn trong trang Lịch sử.
   */
  const openBooking = useCallback(
    (b: ChatBooking) => {
      if (!b.booking_id) {
        setCheckoutAlert("Bạn xem đơn vừa đặt trong trang “Lịch sử” giúp mình nhé.");
        return;
      }
      minimize();
      navigate(`/booking-detail/${b.booking_id}`);
    },
    [minimize, navigate],
  );

  useEffect(() => {
    registerCheckoutHandler(openBooking);
    return () => registerCheckoutHandler(null);
  }, [registerCheckoutHandler, openBooking]);

  return (
    <>
      <ChatbotFloatingButton />
      <ChatSheet onTourPress={openTour} onOpenBooking={openBooking} />
      <ChatMiniBar />
      <AlertDialog
        visible={alertVisible}
        type="warning"
        title="Chưa mở được tour"
        message="Thông tin tour này chưa đầy đủ. Bạn hỏi lại trợ lý hoặc tìm tour trong tab Du lịch nhé."
        onClose={() => setAlertVisible(false)}
      />
      <AlertDialog
        visible={!!checkoutAlert}
        type="warning"
        title="Chưa mở được trang booking"
        message={checkoutAlert ?? ""}
        onClose={() => setCheckoutAlert(null)}
      />
    </>
  );
}
