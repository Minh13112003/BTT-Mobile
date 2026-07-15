# BenThanh Tourist — API Reference

> Tài liệu này mô tả toàn bộ API đang được sử dụng bởi mobile app.  
> Base URL: `EXPO_PUBLIC_API_URL` (biến môi trường) + `/api/v1`  
> Mọi request cần xác thực đều gắn header: `Authorization: Bearer <accessToken>`

---

## Mục lục

- [Authentication](#authentication)
- [User](#user)
- [Tour](#tour)
- [Departure](#departure)
- [Booking](#booking)
- [Voucher](#voucher)
- [Notification](#notification)
- [PIN](#pin)
- [Feedback](#feedback)
- [Referral](#referral)
- [News](#news)
- [Travel Tips](#travel-tips)

---

## Authentication

### POST `/api/v1/auth/login`

Đăng nhập, trả về access token và refresh token.

**Request body:**

| Thuộc tính | Kiểu     | Bắt buộc | Mô tả                   |
| ---------- | -------- | -------- | ----------------------- |
| `email`    | `string` | ✅       | Email đăng ký tài khoản |
| `password` | `string` | ✅       | Mật khẩu                |

**Response:**

| Thuộc tính     | Kiểu          | Mô tả                                                       |
| -------------- | ------------- | ----------------------------------------------------------- |
| `accessToken`  | `string`      | JWT dùng cho mọi request sau khi đăng nhập                  |
| `refreshToken` | `string`      | Token để lấy lại accessToken khi hết hạn                    |
| `user`         | `UserProfile` | Thông tin cơ bản của user (xem [UserProfile](#userprofile)) |

---

### POST `/api/v1/auth/register`

Đăng ký tài khoản mới. **Gửi dạng `multipart/form-data`** (để hỗ trợ upload avatar khi đăng ký).

**Request body (form-data):**

| Thuộc tính  | Kiểu     | Bắt buộc | Mô tả                      |
| ----------- | -------- | -------- | -------------------------- |
| `email`     | `string` | ❌       | Email                      |
| `password`  | `string` | ✅       | Mật khẩu                   |
| `firstName` | `string` | ✅       | Tên                        |
| `lastName`  | `string` | ✅       | Họ                         |
| `phone`     | `string` | ✅       | Số điện thoại              |
| `avatar`    | `File`   | ❌       | Ảnh đại diện (file upload) |

**Response:** tương tự Login.

---

### POST `/api/v1/auth/logout`

Đăng xuất, hủy refresh token phía server.

**Request body:** `{}` (body rỗng)

**Response:** `{ message: string }`

---

### POST `/api/v1/auth/refresh-token`

Lấy lại access token mới khi token cũ hết hạn. Header phải gửi `refreshToken`.

**Header:**

| Header                                 | Mô tả                                       |
| -------------------------------------- | ------------------------------------------- |
| `Authorization: Bearer <refreshToken>` | Gửi refresh token (không phải access token) |

**Request body:** `{}` (body rỗng)

**Response:**

| Thuộc tính     | Kiểu     | Mô tả                        |
| -------------- | -------- | ---------------------------- |
| `accessToken`  | `string` | Access token mới             |
| `refreshToken` | `string` | Refresh token mới (rotation) |

> ⚠️ Interceptor trong app tự động gọi API này khi nhận lỗi 401, không cần gọi thủ công.

---

## User

### GET `/api/v1/users/me`

Lấy thông tin profile người dùng hiện tại.

**Response: `UserProfile`**

#### UserProfile

| Thuộc tính     | Kiểu             | Mô tả                           |
| -------------- | ---------------- | ------------------------------- |
| `email`        | `string`         | Email tài khoản                 |
| `firstName`    | `string`         | Tên                             |
| `lastName`     | `string`         | Họ                              |
| `phone`        | `string?`        | Số điện thoại                   |
| `age`          | `number?`        | Tuổi                            |
| `earnedPoints` | `number?`        | Tổng điểm tích lũy (lifetime)   |
| `rewardPoints` | `number?`        | Điểm thưởng hiện có (dùng được) |
| `avatarUrl`    | `string \| null` | URL ảnh đại diện                |

---

### PATCH `/api/v1/users/me`

Cập nhật thông tin profile.

**Request body:**

| Thuộc tính  | Kiểu     | Bắt buộc | Mô tả             |
| ----------- | -------- | -------- | ----------------- |
| `email`     | `string` | ❌       | Email mới         |
| `firstName` | `string` | ❌       | Tên mới           |
| `lastName`  | `string` | ❌       | Họ mới            |
| `phone`     | `string` | ❌       | Số điện thoại mới |
| `age`       | `number` | ❌       | Tuổi              |

> `earnedPoints` và `rewardPoints` không được phép cập nhật từ client.

**Response:** `UserProfile` đã được cập nhật.

---

### PATCH `/api/v1/users/me/password`

Đổi mật khẩu.

**Request body:**

| Thuộc tính        | Kiểu     | Bắt buộc | Mô tả             |
| ----------------- | -------- | -------- | ----------------- |
| `currentPassword` | `string` | ✅       | Mật khẩu hiện tại |
| `newPassword`     | `string` | ✅       | Mật khẩu mới      |

**Response:** `{ message: string }`

---

### PATCH `/api/v1/users/me/avatar`

Upload hoặc xóa ảnh đại diện.

**Upload avatar — `multipart/form-data`:**

| Thuộc tính | Kiểu   | Mô tả                  |
| ---------- | ------ | ---------------------- |
| `avatar`   | `File` | File ảnh (jpg, png...) |

**Xóa avatar — `application/json`:**

| Thuộc tính | Kiểu   | Mô tả                 |
| ---------- | ------ | --------------------- |
| `avatar`   | `null` | Gửi `null` để xóa ảnh |

**Response:** `UserProfile` với `avatarUrl` mới.

---

### POST `/api/v1/users/me/fcm-token`

Đăng ký FCM token để nhận push notification.

**Request body:**

| Thuộc tính | Kiểu     | Bắt buộc | Mô tả                        |
| ---------- | -------- | -------- | ---------------------------- |
| `fcmToken` | `string` | ✅       | FCM device token từ Firebase |

**Response:** `{ message: string }`

---

### GET `/api/v1/users/referral`

Lấy thông tin mã giới thiệu và thống kê của user.

> ⚠️ Hiện tại service này đang dùng **mock data** (chưa kết nối thật). Cần implement API thật.

**Response: `ReferralStats`**

| Thuộc tính         | Kiểu     | Mô tả                                              |
| ------------------ | -------- | -------------------------------------------------- |
| `referralCode`     | `string` | Mã giới thiệu cá nhân (ví dụ: `BTTNGUYENVANA2026`) |
| `successReferrals` | `number` | Số người đã đăng ký thành công qua mã này          |
| `earnedPoints`     | `number` | Tổng điểm tích lũy từ referral                     |

---

## Tour

### GET `/api/v1/tours`

Lấy danh sách tất cả tour (phân trang cơ bản).

**Query params:**

| Tham số | Kiểu     | Bắt buộc | Mô tả                         |
| ------- | -------- | -------- | ----------------------------- |
| `page`  | `number` | ✅       | Trang hiện tại (bắt đầu từ 1) |
| `limit` | `number` | ✅       | Số item mỗi trang             |

**Response: `PaginatedResponse<TourItem>`** (xem [TourItem](#touritem) và [PaginatedResponse](#paginatedresponse))

---

### GET `/api/v1/tours/newest`

Danh sách tour mới nhất (sắp xếp theo `createdAt` giảm dần).

**Query params:**

| Tham số | Kiểu     | Mặc định | Mô tả   |
| ------- | -------- | -------- | ------- |
| `page`  | `number` | `1`      | Trang   |
| `limit` | `number` | `10`     | Số item |

**Response: `PaginatedResponse<TourItem>`**

---

### GET `/api/v1/tours/hot`

Danh sách tour đang hot (sắp xếp theo `rating` cao nhất).

**Query params:** tương tự `/newest`

**Response: `PaginatedResponse<TourItem>`**

---

### GET `/api/v1/tours/popular`

Danh sách tour bán chạy nhất (sắp xếp theo số booking nhiều nhất). Response có thêm trường `bookingCount`.

**Query params:** tương tự `/newest`

**Response: `PaginatedResponse<TourItem>`** — mỗi item có thêm:

| Thuộc tính     | Kiểu     | Mô tả            |
| -------------- | -------- | ---------------- |
| `bookingCount` | `number` | Tổng số lượt đặt |

---

### GET `/api/v1/tours/by-type`

Lọc/tìm kiếm tour theo loại hình, quốc gia, vùng, thành phố.

**Query params:**

| Tham số    | Kiểu     | Bắt buộc | Mô tả                                                |
| ---------- | -------- | -------- | ---------------------------------------------------- |
| `country`  | `string` | ❌       | Khớp chính xác tên quốc gia (ví dụ: `"Nhật Bản"`)    |
| `region`   | `string` | ❌       | Khớp chính xác tên vùng                              |
| `city`     | `string` | ❌       | Tìm chứa chuỗi, không phân biệt hoa thường           |
| `tourType` | `string` | ❌       | Loại hình tour (ví dụ: `"Nghỉ dưỡng"`, `"Mạo hiểm"`) |
| `page`     | `number` | ❌       | Mặc định `1`                                         |
| `limit`    | `number` | ❌       | Mặc định `10`                                        |

**Response: `PaginatedResponse<TourItem>`**

---

### GET `/api/v1/tours/:id`

Lấy chi tiết một tour theo ID.

**Path param:** `id` — UUID của tour

**Response: `TourDetail`** (xem [TourDetail](#tourdetail))

---

#### TourItem

| Thuộc tính      | Kiểu              | Mô tả                                           |
| --------------- | ----------------- | ----------------------------------------------- |
| `id`            | `string`          | UUID của tour                                   |
| `name`          | `string`          | Tên tour                                        |
| `imageUrl`      | `string[]`        | Mảng URL ảnh — phần tử đầu tiên là ảnh đại diện |
| `imagePublicId` | `string[]`        | Mảng public ID tương ứng trên Cloudinary        |
| `duration`      | `string`          | Thời gian tour (ví dụ: `"5N4Đ"`)                |
| `rating`        | `number`          | Điểm đánh giá trung bình                        |
| `reviewsCount`  | `number`          | Tổng số đánh giá                                |
| `hasVat`        | `boolean`         | Giá đã bao gồm VAT chưa                         |
| `departureFrom` | `string?`         | Điểm khởi hành (ví dụ: `"TP. Hồ Chí Minh"`)     |
| `transport`     | `string?`         | Phương tiện di chuyển (ví dụ: `"Máy bay"`)      |
| `included`      | `string[]?`       | Danh sách dịch vụ đã bao gồm                    |
| `notIncluded`   | `string[]?`       | Danh sách dịch vụ chưa bao gồm                  |
| `notes`         | `string \| null`  | Ghi chú thêm                                    |
| `tourCountry`   | `string \| null`  | Quốc gia điểm đến                               |
| `tourRegion`    | `string \| null`  | Vùng điểm đến                                   |
| `tourCity`      | `string \| null`  | Thành phố điểm đến                              |
| `tourType`      | `string \| null`  | Loại hình tour                                  |
| `bookingCount`  | `number?`         | Số lượt đặt (chỉ có ở `/popular`)               |
| `schedules`     | `TourSchedule[]?` | Lịch trình theo ngày                            |
| `departures`    | `Departure[]?`    | Danh sách lịch khởi hành                        |

#### TourDetail

Kế thừa toàn bộ `TourItem`, bổ sung thêm:

| Thuộc tính             | Kiểu        | Mô tả                             |
| ---------------------- | ----------- | --------------------------------- |
| `code`                 | `string?`   | Mã tour (ví dụ: `"HQSEL5N"`)      |
| `description`          | `string?`   | Mô tả tổng quan tour              |
| `departureDates`       | `string[]?` | Danh sách ngày khởi hành dạng ISO |
| `highlights`           | `string[]?` | Điểm nổi bật của tour             |
| `singleRoomSupplement` | `number?`   | Phụ thu phòng đơn (VND)           |

#### TourSchedule

| Thuộc tính  | Kiểu             | Mô tả                                         |
| ----------- | ---------------- | --------------------------------------------- |
| `id`        | `string`         | UUID lịch trình                               |
| `tourId`    | `string`         | ID tour                                       |
| `dayNumber` | `number`         | Ngày thứ mấy trong hành trình                 |
| `title`     | `string`         | Tiêu đề ngày (ví dụ: `"Hà Nội - Đà Nẵng"`)    |
| `morning`   | `string \| null` | Hoạt động buổi sáng                           |
| `noon`      | `string \| null` | Hoạt động buổi trưa                           |
| `afternoon` | `string \| null` | Hoạt động buổi chiều                          |
| `evening`   | `string \| null` | Hoạt động buổi tối                            |
| `night`     | `string \| null` | Hoạt động đêm                                 |
| `meals`     | `string[]`       | Các bữa ăn (ví dụ: `["Sáng", "Trưa", "Tối"]`) |

#### PaginatedResponse\<T\>

| Thuộc tính | Kiểu            | Mô tả                |
| ---------- | --------------- | -------------------- |
| `items`    | `T[]`           | Mảng dữ liệu         |
| `meta`     | `PaginatedMeta` | Thông tin phân trang |

#### PaginatedMeta

| Thuộc tính    | Kiểu      | Mô tả                     |
| ------------- | --------- | ------------------------- |
| `total`       | `number`  | Tổng số records           |
| `page`        | `number`  | Trang hiện tại            |
| `limit`       | `number`  | Số item mỗi trang         |
| `totalPages`  | `number`  | Tổng số trang             |
| `hasNext`     | `boolean` | Còn trang tiếp theo không |
| `hasPrevious` | `boolean` | Có trang trước không      |

---

## Departure

### GET `/api/v1/departures/tour/:tourId`

Lấy tất cả lịch khởi hành của một tour. Chưa lọc, có thể bao gồm ngày đã qua.

**Path param:** `tourId` — UUID của tour

**Response: `Departure[]`**

#### Departure

| Thuộc tính       | Kiểu      | Mô tả                                                          |
| ---------------- | --------- | -------------------------------------------------------------- |
| `id`             | `string`  | UUID của lịch khởi hành                                        |
| `tourId`         | `string`  | UUID của tour                                                  |
| `departureDate`  | `string`  | Ngày khởi hành (ISO 8601, ví dụ: `"2026-09-15T00:00:00.000Z"`) |
| `price`          | `number`  | Giá tour cho lịch này (VND)                                    |
| `availableSeats` | `number`  | Số chỗ còn trống                                               |
| `totalSeats`     | `number?` | Tổng sức chứa của đợt                                          |

---

### GET `/api/v1/departures/:id`

Lấy chi tiết một lịch khởi hành theo ID.

**Path param:** `id` — UUID của departure

**Response: `Departure`**

---

## Booking

### GET `/api/v1/bookings/dashboard`

Lấy tổng quan dashboard của user (tổng tour đã đặt, điểm thưởng, đơn gần nhất).

**Response:**

| Thuộc tính     | Kiểu               | Mô tả                      |
| -------------- | ------------------ | -------------------------- |
| `toursCount`   | `number`           | Tổng số tour đã đặt        |
| `rewardPoints` | `number`           | Điểm thưởng hiện có        |
| `recentOrders` | `BookingSummary[]` | Danh sách đơn đặt gần nhất |

---

### GET `/api/v1/bookings/me`

Lịch sử đặt tour của user (phân trang).

**Query params:**

| Tham số | Kiểu     | Bắt buộc | Mô tả             |
| ------- | -------- | -------- | ----------------- |
| `page`  | `number` | ✅       | Trang hiện tại    |
| `limit` | `number` | ✅       | Số item mỗi trang |

**Response:** Mảng booking (phân trang). Mỗi item gồm đầy đủ thông tin booking + tour.

---

### GET `/api/v1/bookings/:id`

Lấy chi tiết một booking theo ID.

**Path param:** `id` — UUID của booking

**Response:** Thông tin đầy đủ booking, bao gồm cả thông tin tour (`booking.tour`) và thông tin departure.

---

### POST `/api/v1/bookings`

Tạo booking mới (đặt tour).

**Request body:**

| Thuộc tính      | Kiểu                             | Bắt buộc | Mô tả                           |
| --------------- | -------------------------------- | -------- | ------------------------------- |
| `idTour`        | `string`                         | ✅       | UUID của tour cần đặt           |
| `departureId`   | `string`                         | ✅       | UUID của lịch khởi hành đã chọn |
| `adults`        | `number`                         | ✅       | Số người lớn (≥ 1)              |
| `children`      | `number`                         | ❌       | Số trẻ em                       |
| `infants`       | `number`                         | ❌       | Số em bé                        |
| `paymentMethod` | `"AT_OFFICE" \| "BANK_TRANSFER"` | ✅       | Hình thức thanh toán            |
| `voucherCode`   | `string \| null`                 | ❌       | Mã voucher giảm giá             |
| `notice`        | `string \| null`                 | ❌       | Ghi chú cho đoàn/chuyến         |

**Response:** Booking vừa tạo.

---

## Voucher

### GET `/api/v1/vouchers`

Lấy danh sách voucher khả dụng (phân trang).

**Query params:**

| Tham số | Kiểu     | Bắt buộc | Mô tả             |
| ------- | -------- | -------- | ----------------- |
| `page`  | `number` | ✅       | Trang hiện tại    |
| `limit` | `number` | ✅       | Số item mỗi trang |

**Response: `PaginatedResponse<VoucherItem>`**

#### VoucherItem

| Thuộc tính    | Kiểu     | Mô tả                                               |
| ------------- | -------- | --------------------------------------------------- |
| `id`          | `string` | UUID voucher                                        |
| `code`        | `string` | Mã voucher (ví dụ: `"SUMMER500"`)                   |
| `title`       | `string` | Tiêu đề ngắn (ví dụ: `"Giảm 10% tối đa 500k"`)      |
| `subtitle`    | `string` | Loại voucher (ví dụ: `"VOUCHER TOUR HÈ"`)           |
| `expiry`      | `string` | Ngày hết hạn dạng text (ví dụ: `"HSD: 30/06/2026"`) |
| `tag`         | `string` | Tag phân loại chiến dịch (ví dụ: `"SUMMER VIBES"`)  |
| `description` | `string` | Mô tả điều kiện áp dụng                             |

---

## Notification

### GET `/api/v1/notifications`

Lấy danh sách thông báo của user (phân trang).

**Query params:**

| Tham số | Kiểu     | Mặc định | Mô tả             |
| ------- | -------- | -------- | ----------------- |
| `page`  | `number` | `1`      | Trang hiện tại    |
| `limit` | `number` | `20`     | Số item mỗi trang |

**Response: `NotificationResponse`**

| Thuộc tính | Kiểu                 | Mô tả                |
| ---------- | -------------------- | -------------------- |
| `items`    | `NotificationItem[]` | Danh sách thông báo  |
| `meta`     | `PaginatedMeta`      | Thông tin phân trang |

#### NotificationItem

| Thuộc tính  | Kiểu             | Mô tả                                              |
| ----------- | ---------------- | -------------------------------------------------- |
| `id`        | `string`         | UUID thông báo                                     |
| `title`     | `string`         | Tiêu đề thông báo                                  |
| `message`   | `string`         | Nội dung thông báo                                 |
| `isRead`    | `boolean`        | Đã đọc chưa                                        |
| `createdAt` | `string`         | Thời điểm tạo (ISO 8601)                           |
| `type`      | `string?`        | Loại thông báo (ví dụ: `"BOOKING"`, `"PROMOTION"`) |
| `refId`     | `string \| null` | ID tham chiếu (ví dụ: ID booking)                  |
| `refType`   | `string \| null` | Loại tham chiếu (ví dụ: `"booking"`)               |

---

### GET `/api/v1/notifications/unread-count`

Đếm số thông báo chưa đọc.

**Response:**

| Thuộc tính | Kiểu     | Mô tả                 |
| ---------- | -------- | --------------------- |
| `count`    | `number` | Số thông báo chưa đọc |

---

### PATCH `/api/v1/notifications/read-all`

Đánh dấu tất cả thông báo là đã đọc.

**Request body:** không có

**Response:** `{ message: string }`

---

### PATCH `/api/v1/notifications/:id/read`

Đánh dấu một thông báo cụ thể là đã đọc.

**Path param:** `id` — UUID thông báo

**Response:** `{ message: string }`

---

## PIN

> PIN là mã 6 số bảo vệ tài khoản. Các endpoint PIN trả **HTTP 400** (không phải 401) khi PIN sai để interceptor không nhầm thành token hết hạn.

### GET `/api/v1/users/me/pin-status`

Kiểm tra user đã thiết lập PIN chưa.

**Response:**

| Thuộc tính | Kiểu      | Mô tả                                  |
| ---------- | --------- | -------------------------------------- |
| `hasPin`   | `boolean` | `true` nếu đã có PIN, `false` nếu chưa |

---

### POST `/api/v1/users/me/pin`

Tạo PIN lần đầu.

**Request body:**

| Thuộc tính | Kiểu     | Bắt buộc | Mô tả           |
| ---------- | -------- | -------- | --------------- |
| `pin`      | `string` | ✅       | Mã PIN 6 chữ số |

**Response:**

| Thuộc tính | Kiểu     | Mô tả                |
| ---------- | -------- | -------------------- |
| `message`  | `string` | Thông báo thành công |

---

### POST `/api/v1/users/me/pin/verify`

Xác minh PIN (dùng khi cần xác thực danh tính).

**Request body:**

| Thuộc tính | Kiểu     | Bắt buộc | Mô tả               |
| ---------- | -------- | -------- | ------------------- |
| `pin`      | `string` | ✅       | Mã PIN cần xác minh |

**Response:**

| Thuộc tính | Kiểu      | Mô tả               |
| ---------- | --------- | ------------------- |
| `success`  | `boolean` | `true` nếu PIN đúng |

> ⚠️ Trả `HTTP 400` (không phải 401) khi sai PIN.

---

### PATCH `/api/v1/users/me/pin`

Đổi PIN (cần biết PIN cũ).

**Request body:**

| Thuộc tính   | Kiểu     | Bắt buộc | Mô tả              |
| ------------ | -------- | -------- | ------------------ |
| `currentPin` | `string` | ✅       | PIN hiện tại       |
| `newPin`     | `string` | ✅       | PIN mới (6 chữ số) |

**Response:**

| Thuộc tính | Kiểu     | Mô tả                |
| ---------- | -------- | -------------------- |
| `message`  | `string` | Thông báo thành công |

---

## Feedback

### POST `/api/v1/feedbacks`

Gửi phản hồi / góp ý từ người dùng.

**Request body:**

| Thuộc tính | Kiểu     | Bắt buộc | Mô tả                                     |
| ---------- | -------- | -------- | ----------------------------------------- |
| `subject`  | `string` | ✅       | Chủ đề góp ý (ví dụ: `"Chất lượng tour"`) |
| `content`  | `string` | ✅       | Nội dung chi tiết                         |

**Response:**

| Thuộc tính | Kiểu      | Mô tả                    |
| ---------- | --------- | ------------------------ |
| `success`  | `boolean` | Gửi thành công hay không |
| `message`  | `string`  | Thông báo kết quả        |

---

## Referral

### GET `/api/v1/users/referral`

Lấy thống kê mã giới thiệu của user.

> ⚠️ **Chưa có API thật** — hiện đang dùng mock data phía client. Cần implement endpoint này trong Laravel.

**Response: `ReferralStats`**

| Thuộc tính         | Kiểu     | Mô tả                                                                                  |
| ------------------ | -------- | -------------------------------------------------------------------------------------- |
| `referralCode`     | `string` | Mã giới thiệu (ví dụ: `"BTTNGUYEN2026"`) — thường ghép từ prefix `BTT` + họ user + năm |
| `successReferrals` | `number` | Số người đã đăng ký thành công qua mã                                                  |
| `earnedPoints`     | `number` | Tổng điểm thưởng tích lũy từ referral                                                  |

---

## News

### GET `/api/v1/news`

Lấy danh sách tin tức (phân trang, có thể lọc theo category).

**Query params:**

| Tham số    | Kiểu     | Bắt buộc | Mô tả                                                             |
| ---------- | -------- | -------- | ----------------------------------------------------------------- |
| `category` | `string` | ❌       | Lọc theo danh mục: `COMPANY`, `PROMOTION`, `DESTINATION`, `OTHER` |
| `page`     | `number` | ❌       | Trang (mặc định `1`)                                              |
| `limit`    | `number` | ❌       | Số item (mặc định `10`)                                           |

**Response:**

| Thuộc tính | Kiểu            | Mô tả                |
| ---------- | --------------- | -------------------- |
| `items`    | `NewsItem[]`    | Danh sách bài tin    |
| `meta`     | `PaginatedMeta` | Thông tin phân trang |

#### NewsItem

| Thuộc tính    | Kiểu                                                   | Mô tả                                               |
| ------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `id`          | `string`                                               | UUID bài tin                                        |
| `slug`        | `string`                                               | Slug URL thân thiện (fallback về `id` nếu không có) |
| `title`       | `string`                                               | Tiêu đề bài tin                                     |
| `excerpt`     | `string`                                               | Đoạn tóm tắt ngắn                                   |
| `content`     | `string?`                                              | Nội dung đầy đủ (HTML hoặc Markdown)                |
| `imageUrl`    | `string`                                               | URL ảnh thumbnail                                   |
| `date`        | `string`                                               | Ngày đăng dạng `dd/mm/yyyy` (map từ `publishedAt`)  |
| `category`    | `"COMPANY" \| "PROMOTION" \| "DESTINATION" \| "OTHER"` | Danh mục                                            |
| `isPublished` | `boolean?`                                             | Đã xuất bản chưa                                    |
| `publishedAt` | `string?`                                              | Ngày xuất bản (ISO 8601)                            |

---

### GET `/api/v1/news/:id`

Lấy chi tiết một bài tin theo ID.

**Path param:** `id` — UUID hoặc slug bài tin

**Response: `NewsItem`** (đầy đủ bao gồm `content`)

---

## Travel Tips

### GET `/api/v1/travel-tips`

Lấy danh sách mẹo du lịch (phân trang, có thể lọc theo điểm đến).

**Query params:**

| Tham số       | Kiểu     | Bắt buộc | Mô tả                                                         |
| ------------- | -------- | -------- | ------------------------------------------------------------- |
| `destination` | `string` | ❌       | Tên điểm đến (ví dụ: `"Nhật Bản"`) — bỏ qua nếu là `"Tất cả"` |
| `page`        | `number` | ❌       | Trang (mặc định `1`)                                          |
| `limit`       | `number` | ❌       | Số item (mặc định `10`)                                       |

**Response:**

| Thuộc tính | Kiểu            | Mô tả                 |
| ---------- | --------------- | --------------------- |
| `items`    | `TravelTip[]`   | Danh sách mẹo du lịch |
| `meta`     | `PaginatedMeta` | Thông tin phân trang  |

#### TravelTip

| Thuộc tính           | Kiểu       | Mô tả                                                          |
| -------------------- | ---------- | -------------------------------------------------------------- |
| `id`                 | `string`   | UUID                                                           |
| `title`              | `string`   | Tiêu đề mẹo                                                    |
| `excerpt`            | `string`   | Tóm tắt ngắn                                                   |
| `content`            | `string`   | Nội dung đầy đủ                                                |
| `imageUrl`           | `string`   | URL ảnh minh họa                                               |
| `destination`        | `string`   | Điểm đến liên quan (ví dụ: `"Nhật Bản"`)                       |
| `tags`               | `string[]` | Danh sách tag (ví dụ: `["ẩm thực", "văn hóa"]`)                |
| `date`               | `string`   | Ngày đăng dạng `dd/mm/yyyy`                                    |
| `relatedSearchQuery` | `string?`  | Query tìm kiếm tour liên quan (dùng để link qua Search screen) |

---

### GET `/api/v1/travel-tips/:id`

Lấy chi tiết một mẹo du lịch theo ID.

**Path param:** `id` — UUID

**Response: `TravelTip`**

---

### GET `/api/v1/travel-tips/destinations`

Lấy danh sách các điểm đến có mẹo du lịch (dùng cho filter dropdown).

**Response:** `string[]` — mảng tên điểm đến (ví dụ: `["Nhật Bản", "Hàn Quốc", "Thái Lan"]`)

> Client tự thêm `"Tất cả"` vào đầu mảng.

---

## Lưu ý chung khi implement Laravel

### Authentication flow

- Access token hết hạn → client tự gọi `POST /auth/refresh-token` với `refreshToken` trong header, nhận token mới (rotation).
- Nếu refresh thất bại → redirect về login, xóa cả hai token.
- PIN endpoint **phải trả 400** (không 401) khi sai PIN, để client không nhầm thành token hết hạn.

### Response envelope

Client hiện tại handle nhiều dạng response khác nhau (do quá trình migrate):

```
res?.data?.data   ← NestJS wrap trong { data: ... }
res?.data?.items  ← Paginated list
res?.data         ← Direct object/array
```

Khuyến nghị: **chuẩn hóa về một dạng duy nhất** trong Laravel. Đề xuất:

```json
// List response
{ "items": [...], "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10, "hasNext": true, "hasPrevious": false } }

// Single object
{ "data": { ... } }

// Mutation success
{ "message": "..." }
```

### File upload

Các endpoint upload file dùng `multipart/form-data`. Laravel cần xử lý `$request->file('avatar')`.
