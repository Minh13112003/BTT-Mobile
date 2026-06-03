export const formatDateTime = (dateString: string | Date | undefined) => {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);

  // Lấy các thành phần ngày, tháng, năm, giờ, phút, giây
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng trong JS tính từ 0-11
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
