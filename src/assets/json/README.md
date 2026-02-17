# Products JSON Structure Documentation

## Overview
This JSON file contains all product data for the TENZAY e-commerce platform. It's configured as a public asset in `angular.json` and can be accessed at runtime via HTTP requests.

## File Location
- **Source**: `/src/assets/json/products.json`
- **Public URL**: `assets/json/products.json`

## Access in Angular
```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) {}

getProducts() {
  return this.http.get<ProductData>('assets/json/products.json');
}
```

## JSON Structure

### 1. Categories
Array of product categories with count tracking.

```json
{
  "id": "string",          // Unique identifier (kebab-case)
  "name": "string",        // Display name
  "count": number          // Number of products in category
}
```

**Available Categories:**
- Men, Women, Bags, Clothing, Shoes, Accessories, Kids, Perfumes

### 2. Brands
Array of available brands.

```json
{
  "id": "string",          // Unique identifier (kebab-case)
  "name": "string"         // Display name
}
```

**Available Brands:**
- Louis Vuitton, Chanel, Hermes, Gucci

### 3. Sizes
Simple array of available sizes: `["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "4xl"]`

For shoes, use numeric sizes: `["39", "40", "41", "42", "43", "44"]`

### 4. Colors
Array of color options with CSS classes and hex values.

```json
{
  "id": "string",          // Unique identifier
  "name": "string",        // Color name
  "class": "string",       // CSS class (c-1 to c-9)
  "hex": "string"          // Hex color code
}
```

**Available Colors:**
White, Black, Grey, Red, Blue, Green, Yellow, Pink, Brown

### 5. Tags
Simple array of product tags: `["Product", "Bags", "Shoes", "Fashion", "Clothing", "Hats", "Accessories", "New", "Sale", "Trending"]`

### 6. Price Ranges
Array of price range filters for shop sidebar.

```json
{
  "id": "string",
  "label": "string",       // Display label
  "min": number,           // Minimum price
  "max": number            // Maximum price
}
```

### 7. Products
Main product array with comprehensive details.

#### Product Object Structure

```json
{
  "id": number,                      // Unique product ID
  "sku": "string",                   // Stock Keeping Unit
  "name": "string",                  // Product name
  "slug": "string",                  // URL-friendly slug
  "description": "string",           // Full description
  "shortDescription": "string",      // Brief description
  "price": number,                   // Current price
  "originalPrice": number,           // Original price (before discount)
  "sale": boolean,                   // Is product on sale?
  "salePercentage": number,          // Discount percentage
  "brand": "string",                 // Brand ID (from brands array)
  "categoryId": ["string"],          // Array of category IDs
  "tags": ["string"],                // Array of tags
  "images": ["string"],              // Array of image paths
  "thumbnail": "string",             // Main thumbnail image
  "thumbnails": ["string"],          // Optional: Multiple thumbnails
  "colors": ["string"],              // Array of color IDs
  "sizes": ["string"],               // Array of available sizes
  "rating": number,                  // Rating (0-5)
  "reviewCount": number,             // Number of reviews
  "stock": number,                   // Available quantity
  "featured": boolean,               // Featured product?
  "newArrival": boolean,             // New arrival?
  "hotSale": boolean,                // Hot sale item?
  "bestSeller": boolean,             // Best seller?
  "material": "string",              // Material description
  "additionalInfo": "string",        // Care instructions, etc.
  "videoUrl": "string",              // Optional: Product video URL
  "detailedDescription": {           // Optional: Extended descriptions
    "productsInfo": "string",
    "materialUsed": "string"
  },
  "relatedProducts": [number]        // Array of related product IDs
}
```

## Product Flags and Filters

### Home Page Categories
Products can be filtered using these flags:
- **bestSeller**: true → Shows in "Best Sellers" tab
- **newArrival**: true → Shows in "New Arrivals" tab
- **hotSale**: true → Shows in "Hot Sales" tab

### Sale Products
- `sale: true` → Display "Sale" badge
- `salePercentage` → Calculate from originalPrice vs price
- Both shop and home pages show sale badge

### Product Images
- **Single image**: Use `images` array with one item
- **Multiple images**: Add multiple paths to `images` array
- **Shop Details**: Use `thumbnails` array for gallery navigation
- **Video**: Add `videoUrl` for products with video content

## Usage Examples

### 1. Filter Products by Category
```typescript
const menProducts = products.filter(p => 
  p.categoryId.includes('men')
);
```

### 2. Get Sale Products
```typescript
const saleProducts = products.filter(p => p.sale === true);
```

### 3. Search Products
```typescript
const searchResults = products.filter(p =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
);
```

### 4. Sort by Price
```typescript
// Low to High
const sorted = [...products].sort((a, b) => a.price - b.price);

// High to Low
const sorted = [...products].sort((a, b) => b.price - a.price);
```

### 5. Filter by Price Range
```typescript
const filtered = products.filter(p =>
  p.price >= minPrice && p.price <= maxPrice
);
```

### 6. Filter by Brand
```typescript
const gucciProducts = products.filter(p => p.brand === 'gucci');
```

### 7. Filter by Size
```typescript
const xlProducts = products.filter(p => p.sizes.includes('xl'));
```

### 8. Filter by Color
```typescript
const blackProducts = products.filter(p => 
  p.colors.includes('color-2') // color-2 is black
);
```

### 9. Get Related Products
```typescript
const product = products.find(p => p.id === 12);
const related = products.filter(p => 
  product.relatedProducts.includes(p.id)
);
```

### 10. Pagination
```typescript
const itemsPerPage = 12;
const page = 1;
const startIndex = (page - 1) * itemsPerPage;
const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);
```

## Adding New Products

### For Regular Products
```json
{
  "id": 15,
  "sku": "3812915",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Full product description",
  "shortDescription": "Brief description",
  "price": 99.99,
  "originalPrice": 99.99,
  "sale": false,
  "salePercentage": 0,
  "brand": "gucci",
  "categoryId": ["clothing", "men"],
  "tags": ["Fashion", "Clothing"],
  "images": ["assets/theme/img/product/product-15.jpg"],
  "thumbnail": "assets/theme/img/product/product-15.jpg",
  "colors": ["color-1", "color-2", "color-3"],
  "sizes": ["s", "m", "l", "xl"],
  "rating": 0,
  "reviewCount": 0,
  "stock": 50,
  "featured": false,
  "newArrival": true,
  "hotSale": false,
  "bestSeller": false,
  "material": "Material description",
  "additionalInfo": "Care instructions",
  "relatedProducts": [1, 2, 3]
}
```

### For Perfumes (Future Products)
```json
{
  "id": 16,
  "sku": "3812916",
  "name": "Luxury Perfume",
  "slug": "luxury-perfume",
  "description": "Elegant fragrance with notes of...",
  "shortDescription": "Elegant luxury fragrance",
  "price": 150.00,
  "originalPrice": 150.00,
  "sale": false,
  "salePercentage": 0,
  "brand": "chanel",
  "categoryId": ["perfumes", "men", "women"],
  "tags": ["Perfumes", "Luxury", "New"],
  "images": ["assets/theme/img/perfumes/perfume-1.jpg"],
  "thumbnail": "assets/theme/img/perfumes/perfume-1.jpg",
  "colors": [],
  "sizes": ["50ml", "100ml", "150ml"],
  "rating": 0,
  "reviewCount": 0,
  "stock": 100,
  "featured": true,
  "newArrival": true,
  "hotSale": false,
  "bestSeller": false,
  "material": "Eau de Parfum",
  "additionalInfo": "Top notes: ..., Middle notes: ..., Base notes: ...",
  "relatedProducts": []
}
```

## Notes

1. **Image Paths**: All image paths are relative to the assets folder
2. **SKU Format**: Use format "38129XX" where XX is incremental
3. **Slug Generation**: Convert name to lowercase, replace spaces with hyphens
4. **Category IDs**: A product can belong to multiple categories
5. **Stock Management**: Update stock values when items are purchased
6. **Rating**: Values from 0-5, initially set to 0 for new products
7. **Related Products**: Add IDs of similar or complementary products
8. **Sale Calculation**: `salePercentage = ((originalPrice - price) / originalPrice) * 100`

## Maintenance

- Keep category counts updated when adding/removing products
- Ensure all image paths are valid
- Maintain consistent ID incrementing
- Update related products bidirectionally
- Regular stock inventory checks
