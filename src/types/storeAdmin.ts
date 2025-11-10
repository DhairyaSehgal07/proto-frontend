// types/storeAdmin.ts

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

export interface ColdStoragePreferences {
  bagSizes: string[];
  commodities: string[];
  generation: string | null;
  rouging: string | null;
  tuberType: string | null;
  grader: string | null;
}

export interface ColdStorage {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  capacity: number;
  isPaid: boolean;
  isActive: boolean;
  plan: string;
  preferences: ColdStoragePreferences;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
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
