---
description: Quy tắc hiển thị alert/dialog — bắt buộc dùng CustomAlert, không dùng Alert.alert
globs: ["**/*.tsx"]
alwaysApply: false
---

# Alerts & Dialogs

## Quy tắc bắt buộc

**KHÔNG BAO GIỜ** dùng `Alert.alert` từ React Native. Luôn dùng `<CustomAlert>` của dự án.

Lý do: `Alert.alert` không nhất quán với UI/UX của app và không hỗ trợ dark mode.

## CustomAlert — Props

File: `components/CustomAlert.tsx`

```tsx
<CustomAlert
  visible={boolean}
  type={"success" | "error" | "warning" | "confirm"}
  title={string}
  message={string}
  onClose={() => void}
  onConfirm={() => void}   // tuỳ chọn, dùng với type="confirm"
  confirmText={string}     // tuỳ chọn
  cancelText={string}      // tuỳ chọn
/>
```

## Pattern chuẩn trong màn hình

```tsx
import CustomAlert from "@/components/CustomAlert";

// 1. State
const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState("");
const [alertMessage, setAlertMessage] = useState("");
const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "confirm">("success");

// 2. Helper
const showAlert = (
  title: string,
  message: string,
  type: "success" | "error" | "warning" | "confirm" = "success"
) => {
  setAlertTitle(title);
  setAlertMessage(message);
  setAlertType(type);
  setAlertVisible(true);
};

// 3. Dùng trong handler
const handleSomething = () => {
  showAlert("Thành công", "Đã thực hiện xong.", "success");
};

// 4. JSX — đặt cuối return(), trước thẻ đóng container
<CustomAlert
  visible={alertVisible}
  type={alertType}
  title={alertTitle}
  message={alertMessage}
  onClose={() => setAlertVisible(false)}
/>
```

## Chọn type phù hợp

| type | Khi nào dùng |
|---|---|
| `"success"` | Thao tác thành công (copy, lưu, đặt tour...) |
| `"error"` | Lỗi xảy ra, cần thông báo người dùng |
| `"warning"` | Cảnh báo, thông tin cần chú ý (hotline, lưu ý) |
| `"confirm"` | Cần người dùng xác nhận trước khi tiếp tục (xoá, đăng xuất...) |
