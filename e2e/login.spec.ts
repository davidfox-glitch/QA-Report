import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show an error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'bad@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Expect an error toast or message
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should redirect admin to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL ?? 'admin@example.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD ?? 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('should prevent non-admin from accessing /users', async ({ page }) => {
    // Login as regular user first
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL ?? 'user@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD ?? 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15000 });

    // Try accessing admin-only route
    await page.goto('/users');
    await expect(page).toHaveURL('/');
  });
});
