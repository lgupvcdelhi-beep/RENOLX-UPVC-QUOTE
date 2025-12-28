export type Brand = 'RENOLX' | 'FENERO';

export enum ProfileType {
  FIXED = 'Fixed Window',
  CASEMENT_WINDOW = 'Casement Window',
  SLIDING_2_TRACK = 'Sliding Window (2 Track)',
  SLIDING_3_TRACK = 'Sliding Window (3 Track)',
  CASEMENT_DOOR = 'Casement Door',
  SLIDING_DOOR = 'Sliding Door',
  VENTILATOR = 'Ventilator',
  ARCH = 'Arch Window'
}

export interface QuoteItem {
  id: string;
  itemNumber: number;
  type: ProfileType;
  brand: Brand;
  width: number; // mm
  height: number; // mm
  pricePerSqFt: number;
  quantity: number;
  description?: string;
  sqFt: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  items: QuoteItem[];
  totalAmount: number;
  status: 'Draft' | 'Finalized';
}
