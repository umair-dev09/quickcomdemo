// API Route: /api/scraper/run
// Manually trigger the scraper

import { NextResponse } from 'next/server';
import { runMockScraper } from '@/lib/scraper/mock-scraper';
import { saveScraperResults, seedDatabase } from '@/lib/db/operations';

export async function POST() {
  try {
    console.log('🚀 Manual scraper trigger initiated...');
    
    // Ensure database is seeded
    await seedDatabase();
    
    // Run scraper
    const results = await runMockScraper();
    
    // Save to database
    await saveScraperResults(results);
    
    return NextResponse.json({
      success: true,
      message: 'Scraper executed successfully',
      recordsProcessed: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scraper API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute scraper',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to trigger scraper',
    endpoint: '/api/scraper/run',
    method: 'POST',
  });
}
