import { useCart } from '@/lib/cart-context';
import { usePurchaseSweet } from '@/hooks/useSweets';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, Package } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatINR } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    
    setIsCheckingOut(true);
    
    try {
      // Process each item in the cart
      for (const item of items) {
        const { error } = await supabase.rpc('purchase_sweet', {
          sweet_id: item.sweet.id,
          purchase_quantity: item.quantity,
        });
        
        if (error) {
          throw new Error(`Failed to purchase ${item.sweet.name}: ${error.message}`);
        }
      }
      
      // Success - clear cart and refresh data
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      setIsOpen(false);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-serif">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.sweet.id} className="flex gap-3">
                    {/* Image */}
                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.sweet.image_url ? (
                        <img
                          src={item.sweet.image_url}
                          alt={item.sweet.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {item.sweet.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatINR(Number(item.sweet.price))} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.sweet.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.sweet.id, item.quantity + 1)}
                          disabled={item.quantity >= item.sweet.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive ml-auto"
                          onClick={() => removeFromCart(item.sweet.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <span className="font-semibold text-primary">
                        {formatINR(Number(item.sweet.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatINR(totalPrice)}</span>
              </div>
              
              <Button
                variant="hero"
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut || !user}
              >
                {isCheckingOut ? 'Processing...' : 'Checkout'}
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
