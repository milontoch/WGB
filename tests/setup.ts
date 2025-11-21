// Global test setup
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { server } from "./mocks/server";
import { resetEmailMock } from "./utils/emailMock";
import { clearTestSlots } from "@/lib/services/time-slot-service";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetEmailMock();
  clearTestSlots();
  vi.clearAllMocks();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "test-service-key";
process.env.PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY || "sk_test_mock";
process.env.EMAIL_USER = process.env.EMAIL_USER || "test@example.com";
process.env.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "test-password";
process.env.NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Mock timers for deterministic tests
global.Date.now = vi.fn(() => new Date("2025-11-20T10:00:00Z").getTime());
