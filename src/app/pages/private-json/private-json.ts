import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ShopService } from '../../services/shop.service';
import { Brand, Category, Color, PriceRange, Product, ProductData } from '../../models/shop.model';

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
  categories: Category[] = [];
  brands: Brand[] = [];
  sizes: string[] = [];
  colors: Color[] = [];
  tags: string[] = [];
  priceRanges: PriceRange[] = [];
  showRaw = false;
  expandedProductId: number | null = null;
  searchTerm = '';
  saveMessage = '';
  private readonly STORAGE_KEY = 'private-json-draft';
  private destroy$ = new Subject<void>();

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.shopService
      .getProductData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const draft = this.loadDraft();
          this.data = draft ?? this.cloneData(data);
          this.products = this.data.products;
          this.categories = this.data.categories;
          this.brands = this.data.brands;
          this.sizes = this.data.sizes;
          this.colors = this.data.colors;
          this.tags = this.data.tags;
          this.priceRanges = this.data.priceRanges;
          this.products.forEach((product) => this.ensureProductDefaults(product));
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

  toggleProduct(product: Product): void {
    if (this.expandedProductId === product.id) {
      this.expandedProductId = null;
      return;
    }
    this.expandedProductId = product.id;
  }

  isProductExpanded(product: Product): boolean {
    return this.expandedProductId === product.id;
  }

  isSelected(list: Array<string | number>, value: string | number): boolean {
    return list.includes(value);
  }

  toggleArraySelection(
    product: Product,
    field: 'categoryId' | 'tags' | 'colors' | 'sizes',
    value: string,
    checked: boolean
  ): void {
    const list = product[field];
    if (checked) {
      if (!list.includes(value)) {
        list.push(value);
      }
      return;
    }
    product[field] = list.filter((item) => item !== value) as Product[typeof field];
  }

  toggleRelatedProduct(product: Product, value: number, checked: boolean): void {
    if (checked) {
      if (!product.relatedProducts.includes(value)) {
        product.relatedProducts.push(value);
      }
      return;
    }
    product.relatedProducts = product.relatedProducts.filter((item) => item !== value);
  }

  getFilteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.products;
    }
    return this.products.filter((product) => this.matchesProduct(product, term));
  }

  addProduct(): void {
    if (!this.data) {
      return;
    }
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
      images: [],
      thumbnail: '',
      thumbnails: [],
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
      videoUrl: '',
      detailedDescription: {
        productsInfo: '',
        materialUsed: '',
      },
      relatedProducts: [],
    };

    this.products.unshift(product);
    this.searchTerm = '';
    this.expandedProductId = product.id;
  }

  removeProduct(index: number): void {
    if (!this.data) {
      return;
    }
    this.products.splice(index, 1);
  }

  addImage(product: Product): void {
    product.images.push('');
  }

  removeImage(product: Product, index: number): void {
    product.images.splice(index, 1);
  }

  addThumbnail(product: Product): void {
    if (!product.thumbnails) {
      product.thumbnails = [];
    }
    product.thumbnails.push('');
  }

  removeThumbnail(product: Product, index: number): void {
    product.thumbnails?.splice(index, 1);
  }

  onThumbnailUpload(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    this.convertToBase64(file, (dataUrl) => {
      product.thumbnail = dataUrl;
    });
  }

  onImageUpload(product: Product, index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    this.convertToBase64(file, (dataUrl) => {
      product.images[index] = dataUrl;
    });
  }

  onThumbnailsUpload(product: Product, index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    this.convertToBase64(file, (dataUrl) => {
      if (!product.thumbnails) {
        product.thumbnails = [];
      }
      product.thumbnails[index] = dataUrl;
    });
  }

  private convertToBase64(file: File, callback: (dataUrl: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  updateArrayField(
    product: Product,
    field: 'categoryId' | 'tags' | 'images' | 'thumbnails' | 'colors' | 'sizes' | 'relatedProducts',
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

    if (field === 'thumbnails') {
      product.thumbnails = list;
      return;
    }

    product[field] = list as Product[Exclude<typeof field, 'thumbnails'>];
  }

  getArrayField(
    product: Product,
    field: 'categoryId' | 'tags' | 'images' | 'thumbnails' | 'colors' | 'sizes'
  ): string {
    return (product[field] ?? []).join(', ');
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
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  copyJson(): void {
    if (!this.data) {
      return;
    }
    const content = JSON.stringify(this.data, null, 2);
    void navigator.clipboard?.writeText(content);
  }

  saveJson(): void {
    if (!this.data) {
      return;
    }
    if (typeof localStorage === 'undefined') {
      this.saveMessage = 'LocalStorage not available. Use Download to export.';
      return;
    }
    const content = JSON.stringify(this.data);
    localStorage.setItem(this.STORAGE_KEY, content);
    this.saveMessage = 'Saved locally. Use Download to export a file.';
  }

  private loadDraft(): ProductData | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const content = localStorage.getItem(this.STORAGE_KEY);
    if (!content) {
      return null;
    }
    try {
      return JSON.parse(content) as ProductData;
    } catch (error) {
      console.warn('Invalid saved draft', error);
      return null;
    }
  }

  addCategory(): void {
    if (!this.data) {
      return;
    }
    this.categories.unshift({ id: 'new-category', name: 'New Category', count: 0 });
  }

  removeCategory(index: number): void {
    if (!this.data) {
      return;
    }
    this.categories.splice(index, 1);
  }

  addBrand(): void {
    if (!this.data) {
      return;
    }
    this.brands.unshift({ id: 'new-brand', name: 'New Brand' });
  }

  removeBrand(index: number): void {
    if (!this.data) {
      return;
    }
    this.brands.splice(index, 1);
  }

  addColor(): void {
    if (!this.data) {
      return;
    }
    this.colors.unshift({ id: 'color-new', name: 'New Color', class: 'c-new', hex: '#000000' });
  }

  removeColor(index: number): void {
    if (!this.data) {
      return;
    }
    this.colors.splice(index, 1);
  }

  addPriceRange(): void {
    if (!this.data) {
      return;
    }
    this.priceRanges.unshift({ id: 'range-new', label: '$0.00 - $0.00', min: 0, max: 0 });
  }

  removePriceRange(index: number): void {
    if (!this.data) {
      return;
    }
    this.priceRanges.splice(index, 1);
  }

  addTag(): void {
    if (!this.data) {
      return;
    }
    this.tags.unshift('New Tag');
  }

  removeTag(index: number): void {
    if (!this.data) {
      return;
    }
    this.tags.splice(index, 1);
  }

  addSize(): void {
    if (!this.data) {
      return;
    }
    this.sizes.unshift('new-size');
  }

  removeSize(index: number): void {
    if (!this.data) {
      return;
    }
    this.sizes.splice(index, 1);
  }

  updateDetailedDescription(
    product: Product,
    field: 'productsInfo' | 'materialUsed',
    value: string
  ): void {
    if (!product.detailedDescription) {
      product.detailedDescription = {
        productsInfo: '',
        materialUsed: '',
      };
    }
    product.detailedDescription[field] = value;
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

  private ensureProductDefaults(product: Product): void {
    product.images = product.images ?? [];
    product.thumbnails = product.thumbnails ?? [];
    product.categoryId = product.categoryId ?? [];
    product.tags = product.tags ?? [];
    product.colors = product.colors ?? [];
    product.sizes = product.sizes ?? [];
    product.relatedProducts = product.relatedProducts ?? [];
    product.description = product.description ?? '';
    product.shortDescription = product.shortDescription ?? '';
    product.material = product.material ?? '';
    product.additionalInfo = product.additionalInfo ?? '';
    product.videoUrl = product.videoUrl ?? '';
    product.slug = product.slug ?? '';
    product.sku = product.sku ?? '';
    product.uuid = product.uuid ?? '';
    product.thumbnail = product.thumbnail ?? '';
    product.detailedDescription = product.detailedDescription ?? {
      productsInfo: '',
      materialUsed: '',
    };
  }

  private matchesProduct(product: Product, term: string): boolean {
    const brandName = this.brands.find((brand) => brand.id === product.brand)?.name ?? '';
    const categoryNames = product.categoryId
      .map((categoryId) => this.categories.find((cat) => cat.id === categoryId)?.name ?? '')
      .join(' ');

    const haystack = [
      product.name,
      product.slug,
      product.sku,
      product.uuid,
      product.brand,
      brandName,
      product.shortDescription,
      product.description,
      product.material,
      product.additionalInfo,
      product.videoUrl ?? '',
      product.tags.join(' '),
      product.categoryId.join(' '),
      categoryNames,
      product.colors.join(' '),
      product.sizes.join(' '),
      product.relatedProducts.join(' '),
      String(product.price),
      String(product.originalPrice),
    ]
      .filter((value) => value && value.length > 0)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
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
