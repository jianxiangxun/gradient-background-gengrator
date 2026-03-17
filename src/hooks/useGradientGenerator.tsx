import { useState, useCallback, useRef, useEffect } from 'react';
import { generateRandomSVG } from '@/lib/services/gradientGenerator';
import { colorToParam } from '@/lib/utils';

export function useGradientGenerator() {
  const [colors, setColors] = useState<string[]>(['#5135FF', '#FF5828', '#F69CFF', '#FFA50F']);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 使用 ref 存储最新的 colors，避免依赖循环
  const colorsRef = useRef(colors);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  
  // 同步 ref 值
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);
  
  useEffect(() => {
    widthRef.current = width;
  }, [width]);
  
  useEffect(() => {
    heightRef.current = height;
  }, [height]);

  // 防抖定时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateGradient = useCallback(async () => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置新的定时器，300ms 防抖
    debounceTimerRef.current = setTimeout(async () => {
      setIsGenerating(true);
      try {
        const params = new URLSearchParams();
        colorsRef.current.forEach(color => params.append('colors', colorToParam(color)));
        params.append('width', widthRef.current.toString());
        params.append('height', heightRef.current.toString());
        const response = await fetch(`/api?${params.toString()}`);
        const svg = await response.text();
        setSvgContent(svg);
      } catch (error) {
        console.error('Error generating gradient:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 300);
  }, []); // 空依赖数组，使用 ref 获取最新值

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const downloadGradient = useCallback(() => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradient-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [svgContent]);

  return {
    colors,
    setColors,
    width,
    setWidth,
    height,
    setHeight,
    svgContent,
    isGenerating,
    generateGradient,
    downloadGradient
  };
}
