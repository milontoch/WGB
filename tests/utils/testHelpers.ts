// Test helper utilities

import { NextRequest } from "next/server";
import { vi } from "vitest";

/**
 * Create a mock Next.js request
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    searchParams?: Record<string, string>;
  }
): NextRequest {
  const {
    method = "GET",
    headers = {},
    body,
    searchParams = {},
  } = options || {};

  // Build URL with search params
  const urlObj = new URL(url, "http://localhost:3000");
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const req = new NextRequest(urlObj.toString(), {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  return req;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(condition());
    if (result) return;

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Simulate concurrent requests
 */
export async function simulateConcurrentRequests<T>(
  requestFn: () => Promise<T>,
  count: number
): Promise<T[]> {
  const requests = Array.from({ length: count }, () => requestFn());
  return Promise.all(requests);
}

/**
 * Mock delay (for testing loading states)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract JSON from Response
 */
export async function extractJSON(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON: ${text}`);
  }
}

/**
 * Create authenticated request headers
 */
export function createAuthHeaders(
  token = "mock-access-token"
): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Create admin request headers
 */
export function createAdminHeaders(
  token = "mock-admin-token"
): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Admin-Role": "admin",
  };
}

/**
 * Assert response is successful
 */
export function assertSuccessResponse(response: Response) {
  if (!response.ok) {
    throw new Error(
      `Expected successful response, got ${response.status}: ${response.statusText}`
    );
  }
}

/**
 * Assert response has specific status
 */
export function assertResponseStatus(
  response: Response,
  expectedStatus: number
) {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}: ${response.statusText}`
    );
  }
}

/**
 * Assert response is error
 */
export async function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  errorMessage?: string
) {
  assertResponseStatus(response, expectedStatus);

  if (errorMessage) {
    const json = await extractJSON(response);
    if (!json.error?.includes(errorMessage)) {
      throw new Error(
        `Expected error message to include "${errorMessage}", got "${json.error}"`
      );
    }
  }
}

/**
 * Generate random test email
 */
export function generateTestEmail(prefix = "test"): string {
  return `${prefix}-${Date.now()}@example.com`;
}

/**
 * Generate random test phone
 */
export function generateTestPhone(): string {
  const random = Math.floor(Math.random() * 100000000);
  return `+234${String(random).padStart(9, "0")}`;
}

/**
 * Generate random payment reference
 */
export function generatePaymentReference(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Mock console methods (to prevent noise in tests)
 */
export function mockConsole() {
  const original = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();

  return {
    restore: () => {
      console.log = original.log;
      console.error = original.error;
      console.warn = original.warn;
      console.info = original.info;
    },
    getLogCalls: () => (console.log as any).mock.calls,
    getErrorCalls: () => (console.error as any).mock.calls,
  };
}

/**
 * Test database helpers (if using real test DB)
 */
export const db = {
  /**
   * Clear all test data from database
   */
  async clear() {
    if (process.env.TEST_USE_REAL_DB !== "true") {
      return; // Skip if using mocks
    }

    // This would call your teardown script
    // For now, just a placeholder
    console.log("Clearing test database...");
  },

  /**
   * Seed test data
   */
  async seed() {
    if (process.env.TEST_USE_REAL_DB !== "true") {
      return; // Skip if using mocks
    }

    // This would call your seed script
    console.log("Seeding test database...");
  },
};

/**
 * Format date for API comparison
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

/**
 * Parse API date
 */
export function parseAPIDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if dates are equal (ignoring milliseconds)
 */
export function datesEqual(
  date1: Date | string,
  date2: Date | string
): boolean {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  return Math.abs(d1.getTime() - d2.getTime()) < 1000;
}

/**
 * Create date in future (for booking tests)
 */
export function futureDate(daysFromNow: number, hour = 14, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

/**
 * Create date in past
 */
export function pastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Retry a function multiple times
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxAttempts - 1) {
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Assert array contains object with properties
 */
export function assertArrayContains<T>(
  array: T[],
  properties: Partial<T>
): void {
  const found = array.some((item) =>
    Object.entries(properties).every(
      ([key, value]) => item[key as keyof T] === value
    )
  );

  if (!found) {
    throw new Error(
      `Expected array to contain object with properties ${JSON.stringify(
        properties
      )}`
    );
  }
}

/**
 * Clean up test artifacts
 */
export async function cleanup() {
  // Clear any pending timers
  vi.clearAllTimers();

  // Clear any pending promises
  await vi.runAllTimersAsync();

  // Reset modules
  vi.resetModules();
}
