# Dynamic Image Loading in Angular SPA

## The Problem

In traditional websites, every navigation causes a full page reload, which triggers all jQuery/JavaScript initialization scripts including background image setters. However, Angular is a Single Page Application (SPA) where:

1. **Initial Load**: Page loads once, all scripts run, images load correctly
2. **Route Changes**: Angular updates DOM without full page reload
3. **Dynamic Content**: New content appears but jQuery scripts don't re-run
4. **Result**: Images with `data-setbg` attribute don't load on dynamic content

## The Solution

### Use Angular Property Binding Instead of jQuery Scripts

**❌ Old Approach (Theme's jQuery):**
```html
<div class="product__item__pic set-bg" data-setbg="assets/img/product-1.jpg"></div>
```
- Relies on jQuery script to process `data-setbg` attribute
- Only runs on initial page load
- Fails when DOM updates dynamically

**✅ New Approach (Angular Property Binding):**
```html
<div class="product__item__pic set-bg" 
     [style.background-image]="'url(' + product.thumbnail + ')'"
     [style.background-size]="'cover'"
     [style.background-position]="'center center'"
     [style.background-repeat]="'no-repeat'">
</div>
```
- Uses Angular's reactive property binding
- Automatically updates when data changes
- Works with filters, sorting, pagination
- No page refresh needed

## Implementation Examples

### 1. Shop Page - Product Grid
**File:** `src/app/pages/shop/shop.html`

```html
<div *ngFor="let product of displayedProducts" class="col-lg-4 col-md-6">
    <div class="product__item" [class.sale]="product.sale">
        <div class="product__item__pic set-bg" 
             [style.background-image]="'url(' + product.thumbnail + ')'"
             [style.background-size]="'cover'"
             [style.background-position]="'center center'"
             [style.background-repeat]="'no-repeat'">
            <span *ngIf="product.sale" class="label">Sale</span>
        </div>
        <div class="product__item__text">
            <h6>{{ product.name }}</h6>
            <h5>${{ product.price.toFixed(2) }}</h5>
        </div>
    </div>
</div>
```

### 2. Shop Details Page - Product Images
**File:** `src/app/pages/shop-details/shop-details.html`

```html
<!-- Thumbnail navigation -->
<ul class="nav nav-tabs" role="tablist">
    <li class="nav-item" *ngFor="let img of product?.images || []; let i = index">
        <a class="nav-link" [class.active]="i === 0">
            <div class="product__thumb__pic set-bg" 
                 [style.background-image]="'url(' + img + ')'"
                 [style.background-size]="'cover'"
                 [style.background-position]="'center center'"
                 [style.background-repeat]="'no-repeat'">
            </div>
        </a>
    </li>
</ul>

<!-- Main product images -->
<div class="tab-content">
    <div *ngFor="let img of product?.images || []; let i = index" 
         class="tab-pane" 
         [class.active]="i === 0">
        <div class="product__details__pic__item">
            <img [src]="img" [alt]="product?.name">
        </div>
    </div>
</div>
```

### 3. Related Products - Dynamic Loading
```html
<div *ngFor="let relatedProduct of relatedProducts" class="col-lg-3">
    <div class="product__item">
        <div class="product__item__pic set-bg" 
             [style.background-image]="'url(' + relatedProduct.thumbnail + ')'"
             [style.background-size]="'cover'"
             [style.background-position]="'center center'"
             [style.background-repeat]="'no-repeat'">
        </div>
        <div class="product__item__text">
            <h6>
                <a [routerLink]="['/shop-details', relatedProduct.id]">
                    {{ relatedProduct.name }}
                </a>
            </h6>
        </div>
    </div>
</div>
```

## Why This Works

### 1. **Reactive Updates**
Angular's change detection automatically updates the `style.background-image` whenever the data changes:
- Filtering products
- Sorting products
- Pagination
- Loading new product details

### 2. **No Script Dependency**
Doesn't rely on external jQuery scripts that only run once. Angular handles everything reactively.

### 3. **Performance**
- No need to re-run jQuery selectors
- Direct DOM manipulation by Angular
- Optimal change detection

### 4. **Type Safety**
TypeScript ensures image paths are correct at compile time.

## Best Practices

### 1. Always Use Property Binding for Dynamic Content

**✅ Do:**
```html
<div [style.background-image]="'url(' + product.thumbnail + ')'"></div>
```

**❌ Don't:**
```html
<div data-setbg="{{ product.thumbnail }}"></div>
```

### 2. Handle Missing Images Gracefully

```html
<div class="product__item__pic set-bg" 
     [style.background-image]="product?.thumbnail ? 'url(' + product.thumbnail + ')' : 'url(assets/img/placeholder.jpg)'"
     [style.background-size]="'cover'"
     [style.background-position]="'center center'"
     [style.background-repeat]="'no-repeat'">
</div>
```

### 3. Use Angular's Safe Navigation Operator

```html
<img [src]="product?.thumbnail" [alt]="product?.name || 'Product image'">
```

### 4. Preload Images for Better UX

In your component:
```typescript
ngOnInit() {
  this.loadProducts();
  this.preloadImages();
}

private preloadImages() {
  this.products.forEach(product => {
    const img = new Image();
    img.src = product.thumbnail;
  });
}
```

### 5. Add Loading States

```html
<div class="product__item__pic" 
     [class.loading]="!imageLoaded"
     [style.background-image]="'url(' + product.thumbnail + ')'"
     (load)="imageLoaded = true">
    <div *ngIf="!imageLoaded" class="spinner"></div>
</div>
```

## Static Content vs Dynamic Content

### Static Content (Can use data-setbg)
Content that never changes can still use the theme's jQuery approach:
- Hero banners
- About page images
- Footer images
- Static testimonials

```html
<div class="hero__items set-bg" data-setbg="assets/img/hero-1.jpg"></div>
```

### Dynamic Content (Must use Angular binding)
Content that changes based on user interaction or route changes:
- Product listings
- Filtered results
- Sorted results
- Paginated results
- Product detail images
- Related products

```html
<div [style.background-image]="'url(' + dynamicImage + ')'"></div>
```

## Troubleshooting

### Images not loading after filter

**Problem:** Applied filters but product images show as blank
**Solution:** Check if you're using Angular property binding instead of `data-setbg`

### Images load on first page but not after navigation

**Problem:** Images load initially but disappear when navigating between products
**Solution:** Ensure route parameter changes trigger data reload:

```typescript
ngOnInit() {
  this.route.params.subscribe(params => {
    const id = Number(params['id']);
    this.loadProduct(id);
  });
}
```

### Background image not covering full area

**Problem:** Image appears but doesn't fill the container
**Solution:** Add all necessary CSS properties:

```html
[style.background-image]="'url(' + img + ')'"
[style.background-size]="'cover'"
[style.background-position]="'center center'"
[style.background-repeat]="'no-repeat'"
```

### Images flickering on update

**Problem:** Images flash or flicker when data updates
**Solution:** Use `trackBy` function with `*ngFor`:

```typescript
trackByProductId(index: number, product: Product): number {
  return product.id;
}
```

```html
<div *ngFor="let product of products; trackBy: trackByProductId">
  <!-- content -->
</div>
```

## Performance Tips

### 1. Lazy Load Images
```typescript
<img [src]="product.thumbnail" loading="lazy" [alt]="product.name">
```

### 2. Use Appropriate Image Sizes
- Thumbnail: 400x400px
- Product detail: 800x800px
- Hero images: 1920x800px

### 3. Optimize Image Format
- Use WebP with JPG fallback
- Compress images (TinyPNG, ImageOptim)
- Target < 200KB per image

### 4. Cache Images
Enable browser caching in your server configuration:
```
Cache-Control: public, max-age=31536000
```

## Migration Checklist

When converting theme templates to Angular:

- [ ] Identify all elements with `data-setbg` attribute
- [ ] Check if content is static or dynamic
- [ ] For dynamic content, replace with Angular property binding
- [ ] Test filtering, sorting, and pagination
- [ ] Verify images load on route changes
- [ ] Add loading states if needed
- [ ] Optimize image sizes
- [ ] Test on slow network connections
- [ ] Verify no console errors
- [ ] Check mobile responsiveness

## Summary

| Aspect | jQuery approach | Angular approach |
|--------|----------------|------------------|
| **Initial Load** | ✅ Works | ✅ Works |
| **After Filter** | ❌ Fails | ✅ Works |
| **After Sort** | ❌ Fails | ✅ Works |
| **After Pagination** | ❌ Fails | ✅ Works |
| **Route Change** | ❌ Fails | ✅ Works |
| **Performance** | Slower (DOM scan) | Faster (direct binding) |
| **Type Safety** | ❌ No | ✅ Yes |
| **Maintenance** | Harder | Easier |

**Recommendation:** Always use Angular property binding for any content that can change without a full page reload.
