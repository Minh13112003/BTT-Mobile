# Progress — việc đang dang dở

## [XONG] Tour Detail: tách card Dịch vụ tour, thêm Điểm nổi bật + Lưu ý visa, nút ẩn/hiện lịch trình — 2026-07-16

**Trạng thái**: Hoàn thành. `npx tsc --noEmit` sạch. Toàn bộ mapper/split logic đã verify bằng data thật của 2 tour (Châu Âu hành hương có visa+featured, Miền Tây trong nước rỗng cả 2 field) qua Node script. Xem chi tiết đầy đủ trong `.claude/rules/laravel-migration.md`.

**Tóm tắt**:
- `PriceIncludedCard.tsx` (mới) — card "DỊCH VỤ TOUR" tách khỏi điều khoản, mỗi `<li>` gắn tick xanh (bao gồm)/**x đỏ** (chưa bao gồm — sửa từ dấu chấm cam ban đầu, user phản hồi muốn icon x đỏ rõ ràng hơn) qua `splitTopLevelListItems()` (hàm mới, `services/tour.ts`, tự viết đếm-độ-sâu thay vì dùng thư viện HTML parser ngoài không khai báo trong package.json).
- `TripInfoCard.tsx` — **[SỬA LẦN 2]** bỏ hẳn phần "Dịch vụ bao gồm/Chưa bao gồm" (user phản hồi bị trùng lặp với PriceIncludedCard mới). Ảnh hưởng cả `tour/[id].tsx` và `detailTour.tsx` (booking detail cũ) — user xác nhận xóa ở cả 2 nơi. `services/tour.ts`: comment lại `DEFAULT_INCLUDED`/`DEFAULT_NOT_INCLUDED`, bỏ set default `included`/`notIncluded` trong `normalizeTourDetail()`.
- `FeaturedHighlightsCard.tsx` (mới) — card "ĐIỂM NỔI BẬT" từ `featured_description`, đặt sau DeparturePicker/trước Lịch trình.
- `TermsHtmlAccordion.tsx` — bỏ 2 section giá tour (chuyển sang card riêng), thêm section "Lưu ý visa" (`warning_note_visa`).
- `TourScheduleHtmlAccordion.tsx` — **[SỬA LẦN 2, đúng ý user]** cả card đóng/mở được (bấm tiêu đề), mặc định mở sẵn (thấy danh sách ngày ngay), từng ngày bên trong giữ nguyên hành vi gốc (`defaultOpen={i===0}`, bấm mới xem chi tiết ngày đó). Lần đầu hiểu sai thành "nút ẩn/hiện tất cả các ngày cùng lúc" (đổi `defaultOpen` của mọi Accordion con đồng loạt) — đã sửa lại theo phản hồi của user.

**Chưa test trên app thật** — cần user xác nhận UI (đặc biệt layout tick/x của PriceIncludedCard với nội dung `<li>` lồng `<ul>` con, và hành vi đóng/mở card lịch trình) trên emulator/thiết bị thật.

## [XONG] Migrate trang Tin tức (News) sang Laravel — 2026-07-15

**Trạng thái**: Hoàn thành. `npx tsc --noEmit` sạch. Mapper đã verify bằng data thật (Node script, không phải chạy trong app). Xem chi tiết đầy đủ trong `.claude/rules/laravel-migration.md` (mục "Ghi chú quan trọng phát hiện khi migrate News/Blog").

**Chưa test được** (không có emulator): render UI thật, dark mode, infinite scroll trên thiết bị, ảnh trong `content` load đúng sau khi prefix domain. Cần user tự kiểm tra trên app.

## [XONG] Ảnh trong nội dung chi tiết bài viết không hiển thị — 2026-07-16

**Cập nhật**: user xác nhận ảnh đã hiển thị bình thường trên app thật (screenshot). Không rõ nguyên nhân gốc thật sự (có thể do cache Metro/app lúc test lần đầu) — không cần debug thêm, nghi ngờ layout nêu dưới đây coi như không xác nhận được và không còn cần thiết, giữ lại làm lịch sử điều tra.

## [XONG] Chú thích ảnh (caption) trong content không căn giữa — 2026-07-16

**Nguyên nhân ban đầu tưởng là** (SAI, đã sửa nhưng không đủ): caption trong HTML Laravel là 1 thẻ `<p style="text-align:center;">` riêng (KHÔNG phải `<figcaption>` — style đó trong `tagsStyles` vô nghĩa vì HTML không dùng thẻ này). Lần sửa đầu: bỏ `textAlign: "left"` cứng khỏi `tagsStyles.p` trong `app/(root)/news/[id].tsx` — **user xác nhận vẫn KHÔNG hiệu quả** (screenshot 2 vẫn căn trái).

**Nguyên nhân thật sự**: đào sâu vào `node_modules/@native-html/transient-render-engine/lib/commonjs/flow/hoist.js` phát hiện `react-native-render-html@6.3.4` có cơ chế "hoist" riêng khi 1 `<p>` chỉ chứa đúng 1 thẻ con phrasing (case của Laravel: `<p style="text-align:center;"><i>caption</i></p>` — chỉ có `<i>` bên trong) — code có comment thừa nhận `textAlign` "only working for the uppermost Text element", và trong thực tế inline `style="text-align:center;"` không được áp dụng đáng tin cậy qua cơ chế này. Đây là hạn chế/bug đã biết của thư viện, không phải lỗi ở code app.

**Fix thật sự** (services/news.ts): thêm `convertCenterAlignStyleToClass()` — regex chuyển `<p style="text-align: center;">` thành `<p class="ql-align-center">` NGAY TRONG STRING HTML trước khi đưa vào `RenderHTML`, tận dụng `classesStyles["ql-align-center"] = {textAlign:"center",...}` đã có sẵn trong `[id].tsx` (cơ chế này vốn dùng cho nội dung Quill/CKEditor cũ của NestJS, đã được xác nhận hoạt động ổn định — `classesStyles` không bị ảnh hưởng bởi bug hoist inline-style). Áp dụng trong `getBlogItemMapped()`, cùng chỗ với `prefixRelativeImageSrc()`.

**Đã verify bằng Node script** (không phải chạy trong app) với đúng content thật của bài "BenThanh Tourist đạt Top 10..." (post_id=566): `<p style="text-align:center;"><i>Đại diện BenThanh Tourist...</i></p>` → `<p class="ql-align-center"><i>Đại diện BenThanh Tourist...</i></p>` — đúng như mong đợi. Đã bỏ dòng `textAlign: "left"` cứng ở lần sửa trước (giữ nguyên, không revert — vẫn đúng hướng, chỉ chưa đủ).

**Chưa test trên app thật** — cần user xác nhận lại sau khi bug ảnh trống ở mục trên (nay đã tự hết, không rõ nguyên nhân) không tái diễn.

## [ĐANG DEBUG] Ảnh trống trở lại — case cụ thể: `<figure style="width:75%;"><img style="aspect-ratio:1200/800;" ...></figure>` — 2026-07-16

User báo lại (post_id=569, bài Visa Schengen): ảnh vẫn trống dù caption đã căn giữa đúng. Cung cấp chính xác đoạn HTML lỗi:
```html
<figure class="image image_resized" style="width:75%;"><img style="aspect-ratio:1200/800;" src="/storage/btt-news/travel-tips/chau-au/visa-schengen-1.jpg" alt="visa-schengen-(1)" width="1200" height="800" loading="lazy"></figure>
```

So sánh với bài ĐÃ hiện ảnh thành công trước đó (post_id=566): `<p><img src="..." alt="..." loading="lazy"></p>` — **không** có `<figure>` bọc, **không** có `style="aspect-ratio"`, **không** có `width`/`height` attribute trên `<img>`.

**Đã loại trừ bằng test trực tiếp `css-to-react-native`** (thư viện thực sự parse CSS→RN style trong engine): cả `aspectRatio: '1200/800'` → `1.5` và `width: '75%'` → `"75%"` đều parse thành công, KHÔNG throw lỗi. Vậy không phải lỗi cú pháp CSS.

**Giả thuyết (chưa chứng minh 100% — không có emulator để log runtime)**: `<figure style="width:75%;">` khiến container `<figure>` (1 View) co theo % của cha, nhưng custom `renderers.img` trong `[id].tsx` trả về `<TouchableOpacity>` KHÔNG có `width` tường minh (chỉ có `marginVertical`/`borderRadius`/`overflow`) — nếu container `<figure>` không resolve đúng %, `TouchableOpacity` có thể co về 0, và `<Image style={{width:"100%"}}>` bên trong nó cũng theo đó = 0.

**Fix áp dụng** (`app/(root)/news/[id].tsx`):
- `renderers.img`: thêm `width: "100%"` tường minh vào style của `TouchableOpacity` bọc ngoài `<Image>` — không còn phụ thuộc vào container cha resolve đúng %.
- `tagsStyles.figure`: thêm `width: "100%"` tường minh — ép `<figure>` luôn full-width bất kể `style="width:75%"` từ HTML gốc.

**Mức độ tin cậy của fix này**: TRUNG BÌNH. Đã verify CSS parse không lỗi, nhưng chưa verify được layout runtime thực tế (cần emulator). Nếu vẫn không hiện ảnh sau fix này, nghi ngờ tiếp theo nên là: `width`/`height` attribute trên `<img>` (1200x800, rất lớn) kết hợp `aspectRatio` có thể khiến `useIMGElementState`/kích thước tính toán tràn hoặc NaN ở tầng khác — nhưng vì đang dùng `renderers.img` custom (override hoàn toàn default `IMGElement`), lý thuyết default-renderer's dimension logic không nên chạy. Cần xác nhận qua console.log runtime nếu fix lần này chưa đủ.

## [ĐÃ ĐÓNG — không xác nhận được, không cần nữa] Ảnh trong nội dung chi tiết bài viết không hiển thị — 2026-07-16

**Hiện tượng** (user báo qua screenshot): tại `app/(root)/news/[id].tsx`, mọi `<img>` trong `content` (HTML) đều hiện khoảng trắng thay vì ảnh — user xác nhận **tất cả** ảnh đều trống, không phải lỗi riêng lẻ 1 tấm.

**Đã loại trừ được (verify bằng script/curl thật, không phải đoán)**:
- `prefixRelativeImageSrc()` trong `services/news.ts` hoạt động đúng — test với chính `<img>` mẫu thật (kể cả có `style="aspect-ratio:..."` chen giữa `<img>` và `src`) đều prefix domain chính xác.
- URL ảnh sau khi prefix trả về **HTTP 200**, `content-type: image/jpeg` thật (test bằng `curl`).
- `cleanTextForVietnamese()` trong `[id].tsx` (chạy sau prefix) không làm hỏng URL đã prefix — test riêng, giữ nguyên URL.
- API type của `react-native-render-html@6.3.4`: `CustomRendererProps<T>` có field `tnode: T` hợp lệ — `props.tnode.attributes.src` trong `renderers.img` là cách truy cập đúng theo type definition (`node_modules/react-native-render-html/lib/typescript/shared-types.d.ts:902`), không phải API sai/lỗi thời.

**Nghi ngờ còn lại (CHƯA xác nhận)**: `renderers.img` trong `[id].tsx` (dòng ~71-88) trả về `<TouchableOpacity style={{marginVertical, borderRadius, overflow}}>` (không có `width`/`height` tường minh) bọc `<Image style={{width:"100%", height:220}}>`. Nếu `<img>` là inline/phrasing element trong flow layout của RenderHTML mà container thay thế không được cấp width rõ ràng, `width:"100%"` có thể resolve về 0. **Chưa chứng minh được** vì đây là code renderer cũ (không đổi khi migrate), từng chạy được với nguồn NestJS trước đây — nên nếu đúng là nguyên nhân, cần hiểu tại sao trước đây không lộ vấn đề (có thể ảnh NestJS luôn có sẵn `width`/`height` attribute số nguyên trong content, khác cấu trúc `<figure><img style="aspect-ratio:...">` của Laravel).

**Đang chờ**: user long-press vào ô trống trên app thật để xác định:
- Có hiện context menu "Save image" (ảnh Image component tồn tại nhưng ảnh không load — network/URL issue) → nếu vậy quay lại kiểm tra `src` thực nhận được lúc runtime (có thể cần thêm `console.log(src)` tạm trong renderer).
- Hoàn toàn không có gì phản hồi (component không render / bị co về 0 kích thước — layout issue) → sửa hướng thêm `width`/`height`/`aspectRatio` tường minh cho ảnh trong renderer, có thể dùng `props.width`/`props.height` nếu RenderHTML cung cấp qua tnode attributes (`width`, `height` có sẵn trong HTML thật, xem `docs/laravel-tour-api-samples.md`/mẫu content: `width="1200" height="800"`).

**File liên quan**: `app/(root)/news/[id].tsx` (renderer + RenderHTML config), `services/news.ts` (`prefixRelativeImageSrc`).

---

### Nội dung tham khảo gốc (giữ lại làm lịch sử quyết định)

### Bối cảnh

User có API blog mới từ Laravel để thay thế trang Tin tức hiện tại (đang dùng NestJS qua `services/news.ts`, `app/(root)/news/index.tsx`, `app/(root)/news/[id].tsx`).

### 3 endpoint xác nhận truy cập được

`BASE_BTT_URL = https://benthanhtourist.com`, luôn cần header `Accept: application/json`.

| Endpoint | Mô tả |
|---|---|
| `GET /api/blog/categories` | Danh sách toàn bộ thể loại blog (id + name) |
| `GET /api/blog/category?category_id={id}` | Danh sách bài viết theo category — CÓ phân trang chuẩn Laravel (`links`/`meta`) |
| `GET /api/blog/item?post_id={id}` | Chi tiết 1 bài viết |

### 3 category dùng (đã xác nhận với user)

- `46` = "Tin tức hoạt động công ty"
- `44` = "Cẩm nang du lịch"
- `8` = "Kinh nghiệm du lịch" — ⚠️ user ban đầu nói ID `7`, gọi thử `category_id=7` trả lỗi `{"error":true,"data":null,"message":"No Data"}`. Trong response `/api/blog/categories` thực tế, "Kinh nghiệm du lịch" có `id: 8`. Đã hỏi lại user và **user xác nhận dùng `8`**.
- Bỏ "Mẹo du lịch" (category cũ không dùng nữa theo yêu cầu user).

### Response mẫu đã lấy được

**`/api/blog/categories`**:
```json
{"error":false,"data":[{"id":48,"name":"Tuyển dụng"},{"id":46,"name":"Tin tức hoạt động công ty"},{"id":47,"name":"Thông tin Visa"},{"id":49,"name":"Quy định & Cam Kết"},{"id":10,"name":"Mua sắm"},{"id":8,"name":"Kinh nghiệm du lịch"},{"id":45,"name":"Khuyến mãi"},{"id":35,"name":"Giải Thưởng Du Lịch"},{"id":11,"name":"Địa danh nổi tiếng"},{"id":53,"name":"Du lịch xanh"},{"id":12,"name":"Du lịch trong nước"},{"id":13,"name":"Du lịch nước ngoài"},{"id":52,"name":"Cẩm nang tìm việc"},{"id":44,"name":"Cẩm nang du lịch"},{"id":9,"name":"Ẩm Thực"}],"message":"Success"}
```

**`/api/blog/category?category_id=44`** (item rút gọn, có phân trang):
```json
{
  "data": [
    {
      "id": 569,
      "name": "Bí quyết xin Visa Schengen thành công ngay lần đầu dành cho người mới",
      "description": "Hướng dẫn xin Visa Schengen chi tiết từ A-Z...",
      "image": "https://benthanhtourist.com/storage/btt-news/travel-tips/chau-au/thu-do-amsterdam-mua-thu.jpg",
      "created_at": "10/07/2026"
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "from": null, "last_page": 1, "path": "...", "per_page": 3, "to": null, "total": 0, "links": [...] },
  "error": false,
  "message": "Success"
}
```
⚠️ **CHƯA VERIFY**: mẫu `meta` trên lấy từ `category_id=8` lúc data rỗng (`total: 0`, `per_page: 3` — con số `per_page` này KHÔNG đáng tin vì list rỗng). Cần gọi lại `category_id=44` và `category_id=46` (có data thật) để lấy `per_page`/`total` chính xác trước khi viết mapper phân trang. **Việc này bị dừng giữa chừng khi user ngắt tool call.**

**`/api/blog/item?post_id=569`** (chi tiết đầy đủ):
```json
{
  "error": false,
  "data": {
    "id": 569,
    "name": "Bí quyết xin Visa Schengen thành công ngay lần đầu dành cho người mới",
    "slug": "bi-quyet-xin-visa-schengen-thanh-cong-ngay-lan-dau-danh-cho-nguoi-moi",
    "description": "Hướng dẫn xin Visa Schengen chi tiết từ A-Z cho người Việt...",
    "content": "<p>...</p><h3>...</h3>...",
    "image": "https://benthanhtourist.com/storage/btt-news/travel-tips/chau-au/thu-do-amsterdam-mua-thu.jpg",
    "categories": [
      { "id": 44, "name": "Cẩm nang du lịch", "slug": "cam-nang-du-lich", "url": "https://benthanhtourist.com/tin-tuc/cam-nang-du-lich", "description": "..." }
    ],
    "tags": [],
    "created_at": "2026-07-10",
    "updated_at": "2026-07-10"
  },
  "message": "Success"
}
```

**Lưu ý khác biệt định dạng ngày**: `created_at` ở list (`/api/blog/category`) là `DD/MM/YYYY` (vd `"10/07/2026"`), nhưng ở detail (`/api/blog/item`) là `YYYY-MM-DD` (vd `"2026-07-10"`) — 2 format khác nhau, mapper cần xử lý riêng từng cái, không dùng chung 1 hàm parse.

`content` là HTML thô (CMS/CKEditor output, có `<figure class="image image_resized">`, `<img>` với path tương đối `/storage/...` — cần kiểm tra xem có cần prefix domain không, ảnh mẫu thấy vừa có full URL vừa có path tương đối trong `content`, cần xử lý khi render qua `RenderHTML`).

### Quyết định UI đã chốt với user (KHÔNG cần hỏi lại)

1. **Trang "Tin tức" (`app/(root)/news/index.tsx`)**: thay 4 chip lọc cũ (Tất cả/Công ty/Khuyến mãi/Điểm đến — dựa field `category` nội bộ NestJS) bằng **"Tất cả" + 3 chip đúng tên 3 category mới** (Tin tức hoạt động công ty / Cẩm nang du lịch / Kinh nghiệm du lịch). Chọn "Tất cả" = gộp cả 3 nguồn; chọn 1 chip = gọi đúng `category_id` tương ứng.
2. **Home "Tin tức nổi bật"**: CHỈ lấy tin từ category **46** (Tin tức hoạt động công ty) — không gộp cả 3.

### Việc cần làm khi tiếp tục (chưa code, theo thứ tự)

1. Verify lại `meta`/`per_page`/`total` thật của `category_id=44` và `category_id=46` (có data, không rỗng) trước khi viết mapper phân trang — đây là bước bị dừng dở.
2. Thêm endpoint vào `services/api/constants.ts`: `URL_GetBlogCategories`, `URL_GetBlogCategory`, `URL_GetBlogItem` (dùng `LARAVEL_API_BASE_URL`, đặt cạnh nhóm Tour Laravel hoặc nhóm riêng "Blog APIs (Laravel)").
3. Viết trong `services/news.ts` (hoặc file mới `services/blog.ts` — cân nhắc theo nguyên tắc "mỗi file service chỉ gọi 1 backend tại 1 thời điểm" trong `.claude/rules/laravel-migration.md`; `news.ts` hiện 100% NestJS nên có thể cần tách riêng thay vì mix): hàm gọi Laravel + mapper sang shape `NewsItem` hiện có (giữ nguyên interface cho UI không phải đổi nhiều) — chú ý 3 category cố định (46/44/8), không dùng `resolveCategoryHashByName` vì đây là ID cố định do user chỉ định, không phải tên cần resolve động như Tour.
4. Sửa `app/(root)/news/index.tsx`: đổi `CATEGORIES` sang 3 category mới + "Tất cả", đổi logic fetch (theo category_id, hỗ trợ phân trang/load more nếu cần — kiểm tra lại có bao nhiêu bài mỗi category để quyết định có cần infinite scroll không).
5. Sửa `app/(root)/news/[id].tsx`: đổi `getNewsById` sang gọi `/api/blog/item?post_id=`, map field (`name`→title, `description`→excerpt, `content`, `image`→imageUrl, `created_at` format `YYYY-MM-DD`→hiển thị). Bỏ badge category cứng (COMPANY/PROMOTION/DESTINATION/OTHER), dùng tên category thật từ `categories[0].name`.
6. Sửa nơi gọi `getNews()` cho Home (hiện tại lấy 5 tin mới nhất không phân biệt category) — đổi thành chỉ gọi category 46.
7. Comment code NestJS cũ trong `services/news.ts` (không xoá) theo guardrail.
8. Test: TypeScript (`npx tsc --noEmit`), kiểm tra HTML render đúng (đặc biệt ảnh path tương đối `/storage/...` trong `content` có load được không), dark mode, empty/error state.
9. Cập nhật `.claude/rules/laravel-migration.md` (thêm domain "Blog/News" vào bảng migrate) + tạo/cập nhật file docs sample (có thể thêm section vào `docs/laravel-tour-api-samples.md` hoặc tạo `docs/laravel-blog-api-samples.md` riêng).

### File liên quan (chưa sửa)

- `services/news.ts`
- `services/api/constants.ts`
- `app/(root)/news/index.tsx`
- `app/(root)/news/[id].tsx`
- Nơi Home gọi `getNews()` (cần xác định lại — trước đó `app/(root)/(tabs)/index.tsx` có gọi `getNews()` trực tiếp trong `useEffect`, xem dòng ~144 lúc trước khi sửa phần Tour)
- `.claude/rules/laravel-migration.md`
