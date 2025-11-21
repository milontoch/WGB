# E-Commerce Module Documentation

## Overview

Complete e-commerce system with product catalog, shopping cart, checkout, payment processing via Paystack, and order management.

## Features Implemented

### Customer-Facing Features

1. **Product Catalog** (`/shop`)

   - Grid layout with product cards
   - Product images, names, prices
   - Discount badges and pricing
   - Stock availability indicators
   - Responsive design (1/2/3/4 columns)

2. **Product Detail Page** (`/shop/[id]`)

   - Full product information
   - Image display with discount badges
   - Price and stock status
   - Customer reviews with star ratings
   - Add to cart with quantity selection
   - Buy Now quick checkout

3. **Shopping Cart** (`/cart`)

   - View all cart items with images
   - Quantity adjustment (+ / -)
   - Remove items
   - Real-time price calculations
   - Subtotal, discount, and total display
   - Low stock warnings
   - Proceed to checkout button

4. **Checkout** (`/checkout`)

   - Customer information form (name, email, phone)
   - Shipping address form
   - Pickup option (Asaba location)
   - Order summary sidebar
   - Paystack payment integration
   - Automatic redirect to payment gateway

5. **Payment Verification** (`/checkout/verify`)

   - Verifies Paystack payment status
   - Creates order in database
   - Updates product stock
   - Clears user cart
   - Sends order confirmation email
   - Success/failure handling

6. **Order History** (`/orders`)
   - View all past orders
   - Order details (items, totals, status)
   - Payment and order status badges
   - Expandable order items
   - Delivery/pickup information

### Admin Features

1. **Product Management** (`/admin/products`)

   - View all products in table format
   - Product images, SKU, category
   - Price display (with discount)
   - Stock level indicators
   - Active/inactive toggle
   - Edit and delete products
   - Add new products

2. **Add Product** (`/admin/products/new`)
   - Product name and description
   - Price and discount price
   - Stock quantity
   - SKU (optional)
   - Category selection
   - Image URL
   - Form validation

## Database Schema

### Products Table

```sql
- id (uuid, primary key)
- name (text)
- description (text)
- price (numeric)
- discount_price (numeric, nullable)
- stock (integer)
- sku (text, nullable)
- image_url (text, nullable)
- category (text, nullable)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### Cart Table

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- product_id (uuid, foreign key to products)
- quantity (integer)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE constraint on (user_id, product_id)
```

### Orders Table

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- total_amount (numeric)
- subtotal (numeric)
- discount_amount (numeric)
- payment_status (text)
- payment_reference (text, nullable)
- order_status (text, default 'pending')
- is_pickup (boolean, default false)
- customer_name (text)
- customer_email (text)
- customer_phone (text)
- shipping_address (text, nullable)
- shipping_city (text, nullable)
- shipping_state (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### Order Items Table

```sql
- id (uuid, primary key)
- order_id (uuid, foreign key to orders)
- product_id (uuid, foreign key to products)
- product_name (text)
- product_sku (text, nullable)
- quantity (integer)
- unit_price (numeric)
- total_price (numeric)
- created_at (timestamp)
```

### Reviews Table

```sql
- id (uuid, primary key)
- product_id (uuid, foreign key to products)
- user_id (uuid, foreign key to profiles)
- rating (integer, 1-5)
- comment (text, nullable)
- is_approved (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

## API Endpoints

### Public Endpoints

- `GET /api/products` - List all active products (optional category filter)
- `GET /api/products/[id]` - Get product details with reviews

### Authenticated Endpoints

- `GET /api/cart` - Get user's cart with totals
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/[id]` - Update cart item quantity
- `DELETE /api/cart/[id]` - Remove cart item
- `POST /api/payment/initialize` - Initialize Paystack payment
- `GET /api/payment/verify?reference=` - Verify payment and create order
- `GET /api/orders` - Get user's order history

### Admin Endpoints

- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create new product
- `PATCH /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

## Payment Integration (Paystack)

### Environment Variables Required

```env
PAYSTACK_SECRET_KEY=sk_test_... or sk_live_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (or production URL)
```

### Payment Flow

1. User fills checkout form
2. POST to `/api/payment/initialize` with shipping details
3. Paystack returns `authorization_url`
4. User redirected to Paystack payment page
5. After payment, Paystack redirects to `/checkout/verify?reference=xxx`
6. Verify endpoint checks payment status
7. Order created, stock updated, cart cleared
8. Order confirmation email sent

## Email Notifications

Order confirmation emails are sent via Gmail SMTP (configured in `email-service.ts`):

- Order ID and date
- Customer details
- Order items table with quantities and prices
- Subtotal, discount, and total
- Delivery or pickup information
- Branded HTML template with pink gradient theme

## Components Created

### UI Components

- `ProductCard` - Reusable product display card
- `AddToCartButton` - Add to cart with quantity selector
- `ProductReviews` - Display product reviews and ratings

### Pages

- `/shop` - Product listing
- `/shop/[id]` - Product detail
- `/cart` - Shopping cart
- `/checkout` - Checkout form
- `/checkout/verify` - Payment verification
- `/orders` - Order history
- `/admin/products` - Admin product list
- `/admin/products/new` - Add product form

## Security Features

### Row Level Security (RLS) Policies

- **Products**: Public can view active products, authenticated users can view all
- **Cart**: Users can only access their own cart items
- **Orders**: Users can only view their own orders
- **Reviews**: Public can view approved reviews, users can create reviews

### Authentication

- All cart and checkout endpoints require authentication
- Admin endpoints require authenticated admin user
- Payment verification includes user validation

## Testing Checklist

### Customer Flow

- [ ] Browse products on `/shop`
- [ ] Click product to view details
- [ ] Add product to cart
- [ ] View cart and adjust quantities
- [ ] Remove items from cart
- [ ] Proceed to checkout
- [ ] Fill shipping information
- [ ] Test pickup option
- [ ] Complete Paystack payment (test mode)
- [ ] Verify payment and order creation
- [ ] Check email for order confirmation
- [ ] View order in `/orders` history

### Admin Flow

- [ ] View products in `/admin/products`
- [ ] Add new product
- [ ] Toggle product active/inactive
- [ ] Edit product (when edit page created)
- [ ] Delete product
- [ ] Verify stock updates after orders

### Edge Cases

- [ ] Out of stock products
- [ ] Low stock warnings
- [ ] Cart with removed products
- [ ] Failed payments
- [ ] Invalid payment references
- [ ] Empty cart checkout attempt

## Future Enhancements

1. **Product Management**

   - Edit product page
   - Bulk import/export
   - Image upload (currently URL-based)
   - Multiple product images
   - Product variants (size, color)

2. **Order Management**

   - Admin order view and management
   - Order status updates
   - Shipping tracking
   - Invoice generation
   - Refund handling

3. **Customer Features**

   - Product search and filters
   - Category browsing
   - Product comparisons
   - Wishlist functionality
   - Review submission (currently view-only)

4. **Analytics**

   - Sales reports
   - Popular products
   - Revenue tracking
   - Customer insights

5. **Promotions**
   - Coupon codes
   - Flash sales
   - Bundle deals
   - Free shipping thresholds

## Maintenance Notes

- Product images are stored as URLs (consider CDN integration)
- Payment uses Paystack test mode (switch to live with proper key)
- Email SMTP configured for Gmail (verify sender authentication)
- Stock management is automatic on order creation
- Currency is Nigerian Naira (₦) throughout
