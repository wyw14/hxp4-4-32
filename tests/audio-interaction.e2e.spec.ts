import { test, expect } from '@playwright/test';

test.describe('音频交互测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('音频按钮初始状态没有 active 类', async ({ page }) => {
    const audioToggle = page.locator('#audioToggle');
    const hasActiveClass = await audioToggle.evaluate(el => el.classList.contains('active'));
    expect(hasActiveClass).toBeFalsy();
  });

  test('点击音频按钮后添加 active 类', async ({ page }) => {
    const audioToggle = page.locator('#audioToggle');
    
    await audioToggle.click();
    
    await page.waitForTimeout(500);
    
    const hasActiveClass = await audioToggle.evaluate(el => el.classList.contains('active'));
    expect(hasActiveClass).toBeTruthy();
  });

  test('再次点击音频按钮移除 active 类', async ({ page }) => {
    const audioToggle = page.locator('#audioToggle');
    
    await audioToggle.click();
    await page.waitForTimeout(300);
    
    const hasActiveClass1 = await audioToggle.evaluate(el => el.classList.contains('active'));
    expect(hasActiveClass1).toBeTruthy();
    
    await audioToggle.click();
    await page.waitForTimeout(300);
    
    const hasActiveClass2 = await audioToggle.evaluate(el => el.classList.contains('active'));
    expect(hasActiveClass2).toBeFalsy();
  });

  test('音频按钮包含正确的文本和图标', async ({ page }) => {
    const audioToggle = page.locator('#audioToggle');
    
    const icon = audioToggle.locator('.power-icon');
    const label = audioToggle.locator('.power-label');
    
    await expect(icon).toBeVisible();
    await expect(icon).toHaveText('◉');
    await expect(label).toBeVisible();
    await expect(label).toHaveText('AUDIO');
  });

  test('音频按钮可点击且响应', async ({ page }) => {
    const audioToggle = page.locator('#audioToggle');
    
    const isEnabled = await audioToggle.isEnabled();
    expect(isEnabled).toBeTruthy();
    
    await expect(audioToggle).toBeVisible();
  });
});
