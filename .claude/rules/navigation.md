---
description: Quy tắc navigation — Expo Router, routing structure, cách dùng router
globs: ["app/**/*.tsx"]
alwaysApply: false
---

# Navigation — Expo Router

## Expo Router file-based routing

Dự án dùng Expo Router 6 — mỗi file trong `app/` là một route.

```
app/
  index.tsx                    # "/" — Splash, kiểm tra token → redirect
  (root)/
    _layout.tsx                # Provider stack chính
    detailTour.tsx             # "/detailTour"
    checkout.tsx               # "/checkout"
    membership.tsx             # "/membership"
    (auth)/
      login.tsx                # "/login"
      forgot-password.tsx      # "/forgot-password"
      reset-password.tsx       # "/reset-password"
    (profile)/
      selfprofile.tsx          # "/(profile)/selfprofile"
      setup-pin.tsx            # "/(profile)/setup-pin"
      change-pin.tsx           # "/(profile)/change-pin"
      vouchers.tsx             # "/(profile)/vouchers"
      feedback.tsx             # "/(profile)/feedback"
      security.tsx             # "/(profile)/security" — Mật khẩu & mã PIN (đổi mật khẩu, tạo/đổi PIN)
      faq.tsx                  # "/(profile)/faq" — Câu hỏi thường gặp
      about.tsx                # "/(profile)/about" — Về BenThanh Tourist (giới thiệu, liên hệ, văn phòng)
      terms.tsx                # "/(profile)/terms" — Điều khoản & chính sách (2 tab, Accordion từng điều)
      referral.tsx             # "/(profile)/referral"
      registercustomer.tsx     # "/(profile)/registercustomer"
    (tabs)/
      index.tsx                # Tab: Home
      search.tsx               # Tab: Du lịch
      history.tsx              # Tab: Lịch sử
      notifications.tsx        # Tab: Thông báo
      profile.tsx              # Tab: Tài khoản
    news/[id].tsx              # "/news/[id]"
    tips/[id].tsx              # "/tips/[id]"
    tour/[id].tsx              # "/tour/[id]"
```

## Cách dùng router trong component

```tsx
import { useRouter } from "expo-router";
const router = useRouter();

router.push("/(root)/(profile)/selfprofile");  // Navigate, giữ back stack
router.replace("/login");                       // Replace, xoá back stack (dùng sau logout)
router.back();                                  // Quay lại màn hình trước
```

## Typed routes

Dự án bật `typedRoutes: true` trong `app.json`. TypeScript sẽ báo lỗi nếu path sai.  
Nếu cần cast dynamic path: `router.push("/(root)/(profile)/setup-pin" as any)`.

## Group routes `(name)`

Các thư mục trong ngoặc `(auth)`, `(tabs)`, `(profile)` là **route groups** — không xuất hiện trong URL, chỉ dùng để tổ chức layout.
