# TÀI LIỆU THIẾT KẾ & PHẢN BIỆN SỰ KIỆN: "GA CŨ TRONG ĐÊM MƯA" (HANVUI APP)

## VAI TRÒ CỦA CLAUDE

Bạn là Chuyên gia Thiết kế Game hóa (Gamification) và Kinh tế trong ứng dụng giáo dục (EdTech). Dưới đây là bản thiết kế sự kiện hàng tháng của ứng dụng **HanVui** (app web di động cho người Việt học tiếng Trung HSK 3-4) gồm **Bản gốc (v1.0)** và **Bản phản biện/đề xuất chỉnh sửa (v2.0)**.
Hãy đọc kỹ, phân tích ưu/nhược điểm của từng phương án và **đưa ra quyết định chốt cuối cùng** cho các điểm đang phân vân ở cuối tài liệu.

---

## I. BỐI CẢNH & CẤU TRÚC CỐT LÕI (ĐÃ CHỐT)

- **Mục tiêu sản phẩm:** Vừa học vừa chơi. Người học tìm "từ khóa" ẩn trong các bài hội thoại tiếng Trung để mở khóa cốt truyện trinh thám/bí ẩn hàng tháng.
- **Cấu trúc thời gian & nội dung:**
  - 1 Sự kiện = 1 tháng dương lịch = 4 Chương (4 tuần) = 16 Hồi = 48 Ô từ khóa.
  - Mỗi Chương (1 tuần) = 4 Hồi = 12 Ô từ khóa (cứ giải được 3 ô thì mở 1 hồi truyện nghe cấp HSK 3-4).
  - Lịch mở chương: Tuần 1 (ngày 1-7), Tuần 2 (8-14), Tuần 3 (15-21), Tuần 4 (22-28). Ngày 29, 30, 31 là ngày dự trữ. Reset ngày lúc 00:00 giờ Việt Nam.
  - Chương cũ hết tuần vẫn chơi tiếp được đến hết tháng.
- **Cơ chế nhập đáp án:** Chỉ nhận chữ Hán. Nhập sai 3 lần bị khóa 15 phút.
- **Đơn vị tiền tệ (Point):** 1 lượt gợi ý mua lẻ = 3.000 Point = 3.000 VNĐ. Point dùng để mua VIP và mua lượt. Mỗi Point phát ra là một khoản chi phí của chủ app nên không phát Point tùy tiện.

---

## II. CÁC ĐIỂM CẦN CLAUDE SO SÁNH VÀ CHỐT PHƯƠNG ÁN (v1.0 vs v2.0)

### 1. Cơ chế Gợi ý, Dẫn đường & Điều kiện mở từ khóa (UX Flow)

- **Bản gốc (v1.0):**
  - Mỗi ô có 3 gợi ý mở tuần tự (tốn 1 lượt/gợi ý): (1) Chủ đề; (2) Bối cảnh chung của bài; (3) Câu hỏi trực tiếp ra đáp án.
  - Điều kiện hợp lệ: Từ khóa phải nằm trong **bài hội thoại vừa học**.
  - Đặc quyền VIP ("Bốc secret"): Icon nhập từ khóa rung sáng ngay khi bài vừa học có chứa từ khóa chưa giải (và ô tương ứng trên bảng cũng sáng). Người thường không có báo sáng nhưng vẫn nhập được ở mọi bài.

- **Phản biện & Đề xuất (v2.0):**
  - _Vấn đề 1 (Mò kim đáy bể):_ Nếu kho bài học có hàng trăm bài, người chơi thường mở Gợi ý 1 & 2 vẫn có thể phải học thử 10-15 bài cùng chủ đề mới trúng bài có từ khóa -> Dễ nản và bỏ cuộc.
  - _Vấn đề 2 (Lỗi thao tác "bài vừa học"):_ Nếu học xong Bài A (có từ khóa), quên chưa nhập mà bấm nghe tiếp Bài B -> Quay lại nhập từ khóa Bài A sẽ bị tính sai.
  - _Giải pháp v2.0:_
    1. **Mặc định (0 lượt):** Hiện sẵn _Loại từ & Số chữ Hán_ (VD: Danh từ, 2 chữ) để người chơi có cơ sở đoán mà không mò mẫm.
    2. **Gợi ý 1 (1 lượt):** Hiện _Chủ đề + Cấp độ HSK_ kèm nút lọc nhanh danh sách bài học tương ứng.
    3. **Gợi ý 2 (1 lượt):** Hiện _Bối cảnh bài_ VÀ **bật đèn báo manh mối cho cả người thường** ở ô đó (học trúng bài sẽ báo hiệu). Như vậy VIP có lợi thế báo sáng ngay từ 0 gợi ý, còn người thường mở tới Gợi ý 2 cũng được báo sáng.
    4. **Gợi ý 3 (1 lượt):** Câu hỏi trực tiếp + Nút dẫn thẳng tới bài hội thoại đó.
    5. **Sửa điều kiện hợp lệ:** Chỉ cần bài hội thoại chứa từ khóa **đã được người chơi hoàn thành ít nhất 1 lần kể từ lúc Chương đó mở** (không bắt buộc phải là bài vừa học cuối cùng).

---

### 2. Kinh tế Lượt gợi ý (Hint Economy)

- **Bản gốc (v1.0):**
  - Nhu cầu: Mở hết 3 gợi ý cả tháng cần 144 lượt (chơi cạnh tranh chỉ mở tới Gợi ý 2 cần 96 lượt).
  - Nguồn cung miễn phí:
    - Nhiệm vụ ngày (3 lượt/ngày = 21/tuần): Đăng nhập (+1), nghe & trả lời 3 hội thoại (+1), online 20 phút (+1).
    - Nhiệm vụ tuần (21 lượt/tuần): Đăng nhập 3/5/7 ngày (+2/+3/+2), online 2/3/4 giờ (+2/+3/+2), học 9/15/21 bài (+2/+3/+2).
    - Tổng tuần: 42 lượt (dư 6 lượt so với mức mở full 36 lượt/tuần).
    - Bù ngày vắng: +2 lượt/ngày vắng (tối đa 3 ngày).
    - Thưởng cuối tháng (ngày 26-28): +3 lượt/ngày (+9 lượt). Ngày 29-31: nhiệm vụ ngày + 3 lượt đăng nhập (chỉ cho người chưa giải hết).
    - **Tổng tối đa cả sự kiện: 177 lượt** (chưa tính ngày dự trữ).
  - Xử lý lượt dư cuối sự kiện: Lượt tặng hết hạn. Lượt mua bằng Point đang phân vân giữa việc **hoàn lại Point** hay **cho hết hạn**.

- **Phản biện & Đề xuất (v2.0):**
  - _Vấn đề (Nghịch lý kinh tế):_ Mở càng nhiều gợi ý càng bị trừ điểm xếp hạng, nên nhóm đua Top sẽ dùng rất ít lượt (< 96 lượt), trong khi lượt miễn phí cho tới 177 lượt -> Thừa mứa lượt, không ai có động lực bỏ 3.000đ mua thêm lượt. Ngoài ra, nhiệm vụ "Online 20 phút / 4 giờ" rất dễ bị người dùng treo sáng màn hình để cày gian lận.
  - _Giải pháp v2.0:_
    1. **Bỏ nhiệm vụ đếm giờ online**, giảm tổng lượt miễn phí xuống mức vừa khít: Nhiệm vụ ngày **2 lượt/ngày** (14/tuần) + Nhiệm vụ tuần **16 lượt/tuần** = **30 lượt/tuần** (Cả tháng + thưởng cuối tháng = **~126 lượt**). Người chơi muốn mở full Gợi ý 3 cho cả 48 ô (144 lượt) sẽ thiếu 18 lượt -> Phải tự suy luận ở một số ô hoặc mua thêm lượt.
    2. **Thêm chỗ tiêu lượt (Sink) không làm giảm điểm cho dân đua Top:**
       - Dùng 1 lượt = Xóa thời gian phạt khóa 15 phút khi đoán sai 3 lần.
       - Dùng 2 lượt = "Máy dò sóng": Khoanh vùng 3 bài hội thoại (1 thật, 2 nhiễu) cho 1 ô mà không bị tính là mở gợi ý (không trừ điểm xếp hạng).
    3. **Phân tách Lượt Tặng & Lượt Mua:** Lượt tặng hết hạn cuối tháng. **Lượt mua bằng Point được giữ vĩnh viễn** sang tháng sau và dùng được trong Kho lưu trữ (không hoàn Point để tránh phức tạp kế toán, không xóa để tránh ức chế người nạp tiền).

---

### 3. Bảng xếp hạng, Thang điểm & Chống gian lận (Anti-Cheat)

- **Bản gốc (v1.0):**
  - Điểm mỗi ô: 0 gợi ý = 250đ; Gợi ý 1 = 200đ; Gợi ý 2 = 150đ; Gợi ý 3 = 50đ. Cộng thêm +30đ nếu giải ngay trong tuần của chương.
  - Thứ tự xếp hạng: Điểm sự kiện -> Huy chương mốc -> Thời gian hoàn thành sớm hơn.

- **Phản biện & Đề xuất (v2.0):**
  - _Lỗ hổng 1 (Cày Acc Clone & Chia sẻ đáp án):_ Người chơi tạo 1 tài khoản phụ, dùng lượt miễn phí mở hết tới Gợi ý 3 để lấy danh sách bài học và đáp án. Sau đó lấy tài khoản chính vào học đúng bài đó và nhập đáp án ở mức **0 gợi ý** -> Ăn tuyệt đối 280đ/ô cho cả 48 ô. Hoặc 1 người tìm ra đăng lên group Facebook cho cả cộng đồng chép.
  - _Lỗ hổng 2 (VIP Pay-to-Win tuyệt đối):_ VIP được báo sáng ngay ở mức 0 gợi ý nên luôn ăn 250đ/ô, người thường buộc phải mở Gợi ý 1-2 nên tối đa chỉ được 150-200đ/ô -> BXH mất tính cạnh tranh công bằng.
  - _Lỗ hổng 3 (Độ rơi điểm Gợi ý 3 quá gắt):_ Rơi từ 150đ (G2) xuống 50đ (G3) làm người chơi phổ thông cảm thấy bị phạt quá nặng.
  - _Giải pháp v2.0:_
    1. **Chống Clone/Share đáp án:** Thay vì cả server dùng chung 1 bộ 48 từ khóa cố định, mỗi Chương chuẩn bị một **Bể từ khóa (Pool) gồm 18-24 từ**, hệ thống **random 12 từ cho mỗi tài khoản**. (Nếu thấy tốn công làm nội dung thì giữ 48 từ cố định nhưng **bắt buộc mở Gợi ý 1 mới được nhập đáp án**).
    2. **Cân bằng VIP trên BXH:** Giới hạn tính năng "Bốc secret" của VIP kích hoạt tối đa **2-3 lần/ngày**, hoặc nếu giải nhờ đèn báo VIP ở mức 0 gợi ý thì điểm tính ngang mức Gợi ý 1.
    3. **Làm mượt thang điểm:** 0 gợi ý = **220đ**; Gợi ý 1 = **180đ**; Gợi ý 2 = **140đ**; Gợi ý 3 = **80đ** (+30đ thưởng tuần).

---

### 4. Hệ thống Mốc thưởng & Quà VIP 3 ngày

- **Bản gốc (v1.0):**
  - 4 mốc theo số từ khóa giải được: 10% (5 từ - Đồng), 30% (15 từ - Bạc), 60% (29 từ - Vàng), 90% (44 từ - Ngọc).
  - Quà mốc cuối (44 từ): Gói VIP 3 ngày cất vào "túi đồ" (hạn 90 ngày, bấm kích hoạt mới đếm ngược). Quà 3 mốc đầu chưa chốt.

- **Phản biện & Đề xuất (v2.0):**
  - Đề xuất quà 3 mốc đầu (chi phí 0đ nhưng giá trị cao):
    - **Mốc Đồng (5 từ):** +3 Lượt gợi ý sự kiện + Bộ Flashcard/PDF từ vựng Chương 1.
    - **Mốc Bạc (15 từ):** Khung Avatar sự kiện (hạn 30 ngày) + 1 Thẻ bảo hộ chuỗi học (hoặc 1 lượt mở bài VIP lẻ).
    - **Mốc Vàng (29 từ):** Danh hiệu/Huy hiệu vĩnh viễn trên hồ sơ + **Audio Ngoại truyện (Bonus Track / Hậu trường nhân vật)**.
  - **Rủi ro gói VIP 3 ngày ở Mốc Ngọc:** Người chơi sẽ tích thẻ VIP 3 ngày này sang **Tuần 1 của sự kiện tháng sau** rồi mới kích hoạt để dùng "Bốc secret" cày điểm tuyệt đối.
  - _Giải pháp v2.0:_ Vẫn tặng VIP 3 ngày để kích thích chuyển đổi mua gói (rất tốt cho phễu marketing), nhưng quy định **Thẻ VIP Trải Nghiệm (tặng từ sự kiện) không bao gồm tính năng "Bốc secret" trong sự kiện** (chỉ mở khóa toàn bộ bài học và tính năng học tập VIP).

---

### 5. Các trường hợp biên (Edge Cases) cần chốt cho Dev

1. **Gói theo kịp (Catch-up mechanic):**
   - _v1.0:_ Vào muộn ngày 8-14 tặng 12 lượt; ngày 15-21 tặng 24 lượt; ngày 22-28 tặng 12 lượt.
   - _Rủi ro:_ Người chơi vẫn học từ đầu tháng nhưng cố tình đợi đến ngày 15 mới bấm vào trang sự kiện lần đầu để nhận khống 24 lượt.
   - _Đề xuất v2.0 (Bù chạm sàn - Floor Top-up):_ Chỉ bù nếu `Tổng_lượt_đã_nhận_từ_đầu_tháng < Mức_sàn`. Ví dụ: Tuần 2 bù cho đủ 15 lượt, Tuần 3 bù cho đủ 30 lượt.
2. **Điều kiện mở Hồi truyện:**
   - Cần chốt rõ: Giải đủ **3 ô trong cùng 1 Chương** mới mở 1 Hồi của Chương đó (tránh việc lấy các ô dễ ở Chương 2, 3 để mở Hồi cuối của Chương 1).
3. **Kho lưu trữ (Sau khi kết thúc tháng):**
   - _v1.0:_ Truyện vào kho lưu trữ, không tính điểm, các ô chưa giải vẫn mở gợi ý bằng lượt.
   - _Vấn đề:_ Lượt tặng đã hết hạn lúc kết thúc sự kiện, vậy lấy lượt đâu để mở trong kho lưu trữ?
   - _Đề xuất v2.0:_ Mở gợi ý trong Kho lưu trữ bằng **Lượt Mua (vĩnh viễn)** HOẶC cơ chế luyện tập **"Cứ hoàn thành 2 bài nghe bất kỳ thì mở được 1 gợi ý trong Kho lưu trữ"**.

---

## III. CÂU HỎI NHỜ CLAUDE RA QUYẾT ĐỊNH CUỐI CÙNG

Dựa trên 2 phiên bản trên, nhờ Claude đóng vai trò Trọng tài Thiết kế (Lead Designer) để chốt giúp tôi 5 vấn đề sau (kèm lý giải ngắn gọn):

1. **Về Kinh tế Lượt:** Nên giữ mức hào phóng của **v1.0 (177 lượt)** cho người chơi thoải mái, hay siết lại theo **v2.0 (126 lượt + bán tiện ích Phá khóa/Dò sóng)** để tối ưu doanh thu mà không làm người chơi F2P nản?
2. **Về Chống Gian lận & VIP:** Phương án làm **Pool từ khóa ngẫu nhiên cho từng user** có đáng công sức dev bỏ ra không, hay có cách nào nhẹ nhàng hơn để chặn nạn dùng Acc phụ xem đáp án và chia sẻ lên mạng?
3. **Về UX tìm từ khóa:** Đề xuất **cho người thường cũng được báo sáng khi mở tới Gợi ý 2** (như v2.0) có làm giảm giá trị của gói VIP không?
4. **Về Thang điểm & Quà mốc:** Thang điểm nào tối ưu hơn? Cách xử lý thẻ VIP 3 ngày ở mốc cuối như v2.0 đã hợp lý chưa?
5. **Tổng kết Spec:** Hãy xuất ra giúp tôi **Bản Quy Tắc Sự Kiện Chính Thức (Final Spec)** ngắn gọn sau khi bạn đã chọn phương án tối ưu nhất ở các mục trên để tôi giao thẳng cho lập trình viên.
