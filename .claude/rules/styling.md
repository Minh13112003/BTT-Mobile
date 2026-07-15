---
description: Quy tắc styling — NativeWind, dark mode, typography, gradient
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: false
---

# Styling Rules

## NativeWind (Tailwind CSS)

- Dùng `className` (NativeWind) là cách styling **chính**.
- Inline `style={{}}` chỉ dùng khi Tailwind không hỗ trợ: shadow, gradient, `borderRadius` phức tạp, animation.
- Không hardcode pixel giá trị màu hay font size — dùng constants thay thế.

## Dark Mode

- Lấy theme từ `useTheme()` (context `Theme_Context.tsx`): `const { theme } = useTheme(); const isDark = theme === "dark";`
- Pattern dark mode trong className:
  ```tsx
  className={`rounded-xl ${isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800"}`}
  ```
- Không dùng Tailwind `dark:` prefix — dự án dùng conditional string, không dùng media query dark mode.

## Typography

- **KHÔNG hardcode** font size (ví dụ: `fontSize: 14`).
- Luôn dùng `FONT_SIZE` từ `constants/typography.ts`:
  ```tsx
  import { FONT_SIZE } from "@/constants/typography";
  // FONT_SIZE.xs | FONT_SIZE.sm | FONT_SIZE.md | FONT_SIZE.lg | FONT_SIZE.xl
  style={{ fontSize: FONT_SIZE.sm }}
  ```

## Brand Colors

- Primary: `#D0021B`
- Dark variant: `#B30118`
- Dùng trực tiếp trong inline style hoặc Tailwind class `bg-[#D0021B]`.

## Gradient

- Dùng `LinearGradient` từ `expo-linear-gradient` (đã được import sẵn ở nhiều màn hình).
- Pattern nút gradient thương hiệu:
  ```tsx
  <LinearGradient
    colors={isDark ? ["#7F1D1D", "#991B1B"] : ["#D0021B", "#B30118"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ ... }}
  />
  ```
