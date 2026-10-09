---
description: Cấu trúc thư mục và vai trò từng folder — đọc khi cần biết file nằm ở đâu
globs: ["**/*"]
alwaysApply: false
---

# Cấu trúc dự án

## Thư mục chính

### `components/`
Reusable UI components.

- `CustomAlert.tsx` — Alert dialog dùng toàn app (**bắt buộc**, không dùng `Alert.alert`)
- `CustomToast.tsx` — Toast notification
- `Header.tsx` / `Footer.tsx` — Layout wrapper
- `PINInput.tsx` — Input PIN 6 số
- `PhoneKeypad.tsx` — Bàn phím số tự vẽ (cùng kiểu phím PINInput) có nút "Xong", panel bám đáy màn hình (không phải Modal). Dùng cho ô SĐT ở `login.tsx` thay bàn phím hệ thống; ô mật khẩu vẫn dùng bàn phím hệ thống + thanh "Xong" (`InputAccessoryView`, chỉ iOS). Màn cha phải chừa `paddingBottom` = chiều cao bàn phím (`onHeightChange`) để cuộn được
- `ZaloFloatingButton.tsx` — Nút nổi liên hệ Zalo (mờ, rung lắc định kỳ, confirm trước khi mở link nhóm Zalo). Gắn ở **toàn bộ màn hình trừ login, setup-pin, change-pin** (2 màn PIN bị bàn phím custom chiếm hết chỗ). Props: `liftBy` (đẩy lên tránh đè nút "lên đầu trang"), `baseBottom` (đổi vị trí gốc khi màn có thanh CTA dính đáy như checkout/tour detail). Size 50x50, borderRadius 25
- `SearchBar.tsx` — Ô tìm kiếm
- `MembershipBanner.tsx` — Banner thẻ thành viên
- `tour/` — Components riêng cho tour: `TourCard`, `TourHero`, `BookingBar`, `ItineraryTimeline`, `TermsAccordion`, `DeparturePicker`, `DatePickerCalendar`, `FeaturedCarousel`, ...
- `tour/TourImage.tsx` — **Bắt buộc** dùng thay `<Image>` RN cho ảnh tour từ API (expo-image: spinner khi chờ, fade-in, cache memory+disk, tự retry 2 lần khi lỗi). Đã dùng ở `TourCard`, `ImageCarousel`
- `ui/` — Primitive UI: `Accordion`, `Card`, `SectionTitle`

### `context/`
React Context providers — wrap trong `app/(root)/_layout.tsx`.

- `Auth_Context.tsx` — `isLoggedIn`, `user`, `token`, `points`, `logout()`, `refreshPoints()`
- `Theme_Context.tsx` — `theme: "light" | "dark"`, `toggleTheme()`
- `Notification_Context.tsx` — `unreadCount`
- `ScrollVisibility_Context.tsx` — Ẩn/hiện bottom tab khi scroll

### `hooks/`
Custom hooks tách logic khỏi component.

- `useHomeTours.ts` — Fetch newest/hot/popular, có module-level cache
- `useTourDetail.ts` — Fetch chi tiết tour + departures
- `useTourSearch.ts` — Search + filter tours
- `usePushNotifications.ts` — Đăng ký Firebase messaging, xử lý foreground/background
- `useDebounce.ts` — Debounce giá trị (dùng trong search)
- `useCollapsibleHeader.ts` — Header nổi trượt theo ngón tay (native `diffClamp`), thả tay thì snap về hiện/ẩn hẳn. Trả `{ translateY, scrollProps, reveal }`; list phải là `Animated.FlatList` và spread `{...scrollProps}`. Dùng ở `search.tsx`, `history.tsx` — **không** viết lại kiểu bật/tắt theo `dy > 8` (gây header nhảy giật)

### `services/`
Tất cả call API. Không gọi axios trong component.

- `api/constants.ts` — Chuỗi endpoint
- `api/interceptor.ts` — Axios instance, auto refresh token (401), PIN trả 400
- `auth.ts`, `user.ts`, `tour.ts`, `booking.ts`, `voucher.ts`, `departure.ts`, `notification.ts`, `pin.ts`, `feedback.ts`, `referral.ts`, `news.ts`, `tips.ts`

### `constants/`
Hằng số toàn app — **không hardcode** giá trị này trực tiếp.

- `typography.ts` — `FONT_SIZE` object (xs, sm, md, lg, xl, ...)
- `theme.ts` — Bảng màu (light/dark palettes)
- `tourFilters.ts` — `SearchMode` enum, danh sách filter options

### `helper/`
Pure functions xử lý dữ liệu.

- `datetime_helper.ts` — Format ngày/giờ sang tiếng Việt
- `format.ts` — Format tiền tệ VND

### `utils/`
Utilities hạ tầng.

- `prefetchImages.ts` — `prefetchImages(urls, timeoutMs)`: tải trước ảnh vào cache và chờ tối đa N ms, không bao giờ throw. Gọi trong hook list tour (`useHomeTours`, `useTourSearch`) trước khi `setState` để ảnh có sẵn khi list hiện ra
- `storage.ts` — Wrapper `SecureStore` (iOS/Android) + `localStorage` (Web). Lưu: `accessToken`, `refreshToken`, `user`, `theme_preference`

## Quy ước đặt tên

- Context files: `PascalCase_Context.tsx` (ví dụ: `Auth_Context.tsx`)
- Hook files: `camelCase.ts` với prefix `use` (ví dụ: `useHomeTours.ts`)
- Service files: `camelCase.ts` theo domain (ví dụ: `tour.ts`, `booking.ts`)
- Component files: `PascalCase.tsx`
- Screen files (trong `app/`): `camelCase.tsx` hoặc `kebab-case.tsx`

## Firebase & Notifications

- Config Android: `google-services.json` (root)
- Config iOS: `GoogleService-Info.plist` (root)
- **Không đặt `color`** trong `expo-notifications` config — gây conflict với Firebase manifest trên Android.
