/**
 * Get a value from localStorage
 * @param key - The key to get the value from
 * @returns The value from localStorage
 */
export const getLocalStorage = (key: string): string | null => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    // Expired → remove it
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};

/**
 * Set a value in localStorage
 * @param key - The key to set the value in
 * @param value - The value to set
 * @param days - The number of days to keep the value in localStorage
 */
export const setLocalStorage = (
  key: string,
  value: string,
  days: number = 30,
) => {
  const now = new Date();
  const expiry = now.getTime() + days * 24 * 60 * 60 * 1000; // days → ms

  const item = {
    value: value,
    expiry: expiry,
  };

  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Remove a value from localStorage
 * @param key - The key to remove the value from
 */
export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};
