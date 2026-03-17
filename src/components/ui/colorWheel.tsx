import React, { useRef, useState, useEffect } from 'react';
import { getRecommendedColors } from '@/lib/services/colorRecommender';

interface ColorWheelProps {
  colors: string[];
  onColorsChange: (colors: string[]) => void;
  mode: 'free' | 'recommended';
  onModeChange: (mode: 'free' | 'recommended') => void;
}

const ColorWheel: React.FC<ColorWheelProps> = ({
  colors,
  onColorsChange,
  mode,
  onModeChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 生成色轮
  const drawColorWheel = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    // 绘制色轮
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const color = `hsl(${angle}, 100%, 50%)`;
      ctx.fillStyle = color;
      ctx.fill();
    }

    // 绘制选择点
    colors.forEach((color, index) => {
      const [h] = hexToHsl(color);
      const angle = (h * Math.PI) / 180;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? '#ffffff' : '#000000';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [colors]);

  // 六边形转HSL
  const hexToHsl = (hex: string): [number, number, number] => {
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
  const hslToHex = (h: number, s: number, l: number): string => {
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

  // 获取点击位置的颜色
  const getColorAtPosition = (x: number, y: number): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '#000000';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) - 10;

    if (distance > radius) return '#000000';

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    return hslToHex(angle, 100, 50);
  };

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 检查是否点击了选择点
    let clickedIndex = null;
    colors.forEach((color, index) => {
      const [h] = hexToHsl(color);
      const angle = (h * Math.PI) / 180;
      const pointX = centerX + Math.cos(angle) * radius;
      const pointY = centerY + Math.sin(angle) * radius;

      const dx = x - pointX;
      const dy = y - pointY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 10) {
        clickedIndex = index;
      }
    });

    if (clickedIndex !== null) {
      // 推荐模式下，只允许修改第一个颜色
      if (mode === 'recommended' && clickedIndex !== 0) {
        return;
      }
      setSelectedIndex(clickedIndex);
      setIsDragging(true);
    } else {
      // 如果没有点击选择点，在色轮上点击
      const newColor = getColorAtPosition(x, y);
      
      if (mode === 'recommended') {
        // 推荐模式下，自动生成推荐颜色
        const recommendedColors = getRecommendedColors(newColor);
        onColorsChange(recommendedColors.slice(0, 2));
      } else {
        // 自由模式下，如果颜色数量少于2，则添加新颜色
        if (colors.length < 2) {
          onColorsChange([...colors, newColor]);
        }
      }
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newColor = getColorAtPosition(x, y);
    
    if (mode === 'recommended' && selectedIndex === 0) {
      // 推荐模式下，只修改第一个颜色，第二个颜色自动推荐
      const recommendedColors = getRecommendedColors(newColor);
      onColorsChange(recommendedColors.slice(0, 2));
    } else {
      // 自由模式下，允许修改所有颜色
      const newColors = [...colors];
      newColors[selectedIndex] = newColor;
      onColorsChange(newColors);
    }
  };

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedIndex(null);
  };

  // 初始化和更新时绘制色轮
  useEffect(() => {
    drawColorWheel();
  }, [colors]);

  return (
    <div className="space-y-6">
      {/* 模式选择 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Color Wheel</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="free"
              checked={mode === 'free'}
              onChange={() => onModeChange('free')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">Free</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="recommended"
              checked={mode === 'recommended'}
              onChange={() => onModeChange('recommended')}
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm">Recommended</span>
          </label>
        </div>
      </div>

      {/* 色轮画布 */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="border border-border rounded-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* 颜色预览 */}
      <div className="flex items-center gap-4">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full border-2 border-border"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono">{color.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorWheel;