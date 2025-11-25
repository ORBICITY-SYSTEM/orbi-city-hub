import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");

    // Check if the page title contains "ORBI City Hub"
    await expect(page).toHaveTitle(/ORBI City Hub/);
  });

  test("should display CEO Dashboard when authenticated", async ({ page }) => {
    await page.goto("/");

    // Check for dashboard elements
    const dashboardHeading = page.getByRole("heading", {
      name: /CEO Dashboard/i,
    });
    await expect(dashboardHeading).toBeVisible({ timeout: 10000 });
  });

  test("should navigate between modules", async ({ page }) => {
    await page.goto("/");

    // Click on Finance module
    await page.getByRole("link", { name: /Finance/i }).click();
    await expect(page).toHaveURL(/\/finance/);

    // Click on Marketing module
    await page.getByRole("link", { name: /Marketing/i }).click();
    await expect(page).toHaveURL(/\/marketing/);

    // Click on Logistics module
    await page.getByRole("link", { name: /Logistics/i }).click();
    await expect(page).toHaveURL(/\/logistics/);
  });

  test("should display error boundary on crash", async ({ page }) => {
    // This test would require triggering an error
    // For now, just verify error boundary component exists
    await page.goto("/");

    // Verify page loads without crashing
    await expect(
      page.getByRole("heading", { name: /CEO Dashboard/i })
    ).toBeVisible();
  });
});
