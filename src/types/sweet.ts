export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SweetFormData {
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image_url?: string;
}

export const SWEET_CATEGORIES = [
  'Chocolate',
  'Candy',
  'Pastry',
  'Ice Cream',
  'Cookies',
  'Cakes',
  'Gummies',
  'Hard Candy',
] as const;

export type SweetCategory = typeof SWEET_CATEGORIES[number];
