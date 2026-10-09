/** Format a number as Vietnamese đồng currency, e.g. 13990000 -> "13.990.000 ₫". */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

/** Compact price without the currency symbol, e.g. 13990000 -> "13.990.000đ". Returns "Liên hệ" for null/undefined/NaN. */
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Liên hệ";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Liên hệ";
  return num.toLocaleString("vi-VN") + " đ";
}
