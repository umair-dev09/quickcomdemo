// Area Selector Component - Left Sidebar
'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';

interface Area {
  id: number;
  pincode: string;
  city: string;
  name: string;
  totalProducts: number;
  oosCount: number;
  lowCount: number;
}

interface AreaSelectorProps {
  onAreaSelect: (pincode: string) => void;
  selectedArea: string | null;
}

export function AreaSelector({ onAreaSelect, selectedArea }: AreaSelectorProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/areas');
      const data = await response.json();
      setAreas(data.areas || []);
      
      // Auto-select first area
      if (data.areas.length > 0 && !selectedArea) {
        onAreaSelect(data.areas[0].pincode);
      }
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-80 h-full bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Areas</h2>
          <p className="text-sm text-gray-600 mt-1">Select an area to view stock data</p>
        </div>
        
        <div className="space-y-3">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => onAreaSelect(area.pincode)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${selectedArea === area.pincode
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{area.name}</h3>
                  <p className="text-sm text-gray-600">{area.city}</p>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {area.pincode}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-gray-600">{area.totalProducts} products</span>
                </div>
                {area.oosCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-600 font-medium">{area.oosCount} OOS</span>
                  </div>
                )}
                {area.lowCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-yellow-600 font-medium">{area.lowCount} Low</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
