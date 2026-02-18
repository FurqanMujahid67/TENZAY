import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ShopService } from '../../services/shop.service';
import { Product, ProductData, Category, Brand, PriceRange, Color } from '../../models/shop.model';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, Header, Footer, FormsModule, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {
  // Make Math available in template
  Math = Math;
  
  // Data from JSON
  productData: ProductData | null = null;
  allProducts: Product[] = [];
  displayedProducts: Product[] = [];
  
  // Loading state
  isLoading: boolean = true;
  dataLoaded: boolean = false;
  
  // Filter states
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  selectedSizes: string[] = [];
  selectedColors: string[] = [];
  selectedTags: string[] = [];
  selectedPriceRange: { min: number; max: number } | null = null;
  searchTerm: string = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  totalResults = 0;
  
  // Sorting
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' = 'price-asc';

  constructor(
    private shopService: ShopService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoading = true;
    console.log('Shop page: Starting to load products...');
    // Load all data from JSON
    this.shopService.getProductData().subscribe({
      next: (data) => {
        console.log('Shop page: Product data loaded', data);
        this.productData = data;
        this.allProducts = data.products;
        console.log('Shop page: Total products:', this.allProducts.length);
        this.dataLoaded = true;
        this.applyFiltersAndSort();
        this.isLoading = false;
        console.log('Shop page: Displayed products:', this.displayedProducts.length);
        if (this.displayedProducts.length > 0) {
          console.log('Shop page: First product thumbnail:', this.displayedProducts[0].thumbnail);
        }
        // Manually trigger change detection to ensure images render
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Shop page: Error loading products:', error);
        this.isLoading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  // Apply filters and sorting
  applyFiltersAndSort() {
    let filtered = [...this.allProducts];

    // Apply category filter
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        this.selectedCategories.some(cat => p.categoryId.includes(cat))
      );
    }

    // Apply brand filter
    if (this.selectedBrands.length > 0) {
      filtered = filtered.filter(p => this.selectedBrands.includes(p.brand));
    }

    // Apply size filter
    if (this.selectedSizes.length > 0) {
      filtered = filtered.filter(p =>
        this.selectedSizes.some(size => p.sizes.includes(size))
      );
    }

    // Apply color filter
    if (this.selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        this.selectedColors.some(color => p.colors.includes(color))
      );
    }

    // Apply tags filter
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        this.selectedTags.some(tag => p.tags.includes(tag))
      );
    }

    // Apply price range filter
    if (this.selectedPriceRange) {
      filtered = filtered.filter(p =>
        p.price >= this.selectedPriceRange!.min && p.price <= this.selectedPriceRange!.max
      );
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort the filtered products
    const sorted = this.shopService.sortProducts(filtered, this.sortBy);
    
    // Calculate pagination
    this.totalResults = sorted.length;
    this.totalPages = this.shopService.getTotalPages(sorted.length, this.itemsPerPage);
    
    // Apply pagination
    this.displayedProducts = this.shopService.paginateProducts(
      sorted,
      this.currentPage,
      this.itemsPerPage
    );
    
    // Manually trigger change detection after filtering to ensure images render
    this.cdr.detectChanges();
  }

  // Category filter toggle
  toggleCategory(categoryId: string) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  // Brand filter toggle
  toggleBrand(brandId: string) {
    const index = this.selectedBrands.indexOf(brandId);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brandId);
    }
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  isBrandSelected(brandId: string): boolean {
    return this.selectedBrands.includes(brandId);
  }

  // Size filter toggle
  toggleSize(size: string) {
    const index = this.selectedSizes.indexOf(size);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
    } else {
      this.selectedSizes.push(size);
    }
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  // Color filter toggle
  toggleColor(colorId: string) {
    const index = this.selectedColors.indexOf(colorId);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push(colorId);
    }
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  isColorSelected(colorId: string): boolean {
    return this.selectedColors.includes(colorId);
  }

  // Price range filter
  setPriceRange(priceRange: PriceRange) {
    this.selectedPriceRange = { min: priceRange.min, max: priceRange.max };
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  isPriceRangeSelected(priceRange: PriceRange): boolean {
    return this.selectedPriceRange?.min === priceRange.min && 
           this.selectedPriceRange?.max === priceRange.max;
  }

  // Search
  onSearch() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  // Sorting
  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value as 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
    this.applyFiltersAndSort();
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndSort();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  // Generate array for pagination
  getPaginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Get color by ID
  getColorById(colorId: string): Color | undefined {
    return this.productData?.colors.find(c => c.id === colorId);
  }

  // Get star array for ratings
  getStarArray(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  // Add to cart
  addToCart(product: Product, event: Event) {
    event.preventDefault();
    this.shopService.addToCart(product);
    alert(`${product.name} added to cart!`);
  }

  // Tags filter toggle
  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  // Reset all filters
  resetAllFilters() {
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.selectedSizes = [];
    this.selectedColors = [];
    this.selectedTags = [];
    this.selectedPriceRange = null;
    this.searchTerm = '';
    this.sortBy = 'price-asc';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }
}
