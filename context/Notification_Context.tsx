import { useAuth } from "@/context/Auth_Context";
import { getNotifications } from "@/services/notification";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
      const res = await getNotifications(1, 50);
      const data = res.data as any;
      const items: any[] = data?.items ?? data?.data ?? [];
      setUnreadCount(items.filter((n: any) => !n.isRead).length);
    } catch {
      // silently ignore
    }
  }, [user]);

  // Fetch when user logs in/out
  useEffect(() => {
    refreshUnread();
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
