import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      onClick={() => setIsOpen(true)}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Button>
  );
}

