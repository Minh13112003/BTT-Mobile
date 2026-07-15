---
description: Guardrails bắt buộc — đọc TRƯỚC KHI làm bất kỳ task nào. Áp dụng cho Claude và Gemini.
globs: ["**/*"]
alwaysApply: true
---

# ⛔ GUARDRAILS — BẮT BUỘC TUÂN THỦ

## 1. Nghiêm cấm xóa file

- **KHÔNG BAO GIỜ** xóa file mà không có lệnh rõ ràng từ user.
- Nếu phát hiện file không còn cần thiết → **hỏi user** trước: "File `X` có vẻ không còn dùng, bạn có muốn xóa không?"
- Không xóa ngay cả khi refactor, rename, hay dọn dẹp import.

## 2. Kiểm tra tính phù hợp trước khi tạo module / giao diện mới

Trước khi implement, **bắt buộc** đánh giá và trình bày ngắn gọn:

- **Nhất quán UI**: Giao diện mới có cùng design language (màu, bo góc, shadow, spacing) với app không?
- **Entry point**: User đi từ màn hình nào đến module mới? Navigation flow hợp lý không?
- **Reuse**: Có component nào đang có (`TourCard`, `SectionTitle`, `CustomAlert`...) dùng được không, hay phải tạo mới?
- **Dark mode**: Đã xử lý đủ `isDark` chưa?

Chỉ implement sau khi đánh giá xong. Nếu có điểm không phù hợp → nêu rõ và hỏi user.

## 3. Sau khi thêm module / giao diện mới — bắt buộc kiểm thử

Theo thứ tự:

1. **Kiểm tra TypeScript** — không để lại lỗi type, unused import, undefined variable.
2. **Kiểm tra UI bug** — layout bị vỡ, text bị cắt, dark mode sai màu, spacing lệch.
3. **Kiểm tra edge case** — data rỗng, loading state, error state.
4. Nếu có lỗi → **fix ngay**, không để lại TODO.
5. Nếu không có lỗi → **cập nhật file `.claude/rules/` phù hợp** để ghi nhận component/pattern mới.

## 4. Thứ tự ưu tiên trong file rules

- Guardrails quan trọng nhất luôn đặt **đầu file**.
- Dùng bullet points và heading ngắn — mật độ thông tin cao, không viết dài dòng.

## 5. Phân loại thông tin vào đúng rule file

Khi cập nhật rules, đặt thông tin vào **đúng file chủ đề**:

| Thông tin | File |
|---|---|
| Tổng quan, màn hình, provider | `project-overview.md` |
| Folder structure, naming convention | `project-structure.md` |
| Màu, font, dark mode, gradient | `styling.md` |
| Alert, dialog, toast | `alerts-and-dialogs.md` |
| API, services, fetch pattern | `api-and-services.md` |
| Navigation, routing | `navigation.md` |
| Guardrails, workflow | `workflow-guardrails.md` (file này) |

**Không lẫn lộn** thông tin giữa các file.

## 6. Đánh dấu nội dung do Gemini tạo

Nếu user dùng Gemini để vibe code và paste kết quả vào:

- Bọc đoạn code/nội dung đó trong block comment rõ ràng:
  ```tsx
  {/* ── GEMINI GENERATED ── review trước khi dùng ── */}
  // ... code ...
  {/* ── END GEMINI GENERATED ── */}
  ```
- Với file `.ts`: dùng `// [GEMINI] ...` ở đầu mỗi dòng hoặc block.
- Sau khi user xác nhận ổn → xóa marker, merge vào code chính thức.
- Lý do: giúp user biết phần nào chưa được Claude review, tránh merge nhầm bug.
