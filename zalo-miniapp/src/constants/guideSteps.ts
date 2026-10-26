/**
 * Port 1:1 từ constants/guideSteps.ts (app RN) — nội dung hướng dẫn lần đầu của từng tab (bản đã duyệt 26/10/2026).
 * `keys` = phần tử được làm nổi (đăng ký bằng `useGuideTarget`), nhiều key thì khoanh vùng bao quanh tất cả.
 * Bước không có `keys` (lời chào) hiện thẻ giữa màn hình. Phần tử không có trên màn (vd chưa có thông báo
 * nào dài để hiện "Xem thêm") thì bước đó tự bỏ qua.
 */
export type GuideTab = "home" | "search" | "history" | "notifications" | "profile";

export type GuideStep = {
  keys?: string[];
  title: string;
  body: string;
  /** Bo góc vùng sáng. */
  radius?: number;
};

export const GUIDE_STEPS: Record<GuideTab, GuideStep[]> = {
  home: [
    {
      title: "Chào mừng bạn đến với BenThanh Tourist!",
      body: "Cùng xem nhanh các chức năng chính của ứng dụng. Bấm Tiếp hoặc chạm vào bất kỳ đâu trên màn hình để sang bước sau.",
    },
    { keys: ["home.bell"], radius: 28, title: "Thông báo", body: "Cập nhật đơn hàng, lịch khởi hành và ưu đãi. Số trên chuông là thông báo chưa đọc." },
    { keys: ["home.help"], radius: 28, title: "Hướng dẫn", body: "Bấm biểu tượng này bất cứ lúc nào để xem lại hướng dẫn của màn hình đang mở." },
    { keys: ["home.member"], radius: 28, title: "Thẻ thành viên", body: "Điểm tích lũy và hạng thành viên của bạn. Chạm vào thẻ để xem quyền lợi từng hạng." },
    { keys: ["home.search"], radius: 24, title: "Tìm tour", body: "Nhập tên tour hoặc điểm đến, chọn ngày cụ thể hoặc khoảng ngày, rồi bấm Tìm kiếm." },
    { keys: ["home.types"], radius: 20, title: "Loại tour", body: "Chạm vào một loại để xem các tour cùng chủ đề. Kéo ngang để xem thêm." },
    { keys: ["home.hot"], radius: 28, title: "Tour nổi bật", body: "Bấm Xem chi tiết để xem lịch trình, chọn ngày khởi hành và đặt tour." },
    { keys: ["home.news"], radius: 20, title: "Tin tức & cẩm nang", body: "Cuối trang chủ là tin hoạt động của công ty và cẩm nang du lịch." },
    { keys: ["home.zalo", "home.bot"], radius: 32, title: "Hỗ trợ nhanh", body: "Nhắn tin với nhân viên qua Zalo, hoặc hỏi trợ lý bttAI để tìm và đặt tour." },
    {
      keys: ["nav"],
      radius: 32,
      title: "Thanh điều hướng",
      body: "Chuyển giữa Trang chủ, Du lịch, Lịch sử, Thông báo và Tài khoản. Lần đầu mở mỗi mục sẽ có hướng dẫn riêng.",
    },
  ],
  search: [
    { keys: ["search.search"], radius: 20, title: "Tìm kiếm", body: "Gõ tên tour hoặc điểm đến, kết quả hiện ngay bên dưới." },
    {
      keys: ["search.filters"],
      radius: 20,
      title: "Bộ lọc",
      body: "Lọc theo danh mục, trong nước hay nước ngoài, khu vực và bộ sưu tập. Lựa chọn được giữ lại khi bạn chuyển tab.",
    },
    { keys: ["search.card"], radius: 28, title: "Thẻ tour", body: "Thời lượng, ngày khởi hành gần nhất và giá. Bấm Xem chi tiết để chọn ngày và đặt tour." },
    { keys: ["search.help"], radius: 24, title: "Xem lại hướng dẫn", body: "Mỗi màn hình đều có biểu tượng này. Bấm vào khi bạn cần xem lại." },
  ],
  history: [
    { keys: ["history.tabs"], radius: 28, title: "Lịch sử & Yêu thích", body: "Lịch sử là các đơn bạn đã đặt. Yêu thích là các tour bạn đã lưu bằng nút trái tim." },
    { keys: ["history.chips"], radius: 28, title: "Lọc theo trạng thái", body: "Xem riêng đơn chờ xử lý, đã xác nhận, đã thanh toán… Kéo ngang để xem thêm." },
    {
      keys: ["history.order"],
      radius: 28,
      title: "Đơn hàng",
      body: "Ngày khởi hành, số khách và tổng tiền. Bấm Chi tiết đơn để xem lịch trình, cách thanh toán hoặc đánh giá sau chuyến đi.",
    },
  ],
  notifications: [
    { keys: ["notifications.item"], radius: 24, title: "Thông báo", body: "Chấm đỏ là thông báo chưa đọc. Chạm vào để mở đơn hàng hoặc tour liên quan." },
    { keys: ["notifications.more"], radius: 12, title: "Xem thêm", body: "Nội dung dài chỉ hiện 4 dòng. Bấm Xem thêm để đọc hết." },
    { keys: ["notifications.readall"], radius: 24, title: "Đọc tất cả", body: "Đánh dấu mọi thông báo là đã đọc." },
  ],
  profile: [
    {
      keys: ["profile.profile"],
      radius: 24,
      title: "Hồ sơ & hạng thành viên",
      body: "Bấm Sửa hồ sơ để cập nhật thông tin. Bấm Xem quyền lợi để xem ưu đãi theo hạng.",
    },
    { keys: ["profile.stats"], radius: 24, title: "Lối tắt", body: "Chạm vào ô để mở nhanh chuyến sắp đi, tour yêu thích hoặc voucher của bạn." },
    {
      keys: ["profile.account"],
      radius: 24,
      title: "Bảo mật",
      body: "Cập nhật thông tin cá nhân, đổi mật khẩu và mã PIN dùng để xác nhận khi đặt tour.",
    },
    { keys: ["profile.support"], radius: 24, title: "Hỗ trợ", body: "Gọi tổng đài, nhắn Zalo, xem câu hỏi thường gặp hoặc gửi góp ý cho chúng tôi." },
    {
      keys: ["profile.settings"],
      radius: 24,
      title: "Cài đặt",
      body: "Bật giao diện tối, nhận thông báo khuyến mãi, xem điều khoản và thông tin công ty.",
    },
  ],
};

/** Bấm "Bỏ qua" → làm nổi nút ? của tab đó kèm lời nhắc này. */
export function skipStep(tab: GuideTab): GuideStep {
  return {
    keys: [`${tab}.help`],
    radius: 24,
    title: "Xem lại hướng dẫn khi cần",
    body: "Bạn có thể xem lại hướng dẫn bất cứ lúc nào bằng cách bấm vào biểu tượng ? ở góc trên màn hình.",
  };
}

/** Đường dẫn của từng tab (expo-router `usePathname`) — rời tab thì hướng dẫn tạm dừng. */
export const GUIDE_TAB_PATHS: Record<GuideTab, string> = {
  home: "/",
  search: "/search",
  history: "/history",
  notifications: "/notifications",
  profile: "/profile",
};
