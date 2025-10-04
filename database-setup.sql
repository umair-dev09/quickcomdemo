-- SQL Setup Script for Stock Out Alert Dashboard
-- This script creates all necessary tables for the application

-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE stock_status AS ENUM ('full', 'low', 'out_of_stock');
CREATE TYPE platform AS ENUM ('blinkit', 'zepto', 'instamart', 'swiggy');

-- Create areas table
CREATE TABLE areas (
  id SERIAL PRIMARY KEY,
  pincode TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create stores table
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  store_id TEXT NOT NULL UNIQUE,
  area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  platform platform NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  avg_daily_sales INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create stock_data table
CREATE TABLE stock_data (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  stock_status stock_status NOT NULL,
  stock_count INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  doi DECIMAL(5, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_stock_data_area ON stock_data(area_id);
CREATE INDEX idx_stock_data_store ON stock_data(store_id);
CREATE INDEX idx_stock_data_product ON stock_data(product_id);
CREATE INDEX idx_stock_data_timestamp ON stock_data(timestamp DESC);
CREATE INDEX idx_stock_data_status ON stock_data(stock_status);
CREATE INDEX idx_stores_area ON stores(area_id);

-- Insert sample areas
INSERT INTO areas (pincode, city, name) VALUES
  ('400001', 'Mumbai', 'South Mumbai'),
  ('201301', 'Noida', 'Sector 16'),
  ('560001', 'Bangalore', 'MG Road')
ON CONFLICT (pincode) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, sku, category, brand, avg_daily_sales) VALUES
  ('Mango Oatmeal', 'SKU001', 'Breakfast', 'Quaker', 10),
  ('Almond Milk 1L', 'SKU002', 'Dairy', 'Alpro', 8),
  ('Organic Honey 500g', 'SKU003', 'Grocery', 'Dabur', 12),
  ('Green Tea 25 Bags', 'SKU004', 'Beverages', 'Lipton', 15),
  ('Whole Wheat Bread', 'SKU005', 'Bakery', 'Modern', 20),
  ('Greek Yogurt 400g', 'SKU006', 'Dairy', 'Epigamia', 10),
  ('Dark Chocolate 100g', 'SKU007', 'Snacks', 'Amul', 25),
  ('Peanut Butter 500g', 'SKU008', 'Spreads', 'MyFitness', 7)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample stores for each area
-- Mumbai stores
INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'BLK_400001', id, 'blinkit', 'Blinkit Store - South Mumbai'
FROM areas WHERE pincode = '400001'
ON CONFLICT (store_id) DO NOTHING;

INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'ZPT_400001', id, 'zepto', 'Zepto Store - South Mumbai'
FROM areas WHERE pincode = '400001'
ON CONFLICT (store_id) DO NOTHING;

INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'ISM_400001', id, 'instamart', 'Instamart Store - South Mumbai'
FROM areas WHERE pincode = '400001'
ON CONFLICT (store_id) DO NOTHING;

-- Noida stores
INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'BLK_201301', id, 'blinkit', 'Blinkit Store - Sector 16'
FROM areas WHERE pincode = '201301'
ON CONFLICT (store_id) DO NOTHING;

INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'ZPT_201301', id, 'zepto', 'Zepto Store - Sector 16'
FROM areas WHERE pincode = '201301'
ON CONFLICT (store_id) DO NOTHING;

INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'ISM_201301', id, 'instamart', 'Instamart Store - Sector 16'
FROM areas WHERE pincode = '201301'
ON CONFLICT (store_id) DO NOTHING;

-- Bangalore stores
INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'BLK_560001', id, 'blinkit', 'Blinkit Store - MG Road'
FROM areas WHERE pincode = '560001'
ON CONFLICT (store_id) DO NOTHING;

INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'ZPT_560001', id, 'zepto', 'Zepto Store - MG Road'
FROM areas WHERE pincode = '560001'
ON CONFLICT (store_id) DO NOTHING;

INSERT INTO stores (store_id, area_id, platform, name)
SELECT 'ISM_560001', id, 'instamart', 'Instamart Store - MG Road'
FROM areas WHERE pincode = '560001'
ON CONFLICT (store_id) DO NOTHING;

-- Verification queries
SELECT 'Areas created:' as info, COUNT(*) as count FROM areas;
SELECT 'Stores created:' as info, COUNT(*) as count FROM stores;
SELECT 'Products created:' as info, COUNT(*) as count FROM products;

SELECT 'Setup complete! Use the application to generate stock data.' as message;
