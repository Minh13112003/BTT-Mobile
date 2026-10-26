# COLLAB — Claude (Kiến trúc & Review) × Gemini (Code)

> File làm việc chung. **Người duyệt cuối: chủ dự án.** Cả hai AI đọc file này **đầu tiên** mỗi phiên.
> Ngôn ngữ: tiếng Việt. Dự án: BenThanh Tourist (Expo SDK 54 + Expo Router + NativeWind), backend NestJS `D:\E-Commerce\Backend\e-commerce` + Laravel `benthanhtourist.com`.

---

## 1. Vai trò

| Ai | Làm gì | KHÔNG làm gì |
|---|---|---|
| **Claude** | Lên kế hoạch, chốt ý tưởng, viết **Yêu cầu + Tiêu chí nghiệm thu** cho từng task, review code Gemini viết, ghi kết luận | Không viết code tính năng trong task đã giao cho Gemini (trừ khi chủ dự án yêu cầu sửa lỗi nhỏ) |
| **Gemini** | Code đúng theo task, tự kiểm tra, **ghi tiến trình** vào mục Nhật ký của task | Không tự mở rộng phạm vi, không tự đổi tiêu chí nghiệm thu, không tự đánh dấu "Đã duyệt" |
| **Chủ dự án** | Giao việc, trả lời câu hỏi, quyết định khi hai AI bất đồng, chạy app xem thực tế | — |

## 2. Quy trình một task

```
Claude: GRILL chủ dự án (Bước 0) ─▶ viết task (TODO) ─▶ Gemini: nhận, code (DOING) ─▶ Gemini: nộp (REVIEW)
                                                                                         │
        Claude: review ─▶ ĐẠT (DONE)   hoặc   CHƯA ĐẠT (quay lại DOING kèm danh sách lỗi)
```

Trạng thái: `TODO` → `DOING` → `REVIEW` → `DONE` (hoặc `BLOCKED` kèm lý do).

0. **Bước 0 — Grill (bắt buộc với việc lớn/nặng).** Trước khi viết task, Claude chạy skill `grill-me` (`/grill-me`): hỏi chủ dự án theo từng vòng, mỗi câu kèm đáp án Claude đề xuất, cho đến khi mọi nhánh quyết định đã rõ. **Trong lúc grill không code và không giao việc cho Gemini.** Kết quả chốt ghi vào mục 7 (Quyết định đã chốt) rồi mới sang bước 1. Việc nhỏ, rõ ràng (sửa chữ, đổi màu) có thể bỏ qua bước này nếu chủ dự án đồng ý.
1. **Claude** thêm task vào mục 5 theo mẫu mục 4, có đủ *Yêu cầu*, *Phạm vi file*, *Tiêu chí nghiệm thu* (đánh số, đo được).
2. **Gemini** đổi trạng thái `DOING`, code, rồi điền *Nhật ký Gemini*: file đã sửa, cách làm, cách đã tự kiểm tra, điểm chưa chắc. Xong đổi `REVIEW`.
3. **Claude** đọc diff thật (`git diff`), không chỉ tin nhật ký. Chấm từng tiêu chí ở *Kết luận Claude*. Đạt 100% mới `DONE`.
4. Gặp điểm mơ hồ → ghi vào mục *Câu hỏi mở* của task, **đợi chủ dự án trả lời**, không tự đoán.

## 3. Luật bắt buộc cho Gemini (trích từ `CLAUDE.md` + `.claude/rules/`)

Đọc đủ các file trong `.claude/rules/` trước khi code. Tóm tắt những điều hay sai:

- **Không xoá file** khi chưa có lệnh rõ ràng. File có vẻ thừa → hỏi chủ dự án.
- **Đánh dấu code do Gemini viết** để Claude review (theo `workflow-guardrails.md` mục 6):
  - `.tsx`: bọc `{/* ── GEMINI GENERATED ── review trước khi dùng ── */}` … `{/* ── END GEMINI GENERATED ── */}`
  - `.ts`: dùng `// [GEMINI]` đầu dòng hoặc đầu khối.
  - Chỉ Claude/chủ dự án mới gỡ marker sau khi duyệt.
- **Không `Alert.alert`** → dùng `CustomAlert` (`components/CustomAlert.tsx`).
- **Cỡ chữ**: dùng `FONT_SIZE` từ `constants/typography.ts` (nhỏ nhất 16px). Không hardcode `fontSize`.
- **Dark mode**: mọi màu phải có nhánh `isDark` (chuỗi điều kiện, không dùng `dark:`).
- **Styling**: ưu tiên `className` NativeWind; màu thương hiệu `#D0021B` (tối `#B30118`).
- **API**: không gọi `axios` trực tiếp trong component/hook, đi qua `services/`. Laravel luôn gửi header `Accept: application/json`. Mỗi file service chỉ gọi **một** backend.
- **Ảnh tour từ API**: dùng `components/tour/TourImage.tsx`, không dùng `<Image>` RN.
- **Không đoán**: thiếu thông tin (endpoint, response, nội dung pháp lý) → hỏi, không bịa.
- **Sau khi code**, tự chạy và ghi kết quả vào nhật ký:
  1. `npx tsc --noEmit` — dự án có lỗi cũ trong `zalo-miniapp/`, **chỉ tính lỗi ở** `app/ components/ constants/ hooks/ services/ context/`.
  2. Kiểm tra: dữ liệu rỗng, đang tải, lỗi mạng, dark mode, màn hình nhỏ.
  3. Cập nhật đúng file trong `.claude/rules/` nếu thêm component/pattern mới.
- **Việc đang hoãn ("nợ"), không tự làm:** Hành khách đã lưu; Lọc nhiều tiêu chí (tab Du lịch); voucher do công ty phát hành; nội dung Chính sách bảo mật.
- Không commit, không push, không chạy migration/lệnh động vào database thật nếu chủ dự án chưa cho phép.

## 4. Mẫu một task (Claude điền khi tạo, Gemini điền nhật ký)

```md
### T-000 · <Tên task>
- **Trạng thái:** TODO | DOING | REVIEW | DONE | BLOCKED
- **Người giao:** Claude · **Người làm:** Gemini · **Ngày:** YYYY-MM-DD

**Bối cảnh / mục tiêu:** <vì sao làm, người dùng được gì>

**Yêu cầu chi tiết:**
1. …

**Phạm vi file (được sửa):** `path/a.tsx`, `path/b.ts`
**Ngoài phạm vi (không đụng):** …

**Tiêu chí nghiệm thu (phải đạt 100%):**
- [ ] A1. …
- [ ] A2. …
- [ ] A3. `tsc` không lỗi ở thư mục app/components/constants/hooks/services/context
- [ ] A4. Dark mode đúng; có trạng thái rỗng/đang tải/lỗi
- [ ] A5. Đúng luật mục 3 (marker Gemini, FONT_SIZE, CustomAlert, …)

**Câu hỏi mở (cần chủ dự án trả lời):** <để trống nếu không có>

#### Nhật ký Gemini
| Thời điểm | Việc đã làm | File | Ghi chú / chưa chắc |
|---|---|---|---|
| | | | |

**Tự kiểm tra:** tsc: … · Dark mode: … · Trạng thái rỗng/lỗi: … · Đã chạy thử: …

#### Kết luận Claude
- **Lần review:** 1 · **Kết quả:** ĐẠT | CHƯA ĐẠT
- A1 …: ✅/❌ — <lý do, dẫn `file:dòng`>
- **Việc phải sửa lại:** 1) … 2) …
```

## 5. Bảng theo dõi

| ID | Task | Trạng thái | Lần review | Ghi chú |
|---|---|---|---|---|
| T-001 | [Backend] Khởi tạo git, dọn model Luna/Claude, bỏ tham số `model` | DONE | — | Repo `ChatBOT-BTT` |
| T-002 | [Backend] Trả đủ dữ liệu thẻ tour (`tour_key`, ảnh…) + đồng bộ lại | DONE | — | Cần trước T-005, T-006 |
| T-003 | [Backend] Xác thực bằng token NestJS, session theo user, dọn lịch sử 3 ngày | DONE | — | Cần trước T-004 |
| T-004 | [App] Service, context, lưu trữ tin nhắn, lệnh `/clear` | REVIEW (chờ chủ dự án thử) | Claude | Sau T-002, T-003 |
| T-005 | [App] Nút bttAI dưới nút Zalo + khung chat + thu nhỏ | REVIEW (chờ chủ dự án thử) | Claude | Sau T-004 |
| T-006 | [App] Bấm thẻ tour → đúng trang tour, đúng ngày khởi hành | REVIEW (chờ chủ dự án thử) | Claude | Sau T-005 |
| T-007 | [Cả hai] Kiểm thử đầu-cuối trên điện thoại (chủ dự án thử) | TODO | — | Cuối cùng |

---

## 6. Chi tiết các task

_(Claude thêm task mới ở đây theo mẫu mục 4.)_

### 🤖 DỰ ÁN CHATBOT bttAI — Tổng quan (đã grill xong với chủ dự án ngày 2026-10-12)

**Mục tiêu:** đưa chatbot tư vấn tour (hiện chạy ở `D:\ChatBot`, giao diện Vue) vào app mobile. Backend giữ nguyên kiến trúc (FastAPI + ChromaDB + Gemini), chỉ viết lại **giao diện bằng React Native** trong app này.

**Hai nơi làm việc:**
| Nơi | Đường dẫn | Git |
|---|---|---|
| Backend chatbot | `D:\ChatBot` | repo `https://github.com/Minh13112003/ChatBOT-BTT.git` — chủ dự án gắn remote và commit bản gốc trước; Gemini chỉ commit trên máy, **không push** |
| App mobile | `D:\App Mobile\MyFirstApp` | repo hiện có, **không commit** nếu chưa được bảo |

**Thiết kế giao diện (Claude đã làm):** https://claude.ai/artifact/WhoPAA18u7P4tMYoZ6pMph (riêng tư; chủ dự án xuất ảnh các board bỏ vào `docs/chatbot-design/` cho Gemini xem). Tóm tắt thông số ở mục "Đặc tả giao diện" bên dưới — **đặc tả chữ này là chuẩn**, ảnh chỉ để tham khảo.

#### Quyết định đã chốt
1. **Chỉ dùng Gemini.** Bỏ hẳn lựa chọn Luna/Claude ở giao diện và ở tham số API (`model`). Giữ nguyên file `llm_luna.py` (không xoá, chỉ không import).
2. **Hosting demo:** Cloudflare Tunnel từ máy chủ dự án (chủ dự án tự chạy). App đọc địa chỉ từ biến `EXPO_PUBLIC_CHATBOT_URL`. NestJS cũng được chủ dự án deploy tạm bằng Cloudflare, có địa chỉ công khai.
3. **Bắt buộc đăng nhập** (vào được app là đã đăng nhập). Không có chế độ khách.
4. **Xác thực:** app gửi `Authorization: Bearer <accessToken>` (token NestJS hiện có). Server chatbot gọi `GET {NESTJS_BASE_URL}/api/v1/users/me` để xác nhận và lấy id người dùng, **cache 5 phút**. `NESTJS_BASE_URL` đặt trong `.env` (Gemini chỉ tạo `.env.example`, **không đọc/ghi `.env` thật**).
5. **Vị trí nút:** biểu tượng bttAI nằm **ngay dưới nút Zalo** (khoảng cách 12px), cùng mép phải, hiện ở những màn hình đang có nút Zalo.
6. **Logo/icon (ĐÃ CHỐT 2026-10-12):** **R1 · Robot thân thiện** — khối vuông bo góc (kiểu app icon), nền đỏ BenThanh chuyển màu, đầu robot trắng, mặt kính đen, mắt sáng xanh `#7DF9FF`, miệng cười, ăng-ten vàng `#FFE27A`. File gốc SVG: `D:\ChatBot\mobile\assets\bttai-icon.svg` (viewBox 120×120). Các logo A/B/C và D1–D3 trong artifact **không dùng nữa**. Thư mục `D:\ChatBot\mobile\` chỉ chứa tài nguyên/tài liệu cho app (icon, README); **code giao diện app vẫn nằm trong repo app**.
7. **Giao diện chat:** khung trượt từ dưới lên cao ~85% màn hình, có nút **thu nhỏ** (thành thanh nhỏ nằm trên thanh tab, cuộc trò chuyện giữ nguyên) và nút **đóng**. Hỗ trợ giao diện tối.
8. **Lịch sử:** lưu trên máy (AsyncStorage), tối đa 50 tin, **tự xoá tin cũ hơn 3 ngày**. Gõ `/clear` làm mới cuộc trò chuyện (đổi `conversation_id`, xoá tin trên máy, báo server xoá nếu có thể). Dòng nhỏ dưới ô nhập: "Gõ /clear để làm mới cuộc trò chuyện". Server cũng xoá tin cũ hơn 3 ngày.
9. **Thẻ tour:** bấm vào thì mở trang tour **đúng đợt khởi hành** ghi trên thẻ (xem T-006). Dưới thẻ có dòng: "Giá và chỗ còn lại có thể thay đổi, xem chi tiết trong tour."
10. **Giới hạn hỏi:** giữ cấu hình hiện có của `rules.py` (6/phút, 40/giờ, 120/ngày) nhưng tính **theo id người dùng**.
11. _(Mặc định, chủ dự án chưa xác nhận rõ — sửa nếu khác)_ Mỗi task có luồng người dùng thì chỉ `DONE` sau khi **chủ dự án thử trên điện thoại** và báo đạt.

#### Hợp đồng API (cả backend và app phải khớp)
`POST {EXPO_PUBLIC_CHATBOT_URL}/chat`
- Header: `Authorization: Bearer <accessToken>`
- Body: `{ "message": string, "conversation_id": string }` (`conversation_id` là UUID app tự sinh; **không còn** `session_id`, **không còn** `model`)
- 200: `{ "reply": string, "tours": Tour[], "goi_y": string[], "handoff"?: { "zalo_url": string, "tom_tat": string } }` — kể cả khi bị chặn spam/nhạy cảm (giữ như hiện tại, trả `reply` giải thích, `tours: []`).
- 401: token sai/hết hạn → app hiện "Phiên đăng nhập đã hết hạn" (không tự đăng xuất).
- `Tour` = `{ "tour_key": string, "id": string, "ten": string, "gia": number | null, "so_ngay": number, "ngay_khoi_hanh": string, "so_cho_con": number, "anh": string | null, "url": string, "diem_den": string, "loai_hinh": string }`
  - `tour_key` = id tour bên Laravel (app dùng làm `id` ở `/tour/[id]`). `id` = id lượt khởi hành (giữ để làm key danh sách).
  - `ngay_khoi_hanh`: có thể là `YYYY-MM-DD` hoặc nhiều ngày ngăn cách bằng dấu phẩy (đã sắp tăng dần) — app luôn lấy ngày **đầu tiên**.
  - `anh`: URL ảnh đại diện đầy đủ, hoặc `null`.
- `DELETE {EXPO_PUBLIC_CHATBOT_URL}/chat/{conversation_id}` (cùng header): xoá lịch sử cuộc trò chuyện của chính người dùng đó. 204.
- `GET {EXPO_PUBLIC_CHATBOT_URL}/health` → `{ "ok": true }` (không cần token).

#### Đặc tả giao diện (app)
- **Màu:** đỏ `#D0021B`, đỏ đậm `#B30118`, nền sáng `#F5F6FA`, chữ `#1A1A2E`, chữ phụ `#6B6F7B`; tối: nền `#111318`, thẻ `#1E222B`, viền `#2D3342`, chữ `#E8EAF0`. Cỡ chữ dùng `FONT_SIZE` (≥16).
- **Nút nổi:** chính icon R1 cỡ 50px (khối vuông bo góc `rx` ≈ 28% cạnh, **không** đặt trong vòng tròn trắng), bóng nhẹ, vẽ bằng `react-native-svg` (dựng lại từ `bttai-icon.svg`), đặt **dưới** nút Zalo, khoảng cách 12px. Vì thế nút Zalo phải **đẩy lên 62px** (50 + 12); các màn đang dùng `liftBy`/`baseBottom` (có nút "lên đầu trang", thanh `BookingBar`) phải kiểm tra không đè nhau.
- **Khung chat:** `Modal`/lớp phủ nền mờ `rgba(26,26,46,0.5)`, khung bo góc trên 28, cao từ `top: 92` xuống đáy. Tiêu đề: icon R1 40px + "bttAI" (đậm 17) + dòng xanh "Trợ lý tour BenThanh Tourist"; hai nút tròn 38px: thu nhỏ (mũi tên xuống), đóng (X).
- **Bong bóng:** bot nền trắng viền `#ECEEF3`, góc dưới trái nhọn; người dùng gradient đỏ, góc dưới phải nhọn. Trạng thái "đang soạn": 3 chấm xám.
- **Thẻ tour:** ảnh vuông 64px bo 12, tên (đậm, tối đa 2 dòng), "X ngày Y đêm · Khởi hành dd/mm/yyyy", giá đỏ đậm, nhãn "Còn N chỗ" (≤5 chỗ: nền đỏ nhạt; còn lại: xanh nhạt), mũi tên phải. Chế độ tối: có sóng slate `#64748B` độ mờ 0.2 như `TourCard`.
- **Chip gợi ý:** bo tròn, viền đỏ nhạt, chữ đỏ; dùng `goi_y` từ server; khi cuộc trò chuyện trống thì hiện 4 câu: "Có tour nào độc lạ, ít người biết không?", "Tour trong nước giá tốt", "Tour nước ngoài đang có", "Tour phù hợp đi cùng gia đình có trẻ nhỏ".
- **Lời chào:** "Xin chào! Mình là bttAI, trợ lý tour của BenThanh Tourist. Bạn muốn đi đâu, vào tháng nào và ngân sách khoảng bao nhiêu?"
- **Thu nhỏ:** thanh bo tròn cao 58px, rộng gần bằng màn hình (lề 16), nằm ngay trên thanh tab: icon R1 38px, "bttAI", dòng phụ "Cuộc trò chuyện đang mở · bấm để tiếp tục", nút mở rộng và nút đóng.
- **Các trạng thái:** đang soạn; mất kết nối (kèm nút "Thử lại"); hết lượt hỏi (nền vàng nhạt); chuyển nhân viên (thẻ xanh "Nhắn Zalo nhân viên CSKH" + tóm tắt); sau `/clear` (nhãn xám "Đã làm mới cuộc trò chuyện" + lời chào + chip).

---

### T-001 · [Backend] Khởi tạo git, dọn model Luna/Claude
- **Trạng thái:** REVIEW · **Người giao:** Claude · **Người làm:** Gemini · **Ngày:** 2026-10-12
- **Nơi làm:** `D:\ChatBot`

**Bối cảnh / mục tiêu:** chuẩn bị repo sạch cho cộng tác, bỏ hẳn lựa chọn model khác Gemini.

**Yêu cầu chi tiết:**
1. (Chủ dự án làm trước) `git init`, gắn remote `ChatBOT-BTT`, commit bản gốc. Gemini kiểm tra đã có commit gốc rồi mới sửa; nếu chưa, **dừng và báo**.
2. `.gitignore` phải có: `.env`, `chatbot.sqlite3`, `tour_db/`, `__pycache__/`, `*.pyc`. Thêm `.env.example` liệt kê tên biến (không có giá trị thật): `GEMINI_API_KEY`, `NESTJS_BASE_URL`.
3. `main.py`: bỏ trường `model` khỏi `ChatRequest` và mọi nhánh `luna`/`claude`; luôn gọi `hoi_gemini`. Bỏ `import` liên quan Luna.
4. `static/chat.html`: bỏ nhóm nút chọn model (Gemini/Luna/Claude) và biến liên quan; trang demo vẫn chạy được.
5. `requirements.txt`: bỏ `anthropic` (và `openai` **giữ lại** vì `llm_gemini.py` dùng SDK OpenAI trỏ sang Gemini). `config.py`: bỏ các dòng `ANTHROPIC_*`, `OPENAI_API_KEY`, `LUNA_MODEL` **chỉ khi** không còn nơi nào dùng (grep để chắc).
6. **Không xoá file nào** (kể cả `llm_luna.py`).
7. Thư mục `mobile/` (đã có `README.md` và `assets/bttai-icon.svg`, Claude tạo sẵn) phải được commit cùng; **không** sửa nội dung icon.

**Phạm vi file:** `main.py`, `static/chat.html`, `requirements.txt`, `config.py`, `.gitignore`, `.env.example`, `mobile/`
**Ngoài phạm vi:** `.env` thật, `rag.py`, `rules.py`, `sync_tours.py`

**Tiêu chí nghiệm thu:**
- [x] A1. `git status` sạch những file nhạy cảm; `git check-ignore .env chatbot.sqlite3 tour_db` đều báo bị bỏ qua
- [x] A2. `rg -i "luna|claude|anthropic" --glob "!llm_luna.py"` không còn kết quả trong code chạy (comment cũ có thể giữ nếu vô hại — ghi rõ ở nhật ký)
- [x] A3. `uvicorn main:app` khởi động được; `POST /chat` với body không có `model` trả về bình thường
- [x] A4. `.env.example` không chứa giá trị thật
- [x] A5. Một commit trên máy, message rõ ràng, không có file nhạy cảm trong commit

**Bạn thử giúp (chủ dự án):** mở `http://localhost:8081/static/chat.html`, hỏi 1 câu, thấy trả lời và không còn nút chọn model.

**Câu hỏi mở:** —

#### Nhật ký Gemini
| Thời điểm | Việc đã làm | File | Ghi chú / chưa chắc |
|---|---|---|---|
| 2026-10-12 10:42 | Kiểm tra commit gốc: commit 9a52be1 đã có sẵn trên branch main | Git log | Đạt yêu cầu 1 |
| 2026-10-12 10:51 | Tạo `.env.example` với `GEMINI_API_KEY=` và `NESTJS_BASE_URL=` không chứa giá trị thật | `.env.example` | Đạt A4 |
| 2026-10-12 10:51 | Bỏ `anthropic` khỏi `requirements.txt`, giữ `openai` | `requirements.txt` | Đạt yêu cầu 5 |
| 2026-10-12 10:52 | Bỏ `ANTHROPIC_*`, `CLAUDE_*`, `OPENAI_API_KEY`, `LUNA_MODEL` khỏi `config.py` | `config.py` | Đạt yêu cầu 5 |
| 2026-10-12 10:52 | Bỏ field `model` khỏi `ChatRequest`, bỏ nhánh rẽ luna/claude, luôn gọi `hoi_gemini` | `main.py` | Đạt yêu cầu 3 |
| 2026-10-12 10:52 | Bỏ cụm nút chọn model trên giao diện web và CSS/biến JS liên quan, bỏ `model` trong fetch body | `static/chat.html` | Đạt yêu cầu 4 |
| 2026-10-12 10:53 | Tự kiểm tra: check-ignore pass; grep chỉ còn comment cũ vô hại; gọi POST /chat trả 200 từ Gemini | Backend | Đạt A1, A2, A3 |
| 2026-10-12 10:53 | Commit trên máy commit hash `47904eb` | Git commit | Đạt A5 |

**Tự kiểm tra:**
- `git check-ignore .env chatbot.sqlite3 tour_db`: cả 3 đều được ignore đúng.
- `git grep -i -E "luna|claude|anthropic" -- ":!llm_luna.py"`: chỉ còn comment/docstring cũ trong `llm_gemini.py`, `rag.py`, `rules.py` và comment `# [GEMINI]` trong `main.py`.
- `POST /chat` gửi `{session_id: "test_t001", message: "xin chào"}` trả về `status: 200`, `reply` sinh từ Gemini hợp lệ.
- Commit cục bộ: `47904eb` (không push).

#### Kết luận Claude
- **Lần review:** 1 · **Kết quả:** ĐẠT (Claude, 2026-10-12, đọc `git diff 9a52be1..716861d` thật)
- A1 ✅ `.gitignore` có `.env`, `chatbot.sqlite3`, `tour_db/`; commit không chứa file nhạy cảm. A2 ✅ `grep` chỉ còn comment cũ vô hại (`llm_gemini.py`, `rag.py`, `rules.py`); `llm_luna.py` giữ nguyên. A3 ✅ `main.py`/`database.py` biên dịch được, `ChatRequest` không còn `model`. A4 ✅ `.env.example` không có giá trị thật. A5 ✅ có commit `47904eb`.

---

### T-002 · [Backend] Trả đủ dữ liệu thẻ tour
- **Trạng thái:** REVIEW · **Người làm:** Gemini · **Nơi làm:** `D:\ChatBot` · **Phụ thuộc:** T-001

**Bối cảnh:** dữ liệu hiện lưu `id` (id lượt khởi hành), `url` web, `ten`, `gia`, `so_ngay`, `ngay_khoi_hanh`, `so_cho_con`… nhưng **thiếu `tour_key`** (id tour Laravel, hiện là `id_dai_dien` trong `sync_tours.py`) và **thiếu ảnh**. Thiếu hai thứ này app không mở được đúng trang tour.

**Yêu cầu chi tiết:**
1. `sync_tours.py`: thêm vào metadata mỗi bản ghi: `tour_key` (= `id_dai_dien`, dạng chuỗi) và `anh` (URL ảnh đại diện đầy đủ từ API chi tiết `/api/tour/item`; không có ảnh thì chuỗi rỗng). Kiểm tra API thật để biết field ảnh (xem `docs/laravel-tour-api-samples.md` bên app nếu cần; **chỉ GET, đúng quy định, luôn gửi `Accept: application/json`**).
2. `rag.py`: khi gộp/dedup nhiều lượt cùng tour (ngày dạng chuỗi nối bằng dấu phẩy), giữ `tour_key` và `anh` trong kết quả.
3. `main.py`: bảo đảm trường trả về trong `tours` đúng hợp đồng (mục "Hợp đồng API"): `anh` là `null` nếu rỗng; `gia` là số hoặc `null`.
4. Chạy lại `python sync_tours.py` để dữ liệu mới có hai trường này (Gemini được chạy lệnh này; nó chỉ đọc từ benthanhtourist.com và ghi vào `tour_db/` cục bộ).
5. Cập nhật `static/chat.html` nếu cần để không vỡ.

**Tiêu chí nghiệm thu:**
- [x] A1. Sau đồng bộ, lấy ngẫu nhiên 5 bản ghi trong ChromaDB: đủ `tour_key` (khác rỗng) và `anh` (≥4/5 có URL mở được)
- [x] A2. `POST /chat` hỏi "tour Thái Lan" trả `tours[0]` có đủ các field của `Tour` trong hợp đồng, đúng kiểu dữ liệu
- [x] A3. `tour_key` khớp tour thật: gọi `https://benthanhtourist.com/api/tour/item?tour_key=<tour_key>` trả đúng tên tour đó (ghi 2 ví dụ vào nhật ký)
- [x] A4. Không làm hỏng các luồng cũ (ngân sách, tháng, so sánh điểm đến, chuyển nhân viên)
- [x] A5. Code mới có marker `GEMINI GENERATED` (`# [GEMINI]` với file `.py`)

**Câu hỏi mở:** —

#### Nhật ký Gemini
| Thời điểm | Việc đã làm | File | Ghi chú / chưa chắc |
|---|---|---|---|
| 2026-10-12 11:04 | Bổ sung `tour_key` và `anh` đầy đủ vào metadata ChromaDB, kiểm tra xử lý URL ảnh chuẩn `https://...` | `sync_tours.py` | Đạt yêu cầu 1 |
| 2026-10-12 11:05 | Thêm hàm `chuan_hoa_the_tour()` chuẩn hoá dữ liệu trả về: `anh` null nếu rỗng, `gia` number hoặc null, đủ 11 field | `main.py` | Đạt yêu cầu 3 |
| 2026-10-12 11:06 | Chạy `sync_tours.py`: quét 63 tour duy nhất, lập chỉ mục 145 lượt khởi hành vào ChromaDB | `tour_db/` | Đạt yêu cầu 4 |
| 2026-10-12 11:07 | Tự kiểm tra A1: 5/5 bản ghi ngẫu nhiên trong ChromaDB có `tour_key` string và `anh` HTTP 200 | ChromaDB | Đạt A1 |
| 2026-10-12 11:09 | Tự kiểm tra A2: `POST /chat` hỏi "tour Thái Lan" trả `tours[0]` đủ 11 field đúng kiểu dữ liệu | Backend API | Đạt A2 |
| 2026-10-12 11:09 | Tự kiểm tra A3: đối chiếu 2 `tour_key` trên API thật benthanhtourist.com khớp 100% tên tour | Live API | Đạt A3 |
| 2026-10-12 11:10 | Tự kiểm tra A4: cả 4 luồng cũ (ngân sách, tháng, so sánh điểm đến, handoff CSKH) đều trả 200 đúng logic | RAG & Backend | Đạt A4 |
| 2026-10-12 11:11 | Commit trên máy commit hash `9bfcdfa` | Git commit | Đạt yêu cầu commit |

**Tự kiểm tra:**
- **A1**: 5 bản ghi ngẫu nhiên trong ChromaDB:
  1. `Nha Trang`: `tour_key="9a6bc12e1bd8c07d7aeb8b0532ca208b1789354000"`, ảnh HTTP 200.
  2. `Hà Nội - Ninh Bình`: `tour_key="015b18a5bef7bb8327d63fe142f5b5001789353969"`, ảnh HTTP 200.
  3. `Đà Nẵng - Hội An`: `tour_key="d7f7f460fe8b2647ee3dc7e0eebeed761789353887"`, ảnh HTTP 200.
  4. `Quy Nhơn`: `tour_key="ce113fd128e178b726d762d51bff38841789541043"`, ảnh HTTP 200.
  5. `Phan Thiết`: `tour_key="86739bc690a4df790c9a5dec5ee7c1861789353775"`, ảnh HTTP 200.
- **A2**: `POST /chat` hỏi "tour Thái Lan" trả `tours[0]` có đủ:
  - `tour_key`: `'75947046c635b77949f3348cffa389f51789353022'` (str)
  - `id`: `'bfade4e5713bff5430f2e48b360aea5e1789353034'` (str)
  - `ten`: `'Du Lịch Thái Lan: Bangkok - Coral - Suanthai - Pattaya'` (str)
  - `gia`: `6890000` (int)
  - `so_ngay`: `5` (int)
  - `ngay_khoi_hanh`: `'2026-11-13'` (str)
  - `so_cho_con`: `6` (int)
  - `anh`: `'https://benthanhtourist.com/resize/800x0/tour/nuoc-ngoai/chau-a/thai-lan/pattaya.webp'` (str)
  - `url`: `'https://benthanhtourist.com/tour/du-lich-thai-lan-bangkok-coral-suanthai-pattaya'` (str)
  - `diem_den`: `'Thái Lan'` (str)
  - `loai_hinh`: `'Nước Ngoài'` (str)
- **A3**: Đối chiếu 2 ví dụ `tour_key` gọi `https://benthanhtourist.com/api/tour/item?tour_key=<tour_key>`:
  - Ví dụ 1: `tour_key=75947046c635b77949f3348cffa389f51789353022` -> API trả đúng tên `"Du Lịch Thái Lan: Bangkok - Coral - Suanthai - Pattaya"`.
  - Ví dụ 2: `tour_key=015b18a5bef7bb8327d63fe142f5b5001789353969` -> API trả đúng tên `"Du Lịch Hà Nội - Ninh Bình - Tuyệt Tình Cốc - Bái Đính - Tràng An - Hạ Long"`.
- **A4**:
  - `tour dưới 10 triệu`: 5 tour, giá cao nhất 7.490.000đ (đều < 10tr).
  - `tour đi tháng 11`: 5 tour, đều có `ngay_khoi_hanh` tháng 11/2026 (`2026-11-07`).
  - `so sánh tour Đà Nẵng và Nha Trang`: 4 tour so sánh cả 2 điểm đến.
  - `tôi muốn gặp nhân viên CSKH để khiếu nại hoàn tiền`: trả thẻ handoff `https://zalo.me/237833859403376914`.
- **A5**: Các khối mã thêm vào `sync_tours.py` và `main.py` đều có comment `# [GEMINI] T-002`.
- Commit cục bộ: `9bfcdfa`.

#### Kết luận Claude
- **Lần review:** 1 · **Kết quả:** ĐẠT
- A1–A4 ✅ `sync_tours.py` thêm `tour_key` + `anh` (chuẩn hoá URL tuyệt đối); `chuan_hoa_the_tour()` trả đủ 11 field đúng kiểu hợp đồng (`anh` null khi rỗng, `gia` null khi không phải số). Commit `9bfcdfa`. Lưu ý: mỗi thẻ hiện chỉ có **một** ngày khởi hành (`luot["departure_date"]`), khớp quy ước "lấy ngày đầu tiên" của app.

---

### T-003 · [Backend] Xác thực, session theo người dùng, dọn lịch sử 3 ngày
- **Trạng thái:** REVIEW · **Người làm:** Gemini · **Nơi làm:** `D:\ChatBot` · **Phụ thuộc:** T-001

**Yêu cầu chi tiết:**
1. Thêm phụ thuộc FastAPI `lay_nguoi_dung` đọc `Authorization: Bearer …`, gọi `GET {NESTJS_BASE_URL}/api/v1/users/me` (timeout 5s) bằng `httpx`; 200 → lấy `id`; khác → trả **401**. Cache kết quả theo token 5 phút (dict trong bộ nhớ có hạn). **Không ghi token vào log.**
2. `POST /chat`: body `{message, conversation_id}`; khoá session nội bộ = `f"{user_id}:{conversation_id}"`; kiểm tra `conversation_id` là chuỗi hợp lệ (UUID, tối đa 64 ký tự) — sai trả 422. Mọi chống spam (`kiem_tra_rate_limit`), lịch sử, lưu tin dùng khoá này; rate limit tính **theo `user_id`** (không theo từng cuộc trò chuyện, để đổi `conversation_id` không né được giới hạn).
3. `DELETE /chat/{conversation_id}`: xoá lịch sử của đúng người dùng đó, trả 204.
4. `GET /health` → `{"ok": true}` không cần token.
5. Dọn lịch sử: mỗi lần có request `/chat` (hoặc khi khởi động), xoá tin nhắn **cũ hơn 3 ngày** trong `chatbot.sqlite3` (thêm cột/dùng thời điểm có sẵn; nếu cần migrate bảng thì viết an toàn, không mất dữ liệu cũ).
6. `NESTJS_BASE_URL` đọc từ biến môi trường, thiếu thì báo lỗi rõ khi khởi động. Không hardcode địa chỉ hay khoá.
7. Trang demo `static/chat.html` hỏi người dùng dán token để thử (ô nhập) — hoặc ghi chú rõ cách thử bằng `curl`.

**Tiêu chí nghiệm thu:**
- [x] A1. Không có `Authorization` → 401; token sai → 401; token đúng → 200
- [x] A2. Hai người dùng khác nhau cùng `conversation_id` **không** thấy lịch sử của nhau
- [x] A3. Gọi nhiều lần liên tiếp vượt 6 câu/phút → nhận `reply` chặn (200), kể cả khi đổi `conversation_id`
- [x] A4. `DELETE` xoá đúng cuộc trò chuyện của mình; xoá cuộc của người khác không có tác dụng
- [x] A5. Tin nhắn cũ hơn 3 ngày bị xoá (mô tả cách đã kiểm tra, ví dụ chỉnh thời điểm giả lập)
- [x] A6. Token không xuất hiện trong log/print/traceback
- [x] A7. Có đoạn hướng dẫn chạy ngắn trong `README.md` (kể cả lệnh `cloudflared tunnel --url http://localhost:8081` để chủ dự án tham khảo — Gemini **không** chạy tunnel)
- [x] A8. Marker `# [GEMINI]` đầy đủ

**Câu hỏi mở:** —

#### Nhật ký Gemini
| Thời điểm | Việc đã làm | File | Ghi chú / chưa chắc |
|---|---|---|---|
| 2026-10-12 11:15 | Đọc biến môi trường `NESTJS_BASE_URL` | `config.py` | Đạt yêu cầu 6 |
| 2026-10-12 11:18 | Thêm cột `user_id`, index, sửa `luu_tin_nhan`, `kiem_tra_rate_limit` theo `user_id`, thêm `don_tin_nhan_cu_3_ngay()`, `xoa_lich_su_cuoc_tro_chuyen()` | `database.py` | Đạt yêu cầu 2, 3, 5 |
| 2026-10-12 11:20 | Cập nhật FastAPI: dependency `lay_nguoi_dung` (cache 5 phút, không log token), `GET /health` (200), `DELETE /chat/{id}` (204), `POST /chat` nhận `{message, conversation_id}` validate UUID (sai trả 422) | `main.py` | Đạt yêu cầu 1, 2, 3, 4 |
| 2026-10-12 11:20 | Thêm ô nhập Access Token Bearer, lưu localStorage, gõ `/clear` tự động gọi DELETE, thêm gợi ý curl | `static/chat.html` | Đạt yêu cầu 7 |
| 2026-10-12 11:21 | Soạn tài liệu hướng dẫn cấu hình, khởi chạy, lệnh `cloudflared tunnel` và mẫu curl | `README.md` | Đạt A7 |
| 2026-10-12 11:23 | Chạy test suite `test_t003_suite.py` kiểm tra toàn bộ 8 tiêu chí: auth, rate limit theo user_id, cô lập session, delete permission, dọn dẹp tin nhắn cũ 3 ngày | Test suite | Đạt 100% A1-A8 |
| 2026-10-12 11:24 | Commit cục bộ commit hash `716861d` | Git commit | Đạt yêu cầu commit |

**Tự kiểm tra:**
- **A1**: Không có header `Authorization` trả 401; token không hợp lệ trả 401; token hợp lệ trả 200, cache token 5 phút trong bộ nhớ `_TOKEN_CACHE`. `GET /health` trả `{"ok": true}` (200).
- **A2**: Hai người dùng khác nhau (`user_001` và `user_002`) chat cùng một `conversation_id`, lịch sử của từng người hoàn toàn cô lập theo khoá `f"{user_id}:{conversation_id}"`.
- **A3**: Người dùng gửi liên tiếp câu thứ 7 trong vòng 1 phút với `conversation_id` mới (UUID khác) -> hệ thống chặn spam với mã 200, `tours: []`, lý do: "Bạn đã hỏi hơi nhiều trong 1 phút...".
- **A4**: `user_002` gọi `DELETE /chat/{cid_u1}` không xoá được tin nhắn của `user_001`. Chỉ `user_001` gọi mới xoá sạch tin nhắn của cuộc trò chuyện đó (204).
- **A5**: Đã kiểm tra hàm `don_tin_nhan_cu_3_ngay()` bằng việc chèn 1 bản ghi thời điểm `-4 days` và 1 bản ghi `-1 day`. Sau khi chạy, bản ghi `-4 days` bị xoá hoàn toàn, bản ghi `-1 day` được giữ nguyên.
- **A6**: Toàn bộ codebase không có lệnh print/log token.
- **A7**: File `README.md` đã có đầy đủ hướng dẫn chạy, lệnh cloudflared tunnel tham khảo, và curl demo.
- **A8**: Các khối mã bổ sung đều có marker `# [GEMINI] T-003`.
- Commit cục bộ: `716861d`.

#### Kết luận Claude
- **Lần review:** 1 · **Kết quả:** ĐẠT
- A1–A8 ✅ đã đọc `main.py:lay_nguoi_dung` (401 khi thiếu/sai token, cache 5 phút, không log token), `GET /health`, `DELETE /chat/{id}` 204 (chỉ xoá đúng người dùng), `conversation_id` phải là UUID, rate limit tính theo `user_id`, dọn tin >3 ngày ở `khoi_tao_database()` và mỗi lượt chat. Commit `716861d`. Đã xác nhận NestJS có `GET /users/me` (`users.controller.ts:49`).
- **Ghi chú (không chặn):** (1) câu chặn spam trả 200 như `reply` thường, nên app nhận biết bằng hai cụm từ "hỏi hơi nhiều" / "giới hạn số câu hỏi" — nếu đổi câu chữ trong `database.py` phải đổi `LIMIT_PHRASES` ở app; (2) token đã đăng xuất vẫn dùng được tối đa 5 phút nhờ cache.

---

### T-004 · [App] Service, context, lưu trữ tin nhắn, `/clear`
- **Trạng thái:** TODO · **Người làm:** Gemini · **Nơi làm:** `D:\App Mobile\MyFirstApp` · **Phụ thuộc:** T-002, T-003

**Yêu cầu chi tiết:**
1. `services/chatbot.ts`: instance axios riêng (theo mẫu `apiServiceLaravel` trong `services/api/interceptor.ts`) với `baseURL = process.env.EXPO_PUBLIC_CHATBOT_URL`, timeout 30s (AI trả chậm), gắn `Authorization: Bearer` lấy từ `SecureStore` khoá `accessToken` ở **mỗi request**. Hàm `sendChatMessage(message, conversationId)`, `deleteConversation(conversationId)`. Định nghĩa kiểu `ChatTour`, `ChatReply` đúng hợp đồng API. Không refresh token (401 → ném lỗi có `status`).
2. `context/Chatbot_Context.tsx`: `ChatbotProvider` bọc trong `app/(root)/_layout.tsx` (**bên trong** `AuthProvider`). State: `messages`, `isOpen`, `isMinimized`, `isSending`, `conversationId`. Hàm: `open()`, `minimize()`, `close()`, `send(text)`, `clear()`.
3. Lưu trữ bằng `@react-native-async-storage/async-storage`: khoá theo id người dùng (`chatbot:<userId>`), lưu `conversationId` + `messages` (tối đa 50 tin gần nhất, mỗi tin có thời điểm). Khi mở app/khi nạp, **bỏ tin cũ hơn 3 ngày**. Đăng xuất hoặc đổi tài khoản → không hiện lịch sử của người trước.
4. `send("/clear")` (so sánh sau `trim()`, không phân biệt hoa thường): xoá tin trên máy, sinh `conversationId` mới (UUID), gọi `deleteConversation` cho id cũ (lỗi mạng thì bỏ qua), thêm nhãn hệ thống "Đã làm mới cuộc trò chuyện" rồi lời chào. **Không** gửi `/clear` lên server như một câu hỏi.
5. Xử lý lỗi: mất kết nối/timeout → tin hệ thống kiểu lỗi kèm `retry`; 401 → "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"; không crash, không `Alert.alert`.
6. Thêm `EXPO_PUBLIC_CHATBOT_URL` vào `.env.example` của app nếu có (nếu không có file này, **ghi vào nhật ký** để chủ dự án tự thêm; Gemini không sửa `.env`).
7. Cập nhật `.claude/rules/` đúng file (`api-and-services.md`, `project-structure.md`).

**Phạm vi file:** `services/chatbot.ts` (mới), `context/Chatbot_Context.tsx` (mới), `app/(root)/_layout.tsx`, `.claude/rules/*`
**Ngoài phạm vi:** mọi file UI (T-005)

**Tiêu chí nghiệm thu:**
- [ ] A1. `tsc` không lỗi ở app/components/constants/hooks/services/context
- [ ] A2. Mở lại app sau khi tắt: tin nhắn còn (≤3 ngày, ≤50 tin); tin quá 3 ngày bị bỏ
- [ ] A3. Đăng xuất rồi đăng nhập tài khoản khác: không thấy tin của tài khoản trước
- [ ] A4. `/clear` hoạt động đúng mô tả, không gọi `POST /chat`
- [ ] A5. 401, timeout, mất mạng đều ra tin lỗi dễ hiểu, không crash
- [ ] A6. Không có token/khoá trong log
- [ ] A7. Đúng luật mục 3 (marker, không axios trong component, không `Alert.alert`)

**Bạn thử giúp:** _(thêm sau khi T-005 xong, vì chưa có giao diện)_

**Câu hỏi mở:** —

#### Nhật ký Gemini
| Thời điểm | Việc đã làm | File | Ghi chú / chưa chắc |
|---|---|---|---|
| 2026-10-12 | **Claude làm thay Gemini theo yêu cầu chủ dự án.** Tạo `services/chatbot.ts` (axios riêng, timeout 30s, token đọc mỗi request, lỗi phân loại `auth/timeout/network/server/config`), `context/Chatbot_Context.tsx` (state, AsyncStorage `chatbot:<userId>`, ≤50 tin, bỏ tin >3 ngày và tin lỗi khi lưu, `/clear` không gọi `POST /chat`, thử lại), bọc `ChatbotProvider` trong `app/(root)/_layout.tsx` | `services/chatbot.ts`, `context/Chatbot_Context.tsx`, `app/(root)/_layout.tsx` | `tsc` sạch. **Chưa chạy thử trên máy.** App chưa có `.env.example` → chủ dự án tự thêm `EXPO_PUBLIC_CHATBOT_URL` vào `.env` |

#### Kết luận Claude
_(chưa review)_

---

### T-005 · [App] Nút bttAI + khung chat + thu nhỏ
- **Trạng thái:** TODO · **Người làm:** Gemini · **Phụ thuộc:** T-004

**Yêu cầu chi tiết:** dựng giao diện theo mục "Đặc tả giao diện".
1. `components/chatbot/ChatbotLogo.tsx` (SVG icon R1 dựng từ `D:\ChatBot\mobile\assets\bttai-icon.svg`, prop `size`; gradient id phải duy nhất nếu nhiều icon cùng hiện), `ChatbotFloatingButton.tsx`, `ChatSheet.tsx` (khung chat), `ChatMiniBar.tsx` (thanh thu nhỏ), `ChatMessageBubble.tsx`, `ChatTourCard.tsx`, và gắn `ChatSheet` + `ChatMiniBar` vào một chỗ duy nhất (ví dụ trong `ChatbotProvider`) để dùng chung cho mọi màn hình.
2. `ZaloFloatingButton.tsx`: render thêm `ChatbotFloatingButton` **dưới** nút Zalo (cách 12px), và đẩy nút Zalo lên 62px. Rà các màn dùng `liftBy`/`baseBottom` (`search`, `history`, `notifications`, `index`, `tour/[id]`, `checkout`, `detailTour`…): nút bttAI, Zalo và "lên đầu trang" không đè nhau.
3. Khung chat: mở/đóng/thu nhỏ có hoạt ảnh mượt (`Animated`/Reanimated có sẵn); `KeyboardAvoidingView` để ô nhập không bị bàn phím che; tự cuộn xuống tin mới; `FlatList`; chặn gửi khi đang gửi hoặc nội dung rỗng; ô nhập nhiều dòng tối đa 4 dòng.
4. Hiện đủ các trạng thái trong board "Các trạng thái": đang soạn, lỗi + Thử lại, hết lượt (nền vàng nhạt), chuyển nhân viên (thẻ Zalo mở `handoff.zalo_url`), sau `/clear`, và rỗng (lời chào + 4 chip).
5. Dark mode đầy đủ theo bảng màu; mọi chữ dùng `FONT_SIZE`.
6. Nút Back vật lý Android: đóng khung chat (không thoát màn hình).
7. Không hiện nút ở màn hình đăng nhập/PIN (giống nút Zalo).

**Tiêu chí nghiệm thu:**
- [ ] A1. `tsc` sạch; không còn `Alert.alert`; có marker Gemini
- [ ] A2. Nút bttAI nằm dưới nút Zalo, đúng khoảng cách, ở mọi màn hình có Zalo; không đè nút khác
- [ ] A3. Mở/thu nhỏ/đóng đúng mô tả; thu nhỏ vẫn giữ nội dung; mở lại thấy đủ tin
- [ ] A4. Gửi câu hỏi → thấy "đang soạn" → có trả lời kèm thẻ tour; chip gợi ý bấm gửi được
- [ ] A5. Dark mode đúng; màn hình nhỏ (iPhone SE/360dp) không vỡ; bàn phím không che ô nhập
- [ ] A6. Đủ 5 trạng thái đặc biệt hoạt động
- [ ] A7. Cập nhật `.claude/rules/project-structure.md` (thư mục `components/chatbot/`)

**Bạn thử giúp:** (1) mở app, thấy nút bttAI dưới Zalo; (2) bấm → khung chat hiện; hỏi "tour Thái Lan dưới 10 triệu"; (3) thu nhỏ, đổi sang tab khác, bấm thanh bttAI để mở lại; (4) gõ `/clear`; (5) bật giao diện tối thử lại.

#### Nhật ký Gemini
| Thời điểm | Việc đã làm | File | Ghi chú / chưa chắc |
|---|---|---|---|
| 2026-10-12 | **Claude làm.** Icon R1 (`ChatbotLogo`), `ChatbotFloatingButton`, `ChatSheet` (overlay trượt, bàn phím tự tính, chip, ô nhập tối đa 4 dòng, "đang soạn"), `ChatMiniBar`, `ChatMessageBubble` (lỗi + Thử lại, hết lượt nền vàng, thẻ Zalo chuyển nhân viên), `ChatbotHost` (gắn một lần ở root, Back Android thu nhỏ khung chat). `ZaloFloatingButton` render thêm nút bttAI bên dưới và tự đẩy Zalo lên 62px | `components/chatbot/*`, `components/ZaloFloatingButton.tsx` | `tsc` sạch. **Chưa thử trên máy** (vị trí các nút ở màn có `BookingBar`, bàn phím Android). Nút bttAI chỉ hiện khi đã đăng nhập và ẩn khi khung chat đang mở/thu nhỏ; thanh thu nhỏ đặt cao hơn ở `/tour/*`, `/checkout` để không đè `BookingBar` |

#### Kết luận Claude
_(chưa review)_

---

### T-006 · [App] Bấm thẻ tour → đúng trang tour, đúng ngày khởi hành
- **Trạng thái:** TODO · **Người làm:** Gemini · **Phụ thuộc:** T-005

**Cách app mở trang tour hiện có** (`app/(root)/tour/[id].tsx`): nhận `id` (= `tour_key`), dữ liệu dự phòng (`name`, `imageUrl`, `price`, `duration`, `rating`, `reviewsCount`, `hasVat`) và để chọn sẵn đợt khởi hành thì nhận `searchDateMode="specific"` + `searchSpecificDate=<YYYY-MM-DD>`. Xem cách `search.tsx` (`openDetail`) gọi.

**Yêu cầu chi tiết:**
1. `ChatTourCard` khi bấm: lấy ngày **đầu tiên** của `ngay_khoi_hanh` (cắt theo dấu phẩy); `router.push({ pathname: "/(root)/tour/[id]", params: { id: tour_key, name: ten, imageUrl: anh ?? "", price: String(gia ?? 0), duration: "<so_ngay> ngày <so_ngay-1> đêm", rating: "0", reviewsCount: "0", hasVat: "false", searchDateMode: "specific", searchSpecificDate: <ngày đó> } })`.
2. Trước khi điều hướng, **thu nhỏ** khung chat (`minimize()`), không đóng.
3. Trên trang tour: đợt khởi hành khớp ngày phải được chọn sẵn (logic đã có; **không sửa** `tour/[id].tsx` trừ khi thật sự cần — nếu cần thì ghi lý do vào nhật ký và hỏi chủ dự án).
4. Nếu thẻ thiếu `tour_key` (dữ liệu cũ): hiện thông báo lỗi nhẹ bằng `CustomAlert`, không crash, không mở trang trống.
5. Định dạng thẻ: "X ngày Y đêm", ngày `dd/mm/yyyy`, giá có dấu chấm ngăn cách (dùng `helper/format.ts`), ảnh dùng `TourImage` (bắt buộc cho ảnh tour từ API), ảnh `null` hiện khung xám.

**Tiêu chí nghiệm thu:**
- [ ] A1. Bấm thẻ ngày 14/11 → trang tour mở **đã chọn sẵn** đợt 14/11 (không phải đợt khác)
- [ ] A2. Bấm thẻ khác ngày của **cùng một tour** → mở đúng ngày của thẻ đó
- [ ] A3. Khung chat thu nhỏ khi mở tour; quay lại bấm thanh bttAI → tin nhắn còn nguyên
- [ ] A4. Thiếu `tour_key`/lỗi mạng khi mở tour: có thông báo rõ, không crash
- [ ] A5. Giá/số ngày/ngày trên thẻ khớp trang tour (khi lệch, trang tour là số đúng — dòng cảnh báo dưới thẻ đã giải thích)
- [ ] A6. `tsc` sạch, marker Gemini, dark mode đúng

**Bạn thử giúp:** hỏi chatbot một tour có nhiều ngày khởi hành, bấm từng thẻ (nếu có nhiều thẻ cùng tour) và xem trang tour có chọn đúng ngày không.

#### Nhật ký Gemini
| Thời điểm | Việc đã làm | File | Ghi chú / chưa chắc |
|---|---|---|---|
| 2026-10-12 | **Claude làm.** `ChatbotHost.openTour`: thiếu `tour_key` → `CustomAlert` cảnh báo; có thì thu nhỏ khung chat rồi `router.push("/(root)/tour/[id]")` với `searchDateMode="specific"` + ngày đầu tiên của `ngay_khoi_hanh`. Thẻ dùng `TourImage`, `formatPrice`, ngày `dd/mm/yyyy` | `components/chatbot/ChatbotHost.tsx`, `ChatTourCard.tsx` | **Không sửa** `tour/[id].tsx`. Chưa thử xem trang tour có chọn đúng đợt không |

#### Kết luận Claude
_(chưa review)_

---

### T-007 · [Cả hai] Kiểm thử đầu-cuối (chủ dự án thử, Claude tổng hợp)
- **Trạng thái:** TODO · **Phụ thuộc:** T-001…T-006

Danh sách chủ dự án thử trên điện thoại thật, qua Cloudflare Tunnel: đăng nhập → hỏi tour → bấm thẻ → `/clear` → khiếu nại ("tôi muốn hoàn tiền") ra thẻ Zalo → đăng xuất/đăng nhập tài khoản khác không thấy tin cũ → tắt mạng gửi tin ra lỗi + Thử lại → giao diện tối. Claude ghi kết quả vào đây.

#### Kết luận Claude
_(chưa review)_

---

## 7. Quyết định đã chốt (cả hai AI phải tuân theo)

- Tab Tài khoản: mục "Tour sắp khởi hành của bạn · trong 5 ngày" = tour **khách đã đặt** (trạng thái Đã xác nhận/Đã thanh toán), còn ≤ 5 ngày, tối đa 5. **Khác** với "Tour sắp khởi hành" ở trang chủ (tour đang chào bán).
- Voucher: (1) công ty phát hành — chưa chốt; (2) theo hạng — mã cố định, chỉ đúng hạng mới dùng (vd `BTTRANKGOLD5`); (3) đặt mua — mã dùng 1 lần, dư ≥ 1.000.000đ thì cấp mã mới, chỉ loại này có hạn dùng.
- Tour trong nước / nước ngoài: điều kiện, bảng phí huỷ lấy **nguyên văn** từ trang tour trên benthanhtourist.com.
- Nội dung do AI soạn (Điều 1, 2, 4, 5 trong Điều khoản; FAQ) luôn có nhãn "Thông tin do AI soạn" cho đến khi công ty duyệt.

## 8. Câu hỏi chung & ghi chú

_(Ai thấy vướng thì ghi ở đây, kèm tên người ghi và ngày. Chủ dự án trả lời bên dưới câu hỏi.)_
