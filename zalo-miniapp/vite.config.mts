import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Vite 5 — theo template chính thức của Zalo (Zalo-MiniApp/zmp-blank-templates,
// nhánh vite-5-typescript). zmp-vite-plugin lo phần đặc thù Mini App khi build:
// base "./", outDir "www", tên file assets/*.module.js và ghi listJS/listCSS vào
// app-config.json của bản build.
// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],
    resolve: {
      alias: {
        // .mts là ESM — không có __dirname, dùng import.meta.url.
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      // Không inline ảnh thành base64 — giữ file riêng để Zalo cache, đúng template.
      assetsInlineLimit: 0,
      // Vite 2 dùng `build.polyfillModulePreload: false`; Vite 5 đổi thành option này.
      modulePreload: { polyfill: false },
    },
    server: {
      host: true,
    },
    // Dùng Sass API mới — tránh cảnh báo "legacy JS API is deprecated" (bị bỏ ở Dart Sass 2.0).
    css: {
      preprocessorOptions: {
        scss: { api: "modern-compiler" },
      },
    },
    // root là ./src nhưng index.html nằm ở gốc project → Vite 5 không tự dò được
    // entry để pre-bundle thư viện ("Skipping dependency pre-bundling"). Thiếu
    // bước này dev server phải gửi hàng trăm file lẻ của react/zmp-ui — rất chậm
    // khi xem qua tunnel trên điện thoại (`npm run start:zalo`). Khai báo tay.
    optimizeDeps: {
      include: [
        "react",
        "react-dom/client",
        "react/jsx-runtime",
        "react-router-dom",
        "zmp-ui",
        "zmp-sdk/apis",
        "axios",
      ],
    },
  });
};
