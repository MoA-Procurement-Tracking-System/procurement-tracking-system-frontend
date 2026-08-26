/**
 * In-Memory Authentication Token Manager
 * 
 * SECURITY DESIGN (XSS Protection):
 * Storing access tokens in localStorage or sessionStorage exposes them to 
 * Cross-Site Scripting (XSS) extraction via `localStorage.getItem()`.
 * 
 * This module keeps the active JWT access token purely in an in-memory closure.
 * It is never written to disk or browser web storage. When a page is reloaded,
 * the session is restored via cookie or re-authentication.
 */

let inMemoryAccessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export const authTokenManager = {
  /**
   * Get the current in-memory access token.
   */
  getToken(): string | null {
    return inMemoryAccessToken;
  },

  /**
   * Set or update the active access token in memory.
   */
  setToken(token: string | null): void {
    inMemoryAccessToken = token;
    listeners.forEach((listener) => {
      try {
        listener(token);
      } catch (err) {
        console.error("Error in authToken listener:", err);
      }
    });
  },

  /**
   * Clear the in-memory token on logout.
   */
  clearToken(): void {
    this.setToken(null);
  },

  /**
   * Subscribe to token changes.
   */
  subscribe(listener: (token: string | null) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
