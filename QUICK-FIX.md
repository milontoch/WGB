# QUICK FIX CHECKLIST

## ✅ What You Need to Do NOW

### 1. Run This SQL Migration (CRITICAL)

Go to Supabase Dashboard → SQL Editor → Run this:

```sql
ALTER TABLE orders ALTER COLUMN shipping_address DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
UPDATE orders SET payment_verified = true WHERE payment_status = 'paid';
CREATE INDEX IF NOT EXISTS idx_orders_payment_verified ON orders(payment_verified);
```

**That's it!** Payment issues will be fixed.

---

## 🧪 Test It

1. Add product to cart
2. Checkout with **Pickup** checked
3. Skip address fields
4. Pay with test card: **4084 0840 8408 4081**, CVV: 408, Expiry: 12/30
5. Should work! ✅

---

## ❓ Still Having Issues?

### Logout button not visible?
- Hard refresh: `Ctrl + Shift + R`
- It's already implemented and working

### Cart count not showing?
- Check browser console for errors
- It's already implemented and working

### Payment fails?
- Check if you ran the SQL migration above
- Check terminal logs for database errors

---

## 📂 Files Changed

- ✅ `supabase-ecommerce-schema.sql` - Schema updated
- ✅ `src/app/api/payment/verify/route.ts` - Handles pickup orders
- ✅ `src/lib/supabase/config.ts` - TypeScript types updated
- ✅ `supabase-orders-fix-migration.sql` - Run this migration!

---

## 🎯 What Was Actually Broken?

**Only 1 thing:** Database rejected pickup orders because `shipping_address` was required.

**What was NOT broken:**
- Logout button (already works)
- Cart count (already works)
- Payment verification (already works)

**The fix:** Made `shipping_address` nullable + added payment tracking fields.

---

## 💡 Pro Tips

- Use Paystack test card: 4084 0840 8408 4081
- Check `/orders` page after payment
- Pickup orders = no address needed
- Delivery orders = address required

That's it! Run the migration and you're done. 🚀
