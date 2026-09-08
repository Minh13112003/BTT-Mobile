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
| `GET /api/tour/hot` | Tour hot — KHÔNG phân trang, trả cố định toàn bộ mảng hiện có |
| `GET /api/tour/list` | Tour sắp khởi hành — CÓ phân trang chuẩn Laravel (`links`/`meta`) |

Response mẫu đầy đủ + phân tích khác biệt với NestJS: xem `docs/laravel-tour-api-samples.md`.

## Trạng thái migrate (cập nhật mỗi lần chuyển xong 1 domain)

| Domain | Backend hiện tại | Ghi chú |
|---|---|---|
| Auth | NestJS | Chưa migrate |
| User/Profile | NestJS | Chưa migrate |
| Booking | NestJS (+ snapshot Laravel) | Vẫn tạo booking qua NestJS `POST /api/v1/bookings`. **DEMO (branch `demo/laravel-booking`)**: khi đặt tour nguồn Laravel, app gửi thêm `{ source:"LARAVEL", tourKey, departureKey, departureDate, unitPrice }`; backend NestJS gọi `benthanhtourist.com/api/tour/item` lấy snapshot (tourName/code/image/days/nights/departurePlace/stockQty…) lưu vào `bookings`, `idTour`/`departureId` để null. `detailTour.tsx` đọc booking NestJS (số khách/giá/voucher/status/ngày KH) **và** gọi lại `getTourItemMapped(tourKey)` (Laravel) để render hero + lịch trình HTML + điều khoản. `history.tsx` chỉ dùng snapshot NestJS. Xem lưu ý `Departure` bên dưới |
| Voucher | NestJS | Chưa migrate |
| Tour (category + item + hot + list) | **Laravel** | `getPopularTours` **vẫn NestJS** (mode "popular", Laravel không có endpoint tương đương "bán chạy"). `getNewestTours` chỉ còn dùng nội bộ cho client-side date-filter trong `useTourSearch.ts`, không còn mode/section nào hiển thị "Tour mới nhất" (NestJS) nữa. Domestic/foreign/hot/upcoming (`useTourSearch.ts`), toàn bộ Tour Detail (`useTourDetail.ts`), và Home hot-carousel + "Tour sắp khởi hành" (`useHomeTours.ts`) đã sang Laravel |
| Departure | **Laravel** (gộp vào Tour Detail) | Không còn endpoint `/departures/tour/:id` riêng — `DeparturePicker` nhận `departures` từ `tour.departures` (map từ `tour_days[]`). ⚠️ `getDeparturesByTour`/`getDepartureById` trong `services/departure.ts` không còn được gọi ở Detail nhưng vẫn tồn tại — kiểm tra `checkout.tsx`/booking flow trước khi xoá |
| Notification | NestJS | Chưa migrate |
| Referral | NestJS | Chưa migrate |
| Feedback | NestJS | Chưa migrate |
| News (Blog) | **Laravel** | `getNews()` (Home carousel) chỉ lấy category `46` "Tin tức hoạt động công ty". Trang Tin tức (`app/(root)/news/index.tsx`) dùng 3 category cố định `46`/`44`/`8`, **KHÔNG còn chip "Tất cả"** (bỏ 2026-07-16, xem ghi chú bên dưới) — mặc định chọn category đầu tiên, mỗi chip phân trang thật (infinite scroll) qua `getBlogCategoryMapped()`. Chi tiết bài viết (`app/(root)/news/[id].tsx`) qua `getBlogItemMapped()`/`/api/blog/item`, badge category dùng tên thật (`categoryName`) thay vì enum cứng COMPANY/PROMOTION/DESTINATION/OTHER cũ |
| Travel Tips | NestJS | Chưa migrate |
| PIN | NestJS | Chưa migrate |

> Cập nhật cột "Backend hiện tại" → `Laravel` khi domain đó đã chuyển xong và test ổn định. Khi toàn bộ bảng là `Laravel`, hỏi user có muốn xoá code NestJS (client + rule này) không.

## Ghi chú quan trọng phát hiện khi migrate Tour (Laravel)

- **Category không phải cây cha-con** — là gắn thẻ nhiều-nhiều. 1 tour Hà Nội thuộc đồng thời `category_id` của "Trong Nước", "Miền Bắc" và "Hà Nội". Không có `parent_id` trong response `/api/tour/categories`.
- **Tên category → hash**: resolve **động** lúc runtime qua `resolveCategoryHashByName()` trong `services/tour.ts` (fetch `/api/tour/categories` 1 lần, cache module-level, so khớp tên đã normalize dấu/hoa-thường) — không hardcode bảng tên→hash, để tự thích ứng nếu Laravel đổi hash.
- **`tour_days[]` (đợt khởi hành)** — mỗi phần tử có sẵn `departure_date`/`destination_date` riêng (API đã cập nhật 2026-07-15, dùng trực tiếp field này trong `mapTourDaysToDepartures()`, KHÔNG còn parse từ `code` — quy tắc parse cũ đã bỏ).
- **Danh sách tour theo category** (`/api/tour/category`) chỉ có 1 `price`/`departure_date` cố định mỗi tour, KHÔNG có `tour_days[]` — departures ở list chỉ có đúng 1 phần tử giả lập, `availableSeats` chỉ là 0/1 theo `is_available` (không phải số chỗ thật). Số chỗ thật (`stock_qty`) chỉ có ở `/api/tour/item` (chi tiết).
- **`plans[]` (lịch trình) và các field điều khoản** (`tour_price_included`, `warning_note`...) là HTML thô — render bằng `react-native-render-html` qua `TourScheduleHtmlAccordion`/`TermsHtmlAccordion` (component riêng cho Laravel, song song `TourScheduleAccordion`/`TermsAccordion` cũ của NestJS — không xoá component cũ).
- Response mẫu đầy đủ: `docs/laravel-tour-api-samples.md`.
- **Endpoint `/api/tour/item` có thể chậm (>5s)** — `useTourDetail.ts` KHÔNG còn render fallback (dữ liệu cơ bản truyền từ list) ngay lập tức nữa; luôn giữ `loading: true` cho đến khi API trả về (thành công/lỗi), tránh hiện trang detail thiếu lịch trình/điều khoản/đợt khởi hành. `tour/[id].tsx` dùng `<AppLoadingScreen>` (không phải `ActivityIndicator`) cho màn hình chờ, đồng bộ với UI trang chủ. `fallback` giờ chỉ dùng khi API lỗi hẳn (fallback cứu cánh), không dùng để render tạm thời.
- **`plans[].eats` có thêm slug `bua-phu`** ("Bữa phụ") — đã thêm vào `EAT_LABELS` trong `TourScheduleHtmlAccordion.tsx`.
- **Duration format đổi từ "10N9D" sang "10 ngày 9 đêm"** (thẩm mỹ hơn) — sửa ở 2 chỗ trong `services/tour.ts`: `mapTourItemLaravelToTourItem()` và `mapTourItemDetailLaravelToTourDetail()`.
- **Home (`index.tsx`) đã đổi nguồn Laravel hoàn toàn** (2026-07-15) — Featured Carousel dùng `getTourHotMapped()` (`/api/tour/hot`), section "Tour sắp khởi hành" (thay "Tour mới nhất") dùng `getTourListMapped(1)` (`/api/tour/list`), bỏ hẳn "Tour phổ biến". `useHomeTours.ts` → `HomeSections = { hot, upcoming }`.
- **Tab Du lịch thêm 2 mode Laravel**: `"hot"` (gọi `getTourHotMapped()`, không phân trang — mọi `pageNum > 1` trả mảng rỗng vì backend không hỗ trợ `?page=`, khi backend thêm tour hot mới thì mảng tự dài ra) và `"upcoming"` (gọi `getTourListMapped(page)`, phân trang thật). Thêm vào `SearchMode`/`SECTION_LABELS`/`MODE_CHIP_LABELS`/`SECTION_ORDER` trong `constants/tourFilters.ts`. Chip bar 2 hàng trong `search.tsx` đổi `slice(5, 10)` → `slice(5)` để không cắt mất mode cuối khi `SECTION_ORDER` dài hơn 10.
- **`tour_price_included`/`tour_price_not_included` tách khỏi `htmlTerms`** (2026-07-16) — không còn hiển thị trong "Điều khoản & Lưu ý chung" (`TermsHtmlAccordion`), chuyển sang card riêng `PriceIncludedCard.tsx` ("DỊCH VỤ TOUR" — Dịch vụ bao gồm: tick xanh, Chưa bao gồm: **x đỏ**, KHÔNG phải dấu chấm cam), đặt giữa Lịch trình chuyến đi và Thông tin chuyến đi trong `tour/[id].tsx`. Field mới trong `TourDetail`: `htmlPriceIncluded`/`htmlPriceNotIncluded`. **`TripInfoCard.tsx` đã bỏ hẳn phần `included`/`notIncluded`** (từng có tick xanh/dấu chấm cam riêng, trùng lặp với card mới) — ảnh hưởng cả `tour/[id].tsx` (Laravel) và `detailTour.tsx` (booking detail, NestJS), theo yêu cầu user xóa ở cả 2 nơi. `services/tour.ts`: `normalizeTourDetail()` không còn set default `included`/`notIncluded` (`DEFAULT_INCLUDED`/`DEFAULT_NOT_INCLUDED` đã comment lại, không xóa).
- **`splitTopLevelListItems()` (mới, `services/tour.ts`)** — tách HTML `<ul><li>...</li></ul>` thành mảng HTML của từng `<li>` cấp ngoài cùng bằng đếm độ sâu thẻ `<li>` (KHÔNG dùng thư viện HTML parser ngoài — `htmlparser2`/`domhandler` chỉ là transitive dependency của `react-native-render-html`, không khai báo trong `package.json`, không an toàn để import trực tiếp). Xử lý đúng trường hợp `<li>` chứa `<ul>` lồng bên trong (dữ liệu thật: "Vé máy bay quốc tế khứ hồi... `<ul><li>`TPHCM – Rome/Paris...`</li></ul>`" là 1 item duy nhất, không bị tách vỡ) — đã verify bằng data thật của tour Châu Âu (13 items, 1 item có nested list). Dùng chung cho `PriceIncludedCard` và `FeaturedHighlightsCard`.
- **`featured_description`** — field mới, HTML `<ul><li>` (điểm nổi bật tour, phổ biến ở tour nước ngoài/hành hương, thường rỗng ở tour trong nước). Card riêng `FeaturedHighlightsCard.tsx` ("ĐIỂM NỔI BẬT"), đặt sau `DeparturePicker`/trước `TourScheduleHtmlAccordion`. Field mới: `TourDetail.htmlFeaturedDescription`. Ẩn hẳn card khi rỗng.
- **`warning_note_visa`** — field mới, HTML thô, chỉ có ở tour cần visa (nước ngoài dạng hành hương/Schengen...), rỗng ở tour trong nước. Thêm vào `TourTermsLaravel.warningNoteVisa`, hiển thị như 1 section "Lưu ý visa" trong `TermsHtmlAccordion` (tự ẩn nếu rỗng, theo cùng cơ chế filter section rỗng đã có).
- **"Lịch trình chuyến đi" (`TourScheduleHtmlAccordion.tsx`) đóng/mở được cả card** — bấm tiêu đề card để ẩn/hiện toàn bộ danh sách ngày cùng lúc (giống 1 mục trong "Điều khoản & Lưu ý chung"), mặc định mở sẵn (`cardOpen = true`, thấy danh sách ngay khi vào trang). Bên trong, từng ngày vẫn là `Accordion` riêng biệt với hành vi gốc không đổi (`defaultOpen={i === 0}` — chỉ ngày đầu mở sẵn, các ngày khác phải bấm mới xem). ⚠️ Đây KHÔNG phải nút "ẩn/hiện tất cả các ngày cùng lúc" (đã thử hướng đó trước, user phản hồi hiểu sai yêu cầu — mục đích ban đầu là giảm chiều dài UI bằng cách thu gọn cả card, không phải mở/đóng đồng loạt từng accordion con).

## Ghi chú quan trọng phát hiện khi migrate News/Blog (Laravel) — 2026-07-15

- **3 category cố định** do user chỉ định trực tiếp (không resolve tên→id động như Tour): `46` = "Tin tức hoạt động công ty", `44` = "Cẩm nang du lịch", `8` = "Kinh nghiệm du lịch". Hằng số `BLOG_CATEGORY_COMPANY_NEWS`/`BLOG_CATEGORY_TRAVEL_GUIDE`/`BLOG_CATEGORY_TRAVEL_EXPERIENCE` trong `services/news.ts`. ⚠️ User ban đầu nói category "Kinh nghiệm du lịch" là id `7`, nhưng gọi thật thì `category_id=7` trả lỗi `"No Data"` — id đúng trong `/api/blog/categories` là `8`. Đã xác nhận lại với user trước khi code.
- **`category_id=8` ("Kinh nghiệm du lịch") hiện đang rỗng hoàn toàn** (`total: 0`) tại thời điểm migrate — user xác nhận vẫn giữ chip này, chỉ hiển thị trạng thái rỗng có sẵn ("Chưa có tin tức trong mục này"), không cần sửa gì khi backend có bài sau này.
- **`/api/blog/category` có phân trang chuẩn Laravel**, `per_page` xác nhận thực tế là **3** (nhỏ bất thường so với Tour `per_page=10-12`) — category 44 có 299 bài (100 trang), category 46 có 232 bài (78 trang). Trang "Tin tức" dùng infinite scroll thật (`onEndReached`) khi chọn 1 category cụ thể.
- **Chip "Tất cả" đã bị BỎ HẲN (2026-07-16)** — trước đó gộp preview trang 1 (3 bài/category) của cả 3 category qua `Promise.allSettled` (tối đa 9 bài, không phân trang/load more thật), khiến user tưởng "Tất cả" chỉ có 5-6 tin. Laravel không có endpoint gộp toàn bộ tin tức thật (không có `category_id` kiểu "all"), nên theo yêu cầu user, bỏ hẳn chip này — `CATEGORIES` trong `news/index.tsx` giờ chỉ còn 3 phần tử (company/guide/experience), mặc định chọn category đầu tiên (`CATEGORIES[0].key`), mỗi chip luôn phân trang/load more thật qua `getBlogCategoryMapped()`.
- **2 định dạng ngày khác nhau, KHÔNG dùng chung 1 hàm parse**: `/api/blog/category` (list) trả `created_at` dạng `DD/MM/YYYY` (vd `"10/07/2026"`, đã đúng định dạng hiển thị, dùng thẳng không cần format lại); `/api/blog/item` (detail) trả `created_at` dạng `YYYY-MM-DD` (vd `"2026-07-10"`, cần `formatBlogDetailDate()` chuyển sang `DD/MM/YYYY` để khớp UI).
- **`content` (detail) là HTML thô** dùng ảnh **path tương đối** (vd `/storage/btt-news/travel-tips/...`, khác Tour — nơi `plans[].content` không có ảnh cần prefix domain). Hàm `prefixRelativeImageSrc()` trong `services/news.ts` regex-replace `src="/..."` thành full URL trước khi đưa vào `RenderHTML`, nếu không ảnh sẽ vỡ link (path tương đối không tự resolve được trong app). Field `image` top-level (cover) đã là full URL sẵn, không cần xử lý.
- **Badge category ở trang chi tiết đổi từ enum cứng sang tên thật** — `NewsItem.categoryName` (lấy từ `categories[0].name` của response detail) thay cho `CATEGORY_LABEL[item.category]` cũ (map cứng COMPANY/PROMOTION/DESTINATION/OTHER, không còn ý nghĩa với nguồn Laravel).
- Response mẫu đầy đủ: xem `docs/progress.md` (mục News/Blog) hoặc gọi lại API trực tiếp — sample JSON đã lấy: `/api/blog/categories`, `/api/blog/category?category_id=44`, `/api/blog/item?post_id=569`.
