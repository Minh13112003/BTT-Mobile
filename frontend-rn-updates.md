# Frontend React Native Updates — Vibe Coding Prompt

## Context

React Native + Expo project. Backend đã cập nhật theo file `tour-schema-updates.md`.  
Tất cả thay đổi UI cần đảm bảo **cỡ chữ nhỏ nhất là 16px** toàn app.

---

## 0. Global Font Size Rule

Update toàn bộ `StyleSheet` trong project:

- **Minimum font size: 16**
- Scan tất cả file `.tsx` và thay thế bất kỳ `fontSize` nào < 16 thành 16
- Các mức phổ biến nên dùng:

```typescript
// constants/typography.ts (tạo mới nếu chưa có)
export const FONT_SIZE = {
  xs: 16, // nhỏ nhất
  sm: 17,
  md: 18,
  lg: 20,
  xl: 22,
  xxl: 26,
  title: 30,
  hero: 34,
};
```

---

## 1. `(tabs)/index.tsx` — Home Screen

### 1.1 Member Rank Banner

Thêm banner hiển thị hạng thành viên dựa theo `user.earnedPoints` (lấy từ API `/api/v1/users/me`).

**Membership tiers** (dựa theo `earnedPoints`):

| Hạng                | Điểm tối thiểu | Màu nền                     | Text màu  |
| ------------------- | -------------- | --------------------------- | --------- |
| Đồng (Bronze)       | 0              | `#CD7F32`                   | `#fff`    |
| Bạc (Silver)        | 10,000,000     | `#C0C0C0`                   | `#333`    |
| Vàng (Gold)         | 50,000,000     | `#FFD700`                   | `#333`    |
| Bạch Kim (Platinum) | 100,000,000    | `#E5E4E2`                   | `#333`    |
| Kim Cương (Diamond) | 200,000,000    | `#B9F2FF`                   | `#1a1a2e` |
| Ruby                | 500,000,000    | `linear: #FF0000 → #8B0000` | `#fff`    |

**Component `MembershipBanner`:**

```typescript
// components/MembershipBanner.tsx

const TIERS = [
  {
    name: "Ruby",
    min: 500_000_000,
    bg: ["#FF0000", "#8B0000"],
    text: "#fff",
    icon: "💎",
  },
  {
    name: "Kim Cương",
    min: 200_000_000,
    bg: ["#B9F2FF", "#7EC8E3"],
    text: "#1a1a2e",
    icon: "🔷",
  },
  {
    name: "Bạch Kim",
    min: 100_000_000,
    bg: ["#E5E4E2", "#C8C6C4"],
    text: "#333",
    icon: "⬜",
  },
  {
    name: "Vàng",
    min: 50_000_000,
    bg: ["#FFD700", "#FFA500"],
    text: "#333",
    icon: "🥇",
  },
  {
    name: "Bạc",
    min: 10_000_000,
    bg: ["#C0C0C0", "#A8A8A8"],
    text: "#333",
    icon: "🥈",
  },
  {
    name: "Đồng",
    min: 0,
    bg: ["#CD7F32", "#A0522D"],
    text: "#fff",
    icon: "🥉",
  },
];

const MILESTONES = [
  0, 10_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000,
];

function getTier(earnedPoints: number) {
  return TIERS.find((t) => earnedPoints >= t.min) ?? TIERS[TIERS.length - 1];
}

function getNextMilestone(earnedPoints: number) {
  return MILESTONES.find((m) => m > earnedPoints) ?? null;
}

// UI structure:
// ┌─────────────────────────────────────────────┐
// │  [Icon]  Xin chào, [Tên]          [Hạng 🏅] │
// │  Điểm tích lũy: 45,000,000 pts              │
// │  ████████████░░░░  45/50tr → Vàng           │
// └─────────────────────────────────────────────┘

// Use LinearGradient from expo-linear-gradient for background
// Progress bar shows progress to next tier
// If already Ruby (max tier), show "Hạng cao nhất 🎉"
```

**Cài thư viện nếu chưa có:**

```bash
npx expo install expo-linear-gradient
```

---

### 1.2 Tour Card — Thêm nền ảnh mờ + ngày khởi hành gần nhất

Mỗi Tour card cần:

1. **Background overlay**: Thêm ảnh tour làm nền mờ phía sau card (dùng `ImageBackground` với `opacity: 0.15`)
2. **Ngày khởi hành gần nhất**: Gọi API `GET /api/v1/departures/tour/:tourId` lấy departure gần nhất

**API call:**

```typescript
// Lấy departure gần nhất cho tour
const getNearestDeparture = async (tourId: string) => {
  const res = await api.get(`/departures/tour/${tourId}`);
  // Sort by departureDate ASC, lấy phần tử đầu tiên có departureDate >= today
  const today = new Date();
  const upcoming = res.data
    .filter((d: Departure) => new Date(d.departureDate) >= today)
    .sort(
      (a: Departure, b: Departure) =>
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime(),
    );
  return upcoming[0] ?? null;
};
```

**Tour Card UI structure:**

```
┌────────────────────────────────┐
│ [ImageBackground mờ 15%]       │
│ ┌──────────────────────────┐   │
│ │ [Ảnh tour]               │   │
│ │ ★ 4.8  (120 đánh giá)    │   │
│ ├──────────────────────────┤   │
│ │ Tên Tour                 │   │  fontSize: 18
│ │ 📅 Khởi hành: 15/06/2026 │   │  fontSize: 16
│ │ 💰 Từ 2,500,000đ         │   │  fontSize: 16
│ │ ✈️ Máy bay • 5N4Đ        │   │  fontSize: 16
│ └──────────────────────────┘   │
└────────────────────────────────┘
```

---

## 2. `app/tour/[id].tsx` — Tour Detail Screen

### 2.1 Thêm phần chọn ngày khởi hành

Đặt section này **phía trên** phần "Tour bao gồm".

**API:** `GET /api/v1/departures/tour/:tourId`

**UI Component `DeparturePicker`:**

```
┌─────────────────────────────────────┐
│  🗓  Chọn ngày khởi hành            │  fontSize: 18, fontWeight: bold
├─────────────────────────────────────┤
│  [15/06] [22/06] [29/06] [06/07]   │  Horizontal ScrollView
│    12 chỗ  8 chỗ   HẾT   15 chỗ   │  fontSize: 16
│  [Selected border highlight]        │
├─────────────────────────────────────┤
│  Departure đã chọn:                 │
│  📅 15/06/2026  |  👥 12 chỗ trống  │  fontSize: 16
│  💰 2,500,000đ / người              │  fontSize: 18, color: primary
└─────────────────────────────────────┘
```

**Logic hiển thị:**

```typescript
// Mỗi departure chip:
// - availableSeats > 0  → hiển thị bình thường, có thể chọn
// - availableSeats === 0 → nền xám, chữ gạch ngang, không thể chọn

// Khi chọn departure có availableSeats === 0:
// KHÔNG navigate sang checkout
// Hiển thị Alert hoặc inline message:
Alert.alert(
  "Hết chỗ",
  `Tour "${tourName}" vào ngày ${departureDate} đã hết chỗ. Xin vui lòng chọn ngày khác.`,
  [{ text: "Đồng ý", style: "cancel" }],
);

// Hoặc inline message dưới chip:
// 🚫 Tour "[Tên tour]" vào ngày [ngày đi] đã hết chỗ, xin vui lòng chọn ngày khác
// fontSize: 16, color: '#e74c3c'
```

**State management:**

```typescript
const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(
  null,
);

// Khi bấm "Đặt tour" / "Tiếp tục":
// - Nếu chưa chọn departure → hiện toast "Vui lòng chọn ngày khởi hành"
// - Nếu đã chọn và có chỗ → navigate to checkout với params:
router.push({
  pathname: "/checkout",
  params: {
    tourId,
    departureId: selectedDeparture.id,
    departureDate: selectedDeparture.departureDate,
    price: selectedDeparture.price,
    availableSeats: selectedDeparture.availableSeats,
    tourName,
  },
});
```

---

## 3. `app/checkout.tsx` — Checkout Screen

### 3.1 Hiển thị thông tin departure đã chọn

Đầu trang checkout, hiển thị summary:

```
┌─────────────────────────────────────┐
│  [Ảnh tour thu nhỏ]                 │
│  Tên Tour                           │  fontSize: 20
│  📅 Ngày khởi hành: 15/06/2026      │  fontSize: 16
│  👥 Số chỗ còn: 12                  │  fontSize: 16
│  💰 Giá: 2,500,000đ / người         │  fontSize: 18
└─────────────────────────────────────┘
```

### 3.2 Thêm ô chọn Phương thức thanh toán

Thêm section **"Phương thức thanh toán"** vào form checkout:

```typescript
// PaymentMethodPicker component

const PAYMENT_METHODS = [
  {
    id: "AT_OFFICE",
    label: "Tại Văn Phòng",
    icon: "🏢",
    detail: `CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH (BENTHANH TOURIST)
Trụ sở: Số 03 - 05 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh
Tel: 028 3822 7788`,
  },
  {
    id: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    icon: "🏦",
    detail: `THÔNG TIN THANH TOÁN CHUYỂN KHOẢN
- Ngân hàng TMCP Ngoại Thương Việt Nam - CN TP.HCM (VCB)
- Tên đơn vị hưởng: CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH
- Số tài khoản VNĐ: 007.1001204617
- Tại Ngân Hàng VCB - CN TP.HCM`,
  },
];
```

**UI structure:**

```
┌─────────────────────────────────────┐
│  💳 Phương thức thanh toán          │  fontSize: 18, fontWeight: bold
├─────────────────────────────────────┤
│  ○ 🏢 Tại Văn Phòng                │  fontSize: 16
│  ○ 🏦 Chuyển khoản ngân hàng        │  fontSize: 16
└─────────────────────────────────────┘

// Khi chọn một phương thức → expand hiện chi tiết bên dưới:

┌─────────────────────────────────────┐
│  🏢 Tại Văn Phòng          ✅       │  selected
├─────────────────────────────────────┤
│  CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH  │  fontSize: 16
│  BẾN THÀNH (BENTHANH TOURIST)       │
│  Trụ sở: Số 03 - 05 Nguyễn Huệ,   │
│  Phường Sài Gòn, TP. Hồ Chí Minh   │
│  Tel: 028 3822 7788                 │
└─────────────────────────────────────┘
```

### 3.3 Submit booking

Khi submit, gửi lên API `POST /api/v1/bookings`:

```typescript
const payload = {
  idTour: tourId,
  departureId: selectedDeparture.id,
  quantity: quantity,
  paymentMethod: selectedPaymentMethod, // 'AT_OFFICE' | 'BANK_TRANSFER'
  voucherId: appliedVoucher?.id ?? null,
  notice: note ?? null,
};
```

**Validation trước khi submit:**

- Chưa chọn departure → `"Vui lòng chọn ngày khởi hành"`
- Chưa chọn phương thức thanh toán → `"Vui lòng chọn phương thức thanh toán"`
- `availableSeats < quantity` → `"Số chỗ không đủ, vui lòng giảm số lượng"`

---

## 4. Migration Checklist

- [ ] Thêm `constants/typography.ts` và update toàn bộ `fontSize < 16`
- [ ] Cài `expo-linear-gradient` nếu chưa có
- [ ] Tạo component `MembershipBanner` với LinearGradient
- [ ] Update `(tabs)/index.tsx` — thêm banner + update tour card
- [ ] Update `app/tour/[id].tsx` — thêm `DeparturePicker` section
- [ ] Update `app/checkout.tsx` — thêm departure summary + payment method picker
- [ ] Test API `GET /api/v1/departures/tour/:tourId` trả về đúng data
- [ ] Test booking flow: chọn departure → checkout → submit

---

## 5. API Endpoints cần dùng (từ Backend)

| Method  | Endpoint                          | Dùng ở đâu                   |
| ------- | --------------------------------- | ---------------------------- |
| `GET`   | `/api/v1/departures/tour/:tourId` | Tour list card, Tour detail  |
| `GET`   | `/api/v1/departures/:id`          | Checkout summary             |
| `POST`  | `/api/v1/bookings`                | Checkout submit              |
| `GET`   | `/api/v1/users/me`                | Member banner (earnedPoints) |
| `GET`   | `/api/v1/notifications`           | Notification screen          |
| `PATCH` | `/api/v1/notifications/read-all`  | Mark all read                |
| `PATCH` | `/api/v1/notifications/:id/read`  | Mark one read                |
