// API Route: /api/scraper/init
// Initialize database with seed data

import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/operations';

export async function POST() {
  try {
    console.log('🌱 Database initialization triggered...');
    
    await seedDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Init API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to initialize database',
    endpoint: '/api/scraper/init',
    method: 'POST',
  });
}
