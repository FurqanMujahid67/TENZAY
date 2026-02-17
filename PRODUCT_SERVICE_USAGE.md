# Product Service Usage Guide

## Setup

### 1. Import HttpClientModule
In your `app.config.ts`, ensure HttpClientModule is provided:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient(),
  ]
};
```

### 2. Inject the Service
In your component:

```typescript
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

export class YourComponent {
  products: Product[] = [];

  constructor(private productService: ProductService) {}
}
```

## Common Usage Examples

### Home Page Component

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  bestSellers: Product[] = [];
  newArrivals: Product[] = [];
  hotSales: Product[] = [];
  activeFilter: string = 'all';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Load best sellers
    this.productService.getBestSellers().subscribe(products => {
      this.bestSellers = products;
    });

    // Load new arrivals
    this.productService.getNewArrivals().subscribe(products => {
      this.newArrivals = products;
    });

    // Load hot sales
    this.productService.getHotSales().subscribe(products => {
      this.hotSales = products;
    });
  }

  // Get filtered products based on active filter
  getFilteredProducts(): Product[] {
    switch(this.activeFilter) {
      case 'new-arrivals':
        return this.newArrivals;
      case 'hot-sales':
        return this.hotSales;
      case 'best-sellers':
      default:
        return this.bestSellers;
    }
  }
}
```

### Shop Page Component

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product, ProductFilters, ProductData } from '../../models/product.model';

@Component({
  selector: 'app-shop',
  imports: [CommonModule],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {
  allProducts: Product[] = [];
  displayedProducts: Product[] = [];
  productData: ProductData | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  
  // Filters
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  selectedSizes: string[] = [];
  selectedColors: string[] = [];
  selectedPriceRange: { min: number; max: number } | null = null;
  searchTerm = '';
  
  // Sorting
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' = 'price-asc';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Load all data
    this.productService.getProductData().subscribe(data => {
      this.productData = data;
      this.allProducts = data.products;
      this.applyFiltersAndSort();
    });
  }

  // Apply filters and sorting
  applyFiltersAndSort() {
    const filters: ProductFilters = {
      categories: this.selectedCategories.length > 0 ? this.selectedCategories : undefined,
      brands: this.selectedBrands.length > 0 ? this.selectedBrands : undefined,
      sizes: this.selectedSizes.length > 0 ? this.selectedSizes : undefined,
      colors: this.selectedColors.length > 0 ? this.selectedColors : undefined,
      priceRange: this.selectedPriceRange || undefined,
      search: this.searchTerm || undefined,
    };

    this.productService.filterProducts(filters).subscribe(filtered => {
      // Sort the filtered products
      const sorted = this.productService.sortProducts(filtered, this.sortBy);
      
      // Calculate pagination
      this.totalPages = this.productService.getTotalPages(sorted.length, this.itemsPerPage);
      
      // Apply pagination
      this.displayedProducts = this.productService.paginateProducts(
        sorted,
        this.currentPage,
        this.itemsPerPage
      );
    });
  }

  // Filter methods
  toggleCategory(categoryId: string) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.currentPage = 1; // Reset to first page
    this.applyFiltersAndSort();
  }

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

  setPriceRange(min: number, max: number) {
    this.selectedPriceRange = { min, max };
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onSortChange(newSort: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc') {
    this.sortBy = newSort;
    this.applyFiltersAndSort();
  }

  // Pagination methods
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
}
```

### Shop Details Component

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-shop-details',
  imports: [CommonModule],
  templateUrl: './shop-details.html',
  styleUrl: './shop-details.scss',
})
export class ShopDetails implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    // Get product ID from route
    this.route.params.subscribe(params => {
      const productId = +params['id']; // Convert to number
      
      // Load product details
      this.productService.getProductById(productId).subscribe(product => {
        if (product) {
          this.product = product;
          this.selectedImage = product.images[0];
          
          // Load related products
          this.productService.getRelatedProducts(productId).subscribe(related => {
            this.relatedProducts = related;
          });
        }
      });
    });
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  incrementQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product) {
      this.productService.addToCart(this.product);
      alert(`${this.product.name} added to cart!`);
    }
  }

  addToWishlist() {
    if (this.product) {
      this.productService.addToWishlist(this.product);
      alert(`${this.product.name} added to wishlist!`);
    }
  }
}
```

### HTML Template Examples

#### Home Page - Product Grid
```html
<div class="row product__filter">
  <div *ngFor="let product of getFilteredProducts()" 
       class="col-lg-3 col-md-6 col-sm-6"
       [ngClass]="{
         'mix new-arrivals': product.newArrival,
         'mix hot-sales': product.hotSale
       }">
    <div class="product__item" [ngClass]="{'sale': product.sale}">
      <div class="product__item__pic set-bg" 
           [attr.data-setbg]="product.thumbnail">
        <p *ngIf="product.sale" class="sale__price">Sale</p>
      </div>
      <div class="product__item__text">
        <h6><a [routerLink]="['/shop-details', product.id]">{{ product.name }}</a></h6>
        <h5>
          ${{ product.price }}
          <span *ngIf="product.sale" class="original-price">${{ product.originalPrice }}</span>
        </h5>
      </div>
    </div>
  </div>
</div>
```

#### Shop Page - Product Grid with Filters
```html
<!-- Sidebar -->
<div class="col-lg-3">
  <div class="shop__sidebar">
    <!-- Categories -->
    <div class="shop__sidebar__categories">
      <ul>
        <li *ngFor="let category of productData?.categories">
          <a (click)="toggleCategory(category.id)" 
             [class.active]="selectedCategories.includes(category.id)">
            {{ category.name }} ({{ category.count }})
          </a>
        </li>
      </ul>
    </div>

    <!-- Brands -->
    <div class="shop__sidebar__brand">
      <ul>
        <li *ngFor="let brand of productData?.brands">
          <a (click)="toggleBrand(brand.id)"
             [class.active]="selectedBrands.includes(brand.id)">
            {{ brand.name }}
          </a>
        </li>
      </ul>
    </div>

    <!-- Price Ranges -->
    <div class="shop__sidebar__price">
      <ul>
        <li *ngFor="let range of productData?.priceRanges">
          <a (click)="setPriceRange(range.min, range.max)">
            {{ range.label }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>

<!-- Product Grid -->
<div class="col-lg-9">
  <div class="row">
    <div *ngFor="let product of displayedProducts" 
         class="col-lg-4 col-md-6 col-sm-6">
      <div class="product__item" [ngClass]="{'sale': product.sale}">
        <div class="product__item__pic set-bg" 
             [attr.data-setbg]="product.thumbnail">
          <span *ngIf="product.sale" class="label">Sale</span>
        </div>
        <div class="product__item__text">
          <h6>
            <a [routerLink]="['/shop-details', product.id]">
              {{ product.name }}
            </a>
          </h6>
          <h5>${{ product.price }}</h5>
          <div class="rating">
            <i *ngFor="let star of [1,2,3,4,5]" 
               class="fa"
               [ngClass]="star <= product.rating ? 'fa-star' : 'fa-star-o'">
            </i>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Pagination -->
  <div class="row">
    <div class="col-lg-12">
      <div class="product__pagination">
        <a (click)="previousPage()" 
           [class.disabled]="currentPage === 1">Previous</a>
        <a *ngFor="let page of [].constructor(totalPages); let i = index"
           (click)="goToPage(i + 1)"
           [class.active]="currentPage === i + 1">
          {{ i + 1 }}
        </a>
        <a (click)="nextPage()" 
           [class.disabled]="currentPage === totalPages">Next</a>
      </div>
    </div>
  </div>
</div>
```

## Best Practices

1. **Subscribe Management**: Use `async` pipe or remember to unsubscribe in `ngOnDestroy`
2. **Loading States**: Show loading indicators while data is being fetched
3. **Error Handling**: Add error handling for HTTP requests
4. **Caching**: The service already caches data with `shareReplay(1)`
5. **Performance**: Use `trackBy` in `*ngFor` for better performance
6. **SEO**: Use product slugs in URLs instead of IDs for better SEO

## Advanced Features

### Custom Filter Combination
```typescript
// Get products that are on sale AND in the clothing category
this.productService.filterProducts({
  categories: ['clothing'],
  sale: true
}).subscribe(products => {
  this.saleClothing = products;
});
```

### Multi-Sort
```typescript
// Sort by rating first, then by price
const sorted = this.productService.sortProducts(products, 'rating-desc');
const finalSort = this.productService.sortProducts(sorted, 'price-asc');
```

### Dynamic Category Counts
```typescript
// Update category counts based on current filters
this.productService.filterProducts(currentFilters).subscribe(filtered => {
  this.updateCategoryCounts(filtered);
});
```
