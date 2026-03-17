/**
 * 色彩和谐算法 - 基于色彩理论的颜色推荐系统
 * 支持多种色彩和谐规则：互补色、类似色、三角色、分裂互补色、四角色等
 */

export type HarmonyType = 
  | 'complementary'      // 互补色
  | 'analogous'          // 类似色
  | 'triadic'            // 三角色
  | 'splitComplementary' // 分裂互补色
  | 'tetradic'           // 四角色（矩形）
  | 'square'             // 正方形
  | 'monochromatic';     // 单色

export interface HarmonyRule {
  name: string;
  description: string;
  angles: number[]; // 相对于基色的角度偏移
}

// 色彩和谐规则定义
export const harmonyRules: Record<HarmonyType, HarmonyRule> = {
  complementary: {
    name: '互补色',
    description: '色轮上相对的两种颜色，对比强烈',
    angles: [0, 180]
  },
  analogous: {
    name: '类似色',
    description: '色轮上相邻的颜色，和谐统一',
    angles: [0, 30, -30]
  },
  triadic: {
    name: '三角色',
    description: '色轮上等距的三种颜色，平衡且丰富',
    angles: [0, 120, 240]
  },
  splitComplementary: {
    name: '分裂互补色',
    description: '基色与互补色两侧的颜色，对比但柔和',
    angles: [0, 150, 210]
  },
  tetradic: {
    name: '四角色',
    description: '两组互补色，丰富多样',
    angles: [0, 60, 180, 240]
  },
  square: {
    name: '正方形',
    description: '色轮上等距的四种颜色，平衡多样',
    angles: [0, 90, 180, 270]
  },
  monochromatic: {
    name: '单色',
    description: '同一色相的不同明度和饱和度',
    angles: [0, 0, 0] // 特殊处理
  }
};

// HSL 颜色接口
export interface HSLColor {
  h: number; // 色相: 0-360
  s: number; // 饱和度: 0-100
  l: number; // 亮度: 0-100
}

// RGB 颜色接口
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * 将 Hex 颜色转换为 HSL
 */
export function hexToHsl(hex: string): HSLColor {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb);
}

/**
 * 将 HSL 颜色转换为 Hex
 */
export function hslToHex(hsl: HSLColor): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

/**
 * 将 Hex 颜色转换为 RGB
 */
export function hexToRgb(hex: string): RGBColor {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * 将 RGB 颜色转换为 Hex
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * 将 RGB 颜色转换为 HSL
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * 将 HSL 颜色转换为 RGB
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * 根据色彩和谐规则生成推荐颜色
 * @param baseColor 基色 (Hex)
 * @param harmonyType 和谐类型
 * @returns 推荐的颜色数组
 */
export function generateHarmonyColors(
  baseColor: string, 
  harmonyType: HarmonyType
): string[] {
  const baseHsl = hexToHsl(baseColor);
  const rule = harmonyRules[harmonyType];
  
  if (harmonyType === 'monochromatic') {
    // 单色模式：生成不同明度和饱和度的变体
    return [
      hslToHex({ h: baseHsl.h, s: baseHsl.s, l: Math.max(20, baseHsl.l - 30) }),
      hslToHex({ h: baseHsl.h, s: Math.max(20, baseHsl.s - 20), l: baseHsl.l }),
      hslToHex(baseHsl),
      hslToHex({ h: baseHsl.h, s: Math.min(100, baseHsl.s + 20), l: baseHsl.l }),
      hslToHex({ h: baseHsl.h, s: baseHsl.s, l: Math.min(80, baseHsl.l + 30) })
    ];
  }

  // 根据角度偏移生成颜色
  return rule.angles.map(angle => {
    const newHue = (baseHsl.h + angle + 360) % 360;
    return hslToHex({
      h: newHue,
      s: baseHsl.s,
      l: baseHsl.l
    });
  });
}

/**
 * 获取色轮上的位置坐标
 * @param hue 色相 (0-360)
 * @param saturation 饱和度 (0-100)
 * @param radius 色轮半径
 * @returns 坐标 {x, y}，中心点为 (0, 0)
 */
export function getColorWheelPosition(
  hue: number, 
  saturation: number, 
  radius: number
): { x: number; y: number } {
  const angleRad = (hue - 90) * (Math.PI / 180); // -90 度使 0 度在顶部
  const distance = (saturation / 100) * radius;
  return {
    x: Math.cos(angleRad) * distance,
    y: Math.sin(angleRad) * distance
  };
}

/**
 * 从色轮位置计算色相和饱和度
 * @param x 相对于中心的 x 坐标
 * @param y 相对于中心的 y 坐标
 * @param radius 色轮半径
 * @returns HSL 中的 h 和 s
 */
export function getColorFromWheelPosition(
  x: number, 
  y: number, 
  radius: number
): { h: number; s: number } {
  const distance = Math.min(Math.sqrt(x * x + y * y), radius);
  const saturation = (distance / radius) * 100;
  
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  angle = (angle + 90 + 360) % 360; // 转换回 0-360 范围
  
  return { h: Math.round(angle), s: Math.round(saturation) };
}

/**
 * 生成色轮的渐变色谱数据
 * @param segments 分段数，用于生成平滑渐变
 * @returns 颜色数组
 */
export function generateColorWheelSpectrum(segments: number = 360): string[] {
  return Array.from({ length: segments }, (_, i) => {
    const hue = i * (360 / segments);
    return hslToHex({ h: hue, s: 100, l: 50 });
  });
}

/**
 * 计算两个颜色之间的对比度
 * 基于 WCAG 对比度算法
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * 计算颜色的相对亮度
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 智能推荐最佳和谐类型
 * 根据基色的特性推荐最适合的色彩和谐方案
 */
export function recommendHarmonyType(baseColor: string): HarmonyType {
  const hsl = hexToHsl(baseColor);
  
  // 根据色相推荐不同的和谐类型
  if (hsl.s < 20) {
    // 低饱和度颜色推荐单色方案
    return 'monochromatic';
  }
  
  // 根据色相范围推荐
  if (hsl.h >= 0 && hsl.h < 30 || hsl.h >= 330) {
    // 红色系推荐互补色
    return 'complementary';
  } else if (hsl.h >= 30 && hsl.h < 90) {
    // 橙黄色系推荐类似色
    return 'analogous';
  } else if (hsl.h >= 90 && hsl.h < 150) {
    // 绿色系推荐三角色
    return 'triadic';
  } else if (hsl.h >= 150 && hsl.h < 210) {
    // 青色系推荐分裂互补色
    return 'splitComplementary';
  } else if (hsl.h >= 210 && hsl.h < 270) {
    // 蓝色系推荐四角色
    return 'tetradic';
  } else {
    // 紫色系推荐正方形
    return 'square';
  }
}

/**
 * 生成渐变色（两种颜色之间）
 * @param color1 起始颜色
 * @param color2 结束颜色
 * @param steps 步数
 * @returns 渐变色数组
 */
export function generateColorGradient(
  color1: string, 
  color2: string, 
  steps: number = 4
): string[] {
  const hsl1 = hexToHsl(color1);
  const hsl2 = hexToHsl(color2);
  
  return Array.from({ length: steps }, (_, i) => {
    const ratio = i / (steps - 1);
    const h = interpolateHue(hsl1.h, hsl2.h, ratio);
    const s = hsl1.s + (hsl2.s - hsl1.s) * ratio;
    const l = hsl1.l + (hsl2.l - hsl1.l) * ratio;
    return hslToHex({ h: Math.round(h), s: Math.round(s), l: Math.round(l) });
  });
}

/**
 * 插值色相，处理 360/0 度边界
 */
function interpolateHue(h1: number, h2: number, ratio: number): number {
  let diff = h2 - h1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  let result = h1 + diff * ratio;
  return (result + 360) % 360;
}
