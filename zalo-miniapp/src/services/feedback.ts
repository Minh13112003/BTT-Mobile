// services/feedback.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface FeedbackPayload {
  subject: string;
  content: string;
}

export const postFeedback = async (
  payload: FeedbackPayload,
): Promise<{ success: boolean; message: string }> => {
  const response = await apiService.post(urls.URL_PostFeedback, payload);
  return response.data;
};
