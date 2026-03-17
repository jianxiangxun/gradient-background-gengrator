'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  hexToHsl, 
  hslToHex, 
  getColorWheelPosition, 
  getColorFromWheelPosition,
  generateHarmonyColors,
  recommendHarmonyType,
  harmonyRules,
  type HarmonyType
} from '@/lib/colorHarmony';
import { cn } from '@/lib/utils';

export type SelectionMode = 'free' | 'recommend';

interface ColorWheelProps {
  color1: string;
  color2: string;
  onColor1Change: (color: string) => void;
  onColor2Change: (color: string) => void;
  mode: SelectionMode;
  harmonyType: HarmonyType;
  onHarmonyTypeChange: (type: HarmonyType) => void;
  className?: string;
}

const WHEEL_SIZE = 280;
const WHEEL_RADIUS = 120;
const CENTER = WHEEL_SIZE / 2;

export function ColorWheel({
  color1,
  color2,
  onColor1Change,
  onColor2Change,
  mode,
  harmonyType,
  onHarmonyTypeChange,
  className
}: ColorWheelProps) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<'color1' | 'color2' | null>(null);
  const [recommendedColors, setRecommendedColors] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // 获取颜色在色轮上的位置
  const getPositionForColor = useCallback((color: string) => {
    const hsl = hexToHsl(color);
    return getColorWheelPosition(hsl.h, hsl.s, WHEEL_RADIUS);
  }, []);

  // 更新推荐颜色
  useEffect(() => {
    if (mode === 'recommend') {
      const recommendations = generateHarmonyColors(color1, harmonyType);
      setRecommendedColors(recommendations);
      // 如果 color2 不在推荐列表中，自动设置为第二个推荐色
      if (recommendations.length > 1 && !recommendations.includes(color2)) {
        onColor2Change(recommendations[1]);
      }
    }
  }, [mode, color1, harmonyType, color2, onColor2Change]);

  // 处理鼠标/触摸事件
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current || !dragging) return;

    const rect = wheelRef.current.getBoundingClientRect();
    const x = clientX - rect.left - CENTER;
    const y = clientY - rect.top - CENTER;

    const { h, s } = getColorFromWheelPosition(x, y, WHEEL_RADIUS);
    const lightness = hexToHsl(dragging === 'color1' ? color1 : color2).l;
    const newColor = hslToHex({ h, s, l: lightness });

    if (dragging === 'color1') {
      onColor1Change(newColor);
    } else {
      onColor2Change(newColor);
    }
  }, [dragging, color1, color2, onColor1Change, onColor2Change]);

  const handleMouseDown = (colorKey: 'color1' | 'color2') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(colorKey);
  };

  const handleTouchStart = (colorKey: 'color1' | 'color2') => (e: React.TouchEvent) => {
    setDragging(colorKey);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setDragging(null);
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, handleInteraction]);

  // 生成色轮的圆锥渐变
  const wheelGradient = `conic-gradient(
    from 0deg,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  )`;

  const pos1 = getPositionForColor(color1);
  const pos2 = getPositionForColor(color2);

  // 智能推荐和谐类型
  const handleSmartRecommend = () => {
    const recommended = recommendHarmonyType(color1);
    onHarmonyTypeChange(recommended);
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* 色轮容器 */}
      <div 
        className="relative rounded-full shadow-lg"
        style={{
          width: WHEEL_SIZE,
          height: WHEEL_SIZE,
          background: wheelGradient,
        }}
      >
        {/* 饱和度遮罩 */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
          }}
        />
        
        {/* 中心白色区域 */}
        <div 
          className="absolute rounded-full bg-white"
          style={{
            width: WHEEL_RADIUS * 0.3,
            height: WHEEL_RADIUS * 0.3,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* SVG 层用于交互和标记 */}
        <svg
          ref={wheelRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        >
          {/* 推荐颜色标记（仅在推荐模式下显示） */}
          {mode === 'recommend' && recommendedColors.map((color, index) => {
            const pos = getPositionForColor(color);
            return (
              <circle
                key={index}
                cx={CENTER + pos.x}
                cy={CENTER + pos.y}
                r={6}
                fill={color}
                stroke="white"
                strokeWidth={2}
                className="opacity-60"
              />
            );
          })}

          {/* 颜色1 选择器 */}
          <g
            transform={`translate(${CENTER + pos1.x}, ${CENTER + pos1.y})`}
            onMouseDown={handleMouseDown('color1')}
            onTouchStart={handleTouchStart('color1')}
            className="cursor-grab active:cursor-grabbing"
          >
            <circle
              r={14}
              fill={color1}
              stroke="white"
              strokeWidth={3}
              className="drop-shadow-md"
            />
            <text
              y={-20}
              textAnchor="middle"
              className="text-xs font-bold fill-foreground"
              style={{ fontSize: '12px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
            >
              1
            </text>
          </g>

          {/* 颜色2 选择器 */}
          <g
            transform={`translate(${CENTER + pos2.x}, ${CENTER + pos2.y})`}
            onMouseDown={handleMouseDown('color2')}
            onTouchStart={handleTouchStart('color2')}
            className="cursor-grab active:cursor-grabbing"
          >
            <circle
              r={14}
              fill={color2}
              stroke="white"
              strokeWidth={3}
              className="drop-shadow-md"
            />
            <text
              y={-20}
              textAnchor="middle"
              className="text-xs font-bold fill-foreground"
              style={{ fontSize: '12px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
            >
              2
            </text>
          </g>

          {/* 连接线 */}
          <line
            x1={CENTER + pos1.x}
            y1={CENTER + pos1.y}
            x2={CENTER + pos2.x}
            y2={CENTER + pos2.y}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        </svg>
      </div>

      {/* 颜色信息显示 */}
      <div className="flex gap-4 w-full max-w-xs">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div 
            className="w-12 h-12 rounded-xl border-2 border-border shadow-sm"
            style={{ backgroundColor: color1 }}
          />
          <span className="text-xs font-mono text-muted-foreground">{color1.toUpperCase()}</span>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground">→</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div 
            className="w-12 h-12 rounded-xl border-2 border-border shadow-sm"
            style={{ backgroundColor: color2 }}
          />
          <span className="text-xs font-mono text-muted-foreground">{color2.toUpperCase()}</span>
        </div>
      </div>

      {/* 推荐模式控制面板 */}
      {mode === 'recommend' && (
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">和谐类型</span>
            <button
              onClick={handleSmartRecommend}
              className="text-xs text-primary hover:underline"
            >
              智能推荐
            </button>
          </div>
          <select
            value={harmonyType}
            onChange={(e) => onHarmonyTypeChange(e.target.value as HarmonyType)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Object.entries(harmonyRules).map(([key, rule]) => (
              <option key={key} value={key}>
                {rule.name} - {rule.description}
              </option>
            ))}
          </select>
          
          {/* 推荐颜色预览 */}
          <div className="pt-2">
            <span className="text-xs text-muted-foreground mb-2 block">推荐配色方案</span>
            <div className="flex gap-1">
              {recommendedColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => onColor2Change(color)}
                  className={cn(
                    "flex-1 h-8 rounded-md border-2 transition-all",
                    color2 === color ? "border-primary scale-110" : "border-transparent hover:border-border"
                  )}
                  style={{ backgroundColor: color }}
                  title={color.toUpperCase()}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
