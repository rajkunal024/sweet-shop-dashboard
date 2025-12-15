import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { SWEET_CATEGORIES } from '@/types/sweet';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SweetFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  category: string;
  setCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

export function SweetFilters({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  priceRange,
  setPriceRange,
}: SweetFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
  };

  const applyPriceFilter = () => {
    setPriceRange(localPriceRange);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setPriceRange([0, 100]);
    setLocalPriceRange([0, 100]);
  };

  const hasActiveFilters = searchQuery || category || priceRange[0] > 0 || priceRange[1] < 100;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sweets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Category Select */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SWEET_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Price Range</SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-6">
              <div className="space-y-4">
                <Label>
                  Price: ${localPriceRange[0]} - ${localPriceRange[1]}
                </Label>
                <Slider
                  value={localPriceRange}
                  onValueChange={handlePriceChange}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
              <Button onClick={applyPriceFilter} className="w-full">
                Apply Filter
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

