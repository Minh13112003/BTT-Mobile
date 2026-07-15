# Migration API: NestJS → Laravel

## Bối cảnh

Backend cũ (NestJS, `D:\E-Commerce\Backend\e-commerce`) đang được thay thế dần bằng **Laravel** (API chính thức mới). Trong giai đoạn chuyển tiếp, app chạy **song song 2 backend**:

- **NestJS** — API cũ, đa số domain vẫn đang dùng cái này.
- **Laravel** — API mới, migrate dần từng domain một, bắt đầu từ vài bộ API.

Khi tất cả domain đã chuyển xong → xoá hẳn phần NestJS (client + rule này sẽ được dọn lại).

## Nguyên tắc tổ chức code

- **Tách theo file service**: mỗi file trong `services/` (vd `tour.ts`, `booking.ts`, `voucher.ts`...) chỉ gọi **một** backend tại một thời điểm.
- Khi migrate 1 domain sang Laravel → đổi hẳn import trong file service đó sang instance Laravel, không mix 2 backend trong cùng 1 file.
- Không tự ý đổi service khác ngoài phạm vi được yêu cầu — mỗi lần chỉ migrate đúng domain user chỉ định.

## Axios instance

`services/api/interceptor.ts` cần có **2 instance riêng biệt**:

```ts
// Instance cũ (giữ nguyên tên/behavior hiện tại)
export const apiService = { ... }        // → gọi axiosInstance (NestJS)

// Instance mới cho Laravel
const laravelAxiosInstance = axios.create({
  baseURL: LARAVEL_API_BASE_URL,
  timeout: 10000,
});
export const apiServiceLaravel = { ... } // → gọi laravelAxiosInstance
```

- Interceptor logic (đính token, refresh 401...) cần xét lại riêng cho Laravel — **không giả định** Laravel dùng chung cơ chế refresh token / auth header như NestJS cho đến khi xác nhận với user.
- ⚠️ **Response shape khác NestJS** — Laravel không chắc trả cùng format (`{ data: { items } }` kiểu NestJS). Khi viết service function mới gọi Laravel, phải kiểm tra response thực tế trước, không copy nguyên mapper cũ.

## Biến môi trường

- `EXPO_PUBLIC_API_URL` — giữ nguyên, trỏ NestJS.
- `EXPO_PUBLIC_BASE_BTT_URL` — trỏ Laravel (`https://benthanhtourist.com`), đã có trong `.env`. **Bắt buộc prefix `EXPO_PUBLIC_`** — biến không có prefix này sẽ không được Expo inline vào bundle client, gây lỗi âm thầm (không throw, chỉ luôn fallback default).
- `LARAVEL_API_BASE_URL` trong `constants.ts`/`interceptor.ts` đọc trực tiếp `process.env.EXPO_PUBLIC_BASE_BTT_URL`, fallback `'https://benthanhtourist.com'`. Không dùng `Constants.expoConfig?.extra` vì `app.json` hiện chưa khai báo `extra.apiUrl`/`extra.baseBttUrl` (pattern đó tồn tại trong code cũ nhưng luôn undefined trên thực tế — chỉ `process.env` mới có giá trị thật).
- Laravel là **public read API** cho dữ liệu tour — không cần Bearer token/refresh-token flow như NestJS. `apiServiceLaravel` (trong `interceptor.ts`) chỉ set header `Accept: application/json` cố định, không có interceptor 401.

## `services/api/constants.ts`

- Endpoint NestJS: giữ nguyên các hằng `URL_...` hiện có, dùng `API_BASE_URL`.
- Endpoint Laravel: thêm hằng mới, đặt cạnh nhóm domain tương ứng, dùng `LARAVEL_API_BASE_URL`. Đặt tên rõ ràng để phân biệt, ví dụ đề xuất: giữ nguyên naming `URL_...` (không đổi tên hằng khi domain migrate xong, tránh phải sửa lại mọi chỗ import) — chỉ đổi giá trị base URL bên trong.
- Chưa biết chính xác path prefix / cấu trúc route của Laravel — **hỏi user hoặc xin API doc cụ thể** trước khi thêm endpoint mới, không đoán theo pattern `/api/v1/...` của NestJS.

## Quy trình migrate từng domain (checklist)

Khi user yêu cầu chuyển 1 domain (vd "chuyển API tour sang Laravel"):

1. Xác nhận với user: base URL Laravel, endpoint path, response shape thực tế (xin sample response nếu có).
2. Thêm endpoint mới vào `constants.ts` (dùng `LARAVEL_API_BASE_URL`).
3. Sửa file service tương ứng (`services/tour.ts`...) để gọi `apiServiceLaravel` thay vì `apiService`.
4. Nếu response shape khác → viết mapper để hook/component phía trên (`useHomeTours.ts`...) **không cần đổi gì** — giữ nguyên interface trả về cho UI layer.
5. Test lại toàn bộ flow dùng domain đó (theo guardrail mục 3 trong `workflow-guardrails.md`).
6. Cập nhật bảng "Trạng thái migrate" bên dưới.

## API đã xác nhận truy cập được (chưa code, chỉ tham khảo)

`BASE_BTT_URL = https://benthanhtourist.com` — ⚠️ **luôn gửi header `Accept: application/json`**, thiếu header này server redirect 302 về trang chủ thay vì trả JSON.

### Domain Tour

| Endpoint | Mô tả |
|---|---|
| `GET /api/tour/categories` | Danh sách thể loại tour (trộn loại tour + địa điểm, field id là `hash`) |
| `GET /api/tour/category?category_id={hash}` | Danh sách tour theo category, có phân trang chuẩn Laravel (`links`/`meta`) |
| `GET /api/tour/item?tour_key={id}` | Chi tiết 1 tour (nhiều field là HTML string thô) |

Response mẫu đầy đủ + phân tích khác biệt với NestJS: xem `docs/laravel-tour-api-samples.md`.

## Trạng thái migrate (cập nhật mỗi lần chuyển xong 1 domain)

| Domain | Backend hiện tại | Ghi chú |
|---|---|---|
| Auth | NestJS | Chưa migrate |
| User/Profile | NestJS | Chưa migrate |
| Booking | NestJS | Chưa migrate — vẫn tạo booking qua NestJS, xem lưu ý `Departure` bên dưới |
| Voucher | NestJS | Chưa migrate |
| Tour (category + item) | **Laravel** | Migrate xong `getNewestTours`/`getHotTours`/`getPopularTours` **vẫn NestJS** (Laravel không có endpoint tương đương "mới nhất/hot/bán chạy") — chỉ nhánh domestic/foreign (`useTourSearch.ts`) và toàn bộ Tour Detail (`useTourDetail.ts`) đã sang Laravel |
| Departure | **Laravel** (gộp vào Tour Detail) | Không còn endpoint `/departures/tour/:id` riêng — `DeparturePicker` nhận `departures` từ `tour.departures` (map từ `tour_days[]`). ⚠️ `getDeparturesByTour`/`getDepartureById` trong `services/departure.ts` không còn được gọi ở Detail nhưng vẫn tồn tại — kiểm tra `checkout.tsx`/booking flow trước khi xoá |
| Notification | NestJS | Chưa migrate |
| Referral | NestJS | Chưa migrate |
| Feedback | NestJS | Chưa migrate |
| News | NestJS | Chưa migrate |
| Travel Tips | NestJS | Chưa migrate |
| PIN | NestJS | Chưa migrate |

> Cập nhật cột "Backend hiện tại" → `Laravel` khi domain đó đã chuyển xong và test ổn định. Khi toàn bộ bảng là `Laravel`, hỏi user có muốn xoá code NestJS (client + rule này) không.

## Ghi chú quan trọng phát hiện khi migrate Tour (Laravel)

- **Category không phải cây cha-con** — là gắn thẻ nhiều-nhiều. 1 tour Hà Nội thuộc đồng thời `category_id` của "Trong Nước", "Miền Bắc" và "Hà Nội". Không có `parent_id` trong response `/api/tour/categories`.
- **Tên category → hash**: resolve **động** lúc runtime qua `resolveCategoryHashByName()` trong `services/tour.ts` (fetch `/api/tour/categories` 1 lần, cache module-level, so khớp tên đã normalize dấu/hoa-thường) — không hardcode bảng tên→hash, để tự thích ứng nếu Laravel đổi hash.
- **`tour_days[]` (đợt khởi hành) không có field ngày riêng** — phải parse 8 số cuối của `code` dạng `YYYYMMDD` (vd `TD1NFHG2620260823` → `2026-08-23`), xem `parseDepartureDateFromCode()` trong `services/tour.ts`. Quy tắc này đã được user xác nhận từ dữ liệu thật, không phải suy đoán.
- **Danh sách tour theo category** (`/api/tour/category`) chỉ có 1 `price`/`departure_date` cố định mỗi tour, KHÔNG có `tour_days[]` — departures ở list chỉ có đúng 1 phần tử giả lập, `availableSeats` chỉ là 0/1 theo `is_available` (không phải số chỗ thật). Số chỗ thật (`stock_qty`) chỉ có ở `/api/tour/item` (chi tiết).
- **`plans[]` (lịch trình) và các field điều khoản** (`tour_price_included`, `warning_note`...) là HTML thô — render bằng `react-native-render-html` qua `TourScheduleHtmlAccordion`/`TermsHtmlAccordion` (component riêng cho Laravel, song song `TourScheduleAccordion`/`TermsAccordion` cũ của NestJS — không xoá component cũ).
- Response mẫu đầy đủ: `docs/laravel-tour-api-samples.md`.
