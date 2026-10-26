---
description: Tổng quan dự án BenThanh Tourist — đọc trước khi làm bất kỳ task nào
globs: ["**/*"]
alwaysApply: true
---

# ⚠️ ĐỌC TRƯỚC — Guardrails

> Xem toàn bộ quy tắc bắt buộc tại `.claude/rules/workflow-guardrails.md`
> Tóm tắt nhanh: **không xóa file tùy tiện** · **đánh giá UI fit trước khi implement** · **kiểm thử sau khi xong** · **đánh dấu code Gemini**

---

# BenThanh Tourist — Mobile App

App du lịch mobile cho công ty **BenThanh Tourist**.

- **Framework**: Expo SDK 54 + React Native 0.81.5 + Expo Router 6
- **Styling**: NativeWind (Tailwind CSS v3) + font Rubik
- **Bundle ID**: `com.benthanh.tourist`
- **Brand color**: `#D0021B` (đỏ), dark variant `#B30118`
- **Backend**: NestJS REST API tại `D:\E-Commerce\Backend\e-commerce`, prefix `/api/v1/...`
- **API base URL**: biến môi trường `EXPO_PUBLIC_API_URL` trong `.env`
- **Path alias**: `@/` trỏ về root của project

## Màn hình chính

| Màn hình | File | Mô tả |
|---|---|---|
| Home | `app/(root)/(tabs)/index.tsx` | Thẻ thành viên → tìm theo ngày → 6 loại tour → Tour hot → Tour sắp khởi hành → **Tin tức & cẩm nang** (cuối trang, 2 nút Tin công ty / Cẩm nang du lịch; "Xem tất cả" mở `/news?category=`). Đã bỏ lời chào và 3 ô Tin tức/Mẹo hay/Ưu đãi (2026-10-26) |
| Du lịch | `app/(root)/(tabs)/search.tsx` | Search + filter tours. Mặc định "Tất cả" = toàn bộ tour, **Trong nước trước, Nước ngoài sau** (Laravel, `mode "newest"` trong `useTourSearch`). Bộ lọc đang chọn được giữ khi chuyển tab; rời tab > 30 phút rồi quay lại thì về mặc định (mỗi lần vào/rời tab tính lại mốc 30 phút; điều hướng kèm tham số từ Home thì giữ đúng lựa chọn đó) |
| Lịch sử | `app/(root)/(tabs)/history.tsx` | Booking history |
| Thông báo | `app/(root)/(tabs)/notifications.tsx` | Push notification list |
| Tài khoản | `app/(root)/(tabs)/profile.tsx` | User profile + logout |
| Chi tiết booking | `app/(root)/detailTour.tsx` | Lịch trình, điều khoản, đánh giá (COMPLETED) |
| Thanh toán | `app/(root)/checkout.tsx` | Ngày, phòng, voucher, xác nhận |
| Đặt tour thành công | `app/(root)/booking-success.tsx` | Màn xác nhận sau khi `checkout.tsx` đặt xong (`router.replace`, params: tourName/tourCode/departureDate/adults/children/infants/total/paymentMethod). Nút "Đến lịch sử" + "Đến trang chủ"; Back/vuốt về cũng về trang chủ |
| Thông tin cá nhân | `app/(root)/(profile)/selfprofile.tsx` | Họ tên, ngày sinh, giới tính, email, CCCD, hộ chiếu, avatar (đổi mật khẩu/PIN ở `security.tsx`) |
| PIN | `app/(root)/(profile)/setup-pin.tsx` / `change-pin.tsx` | Tạo / đổi PIN 6 số |

## Provider stack (app/(root)/_layout.tsx)

```
ThemeProvider → AuthProvider → NotificationProvider → ChatbotProvider → GuideProvider → Stack + ChatbotHost + ProfileCompletionPrompt (+ GuideOverlay khi đang hướng dẫn)
```

## Lưu ý Expo SDK 54

Luôn tra docs tại https://docs.expo.dev/versions/v54.0.0/ trước khi dùng API Expo mới. SDK có thể đã thay đổi so với các phiên bản cũ.
