// Main Dashboard Page
'use client';

import { useState, useEffect } from 'react';
import { AreaSelector } from './components/AreaSelector';
import { Card, CardHeader, CardBody, CardTitle } from './components/Card';
import { StatusBadge, PlatformBadge } from './components/Badge';
import { LoadingState, LoadingSpinner } from './components/Loading';
import { StatsCard } from './components/StatsCard';
import { StockQueryResponse, StoreStockSummary, ProductStockDetail } from '@/types';
import { formatPrice } from '@/lib/utils/calculations';

export default function DashboardPage() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (selectedArea) {
      fetchStockData(selectedArea);
    }
  }, [selectedArea]);

  const fetchStockData = async (pincode: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stock?area=${pincode}`);
      if (response.ok) {
        const data = await response.json();
        setStockData(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScraper = async () => {
    setScraping(true);
    try {
      const response = await fetch('/api/scraper/run', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Scraper executed successfully!\n${data.recordsProcessed} records processed.`);
        
        // Refresh current area data
        if (selectedArea) {
          await fetchStockData(selectedArea);
        }
      } else {
        alert(`❌ Scraper failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to run scraper:', error);
      alert('❌ Failed to execute scraper');
    } finally {
      setScraping(false);
    }
  };

  const handleWhatsAppAlert = (store: StoreStockSummary) => {
    const oosProducts = store.products.filter(p => p.status === 'out_of_stock');
    const lowProducts = store.products.filter(p => p.status === 'low');
    
    const message = `
🚨 STOCK ALERT 🚨

Area: ${stockData?.area} (${stockData?.pincode})
Store: ${store.storeName} (#${store.storeId})
Platform: ${store.platform}

📊 Summary:
• Out of Stock: ${oosProducts.length} products
• Low Stock: ${lowProducts.length} products

${oosProducts.length > 0 ? `\n⛔ Out of Stock Products:\n${oosProducts.map(p => `  • ${p.name} (${p.sku})`).join('\n')}` : ''}

${lowProducts.length > 0 ? `\n⚠️ Low Stock Products:\n${lowProducts.map(p => `  • ${p.name} (${p.sku}) - ${p.doi} days remaining`).join('\n')}` : ''}

🔔 Action Required: Refill stock immediately!
    `.trim();
    
    console.log(message);
    alert('WhatsApp Alert sent to console! Check browser console for details.');
  };

  if (!selectedArea) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AreaSelector onAreaSelect={setSelectedArea} selectedArea={selectedArea} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select an Area</h2>
            <p className="text-gray-600">Choose an area from the left to view stock data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Area Selector */}
      <AreaSelector onAreaSelect={setSelectedArea} selectedArea={selectedArea} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Stock Out Alert Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Real-time inventory monitoring across quick commerce platforms
                </p>
              </div>
              <button
                onClick={handleRunScraper}
                disabled={scraping}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 
                  disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {scraping ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scraping...
                  </span>
                ) : (
                  '🔄 Run Scraper'
                )}
              </button>
            </div>
            
            {lastUpdate && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {loading ? (
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : stockData ? (
          <>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Total Products"
                  value={stockData.totalProducts}
                  icon={<span className="text-2xl">📦</span>}
                  color="blue"
                />
                <StatsCard
                  title="Out of Stock"
                  value={stockData.oosProducts}
                  icon={<span className="text-2xl">⛔</span>}
                  color="red"
                />
                <StatsCard
                  title="Low Stock"
                  value={stockData.lowStockProducts}
                  icon={<span className="text-2xl">⚠️</span>}
                  color="yellow"
                />
              </div>
            </div>

            {/* Store Cards */}
            <div className="px-8 pb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Stores in {stockData.area}
              </h2>
              
              <div className="space-y-6">
                {stockData.stores.map((store) => (
                  <Card key={store.storeId} hover>
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle>{store.storeName}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">ID: {store.storeId}</p>
                        </div>
                        <PlatformBadge platform={store.platform} />
                      </div>
                      <button
                        onClick={() => handleWhatsAppAlert(store)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium 
                          hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <span>📱</span>
                        WhatsApp Alert
                      </button>
                    </CardHeader>
                    
                    <CardBody>
                      {/* Summary */}
                      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📊</span>
                          <div>
                            <p className="text-sm text-gray-600">Products</p>
                            <p className="text-lg font-semibold text-gray-900">{store.products.length}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⛔</span>
                          <div>
                            <p className="text-sm text-gray-600">Out of Stock</p>
                            <p className="text-lg font-semibold text-red-600">{store.oosCount}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⚠️</span>
                          <div>
                            <p className="text-sm text-gray-600">Low Stock</p>
                            <p className="text-lg font-semibold text-yellow-600">{store.lowStockCount}</p>
                          </div>
                        </div>
                      </div>

                      {/* Product Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Name</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">DOI</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Alert</th>
                            </tr>
                          </thead>
                          <tbody>
                            {store.products.map((product, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                  {product.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                                  {product.sku}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <StatusBadge status={product.status} />
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-semibold ${
                                    product.stockCount === 0 ? 'text-red-600' :
                                    product.stockCount < 20 ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    {product.stockCount}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-gray-900">
                                  {formatPrice(product.price)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-semibold ${
                                    product.doi === 0 ? 'text-red-600' :
                                    product.doi < 3 ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    {product.doi.toFixed(1)} days
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {product.doiAlert}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
