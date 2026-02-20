import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ShopService } from '../../services/shop.service';
import { Product, ProductData } from '../../models/shop.model';

@Component({
  selector: 'app-private-json',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './private-json.html',
  styleUrl: './private-json.scss',
})
export class PrivateJson implements OnInit, OnDestroy {
  isLoading = true;
  loadError = '';
  data: ProductData | null = null;
  products: Product[] = [];
  showRaw = false;
  private destroy$ = new Subject<void>();

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.shopService
      .getProductData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.data = this.cloneData(data);
          this.products = this.data.products;
          this.isLoading = false;
        },
        error: (error) => {
          this.loadError = String(error ?? 'Failed to load data');
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleRaw(): void {
    this.showRaw = !this.showRaw;
  }

  addProduct(): void {
    const nextId = this.getNextId();
    const product: Product = {
      id: nextId,
      uuid: this.generateUuid(),
      sku: String(3812900 + nextId),
      name: 'New Product',
      slug: 'new-product-' + nextId,
      description: '',
      shortDescription: '',
      price: 0,
      originalPrice: 0,
      sale: false,
      salePercentage: 0,
      brand: 'gucci',
      categoryId: ['clothing'],
      tags: ['Product'],
      images: ['assets/theme/img/product/product-1.jpg'],
      thumbnail: 'assets/theme/img/product/product-1.jpg',
      colors: ['color-1'],
      sizes: ['m'],
      rating: 0,
      reviewCount: 0,
      stock: 0,
      featured: false,
      newArrival: false,
      hotSale: false,
      bestSeller: false,
      material: '',
      additionalInfo: '',
      relatedProducts: [],
    };

    this.products = [...this.products, product];
    this.syncProducts();
  }

  removeProduct(index: number): void {
    this.products = this.products.filter((_, i) => i !== index);
    this.syncProducts();
  }

  updateArrayField(
    product: Product,
    field: 'categoryId' | 'tags' | 'images' | 'colors' | 'sizes' | 'relatedProducts',
    value: string
  ): void {
    if (field === 'relatedProducts') {
      product.relatedProducts = value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item));
      return;
    }

    const list = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    product[field] = list as Product[typeof field];
  }

  getArrayField(product: Product, field: 'categoryId' | 'tags' | 'images' | 'colors' | 'sizes'): string {
    return product[field].join(', ');
  }

  getRelatedField(product: Product): string {
    return product.relatedProducts.join(', ');
  }

  exportJson(): void {
    if (!this.data) {
      return;
    }
    const content = JSON.stringify(this.data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shop.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  copyJson(): void {
    if (!this.data) {
      return;
    }
    const content = JSON.stringify(this.data, null, 2);
    void navigator.clipboard?.writeText(content);
  }

  private syncProducts(): void {
    if (!this.data) {
      return;
    }
    this.data = {
      ...this.data,
      products: [...this.products],
    };
  }

  private getNextId(): number {
    if (!this.products.length) {
      return 1;
    }
    return Math.max(...this.products.map((p) => p.id)) + 1;
  }

  private cloneData(data: ProductData): ProductData {
    return JSON.parse(JSON.stringify(data)) as ProductData;
  }

  private generateUuid(): string {
    const bytes = crypto?.getRandomValues?.(new Uint8Array(16));
    if (!bytes) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const rand = Math.floor(Math.random() * 16);
        const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
        return value.toString(16);
      });
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    const hex = Array.from(bytes, toHex).join('');
    return (
      hex.slice(0, 8) +
      '-' +
      hex.slice(8, 12) +
      '-' +
      hex.slice(12, 16) +
      '-' +
      hex.slice(16, 20) +
      '-' +
      hex.slice(20)
    );
  }
}
