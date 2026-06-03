// services/news.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface NewsItem {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
}

export const getNews = async (): Promise<{ data: NewsItem[] }> => {
  // Giả lập độ trễ của API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    data: [
      {
        id: "n1",
        title: "BenThanh Tourist tổ chức Hội nghị Đại biểu Người lao động năm 2026",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500",
        date: "13/01/2026",
      },
      {
        id: "n2",
        title: "BenThanh Tourist tưng bừng khuyến mãi du lịch Hè 2026",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500",
        date: "10/05/2026",
      },
      {
        id: "n3",
        title: "Khai mạc Ngày hội Du lịch TP.HCM 2026: Nhiều ưu đãi hấp dẫn",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=500",
        date: "05/04/2026",
      },
    ],
  };
};
