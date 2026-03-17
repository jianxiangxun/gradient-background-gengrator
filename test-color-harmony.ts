/**
 * 色彩和谐算法测试脚本
 * 
 * 运行方式:
 * npx tsx test-color-harmony.ts
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
  harmonyRules,
  type HarmonyType
} from './src/lib/colorHarmony';

// 简单的测试框架
let totalTests = 0;
let passedTests = 0;

function describe(name: string, fn: () => void) {
  console.log(`\n📦 ${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ ${name}`);
  } catch (error: any) {
    console.log(`  ❌ ${name}`);
    console.error(`     ${error.message}`);
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

// 打印标题
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║      🎨 色彩和谐算法测试 (Color Harmony Tests)         ║');
console.log('╚════════════════════════════════════════════════════════╝');

// 测试套件
describe('颜色转换测试 (Color Conversion)', () => {
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
    const originalRgb = hexToRgb(originalHex);
    const resultRgb = hexToRgb(backToHex);
    expect(Math.abs(originalRgb.r - resultRgb.r)).toBeLessThan(5);
    expect(Math.abs(originalRgb.g - resultRgb.g)).toBeLessThan(5);
    expect(Math.abs(originalRgb.b - resultRgb.b)).toBeLessThan(5);
  });
});

describe('色彩和谐算法测试 (Color Harmony)', () => {
  it('应该生成互补色 (Complementary)', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'complementary');
    expect(colors).toHaveLength(2);
    expect(colors[0]).toBe(baseColor.toUpperCase());
  });

  it('应该生成三角色 (Triadic)', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'triadic');
    expect(colors).toHaveLength(3);
  });

  it('应该生成类似色 (Analogous)', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'analogous');
    expect(colors).toHaveLength(3);
  });

  it('应该生成单色方案 (Monochromatic)', () => {
    const baseColor = '#5135FF';
    const colors = generateHarmonyColors(baseColor, 'monochromatic');
    expect(colors).toHaveLength(5);
    const baseHsl = hexToHsl(baseColor);
    colors.forEach(color => {
      const hsl = hexToHsl(color);
      expect(hsl.h).toBe(baseHsl.h);
    });
  });

  it('应该生成正方形配色 (Square)', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'square');
    expect(colors).toHaveLength(4);
  });

  it('应该生成分裂互补色 (Split Complementary)', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'splitComplementary');
    expect(colors).toHaveLength(3);
  });

  it('应该生成四角色 (Tetradic)', () => {
    const baseColor = '#FF0000';
    const colors = generateHarmonyColors(baseColor, 'tetradic');
    expect(colors).toHaveLength(4);
  });
});

describe('智能推荐测试 (Smart Recommendation)', () => {
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

  it('应该为青色推荐分裂互补色', () => {
    const recommendation = recommendHarmonyType('#00FFFF');
    expect(recommendation).toBe('splitComplementary');
  });

  it('应该为蓝色推荐四角色', () => {
    const recommendation = recommendHarmonyType('#0000FF');
    expect(recommendation).toBe('tetradic');
  });

  it('应该为紫色推荐正方形', () => {
    const recommendation = recommendHarmonyType('#800080');
    expect(recommendation).toBe('square');
  });

  it('应该为低饱和度颜色推荐单色方案', () => {
    const recommendation = recommendHarmonyType('#808080');
    expect(recommendation).toBe('monochromatic');
  });
});

describe('渐变色生成测试 (Gradient Generation)', () => {
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
    const middleColor = gradient[2];
    const middleHsl = hexToHsl(middleColor);
    expect(middleHsl.h).toBeGreaterThan(250);
    expect(middleHsl.h).toBeLessThan(320);
  });
});

describe('对比度测试 (Contrast Ratio)', () => {
  it('应该正确计算黑白对比度', () => {
    const contrast = getContrastRatio('#FFFFFF', '#000000');
    expect(contrast).toBeCloseTo(21, 0);
  });

  it('相同颜色对比度应该为 1', () => {
    const contrast = getContrastRatio('#FF0000', '#FF0000');
    expect(contrast).toBeCloseTo(1, 0);
  });

  it('应该满足 WCAG AA 标准 (4.5:1)', () => {
    const contrast = getContrastRatio('#FFFFFF', '#000000');
    expect(contrast).toBeGreaterThan(4.5);
  });
});

describe('色轮位置计算测试 (Color Wheel Position)', () => {
  it('应该正确计算色轮位置', () => {
    const position = getColorWheelPosition(0, 100, 100);
    expect(position.x).toBeCloseTo(0, 0);
    expect(position.y).toBeCloseTo(-100, 0);
  });

  it('应该正确从位置计算颜色', () => {
    const color = getColorFromWheelPosition(0, -100, 100);
    expect(color.h).toBe(0);
    expect(color.s).toBe(100);
  });

  it('应该处理色轮中心（白色）', () => {
    const color = getColorFromWheelPosition(0, 0, 100);
    expect(color.s).toBe(0);
  });
});

// 演示功能
console.log('\n\n╔════════════════════════════════════════════════════════╗');
console.log('║         🎯 色彩和谐算法演示 (Demo)                      ║');
console.log('╚════════════════════════════════════════════════════════╝');

const demoColor = '#5135FF';
console.log(`\n基色: ${demoColor}`);
console.log(`智能推荐: ${harmonyRules[recommendHarmonyType(demoColor)].name}`);

console.log('\n各和谐类型生成的配色方案:');
(Object.keys(harmonyRules) as HarmonyType[]).forEach(type => {
  const colors = generateHarmonyColors(demoColor, type);
  console.log(`\n  ${harmonyRules[type].name}:`);
  console.log(`    ${colors.join(' → ')}`);
});

// 测试总结
console.log('\n\n╔════════════════════════════════════════════════════════╗');
console.log('║                   测试结果汇总                          ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log(`\n  总测试数: ${totalTests}`);
console.log(`  通过: ${passedTests} ✅`);
console.log(`  失败: ${totalTests - passedTests} ${totalTests - passedTests > 0 ? '❌' : ''}`);
console.log(`  通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 所有测试通过！');
} else {
  console.log('\n⚠️ 部分测试失败，请检查实现。');
  process.exit(1);
}
