# WGB BEAUTY - COMPLETE SITE FLOW MAP

## PUBLIC PAGES (No Auth Required)

### 1. HOME (/)
- Hero CTA → /booking
- Services Section → /services
- Products Section → /shop
- Book Now CTA → /booking

### 2. SERVICES (/services)
- Service Grid → /services/[id]
- Book Button → /book/[serviceId] (requires auth)

### 3. SERVICE DETAIL (/services/[id])
- Back Link → /services
- Book Button → /booking (requires auth)

### 4. SHOP (/shop)
- Product Grid → /shop/[id]

### 5. PRODUCT DETAIL (/shop/[id])
- Back Link → /shop
- Add to Cart → Updates cart count
- Continue Shopping → /shop

---

## AUTH-REQUIRED PAGES

### 6. CART (/cart)
**Auth Check:** Redirects to /auth/login?redirect=/cart
- Continue Shopping → /shop
- Checkout Button → /checkout
- Remove Items → Updates cart

### 7. CHECKOUT (/checkout)
**Auth Check:** Redirects to /auth/login?redirect=/checkout
**Cart Check:** Redirects to /cart if empty
- Paystack Integration → External payment
- After Payment → /checkout/verify?reference=xxx

### 8. PAYMENT VERIFICATION (/checkout/verify)
**Auto-redirect:** /orders (3 seconds)
- View Order → /orders
- Try Again → /cart
- Continue Shopping → /shop

### 9. ORDERS (/orders)
**Auth Check:** Redirects to /auth/login?redirect=/orders
- Shop Now → /shop (if no orders)

### 10. BOOKING (/booking)
**Auth Check:** Redirects to /auth/login?redirect=/booking
- Browse Services → /services
- Service Details → /services/[id]

### 11. BOOK SERVICE (/book/[serviceId])
**Auth Check:** Redirects to /auth/login?redirect=/book/[serviceId]
- Back to Services → /services
- View Bookings → /booking
- Success → /booking

---

## AUTHENTICATION FLOWS

### 12. LOGIN (/auth/login)
- Success → redirect param OR home
- Forgot Password → /auth/forgot-password
- Register → /auth/register
- Back → /

### 13. REGISTER (/auth/register)
- Success → redirect OR home
- Terms → /terms (MISSING PAGE)
- Privacy → /privacy (MISSING PAGE)
- Login → /auth/login
- Back → /

### 14. OTP REQUEST (/auth/otp/request)
- Submit → /auth/otp/verify
- Login → /auth/login

### 15. OTP VERIFY (/auth/otp/verify)
- Email Verify → /auth/login?message=verified
- Password Reset → /auth/reset-password?verified=true
- Phone Verify → /
- Resend → /auth/otp/request
- Login → /auth/login

### 16. FORGOT PASSWORD (/auth/forgot-password)
**Status:** MISSING PAGE (referenced but not created)

### 17. RESET PASSWORD (/auth/reset-password)
**Status:** MISSING PAGE (referenced but not created)

---

## ADMIN PAGES (Admin Role Required)

### 18. ADMIN DASHBOARD (/admin)
- Bookings → /admin/bookings
- Quick Actions → Various admin routes

### 19. ADMIN SERVICES (/admin/services)
- Create Service → /admin/services/new
- Edit Service → /admin/services/[id]/edit (MISSING)

### 20. ADMIN NEW SERVICE (/admin/services/new)
- Cancel → /admin/services
- Success → /admin/services

### 21. ADMIN PRODUCTS (/admin/products)
- Create Product → /admin/products/new
- Edit Product → /admin/products/[id]/edit (MISSING)

### 22. ADMIN NEW PRODUCT (/admin/products/new)
- Success → /admin/products

### 23. ADMIN BOOKINGS (/admin/bookings)
**Status:** REFERENCED but page not found in search

### 24. ADMIN NOTIFICATIONS (/admin/notifications)
**Status:** REFERENCED but structure unclear

---

## NAVIGATION COMPONENTS

### Header Navigation (All Pages)
- HOME → /
- SERVICES → /services
- STORE → /shop
- BOOKING → /booking
- ADMIN → /admin (if admin)
- Cart Icon → /cart
- Login/Profile → /auth/login or Profile Menu
- Sign Out → / (after logout)

### Footer Navigation (All Pages)
- Home → /
- Services → /services
- Store → /shop
- Booking → /booking
- Orders → /orders

---

## CRITICAL ISSUES TO FIX

### Missing Pages:
1. /terms - Referenced in register
2. /privacy - Referenced in register
3. /auth/forgot-password - Referenced in login
4. /auth/reset-password - Referenced in OTP verify
5. /admin/services/[id]/edit - Edit functionality incomplete
6. /admin/products/[id]/edit - Edit functionality incomplete

### Navigation Issues:
1. /booking page shows all bookings but /book/[serviceId] is for creating new bookings - CONFUSING
2. No direct "Create Booking" button on /booking page
3. Service detail page "Book Button" goes to /booking instead of /book/[serviceId]

### Auth Flow Issues:
1. Redirect chain complexity (multiple ?redirect params)
2. No unified booking creation entry point

---

## RECOMMENDED FIXES

### Fix 1: Unify Booking Flow
**Change:** /services/[id] "Book Now" → /book/[serviceId] (direct)
**Change:** /booking page "Book Service" button → /services (to select service first)

### Fix 2: Create Missing Pages
- /terms
- /privacy  
- /auth/forgot-password
- /auth/reset-password
- /admin/services/[id]/edit
- /admin/products/[id]/edit

### Fix 3: Navigation Clarity
**Change:** Rename /booking to /my-bookings
**Keep:** /book/[serviceId] for creating bookings
**Update:** All navigation references

### Fix 4: Service Detail Flow
**Current:** Service Detail → /booking
**Fix:** Service Detail → /book/[serviceId]
