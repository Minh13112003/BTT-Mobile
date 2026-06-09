# Feature Specification: Expand Tour Order Detail with Dynamic Trip Info & Static Terms

## 🎯 Overview

Objective
We need to enhance the current `detailTour` component (Mobile UI) to display new dynamic trip specifications and a large block of static legal/policy guidelines.
Instead of introducing a new screen or changing the navigation router, when a user clicks to view details, we will render a bottom-sheet sheet or append a seamless scrollable landing view container directly within the same screen.

---

## 🛠 1. Backend Data Integration (Dynamic)

The API now returns extended tour object fields within `items` array. We need to map these fields dynamically to the new **"THÔNG TIN CHUYẾN ĐI" (Trip Information)** card block.

### Target Mapping Fields:

- `departureFrom`: Place of departure (e.g., `"TP. Hồ Chí Minh"`)
- `transport`: Transport method (e.g., `"Máy bay quốc tế & Tàu cao tốc Shinkansen"`)
- `included`: Array of string `[]` (Render as a bulleted checklist)
- `notIncluded`: Array of string `[]` (Render as a bulleted checklist with warning tone)
- `notes`: Specific tour disclaimer string

---

## 🎨 2. UI/UX Design Requirements (Mobile Component Vibe)

### Theme Consistency

- **Background**: Inherit Dark Navy Slate (`#1E222F` or `#121620`) matching `image_c2409f.png`.
- **Card Containers**: Slightly lighter rounded background (`#252A3A`) with `borderRadius: 16`.
- **Typography**:
  - Headers: Bold, uppercase, color `#FFFFFF` or Light Gray.
  - Body text: `#A2A8B8` for readability.
  - Highlight text (Included items): Green accent (`#4CAF50` or matching voucher color in `image_c2409f.png`).

### Layout Structure (Append below "THÔNG TIN GIAO DỊCH"):

1.  **Card 1: THÔNG TIN CHUYẾN ĐI (Dynamic Data)**
    - _Row 1_: Nơi khởi hành ── `departureFrom`
    - _Row 2_: Phương tiện ── `transport`
    - _Section 3_: **Dịch vụ bao gồm** (Render loop `included` list with a subtle check icon `✓`)
    - _Section 4_: **Chưa bao gồm** (Render loop `notIncluded` list with a subtle cross/bullet icon `•`)
    - _Section 5_: **Lưu ý riêng** (Render `notes` text italicized or inside a warning box border)

2.  **Card 2: ĐIỀU KHOẢN & LƯU Ý CHUNG (Static Data)**
    - Collapsible Accordion layout or Scrollable section containing the standardized fixed guidelines.

---

## 📄 3. Static Content Injection (Điều Khoản & Lưu Ý)

Please embed this exact static text block for the **"Một số điểm lưu ý"** section inside the UI component:

```text
Một số điểm lưu ý
• Trước khi đăng ký tour xin Quý khách vui lòng đọc kỹ chương trình, giá tour, các khoản bao gồm và không bao gồm.
• Quý khách từ 70 tuổi trở lên, Quý khách là người khuyết tật khi tham gia tour, đề nghị phải có thân nhân đi kèm và cam kết bảo đảm đủ sức khỏe để tham gia tour du lịch.
• Thứ tự các điểm tham quan trong chương trình có thể thay đổi tùy tình hình thực tế nhưng vẫn bảo đảm tham quan đầy đủ như trong chương trình.
• Giờ nhận phòng khách sạn: sau 14:00 giờ và trả phòng trước 12:00 giờ (trừ các trường hợp đặc biệt, Công ty sẽ thông báo trước cho Quý khách).
• Trong trường hợp bất khả kháng do thời tiết, thiên tai, đình công, bạo động, phá hoại, chiến tranh, dịch bệnh, chuyến bay bị trì hoãn hay bị hủy do thời tiết hoặc do kỹ thuật…..dẫn đến tour không thể thực hiện tiếp tục được, Công ty sẽ hoàn trả lại tiền tour cho quý khách sau khi đã trừ lại các chi phí dịch vụ đã thực hiện (phí liên quan đến vé máy bay, đặt cọc dịch vụ…) Và không chịu trách nhiệm bồi thường thêm bất kỳ chi phí nào khác.
• Theo quy định của hãng hàng không, Công ty không nhận hành khách mang thai từ 32 tuần trở lên tham gia các tour du lịch bằng đường hàng không trong nước.

Lưu ý tham gia tour du lịch bằng đường hàng không:
• Khi đăng ký tour Quý khách vui lòng cung cấp tên chính xác, đầy đủ, đúng từng ký tự trên CCCD/Hộ chiếu/Giấy khai sinh. Nếu cung cấp sai Quý khách vui lòng chịu phí hoàn vé và phải mua lại vé mới theo quy định của Hãng Hàng không (nếu chuyến bay còn chỗ).
• Các chuyến bay phụ thuộc vào hãng hàng không nên một số trường hợp giờ bay sẽ thay đổi mà không được báo trước.
• Quý khách vui lòng tập trung tại sân bay trước 120 phút.
• Sau khi làm thủ tục hàng không, nhận thẻ lên máy bay, đề nghị Quý khách giữ thẻ và lưu ý lên máy bay đúng giờ. Công ty không chịu trách nhiệm trường hợp khách làm mất thẻ lên máy bay và không lên máy bay đúng theo giờ quy định.

Hành lý ký gửi & Lưu ý khi gửi hành lý:
• Quý khách nên ghi tên và địa chỉ của mình vào thẻ nhận dạng hành lý.
• Khi gửi hành lý lưu ý nhớ nhận cuống thẻ từ nhân viên làm thủ tục.
• Để đảm bảo an toàn cho hành lý ký gửi, đề nghị Qúy khách lưu ý: Không nên để những vật dụng quý như tiền, trang sức, kim loại quý, tài liệu và vật mẫu quan trọng… trong hành lý. Hành lý nên được bao gói chắc chắn và có khóa.
• Không được để những vật dụng dễ vỡ như đồ sứ, hàng điện tử, chai lọ…bên trong hành lý.
• Những đồ có đặc tính gây mùi khó chịu như nước mắm, trái sầu riêng…không được phép vận chuyển.

Giấy tờ cần thiết khi đi du lịch:
• Quý khách mang theo bản chính: Hộ chiếu/ Giấy CCCD (Áp dụng hành khách từ 14 tuổi trở lên)/ Giấy phép lái xe ôtô. Đối với Quý khách là Việt kiều, quốc tế nhập cảnh Việt Nam bằng visa rời, vui lòng mang theo visa khi đăng ký và khi đi tour.
• Trẻ em dưới 14 tuổi mang theo giấy khai sinh/ hộ chiếu.
• Trường hợp trẻ em dưới 1 tháng tuổi chưa có giấy khai sinh thì phải có giấy chứng sinh.
• Đối với trẻ em được các tổ chức xã hội đưa về nuôi dưỡng phải có giấy xác nhận của tổ chức xã hội đó.
• Trường hợp trẻ em không có cha/mẹ đi cùng, ngoài các giấy tờ theo quy định cần phải có giấy cam kết của người đại diện theo pháp luật (Giấy ủy quyền của cha mẹ đẻ và có xác nhận của cơ quan công an địa phương).
• Giấy tờ của hành khách sử dụng khi đi máy bay phải đảm bảo các điều kiện sau: Còn giá trị sử dụng, có ảnh đóng dấu giáp lai, trừ giấy khai sinh, giấy chứng sinh của trẻ em.

Lưu ý khi chuyển/huỷ tour:
• Thời gian hủy chuyến du lịch được tính cho ngày làm việc, không tính Thứ Bảy, Chủ Nhật & các ngày Lễ, Tết.
• Sau khi đóng tiền, nếu Quý khách muốn chuyển/huỷ tour xin vui lòng mang Vé Tham Quan Du lịch đến văn phòng đăng ký tour để làm thủ tục chuyển/huỷ tour và đóng phí theo quy định của BenThanh Tourist. Không giải quyết các trường hợp liên hệ chuyển/huỷ tour qua điện thoại.

Quy trình đăng ký và thanh toán:
• Thanh toán bằng tiền mặt hoặc chuyển khoản. Đợt 1: Đặt cọc 50% tiền tour/ khách khi đăng ký tour.
• Đợt 2: Thanh toán số tiền tour còn lại trước 07 ngày so với thời gian khởi hành.

Điều kiện huỷ phạt:
• Chi phí chuyển/hủy tour sau khi đã cọc: 50% tiền tour.
• Trước 30 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour: 50% tiền tour.
• Từ 30 ngày - 15 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour: 60% tiền tour.
• Từ 07 - 14 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour: 80% tiền tour.
• Từ 01 - 07 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour: 100% tiền tour.
```
