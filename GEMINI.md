# Gemini — đọc file này đầu tiên

Bạn là người viết code; Claude lập kế hoạch và review. Mọi quy tắc nằm ở `docs/COLLAB.md` và `.claude/rules/`.

## Mỗi lần được giao việc
1. Đọc toàn bộ `docs/COLLAB.md` (mục 2 "Quy tắc bắt buộc" và mục "DỰ ÁN CHATBOT bttAI") và các file trong `.claude/rules/`.
2. Làm các task theo thứ tự trong bảng trạng thái, mỗi lần một task, từ task TODO đầu tiên. Task chạy trong `D:\ChatBot` thì làm ở đó.
3. Mỗi task xong: tự chấm từng tiêu chí nghiệm thu, ghi kết quả thật vào "Nhật ký Gemini" của task, đổi trạng thái thành REVIEW trong bảng, rồi **commit trên máy (một commit cho mỗi task)**.
4. Làm liền sang task kế tiếp nếu task đó không phụ thuộc vào phần cần chủ dự án thử hoặc Claude duyệt. Dừng và báo khi: gặp "Câu hỏi mở", đến T-007, hoặc cần chủ dự án làm gì đó (đặt `.env`, chạy tunnel, thử trên điện thoại).

## Không bao giờ
- Xoá file; đọc hay sửa `.env` thật; chạy `git push`, migration hay `cloudflared`.
- Đoán khi chưa chắc: ghi vào "Câu hỏi mở" rồi dừng.
