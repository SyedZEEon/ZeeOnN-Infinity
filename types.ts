export enum Role {
  CEO = 'CEO',
  SALES = 'SALES',
  ACCOUNTS = 'ACCOUNTS',
  STOCK = 'STOCK'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED_ACCOUNTS = 'APPROVED_ACCOUNTS',
  APPROVED_STOCK = 'APPROVED_STOCK',
  FINALIZED = 'FINALIZED',
  REJECTED = 'REJECTED'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  reorderLevel: number;
  category: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  schoolName: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  royaltyFee: number; // 15%
  netRevenue: number;
  status: InvoiceStatus;
  approvals: {
    accounts?: {
      approved: boolean;
      by: string;
      date: string;
      signature: string;
    };
    stock?: {
      approved: boolean;
      by: string;
      date: string;
      signature: string;
    };
  };
  luminateSyncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface LedgerEntry {
  id: string;
  date: string;
  invoiceId: string;
  description: string;
  debit: number;
  credit: number;
  type: 'REVENUE' | 'ROYALTY' | 'EXPENSE';
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface AIAnalysisResult {
  text: string;
  data?: any;
  chartType?: 'bar' | 'line' | 'pie';
}