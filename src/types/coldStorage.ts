export interface ColdStorage {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  capacity: number;
  isPaid: boolean;
  isActive: boolean;
  plan: string;

  preferences: {
    commodities: {
      name: string;
      sizes: string[];
    }[];
    varieties: string[];
    generation: string | null;
    rouging: string | null;
    tuberType: string | null;
    grader: string | null;
  };

  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
}

export interface ColdStoragePreferences {
  bagSizes: string[];
  commodities: string[];
  generation: string | null;
  rouging: string | null;
  tuberType: string | null;
  grader: string | null;
}
