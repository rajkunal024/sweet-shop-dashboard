import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/lib/auth-context';
import { usePurchases } from '@/hooks/usePurchases';
import { formatINR } from '@/lib/utils';
import { Package, ShoppingBag, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: purchases = [], isLoading } = usePurchases();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShoppingBag className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Order History
          </h1>
          <p className="text-muted-foreground mt-2">
            View all your past purchases
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border border-border">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't made any purchases yet. Start shopping to see your order history here.
            </p>
            <Button variant="hero" onClick={() => navigate('/')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex gap-4 p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {purchase.sweet?.image_url ? (
                    <img
                      src={purchase.sweet.image_url}
                      alt={purchase.sweet.name}
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
                  <h3 className="font-medium text-foreground line-clamp-1">
                    {purchase.sweet?.name || 'Unknown Item'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {purchase.quantity}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(purchase.created_at), 'MMM d, yyyy • h:mm a')}
                  </div>
                </div>

                {/* Total */}
                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-primary text-lg">
                    {formatINR(Number(purchase.total_price))}
                  </span>
                  {purchase.sweet && (
                    <p className="text-xs text-muted-foreground">
                      {purchase.sweet.category}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Total Summary */}
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Total Orders</span>
                <span className="text-muted-foreground">{purchases.length}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium text-foreground">Total Spent</span>
                <span className="font-bold text-primary text-lg">
                  {formatINR(purchases.reduce((sum, p) => sum + Number(p.total_price), 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

