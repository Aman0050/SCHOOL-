import { test, expect } from "@playwright/test";

test.describe("Super Admin Complete User Journey", () => {
  test("Login, Create Tenant, Verify Dashboard", async ({ page }) => {
    // 1. Login
    await page.goto("/login");

    // Fill credentials for Super Admin
    await page.fill('input[name="email"]', "superadmin@eduxeno.com");
    await page.fill('input[name="password"]', "password123");

    // Click Sign In
    await page.click('button[type="submit"]');

    // 2. Verify Super Admin Dashboard
    await page.waitForURL("**/superadmin/dashboard", { timeout: 15000 });

    // Verify Key elements are visible
    await expect(
      page.locator("text=Executive Command Center").first(),
    ).toBeVisible();
    await expect(page.locator("text=Active Students").first()).toBeVisible();
    await expect(page.locator("text=MRR").first()).toBeVisible();

    // 3. Schools Management
    await page.goto("/superadmin/schools");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Schools Management").first()).toBeVisible();

    // Click on New School Button
    const newSchoolBtn = page.locator('button:has-text("Onboard New School")');
    if (await newSchoolBtn.isVisible()) {
      await newSchoolBtn.click();

      // Wait for modal
      await expect(page.locator("text=School Details").first()).toBeVisible();

      const randomId = Math.floor(Math.random() * 1000000);
      await page.fill(
        'input[placeholder="e.g. Greenwood High"]',
        `Playwright Academy ${randomId}`,
      );
      await page.fill(
        'input[placeholder="e.g. greenwood"]',
        `playwright-${randomId}`,
      );
      await page
        .locator("div")
        .filter({ hasText: /^First Name$/ })
        .getByRole("textbox")
        .fill("John");
      await page
        .locator("div")
        .filter({ hasText: /^Last Name$/ })
        .getByRole("textbox")
        .fill("Doe");
      await page
        .locator('input[type="email"]')
        .fill(`john.doe${randomId}@playwright.eduxeno.com`);
      await page.locator('input[type="password"]').fill("password123");

      await page.click('button:has-text("Onboard School")');

      // Look for success toast
      await expect(page.locator("text=successfully")).toBeVisible({
        timeout: 10000,
      });
    }

    // 4. Subscription & Billing
    await page.goto("/superadmin/billing");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Billing & Revenue").first()).toBeVisible();

    // 5. Data Health Dashboard
    await page.goto("/superadmin/data-health");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("text=Enterprise Data Integrity Center").first(),
    ).toBeVisible();

    // 6. Audit Logs
    await page.goto("/superadmin/audit");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("text=Security & Audit Logs").first(),
    ).toBeVisible();
  });
});
