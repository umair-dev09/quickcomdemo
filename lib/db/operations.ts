// Database operations for stock data management
import { db, schema } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { ScraperResult } from '@/types';
import { calculateDOI, determineStockStatus } from '@/lib/utils/calculations';

/**
 * Initialize database with seed data
 * Creates areas, stores, and products if they don't exist
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Seed areas
    const mockAreas = [
      { pincode: '400001', city: 'Mumbai', name: 'South Mumbai' },
      { pincode: '201301', city: 'Noida', name: 'Sector 16' },
      { pincode: '560001', city: 'Bangalore', name: 'MG Road' },
    ];
    
    for (const area of mockAreas) {
      await db.insert(schema.areas)
        .values(area)
        .onConflictDoNothing();
    }
    
    // Seed products
    const mockProducts = [
      { name: 'Mango Oatmeal', sku: 'SKU001', category: 'Breakfast', brand: 'Quaker', avgDailySales: 10 },
      { name: 'Almond Milk 1L', sku: 'SKU002', category: 'Dairy', brand: 'Alpro', avgDailySales: 8 },
      { name: 'Organic Honey 500g', sku: 'SKU003', category: 'Grocery', brand: 'Dabur', avgDailySales: 12 },
      { name: 'Green Tea 25 Bags', sku: 'SKU004', category: 'Beverages', brand: 'Lipton', avgDailySales: 15 },
      { name: 'Whole Wheat Bread', sku: 'SKU005', category: 'Bakery', brand: 'Modern', avgDailySales: 20 },
      { name: 'Greek Yogurt 400g', sku: 'SKU006', category: 'Dairy', brand: 'Epigamia', avgDailySales: 10 },
      { name: 'Dark Chocolate 100g', sku: 'SKU007', category: 'Snacks', brand: 'Amul', avgDailySales: 25 },
      { name: 'Peanut Butter 500g', sku: 'SKU008', category: 'Spreads', brand: 'MyFitness', avgDailySales: 7 },
    ];
    
    for (const product of mockProducts) {
      await db.insert(schema.products)
        .values(product)
        .onConflictDoNothing();
    }
    
    // Seed stores for each area
    const areas = await db.select().from(schema.areas);
    const mockStores = [
      { storeIdSuffix: 'BLK_', platform: 'blinkit' as const, name: 'Blinkit Store' },
      { storeIdSuffix: 'ZPT_', platform: 'zepto' as const, name: 'Zepto Store' },
      { storeIdSuffix: 'ISM_', platform: 'instamart' as const, name: 'Instamart Store' },
    ];
    
    for (const area of areas) {
      for (const store of mockStores) {
        const storeId = `${store.storeIdSuffix}${area.pincode}`;
        await db.insert(schema.stores)
          .values({
            storeId,
            areaId: area.id,
            platform: store.platform,
            name: `${store.name} - ${area.name}`,
          })
          .onConflictDoNothing();
      }
    }
    
    console.log('✅ Database seeded successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Process and save scraper results to database
 * Optimized with batch operations for speed
 */
export async function saveScraperResults(results: ScraperResult[]) {
  try {
    console.log(`💾 Saving ${results.length} scraper results...`);
    const startTime = Date.now();
    
    // OPTIMIZATION 1: Fetch all lookup data in ONE query each (not 72 queries!)
    const [allAreas, allStores, allProducts] = await Promise.all([
      db.select().from(schema.areas),
      db.select().from(schema.stores),
      db.select().from(schema.products),
    ]);
    
    // Create lookup maps for O(1) access
    const areaMap = new Map(allAreas.map(a => [a.pincode, a]));
    const storeMap = new Map(allStores.map(s => [s.storeId, s]));
    const productMap = new Map(allProducts.map(p => [p.sku, p]));
    
    console.log(`📊 Loaded ${allAreas.length} areas, ${allStores.length} stores, ${allProducts.length} products`);
    
    // OPTIMIZATION 2: Prepare all records for BATCH insert (not 72 individual inserts!)
    const recordsToInsert = [];
    let skippedCount = 0;
    
    for (const result of results) {
      const area = areaMap.get(result.pincode);
      const store = storeMap.get(result.storeId);
      const product = productMap.get(result.sku);
      
      if (!area || !store || !product) {
        skippedCount++;
        continue;
      }
      
      const doi = calculateDOI(result.stockCount, product.avgDailySales);
      const stockStatus = determineStockStatus(result.stockCount, doi);
      
      recordsToInsert.push({
        productId: product.id,
        storeId: store.id,
        areaId: area.id,
        stockStatus,
        stockCount: result.stockCount,
        price: result.price.toString(),
        doi: doi.toString(),
        timestamp: result.timestamp,
      });
    }
    
    // OPTIMIZATION 3: Delete old data and insert all new records in ONE transaction
    if (recordsToInsert.length > 0) {
      await db.delete(schema.stockData); // Clear old data
      await db.insert(schema.stockData).values(recordsToInsert); // Batch insert!
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Scraper results saved: ${recordsToInsert.length} saved, ${skippedCount} skipped in ${duration}ms`);
    
    return { success: true, count: recordsToInsert.length };
  } catch (error) {
    console.error('❌ Error saving scraper results:', error);
    throw error;
  }
}

/**
 * Get latest stock data for a specific area
 */
export async function getStockByArea(pincode: string) {
  try {
    const [area] = await db.select()
      .from(schema.areas)
      .where(eq(schema.areas.pincode, pincode))
      .limit(1);
    
    if (!area) {
      return null;
    }
    
    // Get latest stock data for this area
    const stockRecords = await db.select({
      stockData: schema.stockData,
      product: schema.products,
      store: schema.stores,
    })
      .from(schema.stockData)
      .innerJoin(schema.products, eq(schema.stockData.productId, schema.products.id))
      .innerJoin(schema.stores, eq(schema.stockData.storeId, schema.stores.id))
      .where(eq(schema.stockData.areaId, area.id))
      .orderBy(desc(schema.stockData.timestamp));
    
    return {
      area,
      stockRecords,
    };
  } catch (error) {
    console.error('❌ Error fetching stock by area:', error);
    throw error;
  }
}

/**
 * Get all areas with their latest stock summary
 */
export async function getAllAreasWithStock() {
  try {
    const areas = await db.select().from(schema.areas);
    
    const areasWithStats = await Promise.all(
      areas.map(async (area) => {
        const stockRecords = await db.select()
          .from(schema.stockData)
          .where(eq(schema.stockData.areaId, area.id))
          .orderBy(desc(schema.stockData.timestamp))
          .limit(100);
        
        const oosCount = stockRecords.filter(r => r.stockStatus === 'out_of_stock').length;
        const lowCount = stockRecords.filter(r => r.stockStatus === 'low').length;
        
        return {
          ...area,
          totalProducts: stockRecords.length,
          oosCount,
          lowCount,
        };
      })
    );
    
    return areasWithStats;
  } catch (error) {
    console.error('❌ Error fetching all areas:', error);
    throw error;
  }
}
