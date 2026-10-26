import React, { Suspense, useEffect } from "react";
import { Route, useLocation, useNavigate } from "react-router-dom";
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider, Spinner } from "zmp-ui";

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ChatbotProvider } from "@/context/ChatbotContext";
import { GuideProvider } from "@/context/GuideContext";
import BottomNav from "@/components/BottomNav";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import BackToTopButton from "@/components/BackToTopButton";
import ChatbotHost from "@/components/chatbot/ChatbotHost";
import ProfileCompletionPrompt from "@/components/ProfileCompletionPrompt";

import HomePage from "@/pages/home";
import SearchPage from "@/pages/search";
import HistoryPage from "@/pages/history";
import NotificationsPage from "@/pages/notifications";
import ProfilePage from "@/pages/profile";
import TourDetailPage from "@/pages/tour-detail";
import BookingDetailPage from "@/pages/booking-detail";
import CheckoutPage from "@/pages/checkout";
import BookingSuccessPage from "@/pages/booking-success";
import MembershipPage from "@/pages/membership";
import LoginPage from "@/pages/login";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import SelfProfilePage from "@/pages/selfprofile";
import VouchersPage from "@/pages/vouchers";
import FeedbackPage from "@/pages/feedback";
import ReferralPage from "@/pages/referral";
import NewsListPage from "@/pages/news-list";
import NewsDetailPage from "@/pages/news-detail";
import TipsListPage from "@/pages/tips-list";
import TipsDetailPage from "@/pages/tips-detail";
import SecurityPage from "@/pages/security";
import PinPage from "@/pages/pin";
import FaqPage from "@/pages/faq";
import AboutPage from "@/pages/about";
import TermsPage from "@/pages/terms";

/** Các route vào được khi CHƯA đăng nhập — mọi route khác bắt buộc đăng nhập. */
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

/**
 * Chặn đăng nhập — tương đương app/index.tsx bên RN (splash kiểm tra token:
 * không có → login, có → tabs). Mini app không có route splash riêng (Zalo mở
 * thẳng vào "/"), nên kiểm tra ở mọi lần đổi route: chưa đăng nhập mà vào route
 * không public → thay bằng /login; đã đăng nhập mà đứng ở /login → về trang chủ.
 *
 * Không render con (trang, BottomNav, nút Zalo) khi đang chờ chuyển hướng — nếu
 * không, trang được bảo vệ sẽ kịp mount và gọi API cần token (NestJS) → 401.
 * Trạng thái đăng nhập lấy từ AuthContext (token NestJS lưu trong storage).
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);
  const mustLogin = !isLoggedIn && !isPublic;
  const shouldLeaveLogin = isLoggedIn && location.pathname === "/login";

  useEffect(() => {
    if (mustLogin) navigate("/login", { replace: true });
    else if (shouldLeaveLogin) navigate("/", { replace: true });
  }, [mustLogin, shouldLeaveLogin, navigate]);

  if (mustLogin) return null;
  return <>{children}</>;
}

/**
 * Root shell — tương đương app/(root)/_layout.tsx bên React Native:
 * ThemeProvider → AuthProvider → NotificationProvider, rồi tới router.
 * BottomNav đặt NGANG HÀNG với AnimationRoutes (không lồng làm route layout)
 * để nó không bị cuốn vào hiệu ứng trượt trang mỗi lần đổi route — xem
 * BottomNav.tsx để biết cách nó tự ẩn/hiện theo path hiện tại.
 */
const MyApp = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ChatbotProvider>
          <App>
            <Suspense
              fallback={
                <div className="w-screen h-screen flex justify-center items-center">
                  <Spinner />
                </div>
              }
            >
              <SnackbarProvider>
                <ZMPRouter>
                  <AuthGate>
                    <GuideProvider>
                    <AnimationRoutes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/tour/:id" element={<TourDetailPage />} />
                      <Route path="/booking-detail/:id" element={<BookingDetailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/booking-success" element={<BookingSuccessPage />} />
                      <Route path="/membership" element={<MembershipPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/selfprofile" element={<SelfProfilePage />} />
                      <Route path="/vouchers" element={<VouchersPage />} />
                      <Route path="/feedback" element={<FeedbackPage />} />
                      <Route path="/referral" element={<ReferralPage />} />
                      <Route path="/news" element={<NewsListPage />} />
                      <Route path="/news/:id" element={<NewsDetailPage />} />
                      <Route path="/tips" element={<TipsListPage />} />
                      <Route path="/tips/:id" element={<TipsDetailPage />} />
                      <Route path="/security" element={<SecurityPage />} />
                      <Route path="/setup-pin" element={<PinPage />} />
                      <Route path="/change-pin" element={<PinPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                    </AnimationRoutes>
                    <BottomNav />
                    <ZaloFloatingButton />
                    <BackToTopButton />
                    <ChatbotHost />
                    <ProfileCompletionPrompt />
                    </GuideProvider>
                  </AuthGate>
                </ZMPRouter>
              </SnackbarProvider>
            </Suspense>
          </App>
          </ChatbotProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default MyApp;
