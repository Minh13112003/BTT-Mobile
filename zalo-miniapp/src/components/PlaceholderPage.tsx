import React from "react";
import { Page } from "zmp-ui";
import Header from "@/components/Header";
import { useTheme } from "@/context/ThemeContext";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

/** Khung tạm cho các trang chưa build nội dung đầy đủ — sẽ thay bằng trang thật lần lượt. */
export default function PlaceholderPage({ title }: { title: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  return (
    <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
      <Header title={title} showBackButton />
      <div
        className="flex items-center justify-center"
        style={{ padding: 40, color: palette.textMuted, fontSize: FONT_SIZE.card }}
      >
        Đang xây dựng trang "{title}"...
      </div>
    </Page>
  );
}
