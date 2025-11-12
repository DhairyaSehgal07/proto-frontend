export interface DaybookApiResponse {
  success: boolean;
  message: string;
  data: DaybookOrder[];
}

/**
 * Represents a single daybook order (incoming or outgoing)
 */
export interface DaybookOrder {
  id: string;
  type: 'incoming' | 'outgoing';
  farmerStorageLinkId: string;
  coldStorageId: string;
  commodity: string;
  gatePassType: 'RECEIPT' | 'DELIVERY';
  gatePassNumber: number;
  remarks: string;
  currentStockAtThatTime: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  farmerStorageLink: FarmerStorageLink;
  varieties: Variety[];
  totalBags?: number; // present in outgoing
  totalWeight?: number; // present in outgoing
  createdBy?: CreatedBy; // present in outgoing
}

/**
 * Represents the farmer linkage info in an order
 */
export interface FarmerStorageLink {
  id: string;
  accountNumber?: number; // present in incoming
  farmer: Farmer;
}

/**
 * Represents a farmer entity
 */
export interface Farmer {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl: string | null;
}

/**
 * Represents a variety under a commodity
 */
export interface Variety {
  name: string;
  bagSizes: BagSize[];
}

/**
 * Represents details of a particular bag size and location info
 */
export interface BagSize {
  name: string; // e.g. "25kg" or "50kg"
  quantityInit: number;
  quantityCurr: number;
  approxWeight?: number; // optional because some entries might not include it
  incomingOrderId?: number | null;
  locationId: string;
  floor: string;
  row: string;
  chamber: string;
}

/**
 * Represents the user who created the outgoing order
 */
export interface CreatedBy {
  id: string;
  name: string;
}
