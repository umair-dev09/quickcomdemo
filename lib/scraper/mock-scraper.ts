// Mock data scraper for quick commerce platforms
// This simulates scraping from Blinkit, Zepto, Instamart, etc.
// Using mock data to avoid legal/ethical issues as per assignment guidelines

import { ScraperResult, StockStatus } from '@/types';

// Mock product catalog
const mockProducts = [
  { name: 'Mango Oatmeal', sku: 'SKU001', category: 'Breakfast', brand: 'Quaker' },
  { name: 'Almond Milk 1L', sku: 'SKU002', category: 'Dairy', brand: 'Alpro' },
  { name: 'Organic Honey 500g', sku: 'SKU003', category: 'Grocery', brand: 'Dabur' },
  { name: 'Green Tea 25 Bags', sku: 'SKU004', category: 'Beverages', brand: 'Lipton' },
  { name: 'Whole Wheat Bread', sku: 'SKU005', category: 'Bakery', brand: 'Modern' },
  { name: 'Greek Yogurt 400g', sku: 'SKU006', category: 'Dairy', brand: 'Epigamia' },
  { name: 'Dark Chocolate 100g', sku: 'SKU007', category: 'Snacks', brand: 'Amul' },
  { name: 'Peanut Butter 500g', sku: 'SKU008', category: 'Spreads', brand: 'MyFitness' },
];

// Mock areas
const mockAreas = [
  { pincode: '400001', city: 'Mumbai', name: 'South Mumbai' },
  { pincode: '201301', city: 'Noida', name: 'Sector 16' },
  { pincode: '560001', city: 'Bangalore', name: 'MG Road' },
];

// Mock stores per area (will be combined with pincode to match database)
const mockStores = [
  { storeIdPrefix: 'BLK_', platform: 'blinkit' as const, name: 'Blinkit Store' },
  { storeIdPrefix: 'ZPT_', platform: 'zepto' as const, name: 'Zepto Store' },
  { storeIdPrefix: 'ISM_', platform: 'instamart' as const, name: 'Instamart Store' },
];

/**
 * Generate random stock count with weighted probability
 * More likely to have stock, occasional low stock or OOS
 */
function generateStockCount(): number {
  const rand = Math.random();
  
  if (rand < 0.15) {
    return 0; // 15% chance of out of stock
  } else if (rand < 0.30) {
    return Math.floor(Math.random() * 20) + 1; // 15% chance of low stock (1-20)
  } else {
    return Math.floor(Math.random() * 80) + 30; // 70% chance of healthy stock (30-110)
  }
}

/**
 * Generate random price with some variance
 */
function generatePrice(basePrice: number = 199): number {
  const variance = Math.random() * 0.2 - 0.1; // ±10% variance
  return parseFloat((basePrice * (1 + variance)).toFixed(2));
}

/**
 * Determine stock status based on count
 */
function determineStatus(count: number): StockStatus {
  if (count === 0) return 'out_of_stock';
  if (count < 20) return 'low';
  return 'full';
}

/**
 * Mock scraper that simulates fetching data from quick commerce platforms
 * In production, this would use Puppeteer/Playwright or API calls
 * 
 * @returns Array of scraper results
 */
export async function runMockScraper(): Promise<ScraperResult[]> {
  console.log('🤖 Mock scraper started...');
  
  const results: ScraperResult[] = [];
  
  // Simulate scraping delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock data for each area, store, and product combination
  for (const area of mockAreas) {
    for (const store of mockStores) {
      const storeId = `${store.storeIdPrefix}${area.pincode}`; // Create store ID matching database format
      
      for (const product of mockProducts) {
        const stockCount = generateStockCount();
        const price = generatePrice();
        const stockStatus = determineStatus(stockCount);
        
        results.push({
          area: area.name,
          pincode: area.pincode,
          storeId,
          product: product.name,
          sku: product.sku,
          stockStatus,
          stockCount,
          price,
          platform: store.platform,
          timestamp: new Date(),
        });
      }
    }
  }
  
  console.log(`✅ Mock scraper completed: ${results.length} records generated`);
  
  return results;
}

/**
 * Export mock data for seeding database
 */
export function getMockAreas() {
  return mockAreas;
}

export function getMockStores() {
  return mockStores;
}

export function getMockProducts() {
  return mockProducts;
}

/**
 * Simulate real scraper behavior with error handling
 * In production, this would handle:
 * - Network timeouts
 * - Rate limiting
 * - CAPTCHA challenges
 * - Geo-location requirements
 */
export async function scrapeSingleProduct(
  area: string,
  storeId: string,
  productSku: string
): Promise<ScraperResult | null> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 5% chance of failure (simulating real-world issues)
    if (Math.random() < 0.05) {
      throw new Error('Network timeout or CAPTCHA challenge');
    }
    
    const mockArea = mockAreas.find(a => a.pincode === area);
    const mockProduct = mockProducts.find(p => p.sku === productSku);
    
    // Find store by checking if storeId starts with any of our prefixes
    const mockStore = mockStores.find(s => storeId.startsWith(s.storeIdPrefix));
    
    if (!mockArea || !mockStore || !mockProduct) {
      return null;
    }
    
    const stockCount = generateStockCount();
    const price = generatePrice();
    const stockStatus = determineStatus(stockCount);
    
    return {
      area: mockArea.name,
      pincode: mockArea.pincode,
      storeId,
      product: mockProduct.name,
      sku: mockProduct.sku,
      stockStatus,
      stockCount,
      price,
      platform: mockStore.platform,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to scrape ${productSku} from ${storeId}:`, error);
    return null;
  }
}

/**
 * Helper to simulate real-world scraper delays and rate limiting
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
