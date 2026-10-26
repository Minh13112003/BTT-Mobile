---
description: Cấu trúc thư mục và vai trò từng folder — đọc khi cần biết file nằm ở đâu
globs: ["**/*"]
alwaysApply: false
---

# Cấu trúc dự án

## Thư mục chính

### `zalo-miniapp/` (dự án web riêng, không dùng chung code với app RN)
- Bản port sang **Zalo Mini App** (React + `zmp-ui` + Vite). Có `src/` riêng, cùng gọi backend NestJS/Laravel/chatbot; địa chỉ lấy từ `zalo-miniapp/.env` (`VITE_API_URL`, `VITE_BASE_BTT_URL`, `VITE_CHATBOT_URL`).
- **Quy tắc đồng bộ**: tính năng mới ở app RN phải được port sang mini app (hằng số/dịch vụ thuần TS chép thẳng, giao diện viết lại bằng DOM/inline style). Danh sách đã port và chưa port: `zalo-miniapp/README.md`. Kiểm tra bằng `cd zalo-miniapp && npx tsc --noEmit -p tsconfig.json`.
- Backend chatbot (`D:\ChatBot`) bật CORS riêng cho mini app (xem `main.py`); NestJS whitelist origin ở `src/main.ts`.

### `components/`
Reusable UI components.

- `CustomAlert.tsx` — Alert dialog dùng toàn app (**bắt buộc**, không dùng `Alert.alert`)
- `CustomToast.tsx` — Toast notification
- `Header.tsx` / `Footer.tsx` — Layout wrapper
- `PINInput.tsx` — Input PIN 6 số
- `PhoneKeypad.tsx` — Bàn phím số tự vẽ (cùng kiểu phím PINInput) có nút "Xong", panel bám đáy màn hình (không phải Modal). Dùng cho ô SĐT ở `login.tsx` và các ô toàn số ở `selfprofile.tsx` (ngày sinh, CCCD, ngày hết hạn hộ chiếu — ô là `TouchableOpacity` + `KeypadCaret`, không phải TextInput) thay bàn phím hệ thống. **Không khai báo `Label`/`Section`/component con ngay trong thân màn hình** (mỗi lần đổi state thành component mới → TextInput mất focus, bàn phím tự đóng sau mỗi ký tự); ô mật khẩu vẫn dùng bàn phím hệ thống + thanh "Xong" (`InputAccessoryView`, chỉ iOS). Màn cha phải chừa `paddingBottom` = chiều cao bàn phím (`onHeightChange`) để cuộn được
- `ZaloFloatingButton.tsx` — Nút nổi liên hệ Zalo (mờ, rung lắc định kỳ, confirm trước khi mở link nhóm Zalo). Gắn ở **toàn bộ màn hình trừ login, setup-pin, change-pin** (2 màn PIN bị bàn phím custom chiếm hết chỗ). Từ khi có chatbot, component này còn render nút bttAI bên dưới và tự cộng 62px vào vị trí của Zalo khi nút bttAI đang hiện. Props: `liftBy` (đẩy lên tránh đè nút "lên đầu trang"), `baseBottom` (đổi vị trí gốc khi màn có thanh CTA dính đáy như checkout/tour detail). Size 50x50, borderRadius 25
- `SearchBar.tsx` — Ô tìm kiếm
- `TabHeader.tsx` — Header đỏ dùng chung cho tab Du lịch / Lịch sử / Thông báo (tiêu đề + phụ đề, vòng tròn trang trí, logo in chìm). Props: `title`, `subtitle`, `right`, `children`, `safeArea`, `onBack`. `Header.tsx` giờ chỉ còn dùng cho tab Home (qua `CollapsingHeader`): logo + chuông thông báo, **không** còn nút đổi giao diện/avatar (chuyển sang tab Tài khoản)
- `profile/AvatarViewer.tsx` — Modal xem ảnh đại diện phóng to (bấm `TierAvatar` ở tab Tài khoản; không có ảnh thì hiện chữ cái đầu). Mini app có bản `zalo-miniapp/src/components/AvatarViewer.tsx`
- `profile/ProfileCompletionPrompt.tsx` — Lời nhắc hoàn thiện thông tin, gắn **một lần** ở `app/(root)/_layout.tsx`. Chỉ hiện ngay **sau khi đăng nhập** (không hiện mỗi lần mở app) nếu thiếu email / ngày sinh / mã PIN (**không nhắc CCCD** — khách ít muốn nhập, nhập lúc đặt tour); "Điền ngay" → `selfprofile` (chỉ thiếu PIN → `setup-pin`), "Để sau" → đóng tới lần đăng nhập kế. Câu cam kết chỉ dùng thông tin cho việc đặt tour dẫn về **Điều 2** của `termsContent.ts` (`TERMS_ACCOUNT`) — đổi số điều thì sửa cả hai nơi
- `profile/TierAvatar.tsx` — Avatar viền theo hạng thành viên (Đồng → Ruby, hạng cao có cánh/lấp lánh/ngọc/vương miện), vẽ bằng react-native-svg. Dùng ở tab Tài khoản
- `chatbot/` — Chatbot bttAI (icon robot đỏ). `ChatbotHost` gắn **một lần** ở `app/(root)/_layout.tsx` (khung chat `ChatSheet` + thanh thu nhỏ `ChatMiniBar` + `CustomAlert`); `ChatbotFloatingButton` do `ZaloFloatingButton` render **bên dưới** nút Zalo (cách 12px; Zalo **và mọi nút "lên đầu trang"** phải cộng `useChatbotLift()` = 62px vào `bottom` khi đã đăng nhập — cố định, không đổi theo mở/thu nhỏ nên các nút không nhảy; nút bttAI chỉ hiện khi đã đăng nhập và ẩn khi khung chat đang mở/thu nhỏ; màn mới có nút "lên đầu trang" **bắt buộc** dùng hook này); `ChatMessageBubble`, `ChatTourCard` (bấm → thu nhỏ khung chat + mở `/tour/[id]` đúng ngày khởi hành), `ChatbotLogo` (SVG, id gradient riêng mỗi bản). Thanh thu nhỏ rộng bằng màn hình (lề 16) và **cùng `bottom` với nút bttAI** (thay chỗ nút đó, sát dưới Zalo): tab = `baseBottom` 10 so với mép trên thanh tab (5 màn tab truyền `baseBottom={10}`, nút "lên đầu trang" ở tab `bottom: 74 + chatbotLift`), `/tour/*` & `/checkout` = 130, màn khác = 30. Đổi `baseBottom` của một màn thì phải đổi `miniBarBottom()` trong `ChatMiniBar`. Kế hoạch/hợp đồng API: `docs/COLLAB.md`
- `guest/` — Thân nhân & hành khách khi đặt tour: `GuestFields` (6 ô: họ tên, ngày sinh, CCCD, SĐT, hộ chiếu, visa), `GuestSection` (mục "Thông tin hành khách" ở checkout, mỗi khách một thẻ, chọn từ thân nhân hoặc nhập tay + tick lưu). State ở `hooks/useCheckoutGuests.ts`; định dạng/quy tắc ở `utils/guest.ts` (**phải khớp** `src/modules/bookings/guest-rules.ts` bên NestJS)
- `MembershipBanner.tsx` — Banner thẻ thành viên
- `tour/` — Components riêng cho tour: `TourCard`, `TourHero`, `BookingBar`, `ItineraryTimeline`, `TermsAccordion`, `DeparturePicker`, `DatePickerCalendar`, `FeaturedCarousel`, ...
- `tour/TourCard.tsx` — **bản rút gọn (2026-10-26)**: ảnh + nhãn "Trong nước/Nước ngoài" (suy từ `/nuoc-ngoai/` trong đường dẫn ảnh) + thời lượng; tên 2 dòng; ngày khởi hành + giá **chung 1 hàng**; nút `PrimaryButton` "Xem chi tiết" căn phải; sóng đỏ cao 180 neo đáy; **không** ô ★ (Laravel luôn trả rating 0), không emoji, không vạch chia. Mini app: `zalo-miniapp/src/components/TourCard.tsx`
- Trang `tour/[id].tsx` (mẫu "Hero cũ + nội dung kiểu Mẫu 2", 2026-10-26): `DeparturePicker` (Card, hàng ô trượt ngang **luôn thấy 3,5 ô** — ô thứ 4 cắt nửa ở mép thẻ thay cho dòng gợi ý vuốt; ô ghi thứ / ngày / "Còn N" chỗ; bảng Khởi hành/Ngày về/Chỗ trống/Giá — `Departure.returnDate`), `TourScheduleTabs` (lưới "Ngày N" 3 cột + 1 ngày đang chọn + Ngày trước/Ngày sau), `PriceIncludedTabs` (2 tab "Bao gồm (n) / Chưa bao gồm (n)"), `TermsTabs` (lưới 2 cột, nhãn kèm số `<li>` cấp ngoài cùng khi > 1). Bản Accordion cũ (`TourScheduleHtmlAccordion`, `PriceIncludedCard`, `TermsHtmlAccordion`) **vẫn dùng ở `detailTour.tsx`**. Mini app: `zalo-miniapp/src/components/TourDetailSections.tsx`
- `tour/TourImage.tsx` — **Bắt buộc** dùng thay `<Image>` RN cho ảnh tour từ API (expo-image: spinner khi chờ, fade-in, cache memory+disk, tự retry 2 lần khi lỗi). Đã dùng ở `TourCard`, `ImageCarousel`
- `guide/` — **Hướng dẫn lần đầu** (2026-10-26): `GuideOverlay` (lớp tối khoét sáng phần tử bằng Svg `evenodd`, đo `measureInWindow` mỗi 250ms, khung chú thích dưới/trên vùng sáng, chạm chỗ tối = Tiếp, Back Android = Bỏ qua), `GuideHelpButton` (nút ? — Trang chủ cạnh chuông qua `Header guideTab`, các tab khác qua `TabHeader guideTab`, Tài khoản đặt tay cạnh "Sửa hồ sơ"). Nội dung bước: `constants/guideSteps.ts`. Gắn phần tử: `ref={useGuideTarget("home.member")}` (View thường thêm `collapsable={false}`; danh sách chỉ phần tử đầu đăng ký); màn có ScrollView dài đăng ký `useGuideScroller` để hướng dẫn cuộn tới; mỗi tab gọi `useTabGuide(tab, ready)`. Phần tử không có trên màn → bước tự bỏ qua. Thêm bước mới: thêm key vào `guideSteps.ts` + gắn ref, sửa cả bản mini app (`zalo-miniapp/src/components/GuideOverlay.tsx`, `GuideHelpButton.tsx`, `context/GuideContext.tsx`)
- `ui/` — Primitive UI: `Accordion`, `Card`, `SectionTitle`, `PrimaryButton`, `ChoiceChip` (nút chọn 1-trong-nhiều, `variant` solid = nền đỏ / outline = viền đỏ)

### `context/`
React Context providers — wrap trong `app/(root)/_layout.tsx`.

- `Auth_Context.tsx` — `isLoggedIn`, `user`, `token`, `points`, `logout()`, `refreshPoints()`
- `Theme_Context.tsx` — `theme: "light" | "dark"`, `toggleTheme()`
- `Notification_Context.tsx` — `unreadCount`
- `ScrollVisibility_Context.tsx` — Ẩn/hiện bottom tab khi scroll
- `Guide_Context.tsx` — Hướng dẫn lần đầu: `GuideProvider` (trong `ChatbotProvider`, bọc Stack ở `app/(root)/_layout.tsx`, tự render `GuideOverlay`), "đã xem" lưu AsyncStorage `guide_seen:<userId>` (mảng tab; xem xong hoặc Bỏ qua đều tính). Tự hiện khi vào tab lần đầu (chỉ khi đã đăng nhập); rời tab giữa chừng → tạm dừng, lần sau vào lại hiện tiếp. Bỏ qua → làm nổi nút ? kèm lời nhắc "xem lại bằng biểu tượng ?"
- `Chatbot_Context.tsx` — Chatbot bttAI: `messages`, `isOpen`, `isMinimized`, `sheetVisible`, `send`, `retry`, `clear`. Lưu AsyncStorage `chatbot:<userId>` (≤50 tin, bỏ tin >3 ngày), `/clear` đổi `conversationId` và xoá lịch sử server. Nằm **trong** `AuthProvider`

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
- `auth.ts`, `user.ts`, `tour.ts`, `booking.ts`, `voucher.ts`, `departure.ts`, `notification.ts`, `pin.ts`, `feedback.ts`, `referral.ts`, `news.ts`, `tips.ts`, `chatbot.ts` (backend chatbot riêng, xem `api-and-services.md`)

### `constants/`
Hằng số toàn app — **không hardcode** giá trị này trực tiếp.

- `typography.ts` — `FONT_SIZE` object (xs, sm, md, lg, xl, ...)
- `theme.ts` — Bảng màu (light/dark palettes)
- `tourFilters.ts` — `SearchMode` enum, danh sách filter options
- `faqContent.ts` — Câu hỏi thường gặp (do AI soạn, chờ công ty duyệt)
- `companyInfo.ts` — Thông tin công ty, văn phòng, đại lý nước ngoài (nguồn: benthanhtourist.com/gioi-thieu, /lien-he)
- `termsContent.ts` — Nội dung màn Điều khoản (`TOUR_TERMS` trong nước/nước ngoài nguyên văn từ web; Điều 1/2/4/5 do AI soạn, có nhãn trên UI, chờ công ty duyệt)

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
