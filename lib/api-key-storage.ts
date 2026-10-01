/** Keep provider credentials for this browser tab, rather than indefinitely on disk. */
export const apiKeyStorage = {
  getItem(key: string): string | null {
    const current = sessionStorage.getItem(key);
    const previous = localStorage.getItem(key);
    if (previous) {
      if (!current) sessionStorage.setItem(key, previous);
      localStorage.removeItem(key);
    }
    return current || previous;
  },
  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  },
};
