# Laravel Tour API — Response Samples

Lấy ngày 2026-07-15 để tham khảo khi migrate domain Tour từ NestJS sang Laravel. Xem quy trình chung tại `.claude/rules/laravel-migration.md`.

⚠️ **Bắt buộc gửi header `Accept: application/json`** — nếu thiếu, server redirect 302 về trang chủ (trả về HTML) thay vì JSON.

Base URL: `https://benthanhtourist.com`

---

## 1. GET `/api/tour/categories`

Danh sách thể loại (bao gồm cả loại tour: Trong Nước/Nước Ngoài/Free & Easy, và địa điểm cụ thể: Sapa, Hong Kong...). Không phân trang, trả full mảng phẳng.

```json
{
  "error": false,
  "data": [
    { "hash": 1, "name": "Trong Nước" },
    { "hash": 2, "name": "Nước Ngoài" },
    { "hash": 78, "name": "Free & Easy" },
    { "hash": 14, "name": "Quảng Bình" },
    { "hash": 60, "name": "Singapore" },
    { "hash": 34, "name": "Nhật Bản" }
  ],
  "message": null
}
```

- ID field tên là **`hash`** (không phải `id`).
- Danh sách trộn lẫn: nhóm cha (1, 2, 78 = loại tour) và con (địa điểm/vùng miền/quốc gia) trong cùng 1 mảng phẳng — không có `parent_id` để phân cấp. Cần hỏi thêm hoặc quan sát pattern hash range nếu cần dựng lại cây phân cấp.

---

## 2. GET `/api/tour/category?category_id={hash}`

Danh sách tour thuộc 1 category — **có phân trang chuẩn Laravel** (`links` + `meta`), khác hẳn kiểu phân trang NestJS hiện tại.

```json
{
  "data": [
    {
      "id": "6449700f76094f4e720dd850c629d5b51772015720",
      "code": "BTTOHK00HCMP20260718",
      "name": "Du Lịch Hong Kong 2026: Đỉnh Núi Thái Bình - Vịnh Nước Cạn - Đại Lộ Ngôi Sao - 01 Free Day (Vietnam Airlines)",
      "image": "https://benthanhtourist.com/resize/600x0/tour/nuoc-ngoai/chau-a/hong-kong/xe-dien-nui-thai-binh-1.webp",
      "departure_place": "Hồ Chí Minh",
      "destination_place": "Hongkong",
      "days": 4,
      "nights": 3,
      "departure_date": "2026-07-18",
      "destination_date": "2026-07-21",
      "price": 18990000,
      "is_available": true
    }
  ],
  "links": {
    "first": "https://benthanhtourist.com/api/tour/category?page=1",
    "last": "https://benthanhtourist.com/api/tour/category?page=4",
    "prev": null,
    "next": "https://benthanhtourist.com/api/tour/category?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 4,
    "path": "https://benthanhtourist.com/api/tour/category",
    "per_page": 12,
    "to": 12,
    "total": 42
  },
  "error": false,
  "message": "Success"
}
```

- `id` ở đây chính là `tour_key` dùng cho endpoint `/api/tour/item`.
- Phân trang: `per_page=12` cố định (chưa rõ có param đổi được không — cần test `?page=2` hoặc `?per_page=`).
- Không có trường giá gốc/giảm giá riêng — chỉ 1 field `price`.
- Không có field `type` (hot/newest/popular) như NestJS — cần hỏi user cách BE Laravel filter nổi bật/mới nhất, hoặc endpoint này chỉ dùng cho browse theo category thôi.

---

## 3. GET `/api/tour/item?tour_key={id}`

Chi tiết 1 tour. Field quan trọng:

```json
{
  "data": {
    "id": "6449700f76094f4e720dd850c629d5b51772015720",
    "code": "BTTOHK00HCMP20260718",
    "name": "Du Lịch Hong Kong 2026: ...",
    "image": "https://.../xe-dien-nui-thai-binh-1.webp",
    "images": ["https://.../bao-tang-co-cung.webp", "..."],
    "departure_place": "Hồ Chí Minh",
    "destination_place": "Hongkong",
    "days": 4,
    "nights": 3,
    "departure_date": "2026-07-18",
    "destination_date": "2026-07-21",
    "stock_qty": 9,
    "price": 18990000,
    "is_available": true,
    "tour_days": [
      {
        "id": "b4e4f4f46bd0c4bac2cc0b3d872a19f21773377357",
        "code": "TD1NFHG2620260823",
        "departure_place": "Hồ Chí Minh",
        "destination_place": "Hà Nội",
        "stock_qty": 10,
        "price": 12690000
      }
    ],
    "plans": [
      {
        "day": "1",
        "title": "TP.HCM - HONG KONG",
        "eats": ["an-trua", "an-toi"],
        "main_vehicles": ["may-bay", "xe-oto"],
        "content": "<p><strong>10:50</strong> Đoàn tập trung tại cột số 12...</p>"
      }
    ],
    "tour_price_included": "<ul><li>Vé máy bay khứ hồi...</li></ul>",
    "tour_price_not_included": "<ul><li>Hộ chiếu còn hiệu lực...</li></ul>",
    "warning_note": "<ul><li>Quý khách từ 70 tuổi trở lên...</li></ul>",
    "cancel_booking": "<ul><li>Sau khi đóng tiền...</li></ul>",
    "tuts_booking_payment": "<p>Thanh toán bằng tiền mặt...</p>",
    "punishment_cancel_booking": "<ul><li>Nếu hủy/ hoãn tour sau khi đặt cọc...</li></ul>",
    "warning_note_visa": "",
    "featured_description": ""
  },
  "error": false,
  "message": "Success"
}
```

Khác biệt lớn nhất so với NestJS (`TourCard`, `TourHero`, `ItineraryTimeline`, `TermsAccordion` hiện đang parse structured data):

- **`plans[].content`, `tour_price_included`, `tour_price_not_included`, `warning_note`, `cancel_booking`, `tuts_booking_payment`, `punishment_cancel_booking`** — tất cả là **HTML string thô** (CMS/WYSIWYG output), không phải mảng bullet có cấu trúc như NestJS. Render bằng `react-native-render-html` qua `TourScheduleHtmlAccordion`/`TermsHtmlAccordion` (xem `components/tour/`).
- `plans[].eats` — mảng slug bữa ăn (`an-sang`, `an-trua`, `an-toi`, `an-chieu`) — map sang label trong `TourScheduleHtmlAccordion` (`EAT_LABELS`).
- `plans[].main_vehicles` — mảng slug phương tiện (`may-bay`, `xe-oto`) — map trong `TourScheduleHtmlAccordion` (`VEHICLE_LABELS`).
- **`tour_days[]`** — mảng nhiều đợt khởi hành thật (tour nào chỉ có 1 lịch thì mảng rỗng, dùng field top-level `departure_date`/`price`/`stock_qty` làm fallback). **Cập nhật 2026-07-15**: mỗi phần tử giờ có sẵn `departure_date`/`destination_date` riêng (trước đó phải parse từ 8 số cuối của `code`, quy tắc cũ đã bỏ — xem lịch sử migration trong `.claude/rules/laravel-migration.md` nếu cần đối chiếu).
- Không thấy field địa chỉ điểm khởi hành cụ thể, số hotline, hoặc rating/review — UI hiện tại (`rating`, `reviewsCount`) tạm để `0`, TourCard tự ẩn phần sao.
- `plans[].eats` có thêm slug `bua-phu` ("Bữa phụ") — đã thêm vào `EAT_LABELS`.

---

## 4. GET `/api/tour/hot`

Tour hot (dùng cho Featured Carousel Home + mode "hot" ở Tab Du lịch). **Không phân trang** — trả cố định toàn bộ mảng hiện có mỗi lần gọi (xác nhận thực tế: 4 tour, `?page=` bị bỏ qua, response không có `meta`/`links`). Item shape giống `TourItemLaravel` (như `/api/tour/category`).

```json
{
  "data": [
    { "id": "...", "code": "...", "name": "...", "image": "...", "departure_place": "Hồ Chí Minh", "destination_place": "Japan", "days": 6, "nights": 5, "departure_date": "2026-11-12", "destination_date": "2026-11-17", "price": 39990000, "is_available": true }
  ],
  "error": false,
  "message": null
}
```

## 5. GET `/api/tour/list`

Tour sắp khởi hành (thay `getNewestTours` NestJS trên Home + mode "upcoming" ở Tab Du lịch). **Có phân trang chuẩn Laravel** (`links`/`meta`, xác nhận thực tế: `per_page=10`, `total=57` → 6 trang). Item shape giống `/api/tour/category`.

```json
{
  "data": [ { "id": "...", "code": "...", "name": "...", "days": 1, "nights": 0, "departure_date": "2026-07-18", "destination_date": "2026-07-18", "price": 1390000, "is_available": true } ],
  "links": { "first": "...?page=1", "last": "...?page=6", "prev": null, "next": "...?page=2" },
  "meta": { "current_page": 1, "last_page": 6, "per_page": 10, "total": 57, ... },
  "error": false,
  "message": "Success"
}
```

---

## Trạng thái implementation hiện tại

Đã migrate: `getTourCategories`, `getToursByCategory`/`getToursByCategoryMapped`, `getTourItem`/`getTourItemMapped`, `getTourHot`/`getTourHotMapped`, `getTourList`/`getTourListMapped` — dùng ở `useTourSearch.ts` (mode domestic/foreign/hot/upcoming), `useTourDetail.ts` (toàn bộ Tour Detail), và `useHomeTours.ts` (Home: carousel hot + section "Tour sắp khởi hành"). Chi tiết đầy đủ + các domain còn lại xem bảng "Trạng thái migrate" trong `.claude/rules/laravel-migration.md`.

Còn dùng NestJS: `getNewestTours` (chỉ còn dùng cho client-side date-filter trong `useTourSearch.ts`), `getPopularTours` (mode "popular", Laravel chưa có endpoint tương đương "bán chạy") và toàn bộ Booking/Checkout.
