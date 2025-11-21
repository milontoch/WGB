// Email mock utility for testing
interface MockEmail {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text: string;
  sentAt: Date;
}

let sentEmails: MockEmail[] = [];

/**
 * Mock email transport for Nodemailer
 */
export const mockEmailTransport = {
  sendMail: async (mailOptions: any) => {
    const email: MockEmail = {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
      html: mailOptions.html || "",
      text: mailOptions.text || "",
      sentAt: new Date(),
    };

    sentEmails.push(email);

    if (process.env.TEST_DEBUG === "true") {
      console.log("📧 Mock email sent:", {
        to: email.to,
        subject: email.subject,
      });
    }

    return {
      messageId: `mock-${Date.now()}@test.com`,
      response: "250 Message accepted",
    };
  },

  verify: async () => true,
};

/**
 * Get all sent emails
 */
export function getSentEmails(): MockEmail[] {
  return [...sentEmails];
}

/**
 * Get last sent email
 */
export function getLastEmail(): MockEmail | undefined {
  return sentEmails[sentEmails.length - 1];
}

/**
 * Get emails sent to specific address
 */
export function getEmailsTo(address: string): MockEmail[] {
  return sentEmails.filter((email) => email.to === address);
}

/**
 * Check if email was sent
 */
export function wasEmailSent(options: {
  to?: string;
  subject?: string;
  contentIncludes?: string;
}): boolean {
  return sentEmails.some((email) => {
    if (options.to && email.to !== options.to) return false;
    if (options.subject && !email.subject.includes(options.subject))
      return false;
    if (options.contentIncludes) {
      const content = email.html + email.text;
      if (!content.includes(options.contentIncludes)) return false;
    }
    return true;
  });
}

/**
 * Get email count
 */
export function getEmailCount(): number {
  return sentEmails.length;
}

/**
 * Clear all sent emails
 */
export function resetEmailMock(): void {
  sentEmails = [];
}

/**
 * Wait for email to be sent (with timeout)
 */
export async function waitForEmail(
  predicate: (email: MockEmail) => boolean,
  timeout = 5000
): Promise<MockEmail | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const email = sentEmails.find(predicate);
    if (email) return email;

    // Wait 100ms before checking again
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}

/**
 * Assert email was sent (throws if not found)
 */
export function assertEmailSent(options: {
  to?: string;
  subject?: string;
  contentIncludes?: string;
}): MockEmail {
  const email = sentEmails.find((email) => {
    if (options.to && email.to !== options.to) return false;
    if (options.subject && !email.subject.includes(options.subject))
      return false;
    if (options.contentIncludes) {
      const content = email.html + email.text;
      if (!content.includes(options.contentIncludes)) return false;
    }
    return true;
  });

  if (!email) {
    const criteria = Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    throw new Error(
      `Expected email to be sent with ${criteria}. ` +
        `Found ${sentEmails.length} emails: ${sentEmails
          .map((e) => e.subject)
          .join(", ")}`
    );
  }

  return email;
}
