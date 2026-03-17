/**
 * 色彩和谐算法测试
 * 运行命令: npm test
 */

import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  generateHarmonyColors,
  recommendHarmonyType,
  generateColorGradient,
  getContrastRatio,
  getColorWheelPosition,
  getColorFromWheelPosition,
  type HarmonyType
} from '../colorHarmony';

// 简单的测试框架
function describe(name: string, fn: () => void) {
  console.log(`\n📦 ${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.error(`     ${error}`);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toBeCloseTo(expected: number, precision: number = 2) {
      const factor = Math.pow(10, precision);
      if (Math.round(actual * factor) !== Math.round(expected * factor)) {
        throw new Error(`Expected ${expected} (±${Math.pow(10, -precision)}), but got ${actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (!(actual < expected)) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toContain(expected: any) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    },
    toHaveLength(expected: number) {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual.length}`);
      }
    }
  };
}

// 运行测试
console.log('🧪 色彩和谐算法测试开始...\n');

describe('颜色转换测试', () => {
  it('应该正确将 Hex 转换为 RGB', () => {
    const result = hexToRgb('#FF5733');
    expect(result).toEqual({ r: 255, g: 87, b: 51 });
  });

  it('应该正确将 RGB 转换为 Hex', () => {
    const result = rgbToHex({ r: 255, g: 87, b: 51 });
    expect(result).toBe('#FF5733');
  });

  it('应该正确将 RGB 转换为 HSL', () => {
    const result = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(result.h).toBe(0);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('应该正确将 HSL 转换为 RGB', () => {
    const result = hslToRgb({ h: 0, s: 100, l: 50 });
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });

  it('应该正确将 Hex 转换为 HSL 并转换回来', () => {
    const originalHex = '#5135FF';
    const hsl = hexToHsl(originalHex);
    const backToHex = hslToHex(hsl);
    // 允许小误差
    const originalRgb = hexToRgb(originalHex);
    const resultRgb = hexToRgb(backToHex);
    expect(Math.abs(originalRgb.r - resultRgb.r)).toBeLessThan(2);
    expect(Math.abs(originalRgb.g - resultRgb.g)).toBeLessThan(2);
    expect(Math.abs(originalRgb.b - resultRgb.b)).toBeLessThan(2);
  });
});

describe('色彩和谐算法测试', () => {
  it('应该生成互补色', () => {
    const baseColor = '#FF0000'; // 红色
    const colors = generateHarmonyColors(baseColor, 'complementary');
    expect(colors).toHaveLength(2);
    // 互补色应该包含红色和青色
    expect(colors[0]).toBe(baseColor.toUpperCase());
  });

  it('应该生成三角色', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'triadic');
    expect(colors).toHaveLength(3);
  });

  it('应该生成类似色', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'analogous');
    expect(colors).toHaveLength(3);
  });

  it('应该生成单色方案', () => {
    const baseColor = '#5135FF';
    const colors = generateHarmonyColors(baseColor, 'monochromatic');
    expect(colors).toHaveLength(5);
    // 所有颜色应该具有相同的色相
    const baseHsl = hexToHsl(baseColor);
    colors.forEach(color => {
      const hsl = hexToHsl(color);
      expect(hsl.h).toBe(baseHsl.h);
    });
  });

  it('应该生成正方形配色', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'square');
    expect(colors).toHaveLength(4);
  });
});

describe('智能推荐测试', () => {
  it('应该为红色推荐互补色', () => {
    const recommendation = recommendHarmonyType('#FF0000');
    expect(recommendation).toBe('complementary');
  });

  it('应该为橙色推荐类似色', () => {
    const recommendation = recommendHarmonyType('#FFA500');
    expect(recommendation).toBe('analogous');
  });

  it('应该为绿色推荐三角色', () => {
    const recommendation = recommendHarmonyType('#00FF00');
    expect(recommendation).toBe('triadic');
  });

  it('应该为低饱和度颜色推荐单色方案', () => {
    const recommendation = recommendHarmonyType('#808080');
    expect(recommendation).toBe('monochromatic');
  });
});

describe('渐变色生成测试', () => {
  it('应该生成指定步数的渐变色', () => {
    const color1 = '#FF0000';
    const color2 = '#0000FF';
    const gradient = generateColorGradient(color1, color2, 4);
    expect(gradient).toHaveLength(4);
    expect(gradient[0]).toBe(color1.toUpperCase());
    expect(gradient[3]).toBe(color2.toUpperCase());
  });

  it('渐变色应该在起始和结束颜色之间', () => {
    const color1 = '#FF0000';
    const color2 = '#0000FF';
    const gradient = generateColorGradient(color1, color2, 5);
    // 中间颜色应该是紫色系
    const middleColor = gradient[2];
    const middleHsl = hexToHsl(middleColor);
    // 紫色大约在 270-300 度之间
    expect(middleHsl.h).toBeGreaterThan(250);
    expect(middleHsl.h).toBeLessThan(320);
  });
});

describe('对比度测试', () => {
  it('应该正确计算黑白对比度', () => {
    const contrast = getContrastRatio('#FFFFFF', '#000000');
    expect(contrast).toBeCloseTo(21, 0);
  });

  it('相同颜色对比度应该为 1', () => {
    const contrast = getContrastRatio('#FF0000', '#FF0000');
    expect(contrast).toBeCloseTo(1, 0);
  });

  it('应该满足 WCAG AA 标准', () => {
    // 黑色文字在白色背景上
    const contrast = getContrastRatio('#FFFFFF', '#000000');
    expect(contrast).toBeGreaterThan(4.5);
  });
});

describe('色轮位置计算测试', () => {
  it('应该正确计算色轮位置', () => {
    const position = getColorWheelPosition(0, 100, 100); // 红色，最大饱和度
    expect(position.x).toBeCloseTo(0, 0);
    expect(position.y).toBeCloseTo(-100, 0);
  });

  it('应该正确从位置计算颜色', () => {
    const color = getColorFromWheelPosition(0, -100, 100);
    expect(color.h).toBe(0); // 红色
    expect(color.s).toBe(100); // 最大饱和度
  });

  it('应该处理色轮中心（白色）', () => {
    const color = getColorFromWheelPosition(0, 0, 100);
    expect(color.s).toBe(0); // 零饱和度（白色/灰色）
  });
});

// 运行所有测试
console.log('\n🎉 测试完成！');

// 导出测试函数以便其他模块使用
export { describe, it, expect };
