// Nội dung màn "Câu hỏi thường gặp" — do AI soạn từ các trang của benthanhtourist.com
// và điều khoản tour thật; cần công ty duyệt trước khi dùng chính thức.

export interface FaqItem {
  q: string;
  a: string[];
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "dat-tour",
    title: "Đặt tour",
    items: [
      { q: "Làm sao để đặt tour và biết đơn đã được xác nhận?", a: ["Chọn tour, chọn đợt khởi hành còn chỗ, nhập số khách rồi xác nhận đặt tour. Đơn của bạn hiện trong tab Lịch sử kèm trạng thái; khi nhân viên xác nhận, bạn nhận thông báo trong tab Thông báo.", "Đơn đặt xong chưa phải đã giữ chỗ chắc chắn cho đến khi bạn đặt cọc theo quy định."] },
      { q: "Cần bao nhiêu khách thì tour mới khởi hành?", a: ["Tour ghép khách lẻ cần từ 15 khách.", "Tour trong nước không đủ khách: công ty dời tour sang tuần tiếp theo.", "Tour nước ngoài không đủ khách: công ty báo trước 5 ngày, thoả thuận ngày khởi hành mới hoặc hoàn lại toàn bộ tiền đã đăng ký."] },
      { q: "Lịch trình có thể thay đổi không?", a: ["Thứ tự điểm tham quan có thể thay đổi theo tình hình thực tế nhưng vẫn bảo đảm tham quan đầy đủ như chương trình. Với tour bay, giờ bay có thể đổi mà không báo trước vì phụ thuộc hãng hàng không."] },
      { q: "Giờ nhận và trả phòng khách sạn là mấy giờ?", a: ["Nhận phòng sau 14:00 và trả phòng trước 12:00, trừ trường hợp đặc biệt công ty sẽ báo trước."] },
      { q: "Giá tour đã gồm những gì?", a: ["Mỗi tour có mục \"Dịch vụ tour\" ghi rõ khoản bao gồm (xe, hướng dẫn viên, bữa ăn, vé tham quan, bảo hiểm theo chương trình…) và chưa bao gồm (chi phí cá nhân, tiền tip, phụ phí phòng đơn, visa tuỳ tour…). Hãy đọc kỹ mục này trước khi đăng ký."] },
    ],
  },
  {
    id: "thanh-toan",
    title: "Thanh toán",
    items: [
      { q: "Tôi có thể thanh toán bằng hình thức nào?", a: ["Tiền mặt hoặc chuyển khoản."] },
      { q: "Đặt cọc bao nhiêu và khi nào trả phần còn lại?", a: ["Đợt 1: đặt cọc 50% khi đăng ký tour.", "Đợt 2: thanh toán phần còn lại trước 07 ngày so với ngày khởi hành (tính theo ngày làm việc với tour nước ngoài)."] },
    ],
  },
  {
    id: "huy-tour",
    title: "Huỷ & hoàn tiền",
    items: [
      { q: "Tôi muốn chuyển hoặc huỷ tour thì làm thế nào?", a: ["Mang Vé Tham Quan Du lịch (tour trong nước) hoặc Biên nhận Du lịch (tour nước ngoài) đến văn phòng đăng ký tour để làm thủ tục và đóng phí theo quy định. Công ty không giải quyết chuyển hoặc huỷ qua điện thoại."] },
      { q: "Phí huỷ tour được tính ra sao?", a: ["Phí tính theo số ngày so với ngày khởi hành và khác nhau giữa tour trong nước và nước ngoài. Thời gian huỷ tính theo ngày làm việc, không tính Thứ Bảy, Chủ Nhật và ngày Lễ, Tết.", "Xem bảng chi tiết tại Điều khoản & chính sách, Điều 3."] },
      { q: "Khi nào tôi được hoàn lại tiền cọc?", a: ["Công ty không lên được đoàn vì không đủ khách hoặc lý do khách quan: hoàn tiền cọc sau khi trừ các khoản phát sinh thực tế (nếu có) trong vòng 10 ngày.", "Khách đơn phương chuyển tour hoặc không đạt kết quả visa: hoàn tiền cọc sau khi trừ các khoản phát sinh thực tế (nếu có) trong vòng 20 ngày."] },
      { q: "Thiên tai, dịch bệnh làm tour không đi được thì sao?", a: ["Công ty hoàn lại tiền tour sau khi trừ các chi phí dịch vụ đã thực hiện (như phí làm visa) và không bồi thường thêm khoản nào khác."] },
    ],
  },
  {
    id: "giay-to",
    title: "Giấy tờ & trẻ em",
    items: [
      { q: "Đi tour trong nước cần mang giấy tờ gì?", a: ["Bản chính Hộ chiếu, CMND/CCCD (từ 14 tuổi) hoặc Giấy phép lái xe ô tô. Giấy tờ đi máy bay phải còn giá trị, có ảnh đóng dấu giáp lai.", "Việt kiều và khách quốc tế nhập cảnh bằng visa rời cần mang theo visa."] },
      { q: "Đi tour nước ngoài cần chuẩn bị gì?", a: ["Hộ chiếu còn hạn trên 06 tháng so với ngày kết thúc tour, chữ ký, dấu mộc đỏ và hình ảnh rõ ràng. Nên mang theo CCCD gốc.", "Nên kiểm tra nghĩa vụ thuế và tình trạng cấm hoặc hoãn xuất cảnh trước khi đi để tránh bị từ chối nhập cảnh.", "Khách mang quốc tịch nước ngoài phụ thu 50 USD/khách và cần visa nhập cảnh lại Việt Nam nếu thuộc diện cần visa."] },
      { q: "Trẻ em đi tour cần giấy tờ gì?", a: ["Dưới 14 tuổi mang giấy khai sinh hoặc hộ chiếu; dưới 1 tháng tuổi chưa có giấy khai sinh thì dùng giấy chứng sinh. Với tour nước ngoài cần hộ chiếu gốc và giấy khai sinh bản gốc hoặc trích lục có mộc đỏ.", "Trẻ không đi cùng cha mẹ cần giấy uỷ quyền của cha mẹ cho người thân dẫn đi, có chứng thực của UBND phường/xã.", "Một người lớn đi với một bé dưới 12 tuổi (tour nước ngoài): đóng tiền tour cho bé ngủ giường riêng."] },
      { q: "Người cao tuổi hoặc phụ nữ mang thai có đi tour được không?", a: ["Từ 70 tuổi trở lên: cần người thân đi kèm; tour nước ngoài cần thêm giấy xác nhận đủ sức khoẻ của bác sĩ, người thân dưới 60 tuổi đi cùng và phí bảo hiểm cao cấp. Không nhận khách từ 80 tuổi với tour nước ngoài.", "Khách mang thai từ 32 tuần trở lên không được nhận đi tour bay nội địa. Hãy báo nhân viên ngay khi đăng ký để được tư vấn."] },
    ],
  },
  {
    id: "tai-khoan",
    title: "Tài khoản & voucher",
    items: [
      { q: "Tôi quên mật khẩu hoặc mã PIN thì làm gì?", a: ["Bấm \"Quên mật khẩu\" ở màn hình đăng nhập để đặt lại. Mã PIN 6 số có thể đổi tại Tài khoản, mục Mật khẩu & mã PIN."] },
      { q: "Làm sao để nhận voucher?", a: ["Công ty phát voucher ngẫu nhiên trong năm và công bố mã trên Facebook chính thức facebook.com/benthanhtourist. Thành viên hạng Vàng trở lên còn có mã voucher cố định theo hạng (ví dụ hạng Vàng dùng mã BTTRANKGOLD5), chỉ đúng hạng mới dùng được; doanh nghiệp hoặc cá nhân cũng có thể đặt mua voucher. Chi tiết ở Điều khoản & chính sách, Điều 4."] },
      { q: "Voucher dùng không hết có hoàn tiền không?", a: ["Không hoàn tiền. Mỗi mã chỉ dùng một lần và bị vô hiệu ngay sau khi dùng. Nếu voucher đặt mua còn dư từ 1.000.000đ trở lên, hệ thống tự cấp một mã mới bằng số dư cho bên đã mua. Dưới 1.000.000đ thì không cấp lại."] },
      { q: "Hạng thành viên tính như thế nào?", a: ["Hạng tăng theo điểm tích luỹ: Đồng, Bạc (từ 10 triệu), Vàng (50 triệu), Bạch Kim (100 triệu), Kim Cương (200 triệu), Ruby (500 triệu). Bấm vào thẻ thành viên ở trang chủ để xem quyền lợi từng hạng."] },
    ],
  },
];
