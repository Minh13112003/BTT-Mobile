// services/feedback.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface FeedbackPayload {
  subject: string;
  content: string;
}

export const postFeedback = async (payload: FeedbackPayload): Promise<{ success: boolean; message: string }> => {
  /*
  // Giả lập độ trễ của API
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!payload.subject.trim() || !payload.content.trim()) {
    throw new Error("Chủ đề và nội dung góp ý không được bỏ trống.");
  }

  return {
    success: true,
    message: "Cảm ơn bạn đã đóng góp ý kiến. Ý kiến của bạn đã được ghi nhận để nâng cao chất lượng dịch vụ!",
  };
  */
  const response = await apiService.post(urls.URL_PostFeedback, payload);
  return response.data;
};
