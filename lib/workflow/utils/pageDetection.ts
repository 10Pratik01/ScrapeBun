import { Page } from "puppeteer";

/**
 * Auto-Detection Utilities
 * Automatically detect CAPTCHAs, login pages, and other scenarios
 */

export interface DetectionResult {
    detected: boolean;
    type: "captcha" | "login" | "signup" | "error" | "none";
    message: string;
    selectors?: string[];
    confidence: number; // 0-1
}

/**
 * Detect if page has a CAPTCHA
 */
export async function detectCaptcha(page: Page): Promise<DetectionResult> {
    try {
        const html = await page.content();
        const url = page.url();

        // Common CAPTCHA indicators
        const captchaPatterns = [
            // reCAPTCHA
            "g-recaptcha",
            "recaptcha",
            "grecaptcha",
            // hCaptcha
            "h-captcha",
            "hcaptcha",
            // Cloudflare
            "cf-challenge",
            "cloudflare",
            // Generic
            "captcha",
            "challenge",
            "verify you are human",
            "verify-you-are-human",
            "security check",
            "robot check",
        ];

        // Check HTML content
        const htmlLower = html.toLowerCase();
        let matchedPattern = "";
        let matchCount = 0;

        for (const pattern of captchaPatterns) {
            if (htmlLower.includes(pattern.toLowerCase())) {
                matchedPattern = pattern;
                matchCount++;
            }
        }

        // Check for CAPTCHA elements using selectors
        const captchaSelectors = [
            'iframe[src*="recaptcha"]',
            'iframe[src*="hcaptcha"]',
            ".g-recaptcha",
            ".h-captcha",
            "#cf-challenge-running",
            "[data-captcha]",
        ];

        let foundSelectors: string[] = [];
        for (const selector of captchaSelectors) {
            const element = await page.$(selector);
            if (element) {
                foundSelectors.push(selector);
            }
        }

        const detected = matchCount > 0 || foundSelectors.length > 0;
        const confidence = Math.min(
            (matchCount * 0.3 + foundSelectors.length * 0.5),
            1
        );

        if (detected) {
            return {
                detected: true,
                type: "captcha",
                message: `CAPTCHA detected: ${matchedPattern || foundSelectors.join(", ")}`,
                selectors: foundSelectors,
                confidence,
            };
        }

        return {
            detected: false,
            type: "none",
            message: "No CAPTCHA detected",
            confidence: 0,
        };
    } catch (error: any) {
        return {
            detected: false,
            type: "none",
            message: `Detection error: ${error.message}`,
            confidence: 0,
        };
    }
}

/**
 * Detect if page is a login page
 */
export async function detectLoginPage(page: Page): Promise<DetectionResult> {
    try {
        const html = await page.content();
        const url = page.url();

        // URL patterns for login pages
        const loginUrlPatterns = [
            "/login",
            "/signin",
            "/sign-in",
            "/auth",
            "/account/login",
            "/user/login",
        ];

        const urlMatch = loginUrlPatterns.some((pattern) =>
            url.toLowerCase().includes(pattern)
        );

        // Content patterns
        const loginTextPatterns = [
            "sign in",
            "log in",
            "login",
            "username",
            "password",
            "email",
            "remember me",
            "forgot password",
        ];

        const htmlLower = html.toLowerCase();
        let textMatches = 0;
        for (const pattern of loginTextPatterns) {
            if (htmlLower.includes(pattern)) {
                textMatches++;
            }
        }

        // Check for login form elements
        const loginSelectors = [
            'input[type="password"]',
            'input[name*="password"]',
            'input[name*="email"]',
            'input[name*="username"]',
            'button[type="submit"]',
            'form[action*="login"]',
        ];

        let foundSelectors: string[] = [];
        for (const selector of loginSelectors) {
            const element = await page.$(selector);
            if (element) {
                foundSelectors.push(selector);
            }
        }

        // Login detection logic: need password field + (email or username) + submit
        const hasPasswordField = foundSelectors.some((s) =>
            s.includes("password")
        );
        const hasUserField =
            foundSelectors.some((s) => s.includes("email")) ||
            foundSelectors.some((s) => s.includes("username"));
        const hasSubmit = foundSelectors.some((s) => s.includes("submit"));

        const detected =
            (hasPasswordField && hasUserField && hasSubmit) ||
            (urlMatch && textMatches >= 3);

        const confidence = detected
            ? Math.min(
                (urlMatch ? 0.4 : 0) +
                (textMatches / loginTextPatterns.length) * 0.3 +
                (foundSelectors.length / loginSelectors.length) * 0.3,
                1
            )
            : 0;

        if (detected) {
            return {
                detected: true,
                type: "login",
                message: "Login page detected",
                selectors: foundSelectors,
                confidence,
            };
        }

        return {
            detected: false,
            type: "none",
            message: "Not a login page",
            confidence: 0,
        };
    } catch (error: any) {
        return {
            detected: false,
            type: "none",
            message: `Detection error: ${error.message}`,
            confidence: 0,
        };
    }
}

/**
 * Detect if page is a signup page
 */
export async function detectSignupPage(page: Page): Promise<DetectionResult> {
    try {
        const html = await page.content();
        const url = page.url();

        // URL patterns for signup pages
        const signupUrlPatterns = [
            "/signup",
            "/sign-up",
            "/register",
            "/registration",
            "/create-account",
            "/join",
        ];

        const urlMatch = signupUrlPatterns.some((pattern) =>
            url.toLowerCase().includes(pattern)
        );

        // Content patterns
        const signupTextPatterns = [
            "sign up",
            "create account",
            "register",
            "registration",
            "join now",
            "get started",
            "confirm password",
            "terms and conditions",
            "privacy policy",
        ];

        const htmlLower = html.toLowerCase();
        let textMatches = 0;
        for (const pattern of signupTextPatterns) {
            if (htmlLower.includes(pattern)) {
                textMatches++;
            }
        }

        // Check for signup form elements
        const signupSelectors = [
            'input[type="password"]',
            'input[name*="confirm"]',
            'input[name*="email"]',
            'input[name*="username"]',
            'input[type="checkbox"]', // Terms acceptance
            'button[type="submit"]',
        ];

        let foundSelectors: string[] = [];
        for (const selector of signupSelectors) {
            const element = await page.$(selector);
            if (element) {
                foundSelectors.push(selector);
            }
        }

        // Signup usually has confirm password or terms checkbox
        const hasConfirmField = foundSelectors.some((s) => s.includes("confirm"));
        const hasTermsCheckbox = foundSelectors.some((s) =>
            s.includes('type="checkbox"')
        );

        const detected =
            urlMatch ||
            (textMatches >= 3 && (hasConfirmField || hasTermsCheckbox));

        const confidence = detected
            ? Math.min(
                (urlMatch ? 0.5 : 0) +
                (textMatches / signupTextPatterns.length) * 0.3 +
                (hasConfirmField || hasTermsCheckbox ? 0.2 : 0),
                1
            )
            : 0;

        if (detected) {
            return {
                detected: true,
                type: "signup",
                message: "Signup/Registration page detected",
                selectors: foundSelectors,
                confidence,
            };
        }

        return {
            detected: false,
            type: "none",
            message: "Not a signup page",
            confidence: 0,
        };
    } catch (error: any) {
        return {
            detected: false,
            type: "none",
            message: `Detection error: ${error.message}`,
            confidence: 0,
        };
    }
}

/**
 * Detect common error pages (404, 500, etc.)
 */
export async function detectErrorPage(page: Page): Promise<DetectionResult> {
    try {
        const html = await page.content();
        const url = page.url();

        const errorPatterns = [
            "404",
            "page not found",
            "500",
            "server error",
            "internal server error",
            "access denied",
            "forbidden",
            "403",
            "unauthorized",
            "401",
        ];

        const htmlLower = html.toLowerCase();
        let matchedPattern = "";

        for (const pattern of errorPatterns) {
            if (htmlLower.includes(pattern.toLowerCase())) {
                matchedPattern = pattern;
                break;
            }
        }

        if (matchedPattern) {
            return {
                detected: true,
                type: "error",
                message: `Error page detected: ${matchedPattern}`,
                confidence: 0.8,
            };
        }

        return {
            detected: false,
            type: "none",
            message: "No error detected",
            confidence: 0,
        };
    } catch (error: any) {
        return {
            detected: false,
            type: "none",
            message: `Detection error: ${error.message}`,
            confidence: 0,
        };
    }
}

/**
 * Run all detections and return highest confidence result
 */
export async function autoDetectPageType(
    page: Page
): Promise<DetectionResult> {
    const results = await Promise.all([
        detectCaptcha(page),
        detectLoginPage(page),
        detectSignupPage(page),
        detectErrorPage(page),
    ]);

    // Return the detection with highest confidence
    const sorted = results.sort((a, b) => b.confidence - a.confidence);
    return sorted[0];
}
