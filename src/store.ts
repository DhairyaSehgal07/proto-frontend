// src/store/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreAdmin } from '@/types/storeAdmin';
import type { ColdStorage } from '@/types/coldStorage';

interface StoreState {
  admin: Omit<StoreAdmin, 'password'> | null;
  coldStorage: ColdStorage | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  setAdminData: (admin: Omit<StoreAdmin, 'password'>, coldStorage: ColdStorage) => void;
  clearAdminData: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

type PersistedState = Pick<StoreState, 'admin' | 'coldStorage'>;

export const useStore = create(
  persist<StoreState, [], [], PersistedState>(
    (set) => ({
      admin: null,
      coldStorage: null,
      isLoading: false,
      _hasHydrated: false,
      setAdminData: (admin, coldStorage) => set({ admin, coldStorage, isLoading: false }),
      clearAdminData: () => set({ admin: null, coldStorage: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'store-storage',
      // Only persist user data, not loading states
      partialize: (state): PersistedState => ({
        admin: state.admin,
        coldStorage: state.coldStorage,
      }),
      // Set hydration flag when store is rehydrated
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
