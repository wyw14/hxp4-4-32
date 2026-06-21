import { test, expect } from '@playwright/test';

test.describe('信号匹配测试', () => {
  test.beforeEach(async ({ page }) => {
    const signalsResponsePromise = page.waitForResponse('/signals.json');
    await page.goto('/');
    await signalsResponsePromise;
    await page.waitForTimeout(500);
  });

  test('信号强度条会随旋钮调节变化', async ({ page }) => {
    const signalFill = page.locator('#signalFill');
    
    const initialWidth = await signalFill.evaluate(el => el.style.width);
    
    const vhfKnob = page.locator('#vhfKnob');
    const box = await vhfKnob.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y - 80);
      await page.mouse.up();
      
      await page.waitForTimeout(500);
      
      const newWidth = await signalFill.evaluate(el => el.style.width);
      expect(newWidth).not.toBe(initialWidth);
    }
  });

  test('调节到不受天气影响的信号位置时覆盖层显示', async ({ page }) => {
    const signalOverlay = page.locator('#signalOverlay');
    
    const vhfKnob = page.locator('#vhfKnob');
    const uhfKnob = page.locator('#uhfKnob');
    const antennaKnob = page.locator('#antennaKnob');

    await setKnobValue(page, vhfKnob, page.locator('#vhfValue'), 91, 0, 250, 0.8);
    await setKnobValue(page, uhfKnob, page.locator('#uhfValue'), 537, 100, 800, 1.2);
    await setKnobValue(page, antennaKnob, page.locator('#antennaValue'), 125, 0, 360, 1.5, true);

    await page.waitForTimeout(2000);

    const hasActiveClass = await signalOverlay.evaluate(el => el.classList.contains('active'));
    expect(hasActiveClass).toBeTruthy();
  });

  test('发现不受天气影响的信号后计数增加', async ({ page }) => {
    const foundCount = page.locator('#foundCount');
    
    const initialText = await foundCount.textContent();
    expect(initialText).toBe('Signals found: 0 / 4');

    const vhfKnob = page.locator('#vhfKnob');
    const uhfKnob = page.locator('#uhfKnob');
    const antennaKnob = page.locator('#antennaKnob');

    await setKnobValue(page, vhfKnob, page.locator('#vhfValue'), 91, 0, 250, 0.8);
    await setKnobValue(page, uhfKnob, page.locator('#uhfValue'), 537, 100, 800, 1.2);
    await setKnobValue(page, antennaKnob, page.locator('#antennaValue'), 125, 0, 360, 1.5, true);

    await page.waitForTimeout(3000);

    const newText = await foundCount.textContent();
    expect(newText).not.toBe(initialText);
    
    const match = newText?.match(/Signals found: (\d+) \/ 4/);
    expect(match).not.toBeNull();
    if (match) {
      const count = parseInt(match[1], 10);
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(4);
    }
  });

  test('信号覆盖层显示信号名称和描述', async ({ page }) => {
    const signalOverlay = page.locator('#signalOverlay');
    const signalName = signalOverlay.locator('.signal-name');
    const signalDescription = signalOverlay.locator('.signal-description');

    const vhfKnob = page.locator('#vhfKnob');
    const uhfKnob = page.locator('#uhfKnob');
    const antennaKnob = page.locator('#antennaKnob');

    await setKnobValue(page, vhfKnob, page.locator('#vhfValue'), 91, 0, 250, 0.8);
    await setKnobValue(page, uhfKnob, page.locator('#uhfValue'), 537, 100, 800, 1.2);
    await setKnobValue(page, antennaKnob, page.locator('#antennaValue'), 125, 0, 360, 1.5, true);

    await page.waitForTimeout(2000);

    const hasActiveClass = await signalOverlay.evaluate(el => el.classList.contains('active'));
    expect(hasActiveClass).toBeTruthy();
    
    const nameText = await signalName.textContent();
    const descText = await signalDescription.textContent();
    
    expect(nameText).toBeTruthy();
    expect(nameText?.length).toBeGreaterThan(0);
    expect(descText).toBeTruthy();
    expect(descText?.length).toBeGreaterThan(0);
    expect(nameText).toBe('Lost Tape #7');
  });

  test('二进制流在信号覆盖层激活时显示', async ({ page }) => {
    const signalOverlay = page.locator('#signalOverlay');
    const binaryStream = signalOverlay.locator('.binary-stream');

    const vhfKnob = page.locator('#vhfKnob');
    const uhfKnob = page.locator('#uhfKnob');
    const antennaKnob = page.locator('#antennaKnob');

    await setKnobValue(page, vhfKnob, page.locator('#vhfValue'), 91, 0, 250, 0.8);
    await setKnobValue(page, uhfKnob, page.locator('#uhfValue'), 537, 100, 800, 1.2);
    await setKnobValue(page, antennaKnob, page.locator('#antennaValue'), 125, 0, 360, 1.5, true);

    await page.waitForTimeout(2000);

    const hasActiveClass = await signalOverlay.evaluate(el => el.classList.contains('active'));
    expect(hasActiveClass).toBeTruthy();
    
    const binaryText = await binaryStream.textContent();
    expect(binaryText).toBeTruthy();
    expect(binaryText?.length).toBeGreaterThan(0);
    expect(binaryText).toMatch(/^[01#]+$/);
  });
});

async function setKnobValue(
  page: any,
  knob: any,
  valueElement: any,
  targetValue: number,
  min: number,
  max: number,
  sensitivity: number = 0.8,
  isAntenna: boolean = false
): Promise<void> {
  const box = await knob.boundingBox();
  if (!box) return;

  const currentText = await valueElement.textContent();
  let currentValue: number;
  
  if (isAntenna) {
    currentValue = parseInt(currentText?.replace('°', '') || '0', 10);
  } else {
    currentValue = parseInt(currentText || '0', 10);
  }

  const deltaValue = targetValue - currentValue;
  const range = max - min;
  const deltaY = -(deltaValue * 300) / (sensitivity * range);

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const targetY = startY + deltaY;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, targetY);
  await page.mouse.up();
  
  await page.waitForTimeout(200);
}
