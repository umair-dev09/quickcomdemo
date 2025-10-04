// Main Dashboard Page - Production Ready
'use client';

import { useState, useEffect } from 'react';
import { AreaSelector } from './components/AreaSelector';
import { Card, CardHeader, CardBody, CardTitle } from './components/Card';
import { StatusBadge, PlatformBadge } from './components/Badge';
import { LoadingState, LoadingSpinner } from './components/Loading';
import { StatsCard } from './components/StatsCard';
import { WhatsAppDialog } from './components/WhatsAppDialog';
import { StockQueryResponse, StoreStockSummary, ProductStockDetail } from '@/types';
import { formatPrice } from '@/lib/utils/calculations';

export default function DashboardPage() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // WhatsApp Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreStockSummary | null>(null);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'out_of_stock' | 'low' | 'full'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'doi' | 'stock'>('doi');

  // Fetch stock data when area changes
  useEffect(() => {
    if (selectedArea) {
      fetchStockData(selectedArea);
    }
  }, [selectedArea]);

  // Auto-refresh every 5 minutes - triggers scraper then fetches fresh data
  useEffect(() => {
    if (!autoRefresh || !selectedArea) return;

    const runAutoUpdate = async () => {
      console.log('🔄 Auto-refresh: Running scraper to get fresh data...');
      try {
        // Trigger scraper to get fresh stock data
        const scraperResponse = await fetch('/api/scraper/run', { method: 'POST' });
        const scraperData = await scraperResponse.json();
        console.log(`✅ Auto-refresh: Scraper updated ${scraperData.recordsProcessed} records`);
        
        // Wait a moment for database to update, then fetch fresh data
        setTimeout(() => {
          console.log('🔄 Auto-refresh: Fetching updated data...');
          fetchStockData(selectedArea);
        }, 1000);
      } catch (error) {
        console.error('❌ Auto-refresh failed:', error);
        // Still try to fetch data even if scraper fails
        fetchStockData(selectedArea);
      }
    };

    const interval = setInterval(runAutoUpdate, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, selectedArea]);

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

  const handleWhatsAppAlert = (store: StoreStockSummary) => {
    setSelectedStore(store);
    setDialogOpen(true);
  };

  const handleExportData = (format: 'csv' | 'json') => {
    if (!stockData) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(stockData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock-data-${stockData.pincode}-${new Date().toISOString()}.json`;
      link.click();
    } else {
      // CSV export
      let csv = 'Area,Pincode,Store,Platform,Product,SKU,Status,Stock,Price,DOI,Alert\n';
      stockData.stores.forEach(store => {
        store.products.forEach(product => {
          csv += `"${stockData.area}","${stockData.pincode}","${store.storeName}","${store.platform}","${product.name}","${product.sku}","${product.status}",${product.stockCount},${product.price},${product.doi},"${product.doiAlert}"\n`;
        });
      });
      const dataBlob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock-data-${stockData.pincode}-${new Date().toISOString()}.csv`;
      link.click();
    }
  };

  const filterProducts = (products: ProductStockDetail[]) => {
    let filtered = products;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'doi':
          return a.doi - b.doi;
        case 'stock':
          return a.stockCount - b.stockCount;
        default:
          return 0;
      }
    });
  };

  if (!selectedArea) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AreaSelector onAreaSelect={setSelectedArea} selectedArea={selectedArea} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            <div className="text-8xl mb-6 animate-bounce">📦</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Stock Out Alert Dashboard</h2>
            <p className="text-lg text-gray-600 mb-6">Select an area to view real-time inventory data</p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                <span>Auto-updates every 5 min</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <span>WhatsApp alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span>DOI calculations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Sidebar - Area Selector */}
      <AreaSelector onAreaSelect={setSelectedArea} selectedArea={selectedArea} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Stock Out Alert Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span>🔄</span>
                  Real-time inventory monitoring across quick commerce platforms
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Toggle auto-refresh (every 5 minutes)"
                >
                  {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
                </button>
                <button
                  onClick={async () => {
                    if (!selectedArea) return;
                    setLoading(true);
                    try {
                      console.log('🔄 Manual refresh: Running scraper...');
                      const scraperResponse = await fetch('/api/scraper/run', { method: 'POST' });
                      const scraperData = await scraperResponse.json();
                      console.log(`✅ Scraper updated ${scraperData.recordsProcessed} records`);
                      setTimeout(() => fetchStockData(selectedArea), 1000);
                    } catch (error) {
                      console.error('❌ Manual refresh failed:', error);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 
                    disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  title="Manually trigger scraper and refresh data"
                >
                  {loading ? '⏳ Updating...' : '🔄 Refresh Now'}
                </button>
                <button
                  onClick={() => handleExportData('csv')}
                  disabled={!stockData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 
                    disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => handleExportData('json')}
                  disabled={!stockData}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 
                    disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  📥 Export JSON
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              {lastUpdate && (
                <p className="text-gray-500 flex items-center gap-2">
                  <span>🕒</span>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
              {autoRefresh && (
                <p className="text-green-600 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live monitoring active
                </p>
              )}
            </div>
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
                  subtitle="Across all platforms"
                />
                <StatsCard
                  title="Out of Stock"
                  value={stockData.oosProducts}
                  icon={<span className="text-2xl">⛔</span>}
                  color="red"
                  subtitle={stockData.oosProducts > 0 ? "Requires immediate attention" : "All stocked"}
                />
                <StatsCard
                  title="Low Stock Alert"
                  value={stockData.lowStockProducts}
                  icon={<span className="text-2xl">⚠️</span>}
                  color="yellow"
                  subtitle={stockData.lowStockProducts > 0 ? "DOI < 3 days" : "Healthy levels"}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="px-8 pb-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Filter by Status:</span>
                    <div className="flex gap-2">
                      {(['all', 'out_of_stock', 'low', 'full'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filterStatus === status
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status === 'all' ? 'All' : status === 'out_of_stock' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'Full Stock'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <option value="doi" className="text-gray-900 font-medium">DOI (Days of Inventory)</option>
                      <option value="stock" className="text-gray-900 font-medium">Stock Level</option>
                      <option value="name" className="text-gray-900 font-medium">Product Name</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Cards */}
            <div className="px-8 pb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏪</span>
                Stores in {stockData.area}
              </h2>
              
              <div className="space-y-6">
                {stockData.stores.map((store) => {
                  const filteredProducts = filterProducts(store.products);
                  
                  return (
                    <Card key={store.storeId} hover>
                      <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <CardTitle>{store.storeName}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1 font-mono">ID: {store.storeId}</p>
                          </div>
                          <PlatformBadge platform={store.platform} />
                        </div>
                        <button
                          onClick={() => handleWhatsAppAlert(store)}
                          disabled={store.oosCount === 0 && store.lowStockCount === 0}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold 
                            hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl 
                            disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                            flex items-center gap-2"
                        >
                          <span className="text-lg">📱</span>
                          WhatsApp Alert
                        </button>
                      </CardHeader>
                      
                      <CardBody>
                        {/* Summary */}
                        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            <div>
                              <p className="text-sm text-gray-600">Total Products</p>
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
                              <p className="text-sm text-gray-600">Low Stock (DOI &lt; 3)</p>
                              <p className="text-lg font-semibold text-yellow-600">{store.lowStockCount}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">✅</span>
                            <div>
                              <p className="text-sm text-gray-600">Healthy Stock</p>
                              <p className="text-lg font-semibold text-green-600">
                                {store.products.length - store.oosCount - store.lowStockCount}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Product Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Name</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Stock Level</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">DOI</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Alert</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredProducts.length > 0 ? (
                                filteredProducts.map((product, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
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
                                      <span className={`font-semibold text-lg ${
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
                                      <div className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${
                                        product.doi === 0 ? 'bg-red-100 text-red-700' :
                                        product.doi < 3 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {Math.ceil(product.doi)} days
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <span className={`${
                                        product.doi === 0 ? 'text-red-600 font-semibold' :
                                        product.doi < 3 ? 'text-yellow-600 font-medium' :
                                        'text-gray-600'
                                      }`}>
                                        {product.doiAlert}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7} className="py-8 text-center text-gray-500">
                                    No products match the selected filter
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* WhatsApp Dialog */}
      <WhatsAppDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        store={selectedStore}
        areaName={stockData?.area || ''}
        pincode={stockData?.pincode || ''}
      />
    </div>
  );
}
