// services/chatbot.ts
// Chatbot bttAI (FastAPI ở D:\ChatBot) — backend riêng, không phải NestJS/Laravel.
// Xem docs/COLLAB.md mục "Hợp đồng API".
import axios, { AxiosError } from "axios";
import { getItem } from "@/utils/storage";

const CHATBOT_BASE_URL = (process.env.EXPO_PUBLIC_CHATBOT_URL ?? "").trim().replace(/\/+$/, "");

export const isChatbotConfigured = CHATBOT_BASE_URL.length > 0;

export interface ChatTour {
  tour_key: string;
  id: string;
  ten: string;
  gia: number | null;
  so_ngay: number;
  /** `YYYY-MM-DD`, có thể nhiều ngày ngăn cách bằng dấu phẩy — luôn lấy ngày đầu tiên. */
  ngay_khoi_hanh: string;
  so_cho_con: number;
  anh: string | null;
  url: string;
  diem_den: string;
  loai_hinh: string;
}

export interface ChatHandoff {
  zalo_url: string;
  tom_tat: string;
}

/** Nút bấm chatbot trả về trong luồng đặt tour. */
export interface ChatChoice {
  id: string;
  label: string;
}

/** Nút bấm gửi lên server (`values` dùng cho nút chọn nhiều, vd người đi cùng). */
export interface ChatAction {
  id: string;
  values?: string[];
}

/** Chatbot đã đặt tour xong ngay trong khung chat; app chỉ mở trang trạng thái đơn. */
export interface ChatBooking {
  /** Mã đơn vừa đặt; mỗi app tự mở trang trạng thái đơn của mình từ mã này. */
  booking_id: string;
}

export interface ChatReply {
  reply: string;
  tours: ChatTour[];
  goi_y: string[];
  handoff?: ChatHandoff;
  choices?: ChatChoice[];
  /** Cho phép chọn nhiều nút rồi bấm xác nhận (tối đa `toi_da`). */
  multi?: boolean;
  toi_da?: number;
  booking?: ChatBooking;
}

export type ChatbotErrorKind = "config" | "auth" | "timeout" | "network" | "server";

export class ChatbotError extends Error {
  kind: ChatbotErrorKind;
  status?: number;

  constructor(kind: ChatbotErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ChatbotError";
    this.kind = kind;
    this.status = status;
  }
}

// AI trả lời chậm nên timeout dài hơn các API khác (10s).
const chatbotAxios = axios.create({ timeout: 30000 });

// Token đọc lại ở MỖI request (có thể đã được refresh bởi interceptor NestJS). Không log token.
chatbotAxios.interceptors.request.use(async (config) => {
  const token = await getItem("accessToken");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

function toChatbotError(error: unknown): ChatbotError {
  const err = error as AxiosError;
  const status = err.response?.status;
  if (status === 401) {
    return new ChatbotError("auth", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", 401);
  }
  if (status) {
    return new ChatbotError("server", "Máy chủ trợ lý đang gặp sự cố, bạn thử lại sau ít phút nhé.", status);
  }
  if (err.code === "ECONNABORTED") {
    return new ChatbotError("timeout", "Trợ lý trả lời quá lâu. Bạn thử lại nhé.");
  }
  return new ChatbotError("network", "Mình chưa kết nối được. Bạn kiểm tra mạng rồi thử lại nhé.");
}

export async function sendChatMessage(
  message: string,
  conversationId: string,
  action?: ChatAction,
): Promise<ChatReply> {
  if (!isChatbotConfigured) {
    throw new ChatbotError("config", "Trợ lý chưa được cấu hình địa chỉ máy chủ.");
  }
  try {
    const res = await chatbotAxios.post<ChatReply>(`${CHATBOT_BASE_URL}/chat`, {
      message,
      conversation_id: conversationId,
      ...(action ? { action } : {}),
    });
    const data = res.data;
    return {
      reply: data.reply ?? "",
      tours: Array.isArray(data.tours) ? data.tours : [],
      goi_y: Array.isArray(data.goi_y) ? data.goi_y : [],
      handoff: data.handoff,
      choices: Array.isArray(data.choices) ? data.choices : undefined,
      multi: data.multi,
      toi_da: data.toi_da,
      booking: data.booking,
    };
  } catch (error) {
    throw toChatbotError(error);
  }
}

/** Xoá lịch sử cuộc trò chuyện trên server. Người gọi tự bỏ qua lỗi mạng. */
export async function deleteConversation(conversationId: string): Promise<void> {
  if (!isChatbotConfigured) return;
  try {
    await chatbotAxios.delete(`${CHATBOT_BASE_URL}/chat/${conversationId}`);
  } catch (error) {
    throw toChatbotError(error);
  }
}
