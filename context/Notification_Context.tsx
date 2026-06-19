import { useAuth } from "@/context/Auth_Context";
import { getUnreadCount } from "@/services/notification";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";

interface NotificationContextType {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  setAllRead: () => void;
  decrementUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnread: async () => {},
  setAllRead: () => {},
  decrementUnread: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getUnreadCount();
      setUnreadCount((res.data as any)?.count ?? 0);
    } catch {
      // silently ignore
    }
  }, [user]);

  // Fetch when user logs in/out
  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  // Fetch khi app quay lại foreground (từ background/bị minimize)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshUnread();
    });
    return () => sub.remove();
  }, [refreshUnread]);

  const setAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const decrementUnread = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnread, setAllRead, decrementUnread }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
