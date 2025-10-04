// Core type definitions for the Stock Out Alert Dashboard

export type StockStatus = 'full' | 'low' | 'out_of_stock';

export interface Area {
  id: number;
  pincode: string;
  city: string;
  name: string;
  createdAt: Date;
}

export interface Store {
  id: number;
  storeId: string;
  areaId: number;
  platform: 'blinkit' | 'zepto' | 'instamart' | 'swiggy';
  name: string;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  avgDailySales: number;
  createdAt: Date;
}

export interface StockData {
  id: number;
  productId: number;
  storeId: number;
  areaId: number;
  stockStatus: StockStatus;
  stockCount: number;
  price: number;
  doi: number; // Days of Inventory
  timestamp: Date;
}

// API Response Types
export interface StockQueryResponse {
  area: string;
  pincode: string;
  stores: StoreStockSummary[];
  oosProducts: number;
  lowStockProducts: number;
  totalProducts: number;
}

export interface StoreStockSummary {
  storeId: string;
  storeName: string;
  platform: string;
  products: ProductStockDetail[];
  oosCount: number;
  lowStockCount: number;
}

export interface ProductStockDetail {
  name: string;
  sku: string;
  status: StockStatus;
  stockCount: number;
  price: number;
  doi: number;
  doiAlert: string;
}

// Scraper Types
export interface ScraperResult {
  area: string;
  pincode: string;
  storeId: string;
  product: string;
  sku: string;
  stockStatus: StockStatus;
  stockCount: number;
  price: number;
  platform: string;
  timestamp: Date;
}

// WhatsApp Alert Types
export interface WhatsAppAlert {
  area: string;
  pincode: string;
  storeId: string;
  storeName: string;
  message: string;
}
