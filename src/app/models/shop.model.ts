// TypeScript interfaces for products.json

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Color {
  id: string;
  name: string;
  class: string;
  hex: string;
}

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface DetailedDescription {
  productsInfo: string;
  materialUsed: string;
}

export interface Product {
  id: number;
  uuid: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  sale: boolean;
  salePercentage: number;
  brand: string;
  categoryId: string[];
  tags: string[];
  images: string[];
  thumbnail: string;
  thumbnails?: string[];
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  newArrival: boolean;
  hotSale: boolean;
  bestSeller: boolean;
  material: string;
  additionalInfo: string;
  videoUrl?: string;
  detailedDescription?: DetailedDescription;
  relatedProducts: number[];
}

export interface ProductData {
  categories: Category[];
  brands: Brand[];
  sizes: string[];
  colors: Color[];
  tags: string[];
  priceRanges: PriceRange[];
  products: Product[];
}

// Helper type for product filters
export interface ProductFilters {
  categories?: string[];
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  priceRange?: { min: number; max: number };
  search?: string;
  sale?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  hotSale?: boolean;
  bestSeller?: boolean;
}

// Helper type for sorting
export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating-desc' | 'newest';
