// services/booking.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

// Thống nhất dữ liệu Mock và hàm dịch vụ Booking

export type PaymentMethod = "AT_OFFICE" | "BANK_TRANSFER";

interface Booking {
  idTour: string;
  departureId: string;
  adults: number;
  children?: number;
  infants?: number;
  paymentMethod: PaymentMethod;
  voucherCode?: string | null;
  notice?: string | null;
}

export const getDashboardOverview = async (): Promise<{ data: any }> => {
  /*
  // Giả lập độ trễ của API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    data: {
      toursCount: 19,
      rewardPoints: 1000000,
      recentOrders: [
        {
          id: '1',
          orderCode: 'BTTDHCMKHOA20260327',
          tourName: 'Du lịch Hàn Quốc (Mùa Hoa Anh Đào): Seoul - Nami - Everland - Công viên Yeouido',
          imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500',
          price: 15990000,
          currency: 'VND',
          status: 'Đã nhận hàng',
          hasVat: true,
          bookingDate: '2026-06-03',
        },
      ],
    },
  };
  */
  const response = await apiService.get(urls.URL_DashboardOverview);
  return { data: response.data };
};

export function getTransactionHistory(page: number, limit: number) {
  /*
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    data: [
      {
        id: "1",
        orderCode: "BTTDHCMKHOA20260327",
        tourName: "Du lịch Hàn Quốc (Mùa Hoa Anh Đào): Seoul - Nami - Everland - Công viên Yeouido",
        imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500",
        price: 15990000,
        currency: "VND",
        status: "Đã nhận hàng",
        hasVat: true,
        bookingDate: "2026-06-03",
      },
      {
        id: "2",
        orderCode: "BTTDHCMKHOA20260328",
        tourName: "Đà Nẵng - Hội An - Bà Nà Hills 4 Ngày 3 Đêm",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
        price: 5490000,
        currency: "VND",
        status: "Đã nhận hàng",
        hasVat: true,
        bookingDate: "2026-06-03",
      },
      {
        id: "3",
        orderCode: "BTTDHCMKHOA20260329",
        tourName: "Tour Singapore - Malaysia 5 Ngày 4 Đêm: Sentosa - Genting Highland",
        imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500",
        price: 12490000,
        currency: "VND",
        status: "Chờ xử lý",
        hasVat: false,
        bookingDate: "2026-06-02",
      },
    ],
  };
  */
  return apiService.get(urls.URL_TransactionHistory + `page=${page}&limit=${limit}`);
}

export function getBookingById(id: string) {
  return apiService.get(urls.URL_GetBookingById + id);
}

export function booking(bookingData : Booking){
  return apiService.post(urls.URL_Booking, bookingData);
}
