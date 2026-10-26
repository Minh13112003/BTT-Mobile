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

## Backend Chatbot (bttAI)

- Backend thứ 3 (FastAPI, repo `ChatBOT-BTT`, thư mục `D:\ChatBot`), địa chỉ trong `EXPO_PUBLIC_CHATBOT_URL` (Cloudflare Tunnel khi demo, đổi mỗi lần chạy lại → sửa `.env` + `npx expo start -c`).
- `services/chatbot.ts`: axios riêng (timeout 30s), gắn `Authorization: Bearer <accessToken>` đọc từ SecureStore **mỗi request**, **không** refresh token — chatbot gọi lại NestJS `GET /users/me` để xác thực. 401 → "Phiên đăng nhập đã hết hạn" (không tự đăng xuất).
- Hợp đồng `POST /chat`, `DELETE /chat/{id}`, `GET /health`: `docs/COLLAB.md`. Câu chặn spam trả 200 như `reply`; app nhận biết bằng `LIMIT_PHRASES` trong `Chatbot_Context.tsx` (đổi chữ ở `database.py` thì phải đổi theo).

## Thân nhân & hành khách khi đặt tour

> ⛔ **TẠM TẮT từ 2026-10-14** (chủ dự án chưa cần nhân thân/CCCD/hộ chiếu): phần thân nhân, hành khách, CCCD, hộ chiếu ở app đang **comment** (tìm "TẠM TẮT" trong `checkout.tsx`, `selfprofile.tsx`, `profile.tsx`, `detailTour.tsx`); backend không còn bắt buộc `guests`. Các mô tả dưới đây là thiết kế khi bật lại.

- `services/relative.ts` → NestJS `/relatives` (GET/POST/PATCH/DELETE). Tối đa 20 người/tài khoản, chống trùng bằng CCCD hoặc hộ chiếu (backend). Bảng `relatives`, `booking_guests` (migration `20261013000000_...`).
- `booking()` gửi thêm `guests[]` (đúng bằng người lớn + trẻ em + em bé; khách 1 = người đặt) và `saveToRelatives[]`. Backend **bắt buộc** `guests` với tour nguồn Laravel.
- Quy tắc: họ tên + ngày sinh mọi người; CCCD từ đủ 14 tuổi (tính tại ngày khởi hành); SĐT chỉ khách 1; **hộ chiếu + visa bắt buộc với tour nước ngoài**. Tour nước ngoài nhận biết qua đường dẫn ảnh Laravel chứa `/nuoc-ngoai/` (`isForeign` truyền từ `tour/[id].tsx` sang checkout; backend tự kiểm tra lại bằng `isForeignTourImage`).
- `GET /bookings/:id` trả thêm `guests[]` (chỉ ở chi tiết, không ở danh sách lịch sử). `detailTour.tsx` hiện bằng `components/guest/BookingGuestList.tsx` (số giấy tờ che bớt, bấm "Hiện giấy tờ" để xem); booking cũ không có dữ liệu thì ẩn cả thẻ.

## Số chỗ khi đặt tour nguồn Laravel (2026-10-26)

- `stock_qty` của benthanhtourist.com **không giảm** khi khách đặt qua app → số chỗ thật = `stock_qty` − tổng khách các đơn `source = LARAVEL` cùng `departureKey` đang `PENDING/CONFIRMED/PAID/ONGOING` (hủy/hoàn tiền/hoàn thành thì trả chỗ).
- NestJS `createLaravelBooking`: kiểm tra chỗ + áp voucher + tạo booking trong **1 transaction** có `pg_advisory_xact_lock(hashtext(departureKey))` → 2 người đặt cùng đợt cùng lúc chạy lần lượt, không bán quá chỗ. Voucher dùng-1-lần tắt bằng `updateMany where status=true` (2 đơn cùng voucher thì đơn sau bị từ chối).
- `GET /api/v1/bookings/laravel-seats?tourKey=&departureKey=` → `{ stockQty, bookedSeats, availableSeats }` (`null` = không giới hạn). `checkout.tsx` (RN + mini app) gọi khi mở màn và sau khi đặt lỗi; tổng người lớn + trẻ em + em bé **không vượt** số này (nút "+" mờ và khoá khi đủ, tự bớt khách nếu số chỗ thật về sau ít hơn).
- Chưa làm: trang chi tiết tour vẫn hiện `stock_qty` gốc ("Còn N chỗ") — chưa trừ đơn đã đặt.

## Nội dung thông báo (NestJS, mẫu chốt 2026-10-26 — bản tên rút gọn)

- Mẫu: `Kính gửi Quý khách, đơn đặt Tour du lịch Nhật Bản, ngày khởi hành 14/11/2026, đã được ghi nhận và đang chờ xác nhận. Nhân viên sẽ sớm liên hệ với bạn.` — luôn có lời chào (`GREETING`), tên tour **rút gọn** (không ghi đủ tên dài, không ngoặc kép) + ngày khởi hành có năm. Helper ở `src/modules/notifications/notification-text.ts`; thông báo mới phải dùng:
  - `tourShortName(name)`: phần trước dấu ":" (không có thì trước " - " đầu tiên), bỏ `(...)`, thêm "Tour" → "Du Lịch Nhật Bản (Mùa Thu): Tokyo - …" = "Tour du lịch Nhật Bản". Hai tour cùng điểm đến ra cùng tên — phân biệt bằng ngày (chủ dự án đồng ý).
  - `tourRef({ name, code, date })` = `Tour du lịch X, ngày khởi hành dd/mm/yyyy,` (có `date` thì kèm dấu phẩy đóng cụm) — đặt ngay sau lời chào hoặc sau "đơn đặt". Không tên → `Tour mã X`, không cả hai → `Tour của Quý khách`.
- Đổi trạng thái đơn: tiêu đề = trạng thái mới, nội dung `... đơn đặt <tourRef> <đã được xác nhận/...>. <việc cần biết>` (`STATUS_TEXT` trong `bookings.service.ts`). Đơn nguồn Laravel lấy tên/mã/ngày từ cột snapshot. Nhắc 7 ngày: `<tourRef> còn 7 ngày nữa.`; nhắc 1 ngày: `Tour du lịch X khởi hành ngày mai (dd/mm/yyyy).`
- App: nội dung thông báo cỡ 16 (`FONT_SIZE.card`), tối đa **4 dòng**, dài hơn có "Xem thêm ↓" (`notifications.tsx`; mini app clamp 4 dòng). Thông báo cũ trong DB giữ chữ cũ.

## Nhắc lịch trước ngày khởi hành

- NestJS `src/modules/bookings/departure-reminder.service.ts`: cron 08:00 giờ VN mỗi ngày, nhắc trước **7 ngày** và **1 ngày** cho đơn `CONFIRMED`/`PAID` (cả nguồn Laravel lẫn NestJS). Tạo thông báo loại `DEPARTURE_REMINDER` (migration `20261013100000_...`) + push qua `NotificationsService`; chống gửi trùng bằng `refId = id booking`, `refType = BOOKING_D7 | BOOKING_D1`.
- App: `notifications.tsx` — `refType` bắt đầu bằng `BOOKING` thì mở thẳng `/detailTour?id=<refId>` (khác `refType = "TOUR"` phải dò booking theo id tour).
- Chưa có nút "Thêm vào lịch điện thoại" (cần `expo-calendar` = module native, phải build lại app). Push trên iOS chưa thử được (chưa có tài khoản Apple Developer).

## Đặt tour qua chatbot (bttAI)

> ⛔ **TẠM TẮT từ 2026-10-14**: bước chọn thân nhân của chatbot đang tắt bằng cờ `DUNG_THAN_NHAN = False` trong `D:\ChatBot\dat_tour.py` (số người xong đi thẳng tới tóm tắt, `relative_ids` luôn `[]`, không nhắc hộ chiếu/visa). Đổi sang `True` để bật lại; mô tả về thân nhân bên dưới là thiết kế khi bật.

- Chatbot (`D:\ChatBot\dat_tour.py`) có luồng đặt tour dạng máy trạng thái (không qua Gemini): tìm tour → ngày khởi hành (chỉ 1 ngày thì chốt luôn; lấy **trực tiếp từ benthanhtourist.com**, không dùng dữ liệu Chroma vì có thể cũ) → số người lớn/trẻ em/em bé → chọn thân nhân (NestJS `/relatives`, bằng token của khách) → tổng tiền + "Đồng ý"/"Không đồng ý". Chatbot **không tự tạo booking**.
- Hợp đồng mở rộng của `POST /chat`: request thêm `action: { id, values? }` (nút bấm; không tính rate limit, không gọi AI); response thêm `choices[{id,label}]`, `multi` + `toi_da` (chọn nhiều người đi cùng), `checkout{tour_key, departure_key, departure_date, adults, children, infants, relative_ids}`.
- App: `ChatChoices` (trong `ChatMessageBubble.tsx`) hiện nút; `sendAction` ở `Chatbot_Context`; khi có `checkout`, `ChatbotHost.openCheckout` lấy lại tour (`getTourItemMapped`) rồi mở `/checkout` với tham số như nút "Đặt tour" ở trang tour + `adults/children/infants/relativeIds` để điền sẵn (`useCheckoutGuests(total, relativeIds)`). Khách tự kiểm tra và bấm "Đặt tour" (nhập PIN).
- Không bao giờ thu CCCD/hộ chiếu/visa trong chat; người mới nhập ở trang booking. Mini app Zalo **chưa port** luồng này (chat thường vẫn dùng được, không thấy nút).

## Voucher

- Cờ khả dụng là cột `vouchers.status` (true = còn dùng; false = tắt). `expiry` là chuỗi `DD/MM/YYYY`, còn dùng hết ngày hạn.
- Người dùng thường chỉ nhận voucher có `status = true` **và** chưa quá hạn (lọc ở `VouchersService.getAllVouchers`, hàm `isVoucherExpired` trong `src/modules/vouchers/voucher-expiry.ts`); đặt tour/dùng voucher với voucher tắt hoặc hết hạn bị từ chối. Admin vẫn thấy tất cả.
- `voucher-picker.tsx` chọn kiểu Grab: bấm để chọn, bấm lại để bỏ chọn.

## Loại tour (ô tròn ở Home / chip ở tab Du lịch)

- Chưa có API Laravel cho các loại này nên dữ liệu **set cứng trong DB NestJS**: `GET /tours/by-type?tourType=...`. Một tour thuộc **nhiều loại** → cột `tours.tourTypes` (mảng, `tourType` cũ chỉ là loại chính để tương thích). Client lọc bằng `item.tourTypes?.includes(...)`.
- 6 loại theo web: `TOUR OF THE YEAR 2026`, `TOUR CAO CẤP`, `TOUR MICE`, `TOUR MÙA THU - ĐÔNG`, `DU LỊCH XANH`, `TOUR ĐỘC LẠ` (`MODE_TOUR_TYPE` trong `constants/tourFilters.ts`). **MICE và DU LỊCH XANH cố ý để trống** (chưa có dữ liệu).
- Dữ liệu seed: `D:\E-Commerce\Backend\e-commerce\scripts\seed-tour-categories.js` (24 tour lấy từ benthanhtourist.com ngày 2026-10-12; xem trước bằng `node scripts/seed-tour-categories.js`, ghi bằng `--apply`; chạy lại được). Thêm tour/loại mới → sửa danh sách trong file đó. **Không dùng** `scripts/seed-tour-types.js` (gán loại ngẫu nhiên để test, đã lỗi thời).

## Backend NestJS

- Thư mục: `D:\E-Commerce\Backend\e-commerce`
- Module chính: `users`, `bookings`, `tours`, `departures`, `notifications`, `vouchers`, `news`, `travel-tips`, `feedbacks`, `referral`
- API prefix: `/api/v1/...`
