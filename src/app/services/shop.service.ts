import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, shareReplay, catchError, retry, throwError } from 'rxjs';
import { ProductData, Product, ProductFilters, SortOption } from '../models/shop.model';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private readonly API_URL = '/assets/json/shop.json';
  private readonly API_URL_FALLBACK = 'assets/json/shop.json';
  private productData$: Observable<ProductData>;
  private cartSubject = new BehaviorSubject<Product[]>([]);
  private wishlistSubject = new BehaviorSubject<Product[]>([]);

  constructor(private http: HttpClient) {
    // Cache the product data to avoid multiple HTTP requests
    this.productData$ = this.createProductDataStream();
  }

  private createProductDataStream(): Observable<ProductData> {
    console.log('ShopService: Creating new product data stream');
    return this.http.get<ProductData>(this.API_URL).pipe(
      retry({ count: 2, delay: 500 }),
      catchError((primaryError) => {
        console.warn('ShopService: Primary URL failed, trying fallback', primaryError);
        return this.http.get<ProductData>(this.API_URL_FALLBACK).pipe(
          retry({ count: 1, delay: 500 }),
          catchError((fallbackError) => {
            console.error('ShopService: Both URLs failed', fallbackError);
            return throwError(() => fallbackError);
          })
        );
      }),
      shareReplay(1),
      catchError((error) => {
        console.error('ShopService: Stream error, resetting cache', error);
        // Reset the cached stream for next request
        this.productData$ = this.createProductDataStream();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all product data (categories, brands, colors, products, etc.)
   */
  getProductData(): Observable<ProductData> {
    return this.productData$;
  }

  /**
   * Get all products
   */
  getProducts(): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products)
    );
  }

  /**
   * Get product by ID
   */
  getProductById(id: number): Observable<Product | undefined> {
    return this.productData$.pipe(
      map(data => data.products.find(p => p.id === id))
    );
  }

  /**
   * Get product by ID or UUID
   */
  getProductByIdOrUuid(idOrUuid: number | string): Observable<Product | undefined> {
    const idAsString = String(idOrUuid).trim();
    const numericId = Number(idAsString);
    const isNumericId = Number.isFinite(numericId) && String(numericId) === idAsString;

    return this.productData$.pipe(
      map(data => data.products.find(p => (isNumericId && p.id === numericId) || p.uuid === idAsString))
    );
  }

  /**
   * Get product by slug
   */
  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.productData$.pipe(
      map(data => data.products.find(p => p.slug === slug))
    );
  }

  /**
   * Get products by multiple IDs
   */
  getProductsByIds(ids: number[]): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => ids.includes(p.id)))
    );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => p.categoryId.includes(categoryId)))
    );
  }

  /**
   * Get products by brand
   */
  getProductsByBrand(brandId: string): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => p.brand === brandId))
    );
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => p.featured))
    );
  }

  /**
   * Get new arrival products
   */
  getNewArrivals(): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => p.newArrival))
    );
  }

  /**
   * Get hot sale products
   */
  getHotSales(): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => p.hotSale))
    );
  }

  /**
   * Get best seller products
   */
  getBestSellers(): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => p.bestSeller))
    );
  }

  /**
   * Get sale products
   */
  getSaleProducts(): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => data.products.filter(p => p.sale))
    );
  }

  /**
   * Get related products for a given product
   */
  getRelatedProducts(productId: number): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => {
        const product = data.products.find(p => p.id === productId);
        if (!product) return [];
        return data.products.filter(p => product.relatedProducts.includes(p.id));
      })
    );
  }

  /**
   * Search products by name, description, or tags
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    const term = searchTerm.toLowerCase();
    return this.productData$.pipe(
      map(data => data.products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      ))
    );
  }

  /**
   * Filter products based on multiple criteria
   */
  filterProducts(filters: ProductFilters): Observable<Product[]> {
    return this.productData$.pipe(
      map(data => {
        let filtered = [...data.products];

        // Filter by categories
        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter(p =>
            filters.categories!.some(cat => p.categoryId.includes(cat))
          );
        }

        // Filter by brands
        if (filters.brands && filters.brands.length > 0) {
          filtered = filtered.filter(p => filters.brands!.includes(p.brand));
        }

        // Filter by sizes
        if (filters.sizes && filters.sizes.length > 0) {
          filtered = filtered.filter(p =>
            filters.sizes!.some(size => p.sizes.includes(size))
          );
        }

        // Filter by colors
        if (filters.colors && filters.colors.length > 0) {
          filtered = filtered.filter(p =>
            filters.colors!.some(color => p.colors.includes(color))
          );
        }

        // Filter by tags
        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter(p =>
            filters.tags!.some(tag => p.tags.includes(tag))
          );
        }

        // Filter by price range
        if (filters.priceRange) {
          filtered = filtered.filter(p =>
            p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
          );
        }

        // Filter by search term
        if (filters.search) {
          const term = filters.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.tags.some(tag => tag.toLowerCase().includes(term))
          );
        }

        // Filter by sale status
        if (filters.sale !== undefined) {
          filtered = filtered.filter(p => p.sale === filters.sale);
        }

        // Filter by featured status
        if (filters.featured !== undefined) {
          filtered = filtered.filter(p => p.featured === filters.featured);
        }

        // Filter by new arrival status
        if (filters.newArrival !== undefined) {
          filtered = filtered.filter(p => p.newArrival === filters.newArrival);
        }

        // Filter by hot sale status
        if (filters.hotSale !== undefined) {
          filtered = filtered.filter(p => p.hotSale === filters.hotSale);
        }

        // Filter by best seller status
        if (filters.bestSeller !== undefined) {
          filtered = filtered.filter(p => p.bestSeller === filters.bestSeller);
        }

        return filtered;
      })
    );
  }

  /**
   * Sort products
   */
  sortProducts(products: Product[], sortBy: SortOption): Product[] {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      default:
        return sorted;
    }
  }

  /**
   * Paginate products
   */
  paginateProducts(products: Product[], page: number, itemsPerPage: number): Product[] {
    const startIndex = (page - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }

  /**
   * Calculate total pages for pagination
   */
  getTotalPages(totalItems: number, itemsPerPage: number): number {
    return Math.ceil(totalItems / itemsPerPage);
  }

  /**
   * Cart management
   */
  getCart(): Observable<Product[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    if (!currentCart.find(p => p.id === product.id)) {
      this.cartSubject.next([...currentCart, product]);
    }
  }

  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    this.cartSubject.next(currentCart.filter(p => p.id !== productId));
  }

  clearCart(): void {
    this.cartSubject.next([]);
  }

  /**
   * Wishlist management
   */
  getWishlist(): Observable<Product[]> {
    return this.wishlistSubject.asObservable();
  }

  addToWishlist(product: Product): void {
    const currentWishlist = this.wishlistSubject.value;
    if (!currentWishlist.find(p => p.id === product.id)) {
      this.wishlistSubject.next([...currentWishlist, product]);
    }
  }

  removeFromWishlist(productId: number): void {
    const currentWishlist = this.wishlistSubject.value;
    this.wishlistSubject.next(currentWishlist.filter(p => p.id !== productId));
  }
}
