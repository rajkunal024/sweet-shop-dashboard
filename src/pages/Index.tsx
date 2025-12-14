import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SweetGrid } from '@/components/sweets/SweetGrid';
import { SweetFilters } from '@/components/sweets/SweetFilters';
import { useSweets } from '@/hooks/useSweets';
import { useAuth } from '@/lib/auth-context';
import { Candy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: sweets = [], isLoading } = useSweets(
    searchQuery || undefined,
    category && category !== 'all' ? category : undefined,
    priceRange[0] > 0 ? priceRange[0] : undefined,
    priceRange[1] < 100 ? priceRange[1] : undefined
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Candy className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container py-16 md:py-24 relative">
          <div className="max-w-2xl mx-auto text-center page-transition">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 text-balance">
              Handcrafted Sweets for
              <span className="text-primary"> Every Occasion</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Discover our collection of artisan chocolates, candies, and confections made with the finest ingredients.
            </p>
            {!user && (
              <div className="flex items-center justify-center gap-4">
                <Button variant="hero" size="lg" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container pb-16">
        {user ? (
          <div className="space-y-8 page-transition">
            {/* Filters */}
            <SweetFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />

            {/* Sweet Grid */}
            <SweetGrid sweets={sweets} isLoading={isLoading} />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Candy className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
              Sign in to start shopping
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create an account or sign in to browse and purchase our delicious sweets.
            </p>
            <Button variant="hero" onClick={() => navigate('/auth')}>
              Sign In to Continue
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Candy className="h-5 w-5 text-primary" />
              <span className="font-serif font-medium">SweetShop</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
