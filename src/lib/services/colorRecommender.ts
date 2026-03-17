// 色彩推荐算法服务

// 六边形转HSL
export const hexToHsl = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return [h, s * 100, l * 100];
};

// HSL转六边形
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
};

// 色彩推荐类型
export type ColorScheme = 'complementary' | 'analogous' | 'triadic' | 'splitComplementary' | 'tetradic';

// 获取推荐颜色
export const getRecommendedColors = (baseColor: string, scheme: ColorScheme = 'complementary'): string[] => {
  const [h, s, l] = hexToHsl(baseColor);
  const colors: string[] = [baseColor];

  switch (scheme) {
    case 'complementary':
      // 互补色：色轮上相对的颜色
      colors.push(hslToHex((h + 180) % 360, s, l));
      break;

    case 'analogous':
      // 类似色：色轮上相邻的颜色
      colors.push(hslToHex((h + 30) % 360, s, l));
      colors.push(hslToHex((h - 30 + 360) % 360, s, l));
      break;

    case 'triadic':
      // 三元色：色轮上间隔120度的颜色
      colors.push(hslToHex((h + 120) % 360, s, l));
      colors.push(hslToHex((h + 240) % 360, s, l));
      break;

    case 'splitComplementary':
      // 分裂互补色：互补色附近的颜色
      colors.push(hslToHex((h + 150) % 360, s, l));
      colors.push(hslToHex((h + 210) % 360, s, l));
      break;

    case 'tetradic':
      // 四元色：两对互补色
      colors.push(hslToHex((h + 90) % 360, s, l));
      colors.push(hslToHex((h + 180) % 360, s, l));
      colors.push(hslToHex((h + 270) % 360, s, l));
      break;
  }

  return colors;
};

// 获取所有推荐方案
export const getAllRecommendedSchemes = (baseColor: string) => {
  const schemes: { name: string; colors: string[]; scheme: ColorScheme }[] = [
    {
      name: 'Complementary',
      colors: getRecommendedColors(baseColor, 'complementary'),
      scheme: 'complementary'
    },
    {
      name: 'Analogous',
      colors: getRecommendedColors(baseColor, 'analogous'),
      scheme: 'analogous'
    },
    {
      name: 'Triadic',
      colors: getRecommendedColors(baseColor, 'triadic'),
      scheme: 'triadic'
    },
    {
      name: 'Split Complementary',
      colors: getRecommendedColors(baseColor, 'splitComplementary'),
      scheme: 'splitComplementary'
    },
    {
      name: 'Tetradic',
      colors: getRecommendedColors(baseColor, 'tetradic'),
      scheme: 'tetradic'
    }
  ];

  return schemes;
};

// 生成随机推荐颜色
export const generateRandomRecommendedColors = (baseColor: string): string[] => {
  const schemes: ColorScheme[] = ['complementary', 'analogous', 'triadic', 'splitComplementary', 'tetradic'];
  const randomScheme = schemes[Math.floor(Math.random() * schemes.length)];
  return getRecommendedColors(baseColor, randomScheme);
};