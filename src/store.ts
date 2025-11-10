// src/store/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreAdmin } from '@/types/storeAdmin';
import type { ColdStorage } from '@/types/coldStorage';

interface StoreState {
  admin: Omit<StoreAdmin, 'password'> | null;
  coldStorage: ColdStorage | null;
  isLoading: boolean;

  setAdminData: (admin: Omit<StoreAdmin, 'password'>, coldStorage: ColdStorage) => void;
  clearAdminData: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create(
  persist<StoreState>(
    (set) => ({
      admin: null,
      coldStorage: null,
      isLoading: false,

      setAdminData: (admin, coldStorage) => set({ admin, coldStorage }),
      clearAdminData: () => set({ admin: null, coldStorage: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'store-storage',
    }
  )
);
