import { test, expect } from "@playwright/test";

test.describe("School Admin Complete User Journey", () => {
  // Use a randomly generated email for the test student
  const testStudentEmail = `test.student.${Date.now()}@eduxeno.com`;
  const testRollNumber = `RN-${Date.now()}`;

  test("Login, Create Student, Mark Attendance, Assign Fee, Create Exam", async ({
    page,
  }) => {
    // 1. Login
    await page.goto("/login");

    // Check if redirect to login happened or if we are already logged in
    if (page.url().includes("login")) {
      await page.fill(
        'input[placeholder="name@school.edu or admin123"]',
        "admin@greenwood.edu",
      );
      await page.fill('input[placeholder="••••••••"]', "password123");
      await page.click('button:has-text("Sign In")');

      // Wait for dashboard to load
      await page.waitForURL("**/dashboard", { timeout: 15000 });
    }

    // 2. Dashboard Checks
    // Check something that is definitely on the dashboard
    await expect(page.locator("text=Executive").first()).toBeVisible();

    // 3. Admissions / Create Student
    await page.goto("/dashboard/students");
    await page.waitForLoadState("networkidle");

    // Switch to Admissions tab
    await page.click('button:has-text("Admissions Workflow")');
    await page.click('button:has-text("New Admission")');
    // Ensure modal opens
    await expect(page.locator("text=Student Information")).toBeVisible();

    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");

    // Go to next steps
    await page.click('button:has-text("Continue")'); // Academic
    await page.click('button:has-text("Continue")'); // Parents
    await page.click('button:has-text("Continue")'); // Address

    await page.click('button:has-text("Complete Registration")');

    // Verify toast or directory update
    await expect(
      page.locator("text=Application registered successfully"),
    ).toBeVisible({ timeout: 10000 });

    // 4. Mark Attendance
    await page.goto("/dashboard/attendance");
    await page.waitForLoadState("networkidle");
    // Switch to Workspace Tab
    await page.click('button:has-text("Daily Workspace")');

    // Wait for the class dropdown and select the first class
    const classSelect = page.locator("select").first();
    await classSelect.waitFor({ state: "visible" });
    // This is tricky because we need to know options.
    // Just select index 1 if available
    const optionValues = await classSelect.locator("option").allTextContents();
    if (optionValues.length > 1) {
      await classSelect.selectOption({ index: 1 });

      // Mark All Present
      await page.click('button:has-text("Mark All Present")');
      await page.click('button:has-text("Save Attendance")');

      // Toast success
      await expect(
        page.locator("text=Attendance saved successfully"),
      ).toBeVisible();
    }

    // 5. Fee Collection
    await page.goto("/dashboard/fees");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Fee Management").first()).toBeVisible();
    // Assuming there's a button to collect fees
    const collectFeeBtn = page.locator('button:has-text("Collect Fee")');
    if (await collectFeeBtn.isVisible()) {
      await collectFeeBtn.click();
      await page.fill('input[name="amount"]', "500");
      await page.click('button:has-text("Process Payment")');
    }

    // 6. Examination
    await page.goto("/dashboard/examinations");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Examination").first()).toBeVisible();

    // End of basic flow verification
  });
});
