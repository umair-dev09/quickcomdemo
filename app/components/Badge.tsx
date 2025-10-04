// Status Badge Component
import { StockStatus } from '@/types';
import { getStatusColor } from '@/lib/utils/calculations';

interface BadgeProps {
  status: StockStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  const statusText = {
    full: 'In Stock',
    low: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
        ${getStatusColor(status)}
        ${className}
      `}
    >
      <span className="w-2 h-2 rounded-full mr-2 animate-pulse" 
        style={{
          backgroundColor: status === 'full' ? '#22c55e' : status === 'low' ? '#eab308' : '#ef4444'
        }}
      />
      {statusText[status]}
    </span>
  );
}

interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

export function PlatformBadge({ platform, className = '' }: PlatformBadgeProps) {
  const colors = {
    blinkit: 'bg-yellow-500',
    zepto: 'bg-purple-500',
    instamart: 'bg-orange-500',
    swiggy: 'bg-orange-600',
  };

  const color = colors[platform.toLowerCase() as keyof typeof colors] || 'bg-blue-500';

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white
        ${color}
        ${className}
      `}
    >
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </span>
  );
}
