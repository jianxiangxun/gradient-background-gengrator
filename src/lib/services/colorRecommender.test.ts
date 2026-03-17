import { getRecommendedColors, getAllRecommendedSchemes, hexToHsl, hslToHex } from './colorRecommender';

describe('Color Recommender', () => {
  test('hexToHsl converts hex to HSL correctly', () => {
    const hsl = hexToHsl('#FF0000');
    expect(hsl[0]).toBeCloseTo(0);
    expect(hsl[1]).toBeCloseTo(100);
    expect(hsl[2]).toBeCloseTo(50);
  });

  test('hslToHex converts HSL to hex correctly', () => {
    const hex = hslToHex(0, 100, 50);
    expect(hex).toBe('#ff0000');
  });

  test('getRecommendedColors returns complementary colors', () => {
    const colors = getRecommendedColors('#FF0000', 'complementary');
    expect(colors).toHaveLength(2);
    expect(colors[0]).toBe('#FF0000');
    // 互补色应该是绿色
    expect(colors[1]).toBe('#00ffff');
  });

  test('getRecommendedColors returns analogous colors', () => {
    const colors = getRecommendedColors('#FF0000', 'analogous');
    expect(colors).toHaveLength(3);
    expect(colors[0]).toBe('#FF0000');
  });

  test('getRecommendedColors returns triadic colors', () => {
    const colors = getRecommendedColors('#FF0000', 'triadic');
    expect(colors).toHaveLength(3);
    expect(colors[0]).toBe('#FF0000');
  });

  test('getAllRecommendedSchemes returns all schemes', () => {
    const schemes = getAllRecommendedSchemes('#FF0000');
    expect(schemes).toHaveLength(5);
    expect(schemes[0].name).toBe('Complementary');
    expect(schemes[1].name).toBe('Analogous');
    expect(schemes[2].name).toBe('Triadic');
    expect(schemes[3].name).toBe('Split Complementary');
    expect(schemes[4].name).toBe('Tetradic');
  });
});