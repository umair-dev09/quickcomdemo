// Utility functions for DOI and stock calculations
import { StockStatus } from '@/types';

/**
 * Calculate Days of Inventory (DOI)
 * Formula: DOI = stock count ÷ average daily sales
 * 
 * @param stockCount - Current stock count
 * @param avgDailySales - Average daily sales (default: 10)
 * @returns Days of inventory
 */
export function calculateDOI(stockCount: number, avgDailySales: number = 10): number {
  if (avgDailySales === 0) return 0;
  return parseFloat((stockCount / avgDailySales).toFixed(2));
}

/**
 * Determine stock status based on stock count and DOI
 * 
 * @param stockCount - Current stock count
 * @param doi - Days of inventory
 * @returns Stock status
 */
export function determineStockStatus(stockCount: number, doi: number): StockStatus {
  if (stockCount === 0 || doi === 0) {
    return 'out_of_stock';
  } else if (doi < 3) {
    return 'low';
  } else {
    return 'full';
  }
}

/**
 * Generate DOI alert message
 * 
 * @param doi - Days of inventory
 * @param stockStatus - Current stock status
 * @returns Alert message
 */
export function getDOIAlert(doi: number, stockStatus: StockStatus): string {
  if (stockStatus === 'out_of_stock') {
    return 'Out of Stock - Refill Immediately!';
  } else if (stockStatus === 'low') {
    return `Low Stock - ${doi} days remaining`;
  } else {
    return `Healthy Stock - ${doi} days`;
  }
}

/**
 * Format price for display
 * 
 * @param price - Price value
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}

/**
 * Get status badge color
 * 
 * @param status - Stock status
 * @returns Tailwind CSS color classes
 */
export function getStatusColor(status: StockStatus): string {
  switch (status) {
    case 'full':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'low':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'out_of_stock':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get platform badge color
 * 
 * @param platform - Platform name
 * @returns Tailwind CSS color classes
 */
export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'blinkit':
      return 'bg-yellow-500 text-white';
    case 'zepto':
      return 'bg-purple-500 text-white';
    case 'instamart':
      return 'bg-orange-500 text-white';
    case 'swiggy':
      return 'bg-orange-600 text-white';
    default:
      return 'bg-blue-500 text-white';
  }
}
