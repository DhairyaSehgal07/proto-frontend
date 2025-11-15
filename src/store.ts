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

  // Receipt voucher column preferences
  receiptVisibleColumns: string[];
  setReceiptColumns: (cols: string[]) => void;
  toggleReceiptColumn: (col: string) => void;
  resetReceiptColumns: () => void;

  setAdminData: (admin: Omit<StoreAdmin, 'password'>, coldStorage: ColdStorage) => void;
  clearAdminData: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

type PersistedState = Pick<StoreState, 'admin' | 'coldStorage' | 'receiptVisibleColumns'>;

export const useStore = create(
  persist<StoreState, [], [], PersistedState>(
    (set, get) => ({
      admin: null,
      coldStorage: null,
      isLoading: false,
      _hasHydrated: false,

      /* -------------------------------
          ADD THIS SLICE
      -------------------------------- */
      receiptVisibleColumns: ['variety', 'size', 'quantity', 'weight', 'chamber', 'floor', 'row'],

      setReceiptColumns: (cols) => set({ receiptVisibleColumns: cols }),

      toggleReceiptColumn: (col) => {
        const current = get().receiptVisibleColumns;
        set({
          receiptVisibleColumns: current.includes(col)
            ? current.filter((c) => c !== col)
            : [...current, col],
        });
      },

      resetReceiptColumns: () =>
        set({
          receiptVisibleColumns: [
            'variety',
            'size',
            'quantity',
            'weight',
            'chamber',
            'floor',
            'row',
          ],
        }),

      /* -------------------------------- */

      setAdminData: (admin, coldStorage) => set({ admin, coldStorage, isLoading: false }),
      clearAdminData: () => set({ admin: null, coldStorage: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'store-storage',
      partialize: (state): PersistedState => ({
        admin: state.admin,
        coldStorage: state.coldStorage,
        receiptVisibleColumns: state.receiptVisibleColumns,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
