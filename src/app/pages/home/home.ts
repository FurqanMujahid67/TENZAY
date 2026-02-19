import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ShopService } from '../../services/shop.service';
import { Product } from '../../models/shop.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  // All theme initialization is handled by the Header component
  isLoading = true;
  private hasRetriedLoad = false;
  topFeatured: Product[] = [];
  topBestSellers: Product[] = [];
  topHotSales: Product[] = [];
  topBlogProducts: Product[] = [];

  constructor(
    private shopService: ShopService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  get hasTopProducts(): boolean {
    return this.topFeatured.length > 0 || this.topBestSellers.length > 0 || this.topHotSales.length > 0;
  }

  ngOnInit() {
    this.loadTopProducts();
    // Set a maximum loading timeout as fallback
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('Home: Maximum loading time exceeded, forcing load complete');
        this.isLoading = false;
      }
    }, 5000);
  }

  private loadTopProducts() {
    console.log('Home: Starting product data load');
    this.isLoading = true;
    
    this.shopService.getProductData().subscribe({
      next: (data) => {
        console.log('Home: Product data loaded successfully', data.products?.length);
        if (data?.products && data.products.length > 0) {
          this.topFeatured = data.products.filter(p => p.featured).slice(0, 4);
          this.topBestSellers = data.products.filter(p => p.bestSeller).slice(0, 4);
          this.topHotSales = data.products.filter(p => p.hotSale).slice(0, 4);

          const prioritized = data.products
            .map(p => ({
              product: p,
              score: (p.featured ? 3 : 0) + (p.bestSeller ? 2 : 0) + (p.hotSale ? 1 : 0)
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating || b.product.id - a.product.id)
            .map(item => item.product);

          this.topBlogProducts = (prioritized.length > 0 ? prioritized : data.products).slice(0, 3);
          this.isLoading = false;
          console.log('Home: Section counts', {
            featured: this.topFeatured.length,
            bestSellers: this.topBestSellers.length,
            hotSales: this.topHotSales.length,
            top3: this.topBlogProducts.length
          });
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
          console.log('Home: Data processing completed, isLoading set to false');
        } else {
          console.warn('Home: No products found in data');
          this.isLoading = false;
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        }
      },
      error: (error) => {
        console.error('Home: Error loading products:', error);
        if (!this.hasRetriedLoad) {
          this.hasRetriedLoad = true;
          console.log('Home: Retrying product load in 600ms');
          setTimeout(() => this.loadTopProducts(), 600);
          return;
        }

        console.log('Home: Max retries reached, setting loading to false');
        this.isLoading = false;
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }
}
