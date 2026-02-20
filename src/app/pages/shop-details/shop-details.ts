import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ShopService } from '../../services/shop.service';
import { Product } from '../../models/shop.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-shop-details',
  imports: [CommonModule, Header, Footer, RouterLink],
  templateUrl: './shop-details.html',
  styleUrl: './shop-details.scss',
})
export class ShopDetails implements OnInit, OnDestroy {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  isLoading: boolean = true;
  productNotFound: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get product ID from route and subscribe to route changes
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
      const idOrUuid = params['idOrUuid'];
      if (idOrUuid) {
        this.isLoading = true;
        this.productNotFound = false;
        this.loadProduct(idOrUuid);
        // Scroll to top when product changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  loadProduct(idOrUuid: number | string) {
    this.shopService
      .getProductByIdOrUuid(idOrUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.productNotFound = false;
          this.loadRelatedProducts();
        } else {
          this.product = null;
          this.productNotFound = true;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.product = null;
        this.productNotFound = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRelatedProducts() {
    if (this.product && this.product.relatedProducts.length > 0) {
      this.shopService
        .getProductsByIds(this.product.relatedProducts)
        .pipe(takeUntil(this.destroy$))
        .subscribe(products => {
          this.relatedProducts = products.slice(0, 4).map((product) => ({
            ...product,
            thumbnail: product.thumbnail || product.images?.[0] || 'assets/theme/img/product/product-1.jpg',
          }));
          // Ensure related images render immediately after async update.
          this.cdr.detectChanges();
        });
    }
  }

  // Get star array for ratings
  getStarArray(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
