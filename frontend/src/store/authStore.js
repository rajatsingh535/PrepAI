import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ── Actions ──────────────────────────────────────────
      setAccessToken: (token) => set({ accessToken: token }),

      login: async ({ email, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || err.message || 'Login failed' };
        }
      },

      register: async ({ name, email, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || err.message || 'Registration failed' };
        }
      },

      loginAsDemoCandidate: () => {
        const demoUser = {
          _id: 'demo-candidate-123',
          name: 'Alex Johnson',
          email: 'candidate@prepai.com',
          role: 'candidate',
          isPremium: true,
          totalSessions: 5,
        };
        const mockToken = 'demo_access_token_prepai_' + Date.now();
        set({
          user: demoUser,
          accessToken: mockToken,
          refreshToken: 'demo_refresh_token',
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (updatedUser) => {
        set({ user: { ...get().user, ...updatedUser } });
      },
    }),
    {
      name: 'prepai-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Subscribe to global auth:logout events dispatched by axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}
