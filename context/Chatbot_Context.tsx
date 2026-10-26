import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/Auth_Context";
import {
  ChatAction,
  ChatbotError,
  ChatChoice,
  ChatBooking,
  ChatHandoff,
  ChatTour,
  deleteConversation,
  sendChatMessage,
} from "@/services/chatbot";

export const CHAT_GREETING =
  "Xin chào! Mình là bttAI, trợ lý tour của BenThanh Tourist. Bạn muốn đi đâu, vào tháng nào và ngân sách khoảng bao nhiêu?";

export const CHAT_STARTER_CHIPS = [
  "Có tour nào độc lạ, ít người biết không?",
  "Tour trong nước giá tốt",
  "Tour nước ngoài đang có",
  "Tour phù hợp đi cùng gia đình có trẻ nhỏ",
];

const MAX_MESSAGES = 50;
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

// Server trả câu chặn spam như một `reply` bình thường (xem database.py::kiem_tra_rate_limit).
const LIMIT_PHRASES = ["hỏi hơi nhiều", "giới hạn số câu hỏi", "thao tác hơi nhanh"];

export type ChatMessageKind = "text" | "error" | "limit" | "clear";

export interface ChatMessage {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
  at: number;
  kind: ChatMessageKind;
  tours?: ChatTour[];
  goiY?: string[];
  handoff?: ChatHandoff;
  /** Nút bấm của luồng đặt tour; `answered` = khách đã bấm (các nút bị khoá). */
  choices?: ChatChoice[];
  multi?: boolean;
  toiDa?: number;
  answered?: boolean;
  /** Chatbot dẫn khách tới trang booking (giữ lại để khách mở lại nếu cần). */
  booking?: ChatBooking;
  /** Chỉ có ở tin lỗi: nội dung cần gửi lại khi bấm "Thử lại". */
  retryText?: string;
  retryAction?: ChatAction;
}

interface StoredChat {
  conversationId: string;
  messages: ChatMessage[];
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isMinimized: boolean;
  /** Khung chat đang hiện (mở và không thu nhỏ). */
  sheetVisible: boolean;
  isSending: boolean;
  conversationId: string;
  open: () => void;
  minimize: () => void;
  close: () => void;
  send: (text: string) => Promise<void>;
  /** Bấm nút trong luồng đặt tour. `label` hiện như tin của khách. */
  sendAction: (action: ChatAction, label: string, messageId: string) => Promise<void>;
  /** Màn hình (ChatbotHost) đăng ký hàm mở trang trạng thái đơn khi khách bấm nút ở tin nhắn `booking`. */
  registerCheckoutHandler: (fn: ((b: ChatBooking) => void) | null) => void;
  retry: (messageId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const noop = async () => {};

const ChatbotContext = createContext<ChatbotContextType>({
  messages: [],
  isOpen: false,
  isMinimized: false,
  sheetVisible: false,
  isSending: false,
  conversationId: "",
  open: () => {},
  minimize: () => {},
  close: () => {},
  send: noop,
  sendAction: noop,
  registerCheckoutHandler: () => {},
  retry: noop,
  clear: noop,
});

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

let messageSeq = 0;
function makeMessage(partial: Omit<ChatMessage, "id" | "at" | "kind"> & { kind?: ChatMessageKind }): ChatMessage {
  messageSeq += 1;
  return { id: `${Date.now()}-${messageSeq}`, at: Date.now(), kind: "text", ...partial };
}

function greetingMessage(): ChatMessage {
  return makeMessage({ role: "bot", text: CHAT_GREETING });
}

/** Bỏ tin quá 3 ngày, tin lỗi tạm thời và giữ tối đa 50 tin gần nhất. */
function prune(messages: ChatMessage[]): ChatMessage[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  return messages.filter((m) => m.at >= cutoff && m.kind !== "error").slice(-MAX_MESSAGES);
}

function storageKey(userId: string) {
  return `chatbot:${userId}`;
}

function errorText(error: unknown): string {
  if (error instanceof ChatbotError) return error.message;
  return "Có lỗi xảy ra, bạn thử lại nhé.";
}

/** Bỏ dòng URL Zalo khỏi câu trả lời khi đã có thẻ chuyển nhân viên. */
function stripHandoffUrl(reply: string, handoff?: ChatHandoff): string {
  if (!handoff?.zalo_url) return reply;
  return reply
    .split("\n")
    .filter((line) => !line.includes(handoff.zalo_url))
    .join("\n")
    .trim();
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const userId = isLoggedIn ? user?.id ?? "" : "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hydratedFor, setHydratedFor] = useState("");

  // Dùng ref để `send` luôn thấy giá trị mới nhất mà không phải tạo lại hàm mỗi lần render.
  const conversationIdRef = useRef("");
  const sendingRef = useRef(false);
  const bookingHandlerRef = useRef<((b: ChatBooking) => void) | null>(null);
  conversationIdRef.current = conversationId;

  // Nạp lịch sử của đúng người dùng; đăng xuất / đổi tài khoản → xoá trạng thái trong bộ nhớ.
  useEffect(() => {
    let cancelled = false;
    setIsOpen(false);
    setIsMinimized(false);
    setIsSending(false);
    sendingRef.current = false;
    setHydratedFor("");
    setMessages([]);
    setConversationId("");

    if (!userId) return;

    (async () => {
      let stored: StoredChat | null = null;
      try {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        stored = raw ? (JSON.parse(raw) as StoredChat) : null;
      } catch {
        stored = null;
      }
      if (cancelled) return;
      const kept = prune(Array.isArray(stored?.messages) ? stored!.messages : []);
      setConversationId(stored?.conversationId || uuidv4());
      setMessages(kept.length > 0 ? kept : [greetingMessage()]);
      setHydratedFor(userId);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Lưu lại mỗi khi tin nhắn đổi (chỉ sau khi đã nạp xong, tránh ghi đè bằng mảng rỗng).
  useEffect(() => {
    if (!userId || hydratedFor !== userId || !conversationId) return;
    const data: StoredChat = { conversationId, messages: prune(messages) };
    AsyncStorage.setItem(storageKey(userId), JSON.stringify(data)).catch(() => {});
  }, [messages, conversationId, userId, hydratedFor]);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);
  const minimize = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const ask = useCallback(async (text: string, action?: ChatAction) => {
    sendingRef.current = true;
    setIsSending(true);
    try {
      const res = await sendChatMessage(text, conversationIdRef.current, action);
      const isLimit = LIMIT_PHRASES.some((p) => res.reply.includes(p));
      const botMsg = makeMessage({
        role: "bot",
        text: stripHandoffUrl(res.reply, res.handoff),
        kind: isLimit ? "limit" : "text",
        tours: res.tours,
        goiY: res.goi_y,
        handoff: res.handoff,
        choices: res.choices,
        multi: res.multi,
        toiDa: res.toi_da,
        booking: res.booking,
      });
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errMsg = makeMessage({
        role: "bot",
        text: errorText(error),
        kind: "error",
        retryText: text,
        retryAction: action,
      });
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }, []);

  const clear = useCallback(async () => {
    const oldId = conversationIdRef.current;
    const newId = uuidv4();
    conversationIdRef.current = newId;
    setConversationId(newId);
    setMessages([makeMessage({ role: "system", text: "Đã làm mới cuộc trò chuyện", kind: "clear" }), greetingMessage()]);
    if (oldId) {
      try {
        await deleteConversation(oldId);
      } catch {
        // Lỗi mạng: bỏ qua, server tự xoá tin cũ hơn 3 ngày.
      }
    }
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sendingRef.current) return;
      if (text.toLowerCase() === "/clear") {
        await clear();
        return;
      }
      setMessages((prev) => [...prev, makeMessage({ role: "user", text })]);
      await ask(text);
    },
    [ask, clear],
  );

  const sendAction = useCallback(
    async (action: ChatAction, label: string, messageId: string) => {
      if (sendingRef.current) return;
      setMessages((prev) => [
        ...prev.map((m) => (m.id === messageId ? { ...m, answered: true } : m)),
        makeMessage({ role: "user", text: label }),
      ]);
      await ask("", action);
    },
    [ask],
  );

  const registerCheckoutHandler = useCallback((fn: ((b: ChatBooking) => void) | null) => {
    bookingHandlerRef.current = fn;
  }, []);

  const retry = useCallback(
    async (messageId: string) => {
      if (sendingRef.current) return;
      const found = messages.find((m) => m.id === messageId);
      const text = found?.retryText;
      if (text === undefined) return;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      await ask(text, found?.retryAction);
    },
    [ask, messages],
  );

  const value = useMemo<ChatbotContextType>(
    () => ({
      messages,
      isOpen,
      isMinimized,
      sheetVisible: isOpen && !isMinimized,
      isSending,
      conversationId,
      open,
      minimize,
      close,
      send,
      sendAction,
      registerCheckoutHandler,
      retry,
      clear,
    }),
    [messages, isOpen, isMinimized, isSending, conversationId, open, minimize, close, send, sendAction, registerCheckoutHandler, retry, clear],
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export const useChatbot = () => useContext(ChatbotContext);
