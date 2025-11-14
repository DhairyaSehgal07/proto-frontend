// types/storeAdmin.ts
import { ColdStorage } from './coldStorage';

export interface StoreAdmin {
  id: string;
  coldStorageId: string;
  name: string;
  mobileNumber: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  personalAddress?: string;
}
export interface StoreAdminLoginInput {
  mobileNumber: string;
  password: string;
  isMobile: boolean;
}

export interface StoreAdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    admin: StoreAdmin;
    coldStorage: ColdStorage;
  };
}
