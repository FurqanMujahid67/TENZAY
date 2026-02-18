import { Component, OnInit } from '@angular/core';
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
  topFeatured: Product[] = [];
  topBestSellers: Product[] = [];
  topHotSales: Product[] = [];
  topBlogProducts: Product[] = [];

  constructor(private shopService: ShopService) {}

  ngOnInit() {
    this.shopService.getProductData().subscribe({
      next: (data) => {
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
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
