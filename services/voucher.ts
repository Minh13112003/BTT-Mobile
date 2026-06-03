// services/voucher.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  expiry: string;
  tag: string;
  description: string;
}

export const getVouchers = async (): Promise<{ data: VoucherItem[] }> => {
  /*
  // Giả lập độ trễ của API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    data: [
      {
        id: "v1",
        code: "BTT300K",
        title: "Giảm 5% tối đa 300k",
        subtitle: "VOUCHER PHỤ KIỆN",
        expiry: "HSD: 05/06/2026",
        tag: "HAPPY NEW YEAR 2026",
        description:
          "Áp dụng cho khách hàng mua phụ kiện du lịch tại các chi nhánh BenThanh Tourist toàn quốc.",
      },
      {
        id: "v2",
        code: "SUMMER500",
        title: "Giảm 10% tối đa 500k",
        subtitle: "VOUCHER TOUR HÈ",
        expiry: "HSD: 30/06/2026",
        tag: "SUMMER VIBES",
        description:
          "Áp dụng cho các tour du lịch nội địa đăng ký trong giai đoạn từ 01/06 đến 30/06/2026.",
      },
      {
        id: "v3",
        code: "BTTWELCOME",
        title: "Tặng phụ kiện du lịch",
        subtitle: "VOUCHER QUÀ TẶNG",
        expiry: "HSD: 15/06/2026",
        tag: "WELCOME GIFT",
        description:
          "Món quà chào mừng thành viên mới. Nhận trực tiếp tại văn phòng khi đăng ký tour đầu tiên.",
      },
      {
        id: "v4",
        code: "THANKSDOMIXI",
        title: "Giảm 50% tối đa 2tr",
        subtitle: "Cám ơn anh Độ Mixi",
        expiry: "HSD: 15/06/2026",
        tag: "WELCOME GIFT",
        description: "Nà na na nà ná, cám ơn anh Phùng Thanh Độ.",
      },
      {
        id: "v5",
        code: "BODOI",
        title: "Giảm 99% ",
        subtitle: "VOUCHER BỐ ĐỜI",
        expiry: "HSD: 15/06/2026",
        tag: "WELCOME GIFT",
        description:
          "Voucher giảm giá trong truyền thuyết, bởi vì tôi là một dev nổi loạn",
      },
    ],
  };
  */
  const response = await apiService.get(urls.URL_GetVouchers);
  return { data: response.data };
};
