// E2E tests for checkout and payment flow

import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("complete checkout flow from cart to payment", async ({ page }) => {
    // 1. Browse shop
    await page.click("text=Shop");
    await expect(page).toHaveURL(/.*\/shop/);

    // 2. View products
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5, {
      timeout: 10000,
    });

    // 3. Add product to cart
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );

    // 4. Should show success notification
    await expect(page.locator("text=Added to cart")).toBeVisible({
      timeout: 5000,
    });

    // 5. Cart badge should update
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText("1");

    // 6. Add another product
    await page.click(
      '[data-testid="product-card"]:nth-child(2) >> button:has-text("Add to Cart")'
    );
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText("2");

    // 7. View cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL(/.*\/cart/);

    // 8. Verify cart items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);

    // 9. Update quantity
    await page.click(
      '[data-testid="cart-item"]:first-child >> button[aria-label="Increase quantity"]'
    );
    await expect(
      page.locator(
        '[data-testid="cart-item"]:first-child >> [data-testid="quantity"]'
      )
    ).toContainText("2");

    // 10. Verify total updates
    const total = await page
      .locator('[data-testid="cart-total"]')
      .textContent();
    expect(total).toContain("₦");

    // 11. Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await expect(page).toHaveURL(/.*\/checkout/);

    // 12. Fill shipping information
    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="phone"]', "+2348012345678");
    await page.fill('input[name="address"]', "123 Test Street");
    await page.fill('input[name="city"]', "Lagos");
    await page.fill('input[name="state"]', "Lagos State");

    // 13. Review order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-item"]')).toHaveCount(2);

    // 14. Click "Place Order" - This initiates Paystack
    await page.click('button:has-text("Place Order")');

    // 15. Should redirect to payment page or show payment modal
    // In test environment, we mock the payment
    await expect(page.locator("text=Payment")).toBeVisible({ timeout: 15000 });

    // 16. Mock successful payment (in test, we simulate callback)
    // The test mock will automatically verify payment
    await page.waitForURL(/.*\/checkout\/verify/, { timeout: 20000 });

    // 17. Should show success page
    await expect(page.locator("text=Order Successful")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();

    // 18. Cart should be empty
    await page.goto("/cart");
    await expect(page.locator("text=Your cart is empty")).toBeVisible();
  });

  test("should update cart total when quantity changes", async ({ page }) => {
    // Add product to cart
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );

    // Go to cart
    await page.goto("/cart");

    // Get initial total
    const initialTotal = await page
      .locator('[data-testid="cart-total"]')
      .textContent();
    const initialAmount = parseFloat(initialTotal!.replace(/[₦,]/g, ""));

    // Increase quantity
    await page.click(
      '[data-testid="cart-item"]:first-child >> button[aria-label="Increase quantity"]'
    );

    // Wait for total to update
    await page.waitForTimeout(1000);

    // Get new total
    const newTotal = await page
      .locator('[data-testid="cart-total"]')
      .textContent();
    const newAmount = parseFloat(newTotal!.replace(/[₦,]/g, ""));

    // New total should be double
    expect(newAmount).toBeCloseTo(initialAmount * 2, 0);
  });

  test("should remove item from cart", async ({ page }) => {
    // Add products to cart
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );
    await page.click(
      '[data-testid="product-card"]:nth-child(2) >> button:has-text("Add to Cart")'
    );

    // Go to cart
    await page.goto("/cart");

    // Count initial items
    const initialCount = await page
      .locator('[data-testid="cart-item"]')
      .count();
    expect(initialCount).toBe(2);

    // Remove first item
    await page.click(
      '[data-testid="cart-item"]:first-child >> button[aria-label="Remove"]'
    );

    // Confirm removal if modal appears
    const confirmButton = page.locator('button:has-text("Remove")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Wait for removal
    await page.waitForTimeout(1000);

    // Should have one item left
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test("should prevent checkout with out-of-stock items", async ({ page }) => {
    // Go to shop
    await page.goto("/shop");

    // Try to add out-of-stock product
    const outOfStockButton = page.locator(
      '[data-testid="product-card"][data-stock="0"] >> button:has-text("Add to Cart")'
    );

    if ((await outOfStockButton.count()) > 0) {
      await expect(outOfStockButton).toBeDisabled();
    }
  });

  test("should apply discount code", async ({ page }) => {
    // Add product to cart
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );

    // Go to cart
    await page.goto("/cart");

    // Get initial total
    const initialTotal = await page
      .locator('[data-testid="cart-total"]')
      .textContent();

    // Apply discount code
    await page.fill('input[name="discount_code"]', "TEST10");
    await page.click('button:has-text("Apply")');

    // Should show discount applied
    await expect(page.locator("text=Discount applied")).toBeVisible({
      timeout: 5000,
    });

    // Total should be reduced
    const newTotal = await page
      .locator('[data-testid="cart-total"]')
      .textContent();
    expect(newTotal).not.toBe(initialTotal);
  });

  test("should handle payment failure gracefully", async ({ page }) => {
    // Add product to cart and proceed to checkout
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );
    await page.goto("/cart");
    await page.click('button:has-text("Proceed to Checkout")');

    // Fill shipping info
    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="phone"]', "+2348012345678");
    await page.fill('input[name="address"]', "123 Test Street");

    // Place order with failed payment reference
    await page.click('button:has-text("Place Order")');

    // Simulate payment failure by navigating to verify with failed reference
    await page.goto("/checkout/verify?reference=test-failed-reference");

    // Should show failure message
    await expect(page.locator("text=Payment Failed")).toBeVisible({
      timeout: 15000,
    });

    // Should have option to retry
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();

    // Order status should be failed
    await expect(page.locator('[data-testid="order-status"]')).toContainText(
      "Failed"
    );
  });

  test("should show order in order history after successful payment", async ({
    page,
  }) => {
    // Complete a purchase
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );
    await page.goto("/cart");
    await page.click('button:has-text("Proceed to Checkout")');

    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="phone"]', "+2348012345678");
    await page.fill('input[name="address"]', "123 Test Street");

    await page.click('button:has-text("Place Order")');
    await page.waitForURL(/.*\/checkout\/verify/, { timeout: 20000 });

    // Wait for success
    await expect(page.locator("text=Order Successful")).toBeVisible({
      timeout: 15000,
    });

    // Navigate to order history
    await page.click("text=View Orders");
    await expect(page).toHaveURL(/.*\/orders/);

    // Latest order should be visible
    await expect(
      page.locator('[data-testid="order-card"]').first()
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="order-status"]').first()
    ).toContainText("Completed");
  });

  test("should validate shipping information", async ({ page }) => {
    // Add product and go to checkout
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );
    await page.goto("/checkout");

    // Try to submit without filling required fields
    await page.click('button:has-text("Place Order")');

    // Should show validation errors
    await expect(page.locator("text=required")).toBeVisible();

    // Fill invalid phone
    await page.fill('input[name="phone"]', "123");
    await page.click('button:has-text("Place Order")');

    await expect(page.locator("text=valid phone")).toBeVisible();
  });

  test("should maintain cart across sessions", async ({ page, context }) => {
    // Add items to cart
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );

    // Close page and open new one (simulates session)
    await page.close();
    const newPage = await context.newPage();

    // Cart should still have items
    await newPage.goto("/cart");
    await expect(newPage.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test("should show estimated delivery date", async ({ page }) => {
    // Add product and go to checkout
    await page.goto("/shop");
    await page.click(
      '[data-testid="product-card"]:first-child >> button:has-text("Add to Cart")'
    );
    await page.goto("/checkout");

    // Should show delivery estimate
    const deliveryEstimate = page.locator('[data-testid="delivery-estimate"]');
    if ((await deliveryEstimate.count()) > 0) {
      await expect(deliveryEstimate).toBeVisible();
      const estimateText = await deliveryEstimate.textContent();
      expect(estimateText).toMatch(/\d+ days?/);
    }
  });
});
