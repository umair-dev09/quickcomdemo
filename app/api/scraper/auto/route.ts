// API Route for automatic scraper cron job
// This runs automatically every 5 minutes via external cron service (cron-job.org)
// 
// SECURITY: This endpoint uses a secret token to prevent unauthorized access
// Set CRON_SECRET in your environment variables

import { NextResponse } from 'next/server';
import { runMockScraper } from '@/lib/scraper/mock-scraper';
import { saveScraperResults, seedDatabase } from '@/lib/db/operations';
import { db } from '@/lib/db';
import { areas } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Track last execution time
let lastExecution: Date | null = null;
let isRunning = false;

/**
 * GET endpoint to check scraper status (no auth required for monitoring)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: isRunning ? 'running' : 'idle',
    lastExecution: lastExecution?.toISOString() || null,
    nextExecution: lastExecution 
      ? new Date(lastExecution.getTime() + 5 * 60 * 1000).toISOString() 
      : 'Waiting for first run',
  });
}

/**
 * POST endpoint triggered by external cron service
 * Requires CRON_SECRET header for authentication
 */
export async function POST(request: Request) {
  // Security: Verify cron secret token
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unauthorized - Invalid or missing cron secret' 
      },
      { status: 401 }
    );
  }
  // Prevent concurrent executions
  if (isRunning) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Scraper is already running',
        lastExecution: lastExecution?.toISOString() || null 
      },
      { status: 429 }
    );
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log('🔄 Auto-scraper triggered...');

    // Check if database is initialized
    const existingAreas = await db.select().from(areas);
    if (existingAreas.length === 0) {
      console.log('🌱 First run detected, seeding database...');
      await seedDatabase();
    }

    // Run scraper
    const scraperResults = await runMockScraper();
    
    // Save results to database
    await saveScraperResults(scraperResults);

    lastExecution = new Date();
    const executionTime = Date.now() - startTime;

    console.log(`✅ Auto-scraper completed in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Auto-scraper executed successfully',
      recordsProcessed: scraperResults.length,
      executionTime: `${executionTime}ms`,
      timestamp: lastExecution.toISOString(),
      nextRun: new Date(lastExecution.getTime() + 5 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('❌ Auto-scraper failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        lastExecution: lastExecution?.toISOString() || null 
      },
      { status: 500 }
    );
  } finally {
    isRunning = false;
  }
}
