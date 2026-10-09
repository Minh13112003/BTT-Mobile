/**
 * Màu/bo góc port 1:1 từ constants/theme.ts của app React Native (BRAND, RADIUS)
 * để giữ đúng design language. Không dùng Tailwind `dark:` — dự án RN gốc dùng
 * conditional string theo `isDark`, Mini App này giữ nguyên quy ước đó (xem
 * src/context/ThemeContext.tsx) thay vì trộn 2 cách làm dark mode khác nhau.
 */
module.exports = {
  purge: {
    enabled: true,
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
  },
  theme: {
    extend: {
      colors: {
        primary: "var(--zmp-primary-color)",
        brand: {
          red: "#D0021B",
          redActive: "#A80016",
          redLight: "#FF1F37",
          gold: "#E8A020",
          goldLight: "#FFF3DC",
          green: "#16A34A",
          greenDark: "#15803D",
          greenAccent: "#4CAF50",
          amber: "#F59E0B",
        },
      },
      borderRadius: {
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        pill: "999px",
      },
      zIndex: {
        max: "10000",
      },
    },
  },
};
