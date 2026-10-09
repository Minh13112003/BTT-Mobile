// Nội dung màn "Điều khoản & chính sách".
// Điều 3 (điều kiện tour): chép nguyên văn từ trang chi tiết tour trên benthanhtourist.com.
// Điều 1, 2, 4, 5 do AI soạn (có nhãn trên UI) — cần công ty duyệt.

export interface TourTermsGroup {
  title: string;
  items: string[];
}

export interface TourTerms {
  pay: string[];
  procedure: string[];
  fees: string[];
  feeNote: string;
  groups: TourTermsGroup[];
}

export type TourKind = "domestic" | "foreign";

export const TOUR_TERMS: Record<TourKind, TourTerms> = {
  domestic: {
    pay: ["Thanh toán bằng tiền mặt hoặc chuyển khoản.", "Đợt 1: Đặt cọc 50% tiền tour/ khách khi đăng ký tour.", "Đợt 2: Thanh toán số tiền tour còn lại trước 07 ngày so với thời gian khởi hành."],
    procedure: ["Thời gian hủy chuyến du lịch được tính cho ngày làm việc, không tính Thứ Bảy, Chủ Nhật & các ngày Lễ, Tết", "Sau khi đóng tiền, nếu Quý khách muốn chuyển/huỷ tour xin vui lòng mang Vé Tham Quan Du lịch đến văn phòng đăng ký tour để làm thủ tục chuyển/huỷ tour và đóng phí theo quy định của BenThanh Tourist. Không giải quyết các trường hợp liên hệ chuyển/huỷ tour qua điện thoại."],
    fees: ["Chi phí chuyển/hủy tour sau khi đã cọc: 50% tiền tour.", "Trước 30 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour : 50% tiền tour.", "Từ 30 ngày - 15 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour: 60% tiền tour.", "Từ 07 - 14 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour: 80% tiền tour.", "Từ 01 - 07 ngày so với ngày khởi hành tour, chi phí chuyển/hủy tour: 100% tiền tour."],
    feeNote: "Nguyên văn theo trang chi tiết tour trên benthanhtourist.com.",
    groups: [
      { title: "Về chương trình tour", items: ["Vì là chương trình ghép khách lẻ, nếu không đủ 15 khách để khởi hành, công ty sẽ dời tour sang tuần tiếp theo.", "Trước khi đăng ký, vui lòng đọc kỹ chương trình, giá tour, các khoản bao gồm và không bao gồm.", "Thứ tự các điểm tham quan có thể thay đổi tuỳ tình hình thực tế nhưng vẫn bảo đảm tham quan đầy đủ như chương trình.", "Giờ nhận phòng khách sạn sau 14:00 và trả phòng trước 12:00 (trừ trường hợp đặc biệt, công ty sẽ thông báo trước).", "Trường hợp bất khả kháng (thời tiết, thiên tai, đình công, bạo động, chiến tranh, dịch bệnh, chuyến bay bị hoãn/huỷ…) khiến tour không thể thực hiện, công ty hoàn lại tiền tour sau khi trừ các chi phí dịch vụ đã thực hiện và không bồi thường thêm khoản nào khác."] },
      { title: "Sức khoẻ và đối tượng đặc biệt", items: ["Khách từ 70 tuổi trở lên hoặc là người khuyết tật cần có thân nhân đi kèm và cam kết đủ sức khoẻ tham gia tour.", "Theo quy định hãng hàng không, công ty không nhận khách mang thai từ 32 tuần trở lên với tour đi bằng đường hàng không trong nước."] },
      { title: "Giấy tờ cần mang theo", items: ["Bản chính Hộ chiếu / CMND (khách từ 14 tuổi) / Giấy phép lái xe ô tô. Việt kiều, khách quốc tế nhập cảnh bằng visa rời cần mang theo visa khi đăng ký và khi đi tour.", "Trẻ em dưới 14 tuổi mang giấy khai sinh hoặc hộ chiếu; trẻ dưới 1 tháng tuổi chưa có giấy khai sinh cần giấy chứng sinh.", "Trẻ do tổ chức xã hội đưa về nuôi dưỡng cần giấy xác nhận của tổ chức đó.", "Trẻ đi không có cha/mẹ cần giấy cam kết của người đại diện theo pháp luật (giấy uỷ quyền của cha mẹ đẻ, có xác nhận của công an địa phương).", "Giấy tờ dùng khi đi máy bay phải còn giá trị sử dụng, có ảnh đóng dấu giáp lai (trừ giấy khai sinh, giấy chứng sinh của trẻ em)."] },
    ],
  },
  foreign: {
    pay: ["Thanh toán bằng tiền mặt hoặc chuyển khoản", "Đợt 1: Đặt cọc 50% khi đăng ký tour", "Đợt 2: Thanh toán số tiền tour trước 07 ngày khởi hành (ngày làm việc)"],
    procedure: ["Sau khi đóng tiền, nếu Quý khách muốn chuyển/huỷ tour xin vui lòng mang Biên nhận Du lịch đến văn phòng đăng ký tour để làm thủ tục chuyển/huỷ tour và chịu phạt theo quy định của BenThanh Tourist. Không giải quyết các trường hợp liên hệ chuyển/huỷ tour qua điện thoại", "Đối với những tour còn thời hạn hủy nhưng đã làm visa, Quý khách vui lòng thanh toán phí visa.", "Trong trường hợp BenThanh Tourist không lên được đoàn vì lí do không đủ khách hoặc lí do khách quan, sẽ hoàn trả lại chi phí đặt cọc sau khi đã trừ hết các khoản phát sinh thực tế (nếu có) trong vòng 10 ngày.", "Trong trường hợp Quý khách đơn phương chuyển tour hoặc không đạt kết quả visa, BenThanh Tourist sẽ hoàn trả lại chi phí đặt cọc sau khi đã trừ hết các khoản thực tế phát sinh (nếu có) trong vòng 20 ngày."],
    fees: ["Nếu hủy hoặc hoãn tour sau khi đặt cọc: Chi phí là 100% tiền cọc tour.", "Nếu hủy hoặc hoãn tour từ 15 - 20 ngày trước ngày khởi hành: Chi phí huỷ tour là 50% giá tour.", "Nếu hủy hoặc hoãn tour từ 12-14 ngày trước ngày khởi: Chi phí huỷ tour là 70% giá tour.", "Nếu hủy hoặc hoãn tour ngay sau khi Đại Sứ Quán, Lãnh Sự Quán đã cấp visa: Chi phí huỷ tour là 100% giá tour.", "Nếu hủy hoặc hoãn tour trong vòng từ 05-11 ngày trước ngày khởi hành: Chi phí huỷ tour là 90% trên giá tour du lịch.", "Nếu hủy hoặc hoãn tour từ 01-04 ngày trước ngày khởi hành: Chi phí huỷ tour là 100% trên giá tour du lịch"],
    feeNote: "(Thời gian hủy tour được tính cho ngày làm việc, không tính thứ Bảy, Chủ Nhật và các ngày Lễ, Tết). Nguyên văn theo trang chi tiết tour trên benthanhtourist.com.",
    groups: [
      { title: "Về chương trình tour", items: ["Đọc kỹ chương trình, giá tour, khoản bao gồm và không bao gồm, điều kiện huỷ tour, đặt cọc trước khi đăng ký.", "Đoàn ghép khách lẻ cần từ 15 khách người lớn để khởi hành đúng lịch. Dưới 15 khách, công ty thông báo trước 5 ngày và thoả thuận ngày khởi hành mới hoặc hoàn lại toàn bộ tiền đã đăng ký.", "Chi phí phát sinh do khách tự thanh toán. Công ty không chịu trách nhiệm về việc mất điểm tham quan khi điểm đóng cửa không báo trước, kẹt xe hoặc khách dừng quá thời gian quy định.", "Tour trọn gói kết hợp tham quan, mua sắm. Muốn tách đoàn, báo trước với nhân viên bán tour và thanh toán 1.500.000đ/khách/ngày (không hoàn lại).", "Hành trình có thể thay đổi theo thực tế nhưng vẫn bảo đảm đầy đủ điểm tham quan. Giờ bay có thể thay đổi mà không báo trước do phụ thuộc hãng hàng không.", "Thiên tai, sự cố an ninh, sự cố hàng không: công ty xem xét hoàn chi phí không tham quan trong điều kiện có thể, sau khi trừ dịch vụ đã thực hiện (như phí làm visa) và không bồi thường thêm."] },
      { title: "Quốc tịch và nhập cảnh", items: ["Giá tour chỉ áp dụng cho khách quốc tịch Việt Nam, thông thạo tiếng Việt. Khách quốc tịch nước ngoài phụ thu 50 USD/khách.", "Khách quốc tịch nước ngoài cần có visa nhập cảnh lại Việt Nam sau khi kết thúc tour (nếu thuộc diện cần visa).", "Khách bị từ chối nhập/xuất cảnh vì lý do cá nhân: không hoàn tiền tour và không chi trả các chi phí phát sinh."] },
      { title: "Trẻ em, người lớn tuổi, thai kỳ", items: ["1 khách người lớn đi với 1 bé dưới 12 tuổi: đóng tiền tour cho bé ngủ giường riêng.", "Trẻ không đi cùng cha mẹ cần giấy cha mẹ uỷ quyền cho người thân dẫn đi (có chứng thực của UBND phường/xã), ghi rõ họ tên, giới tính, ngày sinh, thông tin hộ chiếu của con và người được uỷ quyền.", "Trẻ em cần hộ chiếu gốc và giấy khai sinh bản gốc hoặc bản trích lục có mộc đỏ, không dùng bản photo công chứng.", "Khách từ 70 tuổi cần giấy xác nhận đủ sức khoẻ do bác sĩ cấp, giấy cam kết sức khoẻ, người thân dưới 60 tuổi đủ sức khoẻ đi cùng và đóng thêm phí bảo hiểm cao cấp (tuỳ tour). Không nhận khách từ 80 tuổi trở lên.", "Khách mang thai báo cho nhân viên bán tour ngay khi đăng ký để được tư vấn."] },
      { title: "Hộ chiếu và giấy tờ", items: ["Hộ chiếu còn hạn trên 06 tháng so với ngày kết thúc tour, có đầy đủ chữ ký, dấu mộc đỏ, hình ảnh không hư hỏng hoặc mờ nhoè.", "Nên mang theo CCCD gốc phòng khi cần.", "Kiểm tra hoàn tất nghĩa vụ thuế trước khi đi (nên dùng cả số CCCD và CMND cũ), tránh bị từ chối nhập cảnh: kiểm tra trên ứng dụng eTax và kiểm tra cấm/hoãn xuất cảnh tại gdt.gov.vn."] },
    ],
  },
};

export const TERMS_UPDATED_AT = "[ngày cập nhật]";

export const TERMS_AI_NOTICE =
  "Điều 1, 2, 4, 5 do AI soạn từ nội dung website, cần công ty duyệt trước khi dùng. Điều 3 lấy nguyên văn từ trang tour.";

export const TERMS_SCOPE = {
  intro:
    "Ứng dụng BenThanh Tourist do Công ty Cổ phần Dịch vụ Du lịch Bến Thành (BenThanh Tourist) vận hành, mã số thuế 0301171827, giấy phép kinh doanh lữ hành quốc tế số 79-089/2020/TCDL-GP LHQT.",
  bullets: [
    "Điều khoản này áp dụng khi bạn xem tour, đặt tour, thanh toán, nhận thông báo và dùng các tính năng trong ứng dụng.",
    "Tour ghép khách lẻ trong nước và nước ngoài đặt qua ứng dụng tuân theo Điều 3. Tour đoàn, MICE, Inbound, Free & Easy và vé máy bay do bộ phận chuyên trách tư vấn riêng, xem mục Liên hệ.",
    "Khi tiếp tục sử dụng ứng dụng, bạn đồng ý với các điều khoản này.",
  ],
};

export const TERMS_ACCOUNT = [
  "Bạn đăng nhập bằng số điện thoại và mật khẩu. Thông tin cung cấp cần chính xác, đúng với giấy tờ tuỳ thân vì dùng để xuất vé, làm visa và bảo hiểm.",
  "Bạn tự bảo mật mật khẩu và mã PIN 6 số, không chia sẻ cho người khác. Thao tác dùng đúng thông tin đăng nhập được xem là do chính bạn thực hiện.",
  "Hạng thành viên (Đồng, Bạc, Vàng, Bạch Kim, Kim Cương, Ruby) tăng theo điểm tích luỹ từ các chuyến đi đã hoàn thành. Quyền lợi theo từng hạng xem ở mục Hạng thành viên.",
  "Bạn có thể bật hoặc tắt thông báo khuyến mãi trong phần Cài đặt bất cứ lúc nào.",
  "Công ty có quyền tạm khoá tài khoản khi phát hiện thông tin sai lệch, gian lận hoặc dùng ứng dụng sai mục đích.",
];

export const TERMS_VOUCHER = {
  yearly:
    "Công ty phát hành voucher ngẫu nhiên trong năm. Mã voucher được công bố công khai trên trang Facebook chính thức của công ty (facebook.com/benthanhtourist). Hãy theo dõi để không bỏ lỡ. Thể thức chi tiết công ty sẽ bổ sung sau.",
  tierIntro:
    "Từ hạng Vàng trở lên, mỗi hạng có một mã cố định. Mã chỉ dùng được khi tài khoản đang đúng hạng đó: không dùng mã của hạng thấp hơn hoặc cao hơn. Mã giảm theo phần trăm giá tour, số lần dùng tối đa trong năm như sau:",
  tiers: [
    { tier: "Vàng", code: "BTTRANKGOLD5", percent: "5%", perYear: "3 lần" },
    { tier: "Bạch Kim", code: "BTTRANKPLATINUM6", percent: "6%", perYear: "4 lần" },
    { tier: "Kim Cương", code: "BTTRANKDIAMOND7", percent: "7%", perYear: "5 lần" },
    { tier: "Ruby", code: "BTTRANKRUBY10", percent: "10%", perYear: "6 lần" },
  ],
  purchased: [
    "Khách hàng, công ty hoặc doanh nghiệp có thể đặt mua voucher. Sau khi đặt mua thành công, công ty cấp một mã voucher để áp dụng khi đặt tour.",
    "Mỗi mã chỉ dùng một lần. Ngay khi mã được sử dụng, mã đó bị vô hiệu hoá để tránh lộ mã.",
    "Nếu sau khi thanh toán tour, giá trị còn lại từ 1.000.000đ trở lên, hệ thống tự động cấp một mã voucher mới có giá trị bằng số dư cho chính khách hàng, công ty hoặc doanh nghiệp đã mua. Người dùng sau dùng mã mới này, không dùng lại mã cũ.",
    "Khi giá trị còn lại dưới 1.000.000đ, hoặc voucher đã hết hạn, hệ thống không cấp mã mới nữa. Chỉ voucher đặt mua mới có hạn sử dụng và được đổi sang mã khác như trên; voucher theo hạng thành viên dùng mã cố định, không đổi mã.",
    "Voucher không được hoàn tiền. Giá trị voucher cao hơn giá trị tour thì phần dư theo quy tắc trên, không quy đổi thành tiền mặt.",
    "Nếu giá trị tour cao hơn voucher, bạn tự thanh toán phần còn thiếu.",
  ],
  example: [
    "Doanh nghiệp mua voucher 40.000.000đ, công ty cấp mã XXX.",
    "Anh A dùng mã XXX đặt tour 22.000.000đ. Mã XXX bị vô hiệu ngay, còn dư 18.000.000đ nên hệ thống cấp mã mới YYY trị giá 18.000.000đ cho doanh nghiệp.",
    "Chị B dùng mã YYY đặt tour 17.500.000đ, còn dư 500.000đ (thấp hơn 1.000.000đ) nên mã YYY bị vô hiệu và không cấp mã mới.",
    "Anh C đặt tour 45.000.000đ bằng mã XXX 40.000.000đ, anh C tự thanh toán thêm 5.000.000đ.",
  ],
};

export const TERMS_RESPONSIBILITY = [
  "Công ty cung cấp thông tin tour trung thực, thực hiện đúng chương trình đã công bố và hỗ trợ khách khi có phát sinh trong chuyến đi. Quyền lợi bảo hiểm theo từng chương trình tour.",
  "Khách chuẩn bị đủ giấy tờ hợp lệ, khai báo trung thực tình trạng sức khoẻ và đối tượng đặc biệt (trẻ em, người cao tuổi, phụ nữ mang thai), thanh toán đúng hạn và tuân thủ hướng dẫn của hướng dẫn viên.",
  "Mỗi bên không chịu trách nhiệm khi sự cố bất khả kháng xảy ra; cách xử lý theo Điều 3.",
  "Dữ liệu cá nhân của bạn được dùng để xử lý đặt tour và chăm sóc khách hàng, chi tiết xem ở tab Chính sách bảo mật.",
];

export const TERMS_CONTACT = [
  "Công ty Cổ phần Dịch vụ Du lịch Bến Thành",
  "Trụ sở: 70 Lý Tự Trọng, Phường Bến Thành, TP. Hồ Chí Minh",
  "Tổng đài: 1900 6668",
  "Điện thoại: 028 3520 2020",
  "Email: benthanh@benthanhtourist.com",
];
