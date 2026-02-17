import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-shop-details',
  imports: [CommonModule, Header, Footer, RouterLink],
  templateUrl: './shop-details.html',
  styleUrl: './shop-details.scss',
})
export class ShopDetails implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedQuantity: number = 1;
  selectedSize: string = '';
  selectedColor: string = '';
  isLoading: boolean = true;
  productNotFound: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get product ID from route and subscribe to route changes
    this.route.params.subscribe(params => {
      const productId = Number(params['id']);
      if (productId) {
        this.isLoading = true;
        this.productNotFound = false;
        this.loadProduct(productId);
        // Scroll to top when product changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
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
      this.productService.getProductsByIds(this.product.relatedProducts).subscribe(products => {
        this.relatedProducts = products.slice(0, 4);
      });
    }
  }

  // Get star array for ratings
  getStarArray(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  // Add to cart
  addToCart() {
    if (this.product) {
      this.productService.addToCart(this.product, this.selectedQuantity);
      alert(`${this.product.name} added to cart!`);
    }
  }

  // Quantity controls
  increaseQuantity() {
    this.selectedQuantity++;
  }

  decreaseQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }
}
