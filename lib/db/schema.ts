// Database schema using Drizzle ORM
import { pgTable, serial, text, integer, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const stockStatusEnum = pgEnum('stock_status', ['full', 'low', 'out_of_stock']);
export const platformEnum = pgEnum('platform', ['blinkit', 'zepto', 'instamart', 'swiggy']);

// Areas Table (e.g., 400001 Mumbai, 201301 Noida)
export const areas = pgTable('areas', {
  id: serial('id').primaryKey(),
  pincode: text('pincode').notNull().unique(),
  city: text('city').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stores Table (e.g., BLK_123, ZPT_456)
export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  storeId: text('store_id').notNull().unique(),
  areaId: integer('area_id').references(() => areas.id).notNull(),
  platform: platformEnum('platform').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  avgDailySales: integer('avg_daily_sales').notNull().default(10), // Default 10 as per requirement
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stock Data Table (scraped data)
export const stockData = pgTable('stock_data', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  areaId: integer('area_id').references(() => areas.id).notNull(),
  stockStatus: stockStatusEnum('stock_status').notNull(),
  stockCount: integer('stock_count').notNull().default(0),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  doi: decimal('doi', { precision: 5, scale: 2 }).notNull(), // Days of Inventory
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Type exports for TypeScript
export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type StockData = typeof stockData.$inferSelect;
export type NewStockData = typeof stockData.$inferInsert;
