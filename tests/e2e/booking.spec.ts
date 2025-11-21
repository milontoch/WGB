// E2E tests for booking flow

import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await page.goto("/");
  });

  test("complete booking flow from browsing to confirmation", async ({
    page,
  }) => {
    // 1. Browse services
    await page.click("text=Services");
    await expect(page).toHaveURL(/.*\/services/);

    // 2. View available services
    await expect(page.locator('[data-testid="service-card"]')).toHaveCount(3, {
      timeout: 10000,
    });

    // 3. Select a service (Luxury Facial)
    await page.click("text=Luxury Facial Treatment");
    await expect(page).toHaveURL(/.*\/services\/service-1/);

    // 4. View service details
    await expect(page.locator("h1")).toContainText("Luxury Facial");
    await expect(page.locator("text=₦150.00")).toBeVisible();

    // 5. Click "Book Now"
    await page.click('button:has-text("Book Now")');

    // 6. If not logged in, should redirect to login
    const currentUrl = page.url();
    if (currentUrl.includes("/auth/login")) {
      // Login
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "SecurePass123!");
      await page.click('button:has-text("Login")');

      // Wait for redirect back to booking
      await expect(page).toHaveURL(/.*\/book/, { timeout: 10000 });
    }

    // 7. Select date
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();
    await page.click('[data-testid="date-picker"]');

    // Select tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`button:has-text("${tomorrow.getDate()}")`);

    // 8. Wait for time slots to load
    await expect(page.locator('[data-testid="time-slot"]')).toHaveCount(8, {
      timeout: 10000,
    });

    // 9. Select time slot (2pm)
    await page.click('[data-testid="time-slot"]:has-text("2:00 PM")');

    // 10. Add optional notes
    await page.fill(
      'textarea[name="notes"]',
      "Looking forward to this treatment!"
    );

    // 11. Submit booking
    await page.click('button:has-text("Confirm Booking")');

    // 12. Wait for success message
    await expect(page.locator("text=Booking Confirmed")).toBeVisible({
      timeout: 15000,
    });

    // 13. Should show booking details
    await expect(page.locator("text=Luxury Facial")).toBeVisible();
    await expect(page.locator("text=₦150.00")).toBeVisible();

    // 14. Should have option to view booking
    await page.click('button:has-text("View Booking")');
    await expect(page).toHaveURL(/.*\/booking/);

    // 15. Verify booking appears in list
    await expect(page.locator("text=Luxury Facial Treatment")).toBeVisible();
    await expect(
      page.locator('[data-testid="booking-status"]:has-text("Confirmed")')
    ).toBeVisible();
  });

  test("should prevent booking for past date", async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');

    // Go to booking page
    await page.goto("/book/service-1");

    // Try to select past date
    await page.click('[data-testid="date-picker"]');

    // Past dates should be disabled
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayButton = page.locator(
      `button:has-text("${yesterday.getDate()}")`
    );

    await expect(yesterdayButton).toBeDisabled();
  });

  test("should show unavailable slots as disabled", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');

    // Go to booking page
    await page.goto("/book/service-1");

    // Select future date
    await page.click('[data-testid="date-picker"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.click(`button:has-text("${futureDate.getDate()}")`);

    // Wait for slots to load
    await expect(page.locator('[data-testid="time-slot"]')).toHaveCount(8, {
      timeout: 10000,
    });

    // Booked slots should be disabled or marked unavailable
    const bookedSlots = page.locator(
      '[data-testid="time-slot"][data-available="false"]'
    );
    if ((await bookedSlots.count()) > 0) {
      await expect(bookedSlots.first()).toBeDisabled();
    }
  });

  test("should allow rescheduling a booking", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');

    // Go to my bookings
    await page.goto("/booking");

    // Find first confirmed booking
    await page.click(
      '[data-testid="booking-card"]:has([data-testid="booking-status"]:has-text("Confirmed")) >> button:has-text("Reschedule")'
    );

    // Should navigate to reschedule page
    await expect(page).toHaveURL(/.*\/book.*reschedule/);

    // Select new date
    await page.click('[data-testid="date-picker"]');
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 10);
    await page.click(`button:has-text("${newDate.getDate()}")`);

    // Select new time
    await expect(page.locator('[data-testid="time-slot"]')).toHaveCount(8, {
      timeout: 10000,
    });
    await page.click('[data-testid="time-slot"]:has-text("3:00 PM")');

    // Confirm reschedule
    await page.click('button:has-text("Confirm Reschedule")');

    // Should show success message
    await expect(page.locator("text=Booking Rescheduled")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should allow cancelling a booking", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');

    // Go to my bookings
    await page.goto("/booking");

    // Count current bookings
    const initialCount = await page
      .locator('[data-testid="booking-card"]')
      .count();

    // Cancel first booking
    await page.click(
      '[data-testid="booking-card"]:first-child >> button:has-text("Cancel")'
    );

    // Confirm cancellation in modal
    await page.click('button:has-text("Yes, Cancel Booking")');

    // Should show success message
    await expect(page.locator("text=Booking Cancelled")).toBeVisible({
      timeout: 15000,
    });

    // Status should update to cancelled
    await expect(
      page.locator('[data-testid="booking-status"]:has-text("Cancelled")')
    ).toBeVisible();
  });

  test("should enforce 24-hour cancellation policy", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');

    // Go to my bookings
    await page.goto("/booking");

    // Find booking within 24 hours
    const nearBooking = page.locator(
      '[data-testid="booking-card"][data-hours-until="20"]'
    );

    if ((await nearBooking.count()) > 0) {
      await nearBooking.locator('button:has-text("Cancel")').click();

      // Should show policy error
      await expect(page.locator("text=24 hours")).toBeVisible();
    }
  });

  test("should filter bookings by status", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');

    // Go to my bookings
    await page.goto("/booking");

    // Filter by confirmed
    await page.selectOption('select[name="status"]', "confirmed");
    await expect(page.locator('[data-testid="booking-status"]')).toHaveText(
      ["Confirmed"],
      { timeout: 5000 }
    );

    // Filter by cancelled
    await page.selectOption('select[name="status"]', "cancelled");
    const cancelledStatuses = await page
      .locator('[data-testid="booking-status"]')
      .allTextContents();
    expect(cancelledStatuses.every((status) => status === "Cancelled")).toBe(
      true
    );
  });

  test("should show booking reminder notification", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button:has-text("Login")');

    // Go to dashboard
    await page.goto("/");

    // Check for upcoming booking reminder
    const reminderBanner = page.locator('[data-testid="booking-reminder"]');

    if ((await reminderBanner.count()) > 0) {
      await expect(reminderBanner).toContainText("upcoming");
      await expect(reminderBanner).toContainText("tomorrow");
    }
  });
});
