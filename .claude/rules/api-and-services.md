---
description: Quy tắc gọi API — services layer, axios interceptor, data fetching patterns
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# API & Services

> ⚠️ Backend đang migrate dần từ NestJS sang **Laravel** (chạy song song). Xem chi tiết quy trình, axios instance riêng, trạng thái từng domain tại `.claude/rules/laravel-migration.md`.

## Nguyên tắc cơ bản

- **KHÔNG** gọi `axios` trực tiếp trong component hay hook.
- Tất cả call API phải đi qua `services/` — mỗi domain có file riêng.
- Import từ service tương ứng:
  ```tsx
  import { getNewestTours } from "@/services/tour";
  import { getBookingById } from "@/services/booking";
  ```

## Cấu trúc services/

```
services/
  api/
    constants.ts     # Chuỗi endpoint — chỉ sửa ở đây khi đổi URL
    interceptor.ts   # Axios instance + interceptor
  auth.ts            # login, logout, register, forgotPassword, resetPassword
  user.ts            # getMe, updateProfile, changePassword, updateAvatar
  tour.ts            # getNewestTours, getHotTours, getPopularTours, getTourById, ...
  booking.ts         # getBookings, getBookingById, createBooking
  voucher.ts         # getVouchers, applyVoucher
  departure.ts       # getDeparturesByTour, getDepartureById
  notification.ts    # getNotifications, markRead, getUnreadCount
  pin.ts             # getPinStatus, setPin, verifyPin, changePin
  feedback.ts        # submitFeedback
  referral.ts        # getReferralStats
  news.ts            # getNews, getNewsById
  tips.ts            # getTravelTips, getTipById
```

## Axios Interceptor — hành vi quan trọng

File: `services/api/interceptor.ts`

- Tự động đính kèm `Authorization: Bearer <token>` vào mọi request.
- Khi nhận **401**: tự động gọi refresh token, rồi retry request gốc.
- Khi nhận **400**: KHÔNG retry, trả về lỗi bình thường.
- **PIN verify endpoint trả 400** (không phải 401) khi sai PIN — đây là cố ý để interceptor không nhầm là token hết hạn.

## Data Fetching Patterns

### Parallel fetch với allSettled

Dùng `Promise.allSettled` khi fetch nhiều endpoint cùng lúc. Lỗi một endpoint không làm hỏng cả màn hình:

```ts
const results = await Promise.allSettled([
  getNewestTours(1, 6),
  getHotTours(1, 5),
  getPopularTours(1, 5),
]);
const newest = results[0].status === "fulfilled" ? results[0].value?.data?.items ?? [] : [];
```

### Module-level cache

`hooks/useHomeTours.ts` dùng biến module-level `cachedSections` để giữ data giữa các lần navigate, tránh reload fullscreen khi quay về Home:

```ts
let cachedSections: HomeSections | null = null;

// Trong hook: chỉ fetch khi cache trống
useEffect(() => {
  if (cachedSections === null) load();
}, [load]);
```

Áp dụng pattern này cho các màn hình list khác nếu cần tốc độ navigate.

## Backend NestJS

- Thư mục: `D:\E-Commerce\Backend\e-commerce`
- Module chính: `users`, `bookings`, `tours`, `departures`, `notifications`, `vouchers`, `news`, `travel-tips`, `feedbacks`, `referral`
- API prefix: `/api/v1/...`
