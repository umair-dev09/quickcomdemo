// WhatsApp Alert Dialog Component
'use client';

import { StoreStockSummary } from '@/types';

interface WhatsAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreStockSummary | null;
  areaName: string;
  pincode: string;
}

export function WhatsAppDialog({ isOpen, onClose, store, areaName, pincode }: WhatsAppDialogProps) {
  if (!isOpen || !store) return null;

  const oosProducts = store.products.filter(p => p.status === 'out_of_stock');
  const lowProducts = store.products.filter(p => p.status === 'low');
  
  const message = `🚨 *STOCK ALERT* 🚨%0A%0A*Area:* ${areaName} (${pincode})%0A*Store:* ${store.storeName}%0A*Platform:* ${store.platform}%0A%0A📊 *Summary:*%0A• Out of Stock: ${oosProducts.length} products%0A• Low Stock: ${lowProducts.length} products%0A%0A${oosProducts.length > 0 ? `⛔ *Out of Stock Products:*%0A${oosProducts.map(p => `  • ${p.name} (${p.sku})`).join('%0A')}%0A%0A` : ''}${lowProducts.length > 0 ? `⚠️ *Low Stock Products:*%0A${lowProducts.map(p => `  • ${p.name} (${p.sku}) - ${Math.ceil(p.doi)} days remaining`).join('%0A')}%0A%0A` : ''}🔔 *Action Required:* Refill stock immediately!`;

  const whatsappUrl = `https://wa.me/?text=${message}`;

  const handleSendWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleCopyMessage = () => {
    const plainMessage = message.replace(/%0A/g, '\n').replace(/\*/g, '');
    navigator.clipboard.writeText(plainMessage);
    alert('Message copied to clipboard!');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">📱</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">WhatsApp Stock Alert</h2>
                  <p className="text-green-100 text-sm mt-1">Ready to send notification</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-green-100 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Store Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Area</p>
                  <p className="font-semibold text-gray-900">{areaName} ({pincode})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Store</p>
                  <p className="font-semibold text-gray-900">{store.storeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Platform</p>
                  <p className="font-semibold text-gray-900 capitalize">{store.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Store ID</p>
                  <p className="font-semibold text-gray-900 font-mono">{store.storeId}</p>
                </div>
              </div>
            </div>

            {/* Alert Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⛔</span>
                  <div>
                    <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-700">{oosProducts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-700">{lowProducts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products List */}
            {oosProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⛔</span> Out of Stock Products
                </h3>
                <div className="space-y-2">
                  {oosProducts.map((product, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600 font-mono">{product.sku}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lowProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚠️</span> Low Stock Products
                </h3>
                <div className="space-y-2">
                  {lowProducts.map((product, idx) => (
                    <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600 font-mono">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">DOI</p>
                          <p className="font-semibold text-yellow-700">{Math.ceil(product.doi)} days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSendWhatsApp}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 
                  transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">📱</span>
                Send via WhatsApp
              </button>
              <button
                onClick={handleCopyMessage}
                className="px-6 bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 
                  transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">📋</span>
                Copy
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Tip: Send this alert to your warehouse manager for immediate action
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
