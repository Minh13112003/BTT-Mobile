import React from "react";
import { createRoot } from "react-dom/client";

import "./css/tailwind.css";
import "zmp-ui/zaui.css";
import "./css/app.scss";

import App from "./components/App";
import appConfig from "../app-config.json";

// zmp-ui tự khai báo type Window.APP_CONFIG (zmp-ui/router/index.d.ts) — không
// redeclare ở đây để tránh xung đột type, chỉ gán giá trị.
if (!(window as any).APP_CONFIG) {
  (window as any).APP_CONFIG = appConfig;
}

const root = createRoot(document.getElementById("app")!);
root.render(React.createElement(App));
