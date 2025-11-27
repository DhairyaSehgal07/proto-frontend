// src/store/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreAdmin } from '@/types/storeAdmin';
import type { ColdStorage } from '@/types/coldStorage';
import type { DaybookOrder } from '@/types/daybook';

interface StoreState {
  admin: Omit<StoreAdmin, 'password'> | null;
  coldStorage: ColdStorage | null;
  token: string | null;
  tokenExpiry: number | null; // timestamp in milliseconds
  isLoading: boolean;
  _hasHydrated: boolean;

  // Receipt voucher column preferences
  receiptVisibleColumns: string[];
  setReceiptColumns: (cols: string[]) => void;
  toggleReceiptColumn: (col: string) => void;
  resetReceiptColumns: () => void;

  // Order being edited (temporary, not persisted)
  orderToEdit: DaybookOrder | null;
  setOrderToEdit: (order: DaybookOrder | null) => void;

  setAdminData: (
    admin: Omit<StoreAdmin, 'password'>,
    coldStorage: ColdStorage,
    token: string
  ) => void;
  clearAdminData: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

type PersistedState = Pick<
  StoreState,
  'admin' | 'coldStorage' | 'token' | 'tokenExpiry' | 'receiptVisibleColumns'
>;

export const useStore = create(
  persist<StoreState, [], [], PersistedState>(
    (set, get) => ({
      admin: null,
      coldStorage: null,
      token: null,
      tokenExpiry: null,
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

      /* -------------------------------
          Order to Edit (temporary)
      -------------------------------- */
      orderToEdit: null,
      setOrderToEdit: (order) => set({ orderToEdit: order }),

      /* -------------------------------- */

      setAdminData: (admin, coldStorage, token) => {
        const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 week from now
        set({ admin, coldStorage, token, tokenExpiry: expiryTime, isLoading: false });
      },
      clearAdminData: () => set({ admin: null, coldStorage: null, token: null, tokenExpiry: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'store-storage',
      partialize: (state): PersistedState => ({
        admin: state.admin,
        coldStorage: state.coldStorage,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
        receiptVisibleColumns: state.receiptVisibleColumns,
      }),
      onRehydrateStorage: () => (state) => {
        // Check if token has expired (1 week)
        if (state?.tokenExpiry && Date.now() > state.tokenExpiry) {
          state.clearAdminData();
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
