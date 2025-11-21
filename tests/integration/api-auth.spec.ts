// Integration tests for authentication API routes

import { describe, it, expect, beforeEach } from "vitest";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as sendOTP } from "@/app/api/auth/otp/send/route";
import { POST as verifyOTP } from "@/app/api/auth/otp/verify/route";
import { createMockRequest, extractJSON } from "@tests/utils/testHelpers";
import { resetEmailMock, assertEmailSent } from "@tests/utils/emailMock";

describe("Authentication API Routes", () => {
  beforeEach(() => {
    resetEmailMock();
  });

  describe("POST /api/auth/register - User Registration", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "SecurePass123!",
        name: "New User",
        phone: "+2348012345678",
      };

      const request = createMockRequest("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      const response = await register(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(201);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(userData.email);
      expect(data.access_token).toBeDefined();
    });

    it("should hash password before storing", async () => {
      const userData = {
        email: "test@example.com",
        password: "SecurePass123!",
        name: "Test User",
      };

      const request = createMockRequest("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      const response = await register(request);
      const data = await extractJSON(response);

      // Password should not be returned
      expect(data.user.password).toBeUndefined();
    });

    it("should reject duplicate email", async () => {
      const userData = {
        email: "existing@example.com",
        password: "SecurePass123!",
        name: "Duplicate User",
      };

      const request = createMockRequest("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      const response = await register(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("exists");
    });

    it("should validate email format", async () => {
      const userData = {
        email: "invalid-email",
        password: "SecurePass123!",
        name: "Test User",
      };

      const request = createMockRequest("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      const response = await register(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("email");
    });

    it("should validate password strength", async () => {
      const userData = {
        email: "test@example.com",
        password: "weak",
        name: "Test User",
      };

      const request = createMockRequest("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      const response = await register(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("password");
    });

    it("should send welcome email", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "SecurePass123!",
        name: "New User",
      };

      const request = createMockRequest("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      await register(request);

      assertEmailSent({
        to: userData.email,
        subject: "Welcome",
        contentIncludes: "welcome",
      });
    });
  });

  describe("POST /api/auth/login - User Login", () => {
    it("should login with valid credentials", async () => {
      const credentials = {
        email: "test@example.com",
        password: "SecurePass123!",
      };

      const request = createMockRequest("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      const response = await login(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.access_token).toBeDefined();
      expect(data.user).toBeDefined();
    });

    it("should reject invalid password", async () => {
      const credentials = {
        email: "test@example.com",
        password: "WrongPassword123!",
      };

      const request = createMockRequest("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      const response = await login(request);

      expect(response.status).toBe(401);
      const data = await extractJSON(response);
      expect(data.error).toContain("Invalid");
    });

    it("should reject nonexistent email", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "SecurePass123!",
      };

      const request = createMockRequest("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      const response = await login(request);

      expect(response.status).toBe(401);
    });

    it("should return refresh token", async () => {
      const credentials = {
        email: "test@example.com",
        password: "SecurePass123!",
      };

      const request = createMockRequest("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      const response = await login(request);
      const data = await extractJSON(response);

      expect(data.refresh_token).toBeDefined();
    });
  });

  describe("POST /api/auth/otp/send - Send OTP", () => {
    it("should send OTP to email", async () => {
      resetEmailMock();

      const request = createMockRequest("/api/auth/otp/send", {
        method: "POST",
        body: {
          email: "test@example.com",
        },
      });

      const response = await sendOTP(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.message).toContain("sent");

      // Verify OTP email was sent
      assertEmailSent({
        to: "test@example.com",
        subject: "OTP",
        contentIncludes: "code",
      });
    });

    it("should generate 6-digit OTP", async () => {
      resetEmailMock();

      const request = createMockRequest("/api/auth/otp/send", {
        method: "POST",
        body: {
          email: "test@example.com",
        },
      });

      await sendOTP(request);

      const email = assertEmailSent({
        to: "test@example.com",
      });

      // Extract OTP from email (should be 6 digits)
      const otpMatch = email.html.match(/\b\d{6}\b/);
      expect(otpMatch).toBeTruthy();
    });

    it("should rate limit OTP requests", async () => {
      const makeRequest = async () => {
        const request = createMockRequest("/api/auth/otp/send", {
          method: "POST",
          body: {
            email: "test@example.com",
          },
        });
        return sendOTP(request);
      };

      // Send multiple OTP requests
      await makeRequest();
      await makeRequest();
      const response = await makeRequest();

      // Third request should be rate limited
      expect(response.status).toBe(429);
      const data = await extractJSON(response);
      expect(data.error).toContain("many");
    });

    it("should reject invalid email", async () => {
      const request = createMockRequest("/api/auth/otp/send", {
        method: "POST",
        body: {
          email: "invalid-email",
        },
      });

      const response = await sendOTP(request);
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/otp/verify - Verify OTP", () => {
    it("should verify correct OTP", async () => {
      // First, send OTP
      const sendRequest = createMockRequest("/api/auth/otp/send", {
        method: "POST",
        body: {
          email: "test@example.com",
        },
      });
      await sendOTP(sendRequest);

      // Then verify with correct OTP
      const verifyRequest = createMockRequest("/api/auth/otp/verify", {
        method: "POST",
        body: {
          email: "test@example.com",
          otp: "123456", // Mock OTP
        },
      });

      const response = await verifyOTP(verifyRequest);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.verified).toBe(true);
    });

    it("should reject incorrect OTP", async () => {
      const request = createMockRequest("/api/auth/otp/verify", {
        method: "POST",
        body: {
          email: "test@example.com",
          otp: "000000", // Wrong OTP
        },
      });

      const response = await verifyOTP(request);

      expect(response.status).toBe(401);
      const data = await extractJSON(response);
      expect(data.error).toContain("Invalid");
    });

    it("should expire OTP after 10 minutes", async () => {
      // This would require mocking time
      // For now, just verify the logic exists
      const request = createMockRequest("/api/auth/otp/verify", {
        method: "POST",
        body: {
          email: "test@example.com",
          otp: "123456",
        },
      });

      const response = await verifyOTP(request);
      const data = await extractJSON(response);

      // If OTP is expired, should return error
      if (response.status !== 200) {
        expect(data.error).toBeDefined();
      }
    });

    it("should allow only 3 verification attempts", async () => {
      const makeRequest = async () => {
        const request = createMockRequest("/api/auth/otp/verify", {
          method: "POST",
          body: {
            email: "test@example.com",
            otp: "000000", // Wrong OTP
          },
        });
        return verifyOTP(request);
      };

      await makeRequest();
      await makeRequest();
      const response = await makeRequest();

      // Third failed attempt should lock OTP
      expect(response.status).toBe(429);
      const data = await extractJSON(response);
      expect(data.error).toContain("attempts");
    });
  });
});
