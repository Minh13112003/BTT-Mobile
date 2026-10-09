import { getStorage, setStorage, removeStorage } from "zmp-sdk/apis";

/**
 * zmp-sdk's storage APIs reject with "notFound" unless the page actually runs
 * inside the Zalo app/webview (isMp/isMpWeb) — during `zmp start` browser
 * preview they don't work at all. Fall back to localStorage so local dev in a
 * plain browser still works; real deploys inside Zalo use native storage.
 */
export const getItem = async (key: string): Promise<string | null> => {
  try {
    const res = await getStorage({ keys: [key] });
    const value = (res as Record<string, unknown>)?.[key];
    return value == null ? null : String(value);
  } catch {
    return localStorage.getItem(key);
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await setStorage({ data: { [key]: value } });
  } catch {
    localStorage.setItem(key, value);
  }
};

export const deleteItem = async (key: string): Promise<void> => {
  try {
    await removeStorage({ keys: [key] });
  } catch {
    localStorage.removeItem(key);
  }
};
