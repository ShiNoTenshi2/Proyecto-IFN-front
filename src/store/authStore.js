// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      session: null,
      isAuthenticated: false,

      // Actions
      setAuth: (user, session) => set({ 
        user, 
        session, 
        isAuthenticated: true 
      }),

      logout: () => set({ 
        user: null, 
        session: null, 
        isAuthenticated: false 
      }),

      // Obtener token - IMPORTANTE: Este método necesita acceso a get()
      getToken: () => {
        const state = get();
        return state.session?.access_token || null;
      }
    }),
    {
      name: 'ifn-auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);