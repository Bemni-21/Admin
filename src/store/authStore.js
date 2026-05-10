import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      token_created_at: null,

      // Save login session
      login: ({ user, access_token, refresh_token }) => {
        console.log("Login - saving token:", access_token);
        const tokenCreatedAt = Date.now();
        set({ 
          user, 
          access_token, 
          refresh_token,
          token_created_at: tokenCreatedAt 
        });
        // Store in localStorage
        localStorage.setItem('token_created_at', tokenCreatedAt.toString());
        localStorage.setItem('last_activity', tokenCreatedAt.toString());
      },

      // Logout
      logout: () => {
        console.log("Logout - clearing token");
        set({ 
          user: null, 
          access_token: null, 
          refresh_token: null,
          token_created_at: null 
        });
        // Clear all session data
        localStorage.removeItem('token_created_at');
        localStorage.removeItem('last_activity');
        localStorage.removeItem('auth-storage'); // Clear persisted auth
      },
    }),
    {
      name: "auth-storage",
    }
  )
);