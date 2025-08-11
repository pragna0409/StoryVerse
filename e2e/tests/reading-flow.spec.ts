
// E2E tests with Playwright
// e2e/tests/reading-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reading Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test('should upload and read a PDF', async ({ page }) => {
    // Navigate to library
    await page.click('[data-testid="library-link"]');

    // Upload PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-files/sample.pdf');

    // Wait for upload to complete
    await page.waitForSelector('[data-testid="book-card"]');

    // Click on the uploaded book
    await page.click('[data-testid="book-card"]');

    // Verify PDF reader opens
    await expect(page.locator('[data-testid="pdf-reader"]')).toBeVisible();

    // Test audio playback
    await page.click('[data-testid="play-audio"]');
    await expect(page.locator('[data-testid="audio-playing"]')).toBeVisible();
  });

  test('should generate an interactive story', async ({ page }) => {
    // Navigate to story generator
    await page.click('[data-testid="story-generator-link"]');

    // Fill story setup form
    await page.selectOption('[data-testid="genre-select"]', 'Fantasy');
    await page.fill('[data-testid="characters-input"]', 'A brave wizard');
    await page.fill('[data-testid="setting-input"]', 'Magical forest');

    // Generate story
    await page.click('[data-testid="generate-story"]');

    // Wait for story to be generated
    await page.waitForSelector('[data-testid="story-content"]');

    // Verify story content is displayed
    await expect(page.locator('[data-testid="story-content"]')).toContainText('wizard');

    // Verify choices are available
    await expect(page.locator('[data-testid="story-choice"]')).toHaveCount(3);

    // Make a choice
    await page.click('[data-testid="story-choice"]:first-child');

    // Verify story continues
    await page.waitForSelector('[data-testid="story-content"]');
  });

  test('should connect social media accounts', async ({ page }) => {
    // Navigate to profile
    await page.click('[data-testid="profile-link"]');

    // Connect Spotify
    await page.click('[data-testid="connect-spotify"]');

    // Mock Spotify OAuth (in real test, you'd handle the OAuth flow)
    await page.route('**/api/integrations/spotify/connect', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ authUrl: '<https://accounts.spotify.com/authorize?.>..' })
      });
    });

    // Verify connection initiated
    await expect(page.locator('[data-testid="spotify-connecting"]')).toBeVisible();
  });
});
