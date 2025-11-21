# Testing & QA Documentation

## Overview

Comprehensive testing suite for Modern Beauty Studio using Vitest (unit/integration) and Playwright (E2E).

---

## Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw @mswjs/http-middleware express nock playwright @playwright/test dotenv ts-node nodemailer-mock cross-env c8 @types/node
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Setup Test Environment

```bash
# Copy example env file
cp .env.test.example .env.test

# Edit .env.test with test credentials
```

### 4. Seed Test Data

```bash
npm run seed:test
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# UI mode (interactive)
npm run test:ui
```

---

## Test Structure

```
tests/
├── unit/                  # Unit tests
│   ├── utils.spec.ts
│   ├── validators.spec.ts
│   ├── pricing.spec.ts
│   └── slots.spec.ts
├── integration/           # Integration tests
│   ├── api-bookings.spec.ts
│   ├── api-orders.spec.ts
│   ├── api-auth.spec.ts
│   └── api-payments.spec.ts
├── e2e/                   # End-to-end tests
│   ├── booking.spec.ts
│   ├── checkout.spec.ts
│   ├── admin.spec.ts
│   └── auth.spec.ts
├── mocks/                 # Mock handlers
│   ├── handlers.ts
│   ├── server.ts
│   └── browser.ts
├── utils/                 # Test utilities
│   ├── emailMock.ts
│   ├── factories.ts
│   ├── fixtures.ts
│   └── testHelpers.ts
└── setup.ts              # Global test setup
```

---

## Running Tests Locally

### Unit Tests

```bash
npm run test:unit
```

Tests utility functions, validators, calculations without external dependencies.

### Integration Tests

```bash
npm run test:integration
```

Tests API routes with mocked Supabase/Paystack. Optionally run against real test DB:

```bash
TEST_USE_REAL_DB=true npm run test:integration
```

### E2E Tests

```bash
# Start dev server first
npm run dev

# In another terminal
npm run test:e2e

# Or run together
npm run test:e2e:ci
```

### Watch Mode

```bash
npm run test:watch
```

Auto-reruns tests on file changes.

### Coverage Report

```bash
npm run test:coverage
```

Generates HTML coverage report in `coverage/` directory.

---

## CI/CD Pipeline

Tests run automatically on:

- Every push to `main` branch
- Every pull request
- Manual trigger via GitHub Actions

### CI Workflow Steps:

1. Checkout code
2. Install dependencies
3. Seed test database
4. Run unit tests
5. Run integration tests
6. Start Next.js server
7. Run E2E tests
8. Generate coverage report
9. Teardown test data
10. Deploy (if on main and tests pass)

### View CI Results:

Go to **GitHub Actions** tab in repository to see test results and coverage reports.

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from "vitest";
import { calculateTotal } from "@/lib/utils/pricing";

describe("calculateTotal", () => {
  it("calculates cart total correctly", () => {
    const items = [
      { price: 1000, quantity: 2 },
      { price: 500, quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe(2500);
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/bookings/create/route";

describe("POST /api/bookings/create", () => {
  it("creates booking successfully", async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("user can book a service", async ({ page }) => {
  await page.goto("/services");
  await page.click("text=Book Now");
  // ... test steps
  await expect(page).toHaveURL("/booking/success");
});
```

---

## Test Data

### Seed Test Data

```bash
npm run seed:test
```

Creates:

- Test users (customer, admin, staff)
- Services (haircut, manicure, facial)
- Time slots (9 AM - 5 PM)
- Sample products
- Staff availability

### Cleanup Test Data

```bash
npm run teardown:test
```

Removes all test data from database.

### Fixtures

Pre-defined test data available in `tests/utils/fixtures.ts`:

- `testUser` - Sample user object
- `testService` - Sample service
- `testBooking` - Sample booking
- `testProduct` - Sample product

---

## Mocking External Services

### Supabase

Mocked by default using MSW handlers. Returns predictable test data.

**Optional Real DB**: Set `TEST_USE_REAL_DB=true` to use test Supabase project.

### Paystack

All payment requests intercepted and mocked:

- `/transaction/initialize` returns mock authorization URL
- `/transaction/verify` returns success/failure based on test scenario

### Email (Nodemailer)

Emails captured in-memory. Verify with:

```typescript
import { getLastEmail, clearEmails } from "@/tests/utils/emailMock";

const email = getLastEmail();
expect(email.to).toBe("customer@example.com");
expect(email.subject).toContain("Booking Confirmation");
```

---

## Coverage Requirements

Minimum coverage thresholds:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

CI fails if coverage drops below these thresholds.

---

## Debugging Tests

### Failed Tests

```bash
# Run specific test file
npx vitest tests/unit/utils.spec.ts

# Run with debugging
DEBUG=* npm test

# Run single test
npx vitest -t "test name pattern"
```

### E2E Debugging

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Generate trace
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### View Test UI

```bash
npm run test:ui
```

Opens interactive Vitest UI in browser.

---

## Common Issues

### Issue: Tests timing out

**Solution**: Increase timeout in test file:

```typescript
test(
  "slow test",
  async () => {
    // ...
  },
  { timeout: 10000 }
);
```

### Issue: Port already in use (E2E)

**Solution**: Kill process using port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Issue: Playwright browsers not installed

**Solution**:

```bash
npx playwright install
```

### Issue: MSW handlers not working

**Solution**: Ensure `tests/setup.ts` is imported and server is started.

---

## Best Practices

1. **Isolate tests**: Each test should be independent
2. **Use factories**: Generate test data with factories
3. **Mock external calls**: Never hit real APIs in tests
4. **Clean up**: Reset state after each test
5. **Descriptive names**: Test names should explain what they test
6. **Arrange-Act-Assert**: Follow AAA pattern
7. **Test edge cases**: Not just happy paths
8. **Keep tests fast**: Unit tests < 100ms, integration < 1s

---

## Environment Variables

### .env.test

Required for local test runs:

```env
# Supabase Test Project
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key

# Paystack Test Keys
PAYSTACK_SECRET_KEY=sk_test_...

# Email (mocked)
EMAIL_USER=test@example.com
EMAIL_PASSWORD=test-password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test flag
NODE_ENV=test
```

---

## Continuous Integration

### GitHub Actions

Workflow file: `.github/workflows/ci.yml`

**Triggers**:

- Push to `main`
- Pull requests
- Manual dispatch

**Artifacts**:

- Test results
- Coverage reports
- Playwright traces (on failure)
- Screenshots (on E2E failure)

### View Results

1. Go to repository on GitHub
2. Click **Actions** tab
3. Select workflow run
4. View logs and download artifacts

---

## Optional: Real Database Testing

For full integration tests against real Supabase:

1. Create test Supabase project
2. Set credentials in `.env.test`
3. Run migrations:

```bash
npm run db:migrate:test
```

4. Enable real DB mode:

```bash
TEST_USE_REAL_DB=true npm run test:integration
```

**Warning**: Real DB tests are slower but catch issues mocks might miss.

---

## Test Scenarios Covered

### Unit Tests

✅ Slot availability calculation  
✅ Price/discount calculations  
✅ Cart total calculations  
✅ Date/time validation  
✅ Email validation  
✅ Phone number formatting

### Integration Tests

✅ Booking creation with validation  
✅ Double-booking prevention (race condition)  
✅ Order creation with stock deduction  
✅ Payment initialization and verification  
✅ OTP generation and verification  
✅ Cart operations (add, update, remove)  
✅ Concurrent order creation (stock race)

### E2E Tests

✅ User signup and login  
✅ Complete booking flow  
✅ Add to cart → checkout → payment  
✅ Payment failure handling  
✅ Admin create service  
✅ Admin manage time slots  
✅ Email confirmation sending (mocked)  
✅ Order history viewing

---

## Performance Benchmarks

Target test execution times:

- **Unit tests**: < 5 seconds total
- **Integration tests**: < 30 seconds total
- **E2E tests**: < 2 minutes total
- **Full suite**: < 3 minutes total

---

## Support

For test-related issues:

1. Check this documentation
2. Review test output and error messages
3. Check CI logs on GitHub Actions
4. Review mock handlers in `tests/mocks/`

---

**Last Updated**: November 20, 2025  
**Test Framework**: Vitest + Playwright  
**Coverage Tool**: c8  
**CI/CD**: GitHub Actions
