// API Route: /api/areas
// Get all areas with stock summary

import { NextResponse } from 'next/server';
import { getAllAreasWithStock } from '@/lib/db/operations';

export async function GET() {
  try {
    const areas = await getAllAreasWithStock();
    
    return NextResponse.json({
      success: true,
      areas,
      count: areas.length,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
