/**
 * Module-level bridge for the checkout <-> voucher-picker flow. Expo Router has
 * no "navigate and get a result back" API like React Navigation's callbacks, so
 * the picker writes the chosen voucher here before calling `router.back()`, and
 * checkout reads it via `useFocusEffect` when it regains focus — avoiding a full
 * remount/param roundtrip that would otherwise reset the rest of the checkout form.
 *
 * Generic over the voucher shape so both screens can keep using checkout's local
 * `ExtendedVoucher` (API response has more fields than the base `VoucherItem`).
 */
let pendingVoucher: unknown | null | undefined = undefined;

/** Called by the picker screen right before navigating back. */
export function setPendingVoucherSelection<T>(voucher: T | null) {
  pendingVoucher = voucher;
}

/**
 * Called by checkout on focus. Returns `undefined` if nothing new was picked
 * since the last read (checkout should leave its current voucher untouched),
 * otherwise consumes and returns the selection (which may be `null` for "bỏ chọn").
 */
export function consumePendingVoucherSelection<T>(): T | null | undefined {
  if (pendingVoucher === undefined) return undefined;
  const value = pendingVoucher as T | null;
  pendingVoucher = undefined;
  return value;
}
