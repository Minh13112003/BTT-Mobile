# BenThanh Tourist — Zalo Mini App

Bản port sang Zalo Mini App của app React Native "BenThanh Tourist" (thư mục gốc
`../`). Đây là project web độc lập (React + `zmp-ui` + Vite, build bằng
`zmp-cli`) — không dùng chung tooling với app React Native, chỉ port lại giao
diện + gọi cùng backend.

## Chạy thử (development)

```bash
cd zalo-miniapp
npm install
npm start          # = zmp start --port 5181
```

`zmp start` chạy như 1 web app bình thường — xem trực tiếp bằng trình duyệt,
không cần tài khoản Zalo.

**Port đã cố định sẵn là `5181`** (trong `package.json`, script `start`) —
KHÔNG tự đổi port mỗi lần chạy, kể cả khi thấy báo "port đang bận". Lý do:
`zmp-cli` chạy 2 server — server bọc ngoài ở port bạn truyền (`5181`, chỉ là
khung giả lập điện thoại) và server app THẬT ở port thấp hơn 1 (`5180`, nơi
mọi request gọi API thực sự xuất phát từ đó — xem browser mở đúng
`http://localhost:5180` khi vào qua khung giả lập, hoặc mở thẳng URL đó để bỏ
qua khung giả lập). Backend NestJS cần whitelist CORS cho đúng origin
`http://localhost:5180` — đổi port bất kỳ lúc nào (vd `--port 5173`) sẽ đổi
luôn origin này, khiến request bị CORS chặn lại dù trước đó đã chạy được.

Nếu port 5181/5180 bị chiếm bởi app khác trên máy, đổi cả `package.json`
("start": "zmp start --port <port_mới>") **và** cập nhật lại CORS backend
cho origin `http://localhost:<port_mới - 1>` tương ứng — đổi đồng bộ cả 2
phía, không đổi 1 bên.

Để xem đúng trong môi trường Zalo thật (preview qua QR code):

```bash
npm run start:zalo  # = zmp start -D — tunnel công khai, quét QR bằng Zalo
```

**Yêu cầu trước khi deploy/preview-trong-Zalo**: cần có App ID đăng ký qua
[Zalo Mini App Studio](https://mini.zalo.me) (tài khoản Zalo Developer riêng
của công ty). Chạy `npx zmp-cli login` lần đầu để đăng nhập, App ID sẽ được
hỏi/gắn lúc đó — không cấu hình sẵn trong code.

## Vite 5 (nâng cấp 08/10/2026 — Zalo yêu cầu)

- `vite@5`, `@vitejs/plugin-react@4`, `zmp-vite-plugin` (đã gỡ
  `@vitejs/plugin-react-refresh` của Vite 2). Config theo template chính thức
  `Zalo-MiniApp/zmp-blank-templates` nhánh `vite-5-typescript`.
- `zmp-cli` 4.0.3 vẫn tự kéo theo Vite 2 nhưng nằm lồng trong
  `node_modules/zmp-cli/node_modules` — `zmp start/deploy` dùng bản Vite 5 ở gốc.
- `optimizeDeps.include` khai báo tay trong `vite.config.mts` (ESM, đổi từ `.ts` để hết cảnh báo "CJS build of Vite deprecated"): root là `./src`
  nhưng `index.html` ở gốc → Vite 5 không tự dò entry, bỏ qua pre-bundle, dev
  qua tunnel rất chậm. Thêm thư viện lớn mới thì bổ sung vào list này.
- Chỉ ảnh hưởng mini app — app Expo (App Store/Google Play/Expo Go) build bằng
  Metro, không dùng Vite.

## Biến môi trường

Xem `.env` (không commit, đã gitignore) — `.env.example` cho các giá trị mẫu
(xem file `.env` hiện tại). `VITE_API_URL` cần trỏ đúng IP LAN máy chạy backend
NestJS (giống cách app React Native cấu hình `EXPO_PUBLIC_API_URL`).

## Bắt buộc đăng nhập

- Đăng nhập lấy từ **NestJS** (BE phụ, dựng API demo thay cho phần
  benthanhtourist.com chưa có). Chưa đăng nhập thì mọi route đều bị `AuthGate`
  (`components/App.tsx`) chuyển về `/login` — tương đương splash `app/index.tsx`
  bên RN. Route public duy nhất: `/login`, `/forgot-password`, `/reset-password`.
- Refresh token thất bại → interceptor phát sự kiện `auth:expired` (KHÔNG
  `window.location.href = "/login"` — trong Zalo app chạy dưới
  `/zapps/<APP_ID>/`, redirect tuyệt đối rơi ra ngoài app) → `AuthContext`
  đăng xuất → `AuthGate` tự về `/login`.

## Những gì ĐÃ port đầy đủ

- Toàn bộ 5 tab chính: Trang chủ, Du lịch (tìm kiếm/lọc), Lịch sử đặt tour,
  Thông báo, Tài khoản.
- Chi tiết tour → chọn ngày khởi hành → Thanh toán → đặt tour thật (gọi cùng
  API `services/booking.ts`).
- Đăng nhập / Quên mật khẩu / Đặt lại mật khẩu (2 cái sau vẫn là mock phía
  backend giống bản RN gốc — TODO gốc chưa có API thật).
- Thẻ thành viên (Membership) — giữ nguyên 1:1 thiết kế card đã chốt ở bản RN
  (logo 36px, "BenThanh Tourist" đầy đủ, chip trái/điểm tích lũy dọc phải).
- Hồ sơ cá nhân (sửa thông tin, đổi avatar, đổi mật khẩu), Kho voucher, Góp ý,
  Giới thiệu bạn bè.
- Tin tức & Mẹo du lịch (list + chi tiết, load more phân trang thật).
- Dark mode — đồng bộ cả token riêng của app (`html.dark`) lẫn cơ chế theme
  riêng của `zmp-ui` (`body[zaui-theme]`).
- **Đồng bộ đợt 08/10/2026** (theo các thay đổi chưa commit bên RN ngày 06–07/10):
  - `PrimaryButton` (`components/PrimaryButton.tsx`) — nút CTA viên thuốc đỏ bóng,
    dùng ở TourCard, Đặt tour, Checkout, Login, Quên/Đặt lại mật khẩu, Góp ý.
    Có `as="span"` để dùng bên trong 1 vùng bấm khác (không lồng `<button>`).
  - TourCard mới (nền sóng đỏ, 3 dòng 📅/💰/🕒), Login redesign (gradient đỏ đậm,
    logo in chìm, form kính mờ).
  - Tour yêu thích: nút tim ở chi tiết tour + tab "Yêu thích" trong Lịch sử
    (`services/favorite.ts`, `components/FavoritesList.tsx`).
  - Chọn voucher kiểu Grab: `components/VoucherPickerSheet.tsx` là **lớp phủ
    trong checkout**, không phải route riêng như `voucher-picker.tsx` bên RN —
    để form checkout không bị reset và không cần bridge `voucherSelection.ts`.
  - Mã tour theo đợt khởi hành (`Departure.code`), gộp đợt top-level vào
    `tour_days`, `hasVat` suy từ "Dịch vụ bao gồm", dòng VAT chuẩn hoá "Bao gồm VAT".
  - Fix: chi tiết tour giờ truyền `source=LARAVEL` sang checkout (trước đó thiếu
    → booking gửi sai payload kiểu NestJS).

## Những gì CHƯA port (quyết định phạm vi có chủ đích)

- **PIN bảo mật** (`setup-pin`/`change-pin`, xác nhận PIN trước khi đặt tour) —
  Zalo Mini App không có SecureStore/keychain/biometric cấp hệ điều hành như
  native app. Checkout hiện dùng 1 bước confirm đơn giản (`confirm()`) thay
  cho bước xác nhận PIN.
- **Push notification** — app RN dùng Firebase/`expo-notifications`; Zalo Mini
  App dùng cơ chế gửi tin nhắn qua Zalo OA (Official Account), hoàn toàn khác
  cơ chế, cần thiết kế riêng nếu muốn làm.
- **Đăng ký khách hàng (admin)** — màn hình chỉ dành cho role ADMIN, ngoài
  phạm vi v1.
- **Giao diện cuộn-thu-gọn (collapsing header)** ở Search/History — bản RN
  dùng `Animated.diffClamp` đồng bộ với scroll; bản web dùng header tĩnh đơn
  giản hơn cho v1.

## Cấu trúc

```
src/
  app.ts                 # Entry point
  components/App.tsx      # Provider stack + router + bottom nav
  components/             # Header, Footer, TourCard, BottomNav, icons SVG...
  context/                 # AuthContext, ThemeContext, NotificationContext
  services/                # Port 1:1 từ ../services (API layer dùng chung)
  hooks/                    # Port từ ../hooks (useHomeTours, useTourSearch...)
  constants/                # theme.ts, typography.ts, tourFilters.ts
  pages/<route-name>/index.tsx   # Mỗi route 1 thư mục
```

## Test trên điện thoại qua Zalo thật

1. `npx zmp-cli login` (1 lần, mở trình duyệt đăng nhập Zalo Developer).
2. `npm run start:zalo` (= `zmp start -D`, "Device mode") → mở tunnel HTTPS
   công khai (`*.mini.123c.vn`) và hiện QR code trên terminal.
   KHÔNG dùng `-Z` ("Preview on Zalo"): chế độ này gọi `adb reverse` (cần cắm
   USB Android + cài adb, thiếu adb sẽ crash `spawn adb ENOENT`) và QR trỏ về
   `localhost` của điện thoại. Lưu ý: tên cờ trong `zmp start --help` dễ gây
   nhầm — đã kiểm chứng thực tế với zmp-cli 4.0.3.
3. Mở app Zalo trên điện thoại → quét QR → xem trực tiếp trong Zalo.
4. Khi ưng ý: `npm run deploy` (= `zmp deploy`) để publish lên Zalo Mini App
   Studio, sau đó nộp xét duyệt (khoảng 72 giờ làm việc).
