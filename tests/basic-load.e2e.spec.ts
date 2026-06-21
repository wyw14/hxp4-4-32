import { test, expect } from '@playwright/test';

test.describe('页面基础加载测试', () => {
  test('页面成功加载且无控制台错误', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/');
    
    expect(response?.status()).toBeLessThan(400);
    expect(consoleErrors).toHaveLength(0);
  });

  test('所有必需的 DOM 元素都存在', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#glCanvas')).toBeVisible();
    await expect(page.locator('#vhfKnob')).toBeVisible();
    await expect(page.locator('#uhfKnob')).toBeVisible();
    await expect(page.locator('#antennaKnob')).toBeVisible();
    await expect(page.locator('#vhfValue')).toBeVisible();
    await expect(page.locator('#uhfValue')).toBeVisible();
    await expect(page.locator('#antennaValue')).toBeVisible();
    await expect(page.locator('#signalFill')).toBeVisible();
    await expect(page.locator('#signalOverlay')).toBeVisible();
    await expect(page.locator('#audioToggle')).toBeVisible();
    await expect(page.locator('#foundCount')).toBeVisible();
  });

  test('旋钮初始值显示正确', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#vhfValue')).toHaveText('100');
    await expect(page.locator('#uhfValue')).toHaveText('400');
    await expect(page.locator('#antennaValue')).toHaveText('180°');
  });

  test('信号发现计数初始状态正确', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#foundCount')).toHaveText('Signals found: 0 / 4');
  });

  test('signals.json 成功加载', async ({ page }) => {
    await page.goto('/');

    const signalsResponse = await page.waitForResponse('/signals.json');
    expect(signalsResponse.ok()).toBeTruthy();
    
    const signalsData = await signalsResponse.json();
    expect(signalsData.signals).toBeInstanceOf(Array);
    expect(signalsData.signals.length).toBe(4);
  });

  test('Canvas WebGL 上下文成功创建', async ({ page }) => {
    await page.goto('/');

    const hasGLContext = await page.evaluate(() => {
      const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
      if (!canvas) return false;
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return gl !== null;
    });

    expect(hasGLContext).toBeTruthy();
  });
});
