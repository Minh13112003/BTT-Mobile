import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPalette } from "@/constants/theme";
import { useAuth } from "@/context/Auth_Context";
import { useHideOnScroll } from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { formatDateTime } from "@/helper/datetime_helper";
import { useNotification } from "@/context/Notification_Context";
import {
  NotificationItem,
  getNotifications,
  readAllNotifications,
  readNotification,
} from "@/services/notification";
import { getTransactionHistory } from "@/services/booking";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIMIT = 20;

type NotifIconConfig = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
};

const TYPE_ICON: Record<string, NotifIconConfig> = {
  BOOKING_CREATED: {
    name: "checkmark-circle",
    color: "#16A34A",
    bg: "#DCFCE7",
  },
  BOOKING_STATUS_UPDATED: {
    name: "document-text",
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  DEPARTURE_RESCHEDULED: {
    name: "warning",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  SCHEDULE_UPDATED: {
    name: "calendar",
    color: "#EA580C",
    bg: "#FFEDD5",
  },
  PASSWORD_CHANGED: {
    name: "lock-closed",
    color: "#6B7280",
    bg: "#F3F4F6",
  },
};

const DEFAULT_ICON: NotifIconConfig = {
  name: "notifications",
  color: "#D0021B",
  bg: "#FEE2E2",
};

function getIconConfig(type?: string | null): NotifIconConfig {
  return (type && TYPE_ICON[type]) ?? DEFAULT_ICON;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const { user } = useAuth();
  const { refreshUnread, setAllRead, unreadCount } = useNotification();
  const insets = useSafeAreaInsets();
  const onScroll = useHideOnScroll();
  const router = useRouter();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const notifListenerRef = useRef<Notifications.EventSubscription | null>(null);

  const fetchPage = useCallback(
    async (p: number, replace: boolean) => {
      try {
        const res = await getNotifications(p, LIMIT);
        const data = res.data as any;
        const list: NotificationItem[] = data?.items ?? data?.data ?? [];
        const meta = data?.meta;
        setHasNext(meta?.hasNext ?? false);
        setPage(p);
        setItems((prev) => (replace ? list : [...prev, ...list]));
      } catch {
        // silently ignore — keep existing list
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    // Khi mở tab → sync badge + load list
    refreshUnread();
    fetchPage(1, true).finally(() => setLoading(false));
  }, [fetchPage, refreshUnread]);

  // Tự reload list khi nhận notification mới qua push (foreground listener)
  useEffect(() => {
    notifListenerRef.current = Notifications.addNotificationReceivedListener(() => {
      fetchPage(1, true);
    });
    return () => {
      notifListenerRef.current?.remove();
    };
  }, [fetchPage]);

  // Khi unreadCount tăng (polling phát hiện notification mới) → reload list
  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      fetchPage(1, true);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage(1, true);
    setRefreshing(false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNext) return;
    setLoadingMore(true);
    await fetchPage(page + 1, false);
    setLoadingMore(false);
  }, [loadingMore, hasNext, page, fetchPage]);

  const handleMarkAll = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await readAllNotifications();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setAllRead();
    } catch {
      // silently ignore
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, unreadCount, setAllRead]);

  const handleRead = useCallback(async (id: string) => {
    // Optimistic: cập nhật local ngay lập tức
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await readNotification(id);
    } catch {
      // Revert nếu API lỗi
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    }
    // Luôn sync badge từ BE sau khi read
    refreshUnread();
  }, [refreshUnread]);

  const handleNotifPress = useCallback(
    (item: NotificationItem) => {
      if (!item.isRead) handleRead(item.id);
    },
    [handleRead]
  );

  const [navigating, setNavigating] = useState<string | null>(null);

  const handleViewDetail = useCallback(
    async (item: NotificationItem) => {
      if (!item.isRead) handleRead(item.id);
      if (!item.refId) return;

      setNavigating(item.id);
      try {
        // Lấy danh sách booking của user, tìm booking có tour.id === refId
        const res = await getTransactionHistory(1, 50);
        const data = res.data as any;
        const bookings: any[] = data?.items ?? data?.data ?? [];
        const match = bookings.find(
          (b: any) => b.tour?.id === item.refId || b.tourId === item.refId
        );
        if (match) {
          router.push({
            pathname: "/detailTour" as any,
            params: { id: match.id },
          });
        } else {
          // Không tìm thấy booking → sang tab lịch sử
          router.push("/(root)/(tabs)/history" as any);
        }
      } catch {
        Alert.alert("Lỗi", "Không thể tải thông tin booking. Vui lòng thử lại.");
      } finally {
        setNavigating(null);
      }
    },
    [handleRead, router]
  );

  const NotifItem = ({ item }: { item: NotificationItem }) => {
    const iconCfg = getIconConfig(item.type);
    const canNavigate = !!(item.refId && item.refType === "TOUR");
    const [expanded, setExpanded] = useState(false);
    const [isLong, setIsLong] = useState(false);
    const MAX_LINES = 3;

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleNotifPress(item)}
        className={`mx-4 mb-3 rounded-2xl overflow-hidden ${
          isDark
            ? item.isRead
              ? "bg-[#1E222B]"
              : "bg-[#242938]"
            : item.isRead
            ? "bg-white"
            : "bg-red-50"
        }`}
        style={{
          borderWidth: 1,
          borderColor: isDark
            ? item.isRead
              ? "#2D3748"
              : "#3D2020"
            : item.isRead
            ? "#F1F5F9"
            : "#FECACA",
        }}
      >
        <View className="flex-row items-start p-4">
          {/* Icon theo type */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark
                ? item.isRead
                  ? "#374151"
                  : iconCfg.bg + "33"
                : item.isRead
                ? "#F1F5F9"
                : iconCfg.bg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              flexShrink: 0,
            }}
          >
            <Ionicons
              name={item.isRead ? (`${iconCfg.name}-outline` as any) ?? iconCfg.name : iconCfg.name}
              size={18}
              color={item.isRead ? (isDark ? "#6B7280" : "#94A3B8") : iconCfg.color}
            />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className={`font-bold flex-1 mr-2 ${
                  item.isRead
                    ? isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                    : isDark
                    ? "text-slate-100"
                    : "text-slate-800"
                }`}
                style={{ fontSize: 15 }}
                numberOfLines={1}
              >
                {item.title || "Thông báo mới"}
              </Text>
              {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-[#D0021B] flex-shrink-0" />
              )}
            </View>

            {/* Text ẩn để đếm số dòng thật sự */}
            <View style={{ height: 0, overflow: "hidden" }}>
              <Text
                className={`leading-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                style={{ fontSize: 14 }}
                onTextLayout={(e) => {
                  if (!isLong && e.nativeEvent.lines.length > MAX_LINES) {
                    setIsLong(true);
                  }
                }}
              >
                {item.message}
              </Text>
            </View>
            {/* Text hiển thị thật */}
            <Text
              className={`leading-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              style={{ fontSize: 14 }}
              numberOfLines={expanded ? undefined : MAX_LINES}
            >
              {item.message}
            </Text>

            {isLong && (
              <TouchableOpacity
                onPress={() => setExpanded((v) => !v)}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                className="mt-1 self-start"
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#93C5FD" : "#2563EB" }}>
                  {expanded ? "Rút gọn ↑" : "Xem thêm ↓"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Footer: timestamp + chi tiết */}
            <View className="flex-row items-center justify-between mt-2">
              <Text
                className={isDark ? "text-slate-600" : "text-slate-400"}
                style={{ fontSize: 12 }}
              >
                {formatDateTime(item.createdAt)}
              </Text>

              {canNavigate && (
                <TouchableOpacity
                  onPress={() => handleViewDetail(item)}
                  activeOpacity={0.7}
                  disabled={navigating === item.id}
                  className="flex-row items-center"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {navigating === item.id ? (
                    <ActivityIndicator size="small" color="#D0021B" />
                  ) : (
                    <>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#D0021B",
                          marginRight: 2,
                        }}
                      >
                        Chi tiết
                      </Text>
                      <Ionicons name="chevron-forward" size={13} color="#D0021B" />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <NotifItem item={item} />
  );

  if (!user) {
    return (
      <View className={`flex-1 ${isDark ? "bg-[#111318]" : "bg-[#F1F5F9]"}`}>
        <StatusBar style="light" backgroundColor={isDark ? "#1E222B" : "#D0021B"} />
        <Header title="Thông báo" showActions={false} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="notifications-off-outline"
            size={56}
            color={isDark ? "#4B5563" : "#CBD5E1"}
          />
          <Text
            className={`font-bold mt-4 text-center ${isDark ? "text-slate-300" : "text-slate-700"}`}
            style={{ fontSize: 18 }}
          >
            Vui lòng đăng nhập
          </Text>
          <Text
            className={`mt-2 text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}
            style={{ fontSize: 15 }}
          >
            Đăng nhập để xem thông báo của bạn.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-[#111318]" : "bg-[#F1F5F9]"}`}>
      <StatusBar style="light" backgroundColor={isDark ? "#1E222B" : "#D0021B"} />
      <Header title="Thông báo" showActions={false} />

      <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
        {/* Toolbar: unread count + mark all */}
        <View
          className={`flex-row items-center justify-between px-4 py-3 border-b ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <Text
            className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
            style={{ fontSize: 14 }}
          >
            {unreadCount > 0
              ? `${unreadCount} chưa đọc`
              : "Tất cả đã đọc"}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAll}
              disabled={markingAll}
              activeOpacity={0.7}
              className="flex-row items-center"
            >
              {markingAll ? (
                <ActivityIndicator size="small" color="#D0021B" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={16}
                    color="#D0021B"
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    className="font-bold text-[#D0021B]"
                    style={{ fontSize: 14 }}
                  >
                    Đánh dấu tất cả đã đọc
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={palette.spinner} />
            <Text
              className={`mt-2 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
              style={{ fontSize: 15 }}
            >
              Đang tải thông báo...
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.spinner}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              <>
                {loadingMore ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color={palette.spinner} />
                  </View>
                ) : !hasNext && items.length > 0 ? (
                  <View className="py-3 items-center">
                    <Text className="font-semibold text-slate-400" style={{ fontSize: 15 }}>
                      ✓ Đã hiển thị tất cả thông báo
                    </Text>
                  </View>
                ) : null}
                <Footer />
              </>
            }
            ListEmptyComponent={
              <View
                className={`mx-4 rounded-3xl p-10 items-center border border-dashed mt-4 ${
                  isDark
                    ? "bg-[#1E222B]/40 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={48}
                  color={isDark ? "#4B5563" : "#CBD5E1"}
                />
                <Text
                  className={`font-bold mt-4 text-center ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                  style={{ fontSize: 17 }}
                >
                  Chưa có thông báo
                </Text>
                <Text
                  className="text-slate-400 text-center mt-1.5"
                  style={{ fontSize: 14 }}
                >
                  Thông báo về đơn hàng và khuyến mãi sẽ xuất hiện ở đây.
                </Text>
              </View>
            }
          />
        )}
      </LinearGradient>
    </View>
  );
}
