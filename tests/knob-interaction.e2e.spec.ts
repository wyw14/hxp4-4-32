import { test, expect } from '@playwright/test';

test.describe('旋钮交互测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('VHF 旋钮拖拽调节值变化', async ({ page }) => {
    const knob = page.locator('#vhfKnob');
    const valueDisplay = page.locator('#vhfValue');
    
    const initialValue = await valueDisplay.textContent();
    expect(initialValue).toBe('100');

    const box = await knob.boundingBox();
    expect(box).not.toBeNull();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y - 100);
      await page.mouse.up();

      const newValue = await valueDisplay.textContent();
      expect(newValue).not.toBe(initialValue);
      
      const numValue = parseInt(newValue || '0', 10);
      expect(numValue).toBeGreaterThan(100);
      expect(numValue).toBeGreaterThanOrEqual(0);
      expect(numValue).toBeLessThanOrEqual(250);
    }
  });

  test('UHF 旋钮拖拽调节值变化', async ({ page }) => {
    const knob = page.locator('#uhfKnob');
    const valueDisplay = page.locator('#uhfValue');
    
    const initialValue = await valueDisplay.textContent();
    expect(initialValue).toBe('400');

    const box = await knob.boundingBox();
    expect(box).not.toBeNull();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + 100);
      await page.mouse.up();

      const newValue = await valueDisplay.textContent();
      expect(newValue).not.toBe(initialValue);
      
      const numValue = parseInt(newValue || '0', 10);
      expect(numValue).toBeLessThan(400);
      expect(numValue).toBeGreaterThanOrEqual(100);
      expect(numValue).toBeLessThanOrEqual(800);
    }
  });

  test('ANTENNA 旋钮滚轮微调', async ({ page }) => {
    const knob = page.locator('#antennaKnob');
    const valueDisplay = page.locator('#antennaValue');
    
    const initialValue = await valueDisplay.textContent();
    expect(initialValue).toBe('180°');

    await knob.hover();
    await page.mouse.wheel(0, 100);

    await page.waitForTimeout(100);
    
    const newValue = await valueDisplay.textContent();
    expect(newValue).not.toBe(initialValue);
  });

  test('VHF 旋钮滚轮微调', async ({ page }) => {
    const knob = page.locator('#vhfKnob');
    const valueDisplay = page.locator('#vhfValue');
    
    const initialValue = await valueDisplay.textContent();
    expect(initialValue).toBe('100');

    await knob.hover();
    await page.mouse.wheel(0, -100);

    await page.waitForTimeout(100);
    
    const newValue = await valueDisplay.textContent();
    expect(newValue).not.toBe(initialValue);
    
    const numValue = parseInt(newValue || '0', 10);
    expect(numValue).toBeGreaterThan(100);
  });

  test('旋钮值不会超出边界', async ({ page }) => {
    const knob = page.locator('#vhfKnob');
    const valueDisplay = page.locator('#vhfValue');
    
    const box = await knob.boundingBox();
    expect(box).not.toBeNull();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y - 1000);
      await page.mouse.up();

      const newValue = await valueDisplay.textContent();
      const numValue = parseInt(newValue || '0', 10);
      expect(numValue).toBeLessThanOrEqual(250);
      expect(numValue).toBeGreaterThanOrEqual(0);
    }
  });

  test('旋钮拖拽后释放不再变化', async ({ page }) => {
    const knob = page.locator('#vhfKnob');
    const valueDisplay = page.locator('#vhfValue');
    
    const box = await knob.boundingBox();
    expect(box).not.toBeNull();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y - 50);
      await page.mouse.up();

      const value1 = await valueDisplay.textContent();
      
      await page.mouse.move(box.x + box.width / 2, box.y - 100);
      await page.waitForTimeout(100);
      
      const value2 = await valueDisplay.textContent();
      expect(value1).toBe(value2);
    }
  });
});
