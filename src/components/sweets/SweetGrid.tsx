import { Sweet } from '@/types/sweet';
import { SweetCard } from './SweetCard';
import { Package } from 'lucide-react';

interface SweetGridProps {
  sweets: Sweet[];
  isLoading?: boolean;
}

export function SweetGrid({ sweets, isLoading }: SweetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-animation">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="sweet-card animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-9 bg-muted rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No sweets found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-animation">
      {sweets.map((sweet) => (
        <SweetCard key={sweet.id} sweet={sweet} />
      ))}
    </div>
  );
}

