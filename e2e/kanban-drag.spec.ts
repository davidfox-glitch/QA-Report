import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL ?? 'admin@example.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD ?? 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('should display kanban columns', async ({ page }) => {
    // Navigate to a project that has a kanban board
    // Adjust the selector based on your actual UI
    const columns = page.locator('[data-testid="kanban-column"]');
    await expect(columns.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display task cards in columns', async ({ page }) => {
    const cards = page.locator('[data-testid="kanban-card"]');
    // Wait for at least one card to appear (assumes test data exists)
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow drag-and-drop of task cards between columns', async ({ page }) => {
    // Wait for the board to load
    await page.waitForSelector('[data-testid="kanban-card"]', { timeout: 10000 });

    const sourceCard = page.locator('[data-testid="kanban-card"]').first();
    const targetColumn = page.locator('[data-testid="kanban-column"]').nth(1);

    // Get original column text to verify the move later
    const cardText = await sourceCard.textContent();

    // Perform drag and drop
    await sourceCard.dragTo(targetColumn);

    // Verify the card is now in the target column
    const targetCards = targetColumn.locator('[data-testid="kanban-card"]');
    await expect(targetCards.filter({ hasText: cardText ?? '' })).toBeVisible();
  });

  test('should persist task position after page reload', async ({ page }) => {
    // Wait for the board to load
    await page.waitForSelector('[data-testid="kanban-card"]', { timeout: 10000 });

    const sourceCard = page.locator('[data-testid="kanban-card"]').first();
    const targetColumn = page.locator('[data-testid="kanban-column"]').nth(1);
    const cardText = await sourceCard.textContent();

    // Drag card to new column
    await sourceCard.dragTo(targetColumn);

    // Wait for the async persist
    await page.waitForTimeout(2000);

    // Reload the page
    await page.reload();

    // Verify card stayed in the new column after refresh
    await page.waitForSelector('[data-testid="kanban-card"]', { timeout: 10000 });
    const targetCards = page.locator('[data-testid="kanban-column"]').nth(1).locator('[data-testid="kanban-card"]');
    await expect(targetCards.filter({ hasText: cardText ?? '' })).toBeVisible();
  });
});
