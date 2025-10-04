// API Route: /api/stock
// Get stock data filtered by area (pincode)

import { NextRequest, NextResponse } from 'next/server';
import { getStockByArea } from '@/lib/db/operations';
import { StockQueryResponse, StoreStockSummary, ProductStockDetail } from '@/types';
import { getDOIAlert } from '@/lib/utils/calculations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    
    if (!area) {
      return NextResponse.json(
        { error: 'Missing area parameter. Use ?area=400001' },
        { status: 400 }
      );
    }
    
    // Fetch stock data
    const result = await getStockByArea(area);
    
    console.log(`📊 Stock data for area ${area}:`, result ? `${result.stockRecords.length} records` : 'null');
    
    if (!result) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }
    
    // Group by store
    const storeMap = new Map<number, StoreStockSummary>();
    
    for (const record of result.stockRecords) {
      const storeId = record.store.id;
      
      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, {
          storeId: record.store.storeId,
          storeName: record.store.name,
          platform: record.store.platform,
          products: [],
          oosCount: 0,
          lowStockCount: 0,
        });
      }
      
      const storeSummary = storeMap.get(storeId)!;
      
      const productDetail: ProductStockDetail = {
        name: record.product.name,
        sku: record.product.sku,
        status: record.stockData.stockStatus,
        stockCount: record.stockData.stockCount,
        price: parseFloat(record.stockData.price),
        doi: parseFloat(record.stockData.doi),
        doiAlert: getDOIAlert(
          parseFloat(record.stockData.doi),
          record.stockData.stockStatus
        ),
      };
      
      storeSummary.products.push(productDetail);
      
      if (record.stockData.stockStatus === 'out_of_stock') {
        storeSummary.oosCount++;
      } else if (record.stockData.stockStatus === 'low') {
        storeSummary.lowStockCount++;
      }
    }
    
    const stores = Array.from(storeMap.values());
    const totalOOS = stores.reduce((sum, store) => sum + store.oosCount, 0);
    const totalLowStock = stores.reduce((sum, store) => sum + store.lowStockCount, 0);
    const totalProducts = result.stockRecords.length;
    
    const response: StockQueryResponse = {
      area: result.area.name,
      pincode: result.area.pincode,
      stores,
      oosProducts: totalOOS,
      lowStockProducts: totalLowStock,
      totalProducts,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
