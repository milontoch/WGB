/**
 * Error Handling Utilities
 * Standardized error responses for API routes
 */

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export class BookingError extends Error {
  code: string;
  statusCode: number;
  details?: any;

  constructor(
    message: string,
    code: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(message);
    this.name = "BookingError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation errors
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_DATE_FORMAT: "INVALID_DATE_FORMAT",
  INVALID_TIME_FORMAT: "INVALID_TIME_FORMAT",
  PAST_DATE: "PAST_DATE",

  // Resource errors
  SERVICE_NOT_FOUND: "SERVICE_NOT_FOUND",
  STAFF_NOT_FOUND: "STAFF_NOT_FOUND",
  BOOKING_NOT_FOUND: "BOOKING_NOT_FOUND",

  // Booking errors
  SLOT_UNAVAILABLE: "SLOT_UNAVAILABLE",
  DOUBLE_BOOKING: "DOUBLE_BOOKING",
  STAFF_UNAVAILABLE: "STAFF_UNAVAILABLE",
  BOOKING_WINDOW_EXCEEDED: "BOOKING_WINDOW_EXCEEDED",
  CANNOT_CANCEL_PAST_BOOKING: "CANNOT_CANCEL_PAST_BOOKING",

  // System errors
  DATABASE_ERROR: "DATABASE_ERROR",
  EMAIL_ERROR: "EMAIL_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  code?: string,
  statusCode: number = 400,
  details?: any
): Response {
  const errorResponse: ApiError = {
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: any): BookingError {
  // Unique constraint violation (duplicate booking)
  if (error.code === "23505") {
    return new BookingError(
      "This time slot is no longer available",
      ErrorCodes.DOUBLE_BOOKING,
      409
    );
  }

  // Foreign key violation
  if (error.code === "23503") {
    return new BookingError(
      "Invalid service or staff reference",
      ErrorCodes.INVALID_INPUT,
      400
    );
  }

  // Row not found
  if (error.code === "PGRST116") {
    return new BookingError(
      "Resource not found",
      ErrorCodes.BOOKING_NOT_FOUND,
      404
    );
  }

  // Default database error
  return new BookingError(
    "Database operation failed",
    ErrorCodes.DATABASE_ERROR,
    500,
    { originalError: error.message }
  );
}

/**
 * Log error with context
 */
export function logError(
  error: any,
  context: {
    endpoint?: string;
    userId?: string;
    action?: string;
    data?: any;
  }
) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    context,
  };

  // In production, send to error tracking service (e.g., Sentry)
  console.error("[API Error]", JSON.stringify(errorLog, null, 2));
}
