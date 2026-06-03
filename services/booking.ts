// services/booking.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

// Thống nhất dữ liệu Mock và hàm dịch vụ Booking

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

export const getTransactionHistory = async (): Promise<{ data: any[] }> => {
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
  const response = await apiService.get(urls.URL_TransactionHistory);
  return { data: response.data };
};

export const getTours = async (): Promise<{ data: any[] }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    data: [
      {
        id: "t1",
        name: "Du lịch Hàn Quốc (Mùa Hoa Anh Đào): Seoul - Nami - Everland - Công viên Yeouido",
        imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500",
        price: 15990000,
        duration: "5 Ngày 4 Đêm",
        rating: 4.9,
        reviewsCount: 124,
      },
      {
        id: "t2",
        name: "Đà Nẵng - Hội An - Bà Nà Hills 4 Ngày 3 Đêm",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
        price: 5490000,
        duration: "4 Ngày 3 Đêm",
        rating: 4.8,
        reviewsCount: 95,
      },
      {
        id: "t3",
        name: "Tour Singapore - Malaysia 5 Ngày 4 Đêm: Sentosa - Genting Highland",
        imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500",
        price: 12490000,
        duration: "5 Ngày 4 Đêm",
        rating: 4.7,
        reviewsCount: 82,
      },
      {
        id: "t4",
        name: "Khám phá Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới du thuyền 5 sao",
        imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=500",
        price: 3250000,
        duration: "2 Ngày 1 Đêm",
        rating: 4.9,
        reviewsCount: 156,
      },
    ],
  };
};
