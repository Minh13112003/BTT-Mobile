/** Format a number as Vietnamese đồng currency, e.g. 13990000 -> "13.990.000 ₫". */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

/** Compact price without the currency symbol, e.g. 13990000 -> "13.990.000đ". */
export function formatPrice(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}
