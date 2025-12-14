import { Sweet } from '@/types/sweet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

interface SweetCardProps {
  sweet: Sweet;
}

const categoryStyles: Record<string, string> = {
  'Chocolate': 'category-chocolate',
  'Candy': 'category-candy',
  'Pastry': 'category-pastry',
  'Ice Cream': 'category-ice-cream',
  'Cookies': 'bg-amber-500/10 text-amber-700',
  'Cakes': 'bg-rose-500/10 text-rose-600',
  'Gummies': 'bg-green-500/10 text-green-600',
  'Hard Candy': 'bg-purple-500/10 text-purple-600',
};

export function SweetCard({ sweet }: SweetCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isOutOfStock = sweet.quantity === 0;

  const handleAddToCart = () => {
    if (!user) return;
    addToCart(sweet);
  };

  const getCategoryStyle = (category: string) => {
    return categoryStyles[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="sweet-card group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {sweet.image_url ? (
          <img
            src={sweet.image_url}
            alt={sweet.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn('category-badge', getCategoryStyle(sweet.category))}>
            {sweet.category}
          </span>
        </div>

        {/* Stock Badge */}
        {!isOutOfStock && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background/90 text-foreground">
              {sweet.quantity} left
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">
            {sweet.name}
          </h3>
          {sweet.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {sweet.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${Number(sweet.price).toFixed(2)}
          </span>
          
          <Button
            variant="sweet"
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock || !user}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
