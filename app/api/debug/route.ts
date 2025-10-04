// Debug API route to check database tables
import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';

export async function GET() {
  try {
    // Count records in each table
    const areas = await db.select().from(schema.areas);
    const stores = await db.select().from(schema.stores);
    const products = await db.select().from(schema.products);
    const stockData = await db.select().from(schema.stockData);
    
    return NextResponse.json({
      success: true,
      counts: {
        areas: areas.length,
        stores: stores.length,
        products: products.length,
        stockData: stockData.length,
      },
      sampleData: {
        areas: areas.slice(0, 2),
        stores: stores.slice(0, 3),
        products: products.slice(0, 2),
        stockData: stockData.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
