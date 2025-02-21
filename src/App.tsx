// @ts-nocheck
/* eslint-disable */
// @charset UTF-8

import React, { useState, useRef } from 'react';
import {
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  MenuItem,
} from '@mui/material';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import * as gifshot from 'gifshot';
import { TEXTS } from './constants';

// 定义类型
interface Line {
  x1: number;
  y1: number;
  length: number;
  angle: number;
  color: string;
  offset: number;
}

interface Emoji {
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scale: number;
}

interface ScatteredChar {
  char: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  opacity: number;
  fontSize: number;
  fontFamily: string;
}

function App() {
  // 状态定义
  const [topText, setTopText] = useState('');
  const [mainText, setMainText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [styles, setStyles] = useState<string[]>(['emoji']);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState('Arial');

  // 修改字体选项
  const fontOptions = [
    { value: 'Arial', label: TEXTS.FONT_OPTIONS.DEFAULT },
    { value: 'Times New Roman', label: TEXTS.FONT_OPTIONS.SERIF },
    { value: 'Georgia', label: TEXTS.FONT_OPTIONS.ELEGANT },
    { value: 'Impact', label: TEXTS.FONT_OPTIONS.BOLD },
    { value: 'Comic Sans MS', label: TEXTS.FONT_OPTIONS.CUTE },
  ];

  // 修改生成随机线条的函数
  const generateRandomLines = (): Line[] => {
    const lines: Line[] = [];
    const colors = [
      '#d00b57',
      '#eb89a7', 
      '#a789eb',
      '#89eba7',
      '#eba789',
    ];

    // 生成曲线函数
    const generateCurve = (startX: number, startY: number, endX: number, endY: number, segments: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const controlPoint1X = startX + (Math.random() * 50 - 25);
      const controlPoint1Y = startY + (Math.random() * 50 - 25);
      const controlPoint2X = endX + (Math.random() * 50 - 25);
      const controlPoint2Y = endY + (Math.random() * 50 - 25);

      for (let i = 0; i < segments; i++) {
        const t1 = i / segments;
        const t2 = (i + 1) / segments;

        const x1 = Math.pow(1 - t1, 3) * startX + 
                   3 * Math.pow(1 - t1, 2) * t1 * controlPoint1X + 
                   3 * (1 - t1) * Math.pow(t1, 2) * controlPoint2X + 
                   Math.pow(t1, 3) * endX;
        
        const y1 = Math.pow(1 - t1, 3) * startY + 
                   3 * Math.pow(1 - t1, 2) * t1 * controlPoint1Y + 
                   3 * (1 - t1) * Math.pow(t1, 2) * controlPoint2Y + 
                   Math.pow(t1, 3) * endY;

        const x2 = Math.pow(1 - t2, 3) * startX + 
                   3 * Math.pow(1 - t2, 2) * t2 * controlPoint1X + 
                   3 * (1 - t2) * Math.pow(t2, 2) * controlPoint2X + 
                   Math.pow(t2, 3) * endX;
        
        const y2 = Math.pow(1 - t2, 3) * startY + 
                   3 * Math.pow(1 - t2, 2) * t2 * controlPoint1Y + 
                   3 * (1 - t2) * Math.pow(t2, 2) * controlPoint2Y + 
                   Math.pow(t2, 3) * endY;

        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1);

        lines.push({
          x1,
          y1,
          length,
          angle,
          color,
          offset: Math.random() * Math.PI * 2,
        });
      }
    };

    // 增加曲线数量和分段数
    const numCurves = 30; // 从15增加到30
    const segments = 40;  // 从30增加到40

    // 生成多条曲线
    for (let i = 0; i < numCurves; i++) {
      // 修改起点和终点的生成方式，使线条分布更均匀
      const startX = (i % 5) * 25 + Math.random() * 15;
      const startY = Math.random() * 100;
      const endX = ((i + 2) % 5) * 25 + Math.random() * 15;
      const endY = Math.random() * 100;
      generateCurve(startX, startY, endX, endY, segments);
    }

    // 额外添加一些短线条作为装饰
    const numShortLines = 20;
    for (let i = 0; i < numShortLines; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const length = 5 + Math.random() * 10; // 短线条长度
      const angle = Math.random() * Math.PI * 2;
      
      lines.push({
        x1: x,
        y1: y,
        length,
        angle,
        color: colors[Math.floor(Math.random() * colors.length)],
        offset: Math.random() * Math.PI * 2,
      });
    }

    return lines;
  };

  // 添加贝塞尔曲线计算函数
  const getBezierPoint = (points: Array<{x: number, y: number}>, t: number) => {
    if (points.length === 1) {
      return points[0];
    }
    
    const newPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
      newPoints.push({
        x: points[i].x * (1 - t) + points[i + 1].x * t,
        y: points[i].y * (1 - t) + points[i + 1].y * t
      });
    }
    
    return getBezierPoint(newPoints, t);
  };

  // 修改生成随机表情的函数，减小最小间距允许轻微重叠
  const generateRandomEmojis = (): Emoji[] => {
    const emojis = [
      '🌸', '✨', '💫', '🌟', '💝', '🎀', '🍠', '🌺', '🎈', '🪽', '🌷', '🍡',
      '💗', '🎉', '📕', '🔖', '🌢', '🌣', '🎔', '🎕', '🎘', '🎜', '🎝',
      '🌹', '🌻', '🌼', '🌱', '🍀', '🌿', '🎋', '🎍', '🪴', '🌳', '🌴',
      '🌵', '🍦', '🍪', '🎂', '🍰', '🥧', '🍫', '🍯', '🍼', '🧼', '☕', 
      '🍵', '🍶', '🍾', '🍷', '🍻', '🥂', '🥃', '🥤', '🥢', '🍽', '🍴',
      '🌍', '🌎', '🌏', '🌐', '🗺', '🗾', '🏔', '⛰', '🌋', '🗻', '🏕',
      '🎠', '🎡', '🎢', '🎪', '🎭', '🎨', '🚂', '🚃', '🚄', '🛩',
      '⌛', '⏳', '⌚', '🕰',  '🦖', '🌔', '🌕', '🌖','🥑','🍑','🥝',
      '🎃', '🎄', '🎆', '🎇', '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏',
    ];
    const positions: Emoji[] = [];
    const minDistance = 10; // 减小最小间距
    
    const isValidPosition = (x: number, y: number) => {
      for (const pos of positions) {
        const distance = Math.sqrt(
          Math.pow(pos.x - x, 2) + 
          Math.pow(pos.y - y, 2)
        );
        if (distance < minDistance) {
          return false;
        }
      }
      return true;
    };
    
    for (let i = 0; i < 50; i++) { // 减少emoji数量
      let x: number, y: number;
      let attempts = 0;
      do {
        x = Math.random() * 90 + 5; // 留出边距
        y = Math.random() * 90 + 5;
        attempts++;
      } while (!isValidPosition(x, y) && attempts < 50);
      
      if (attempts < 50) { // 如果找到合适位置
        positions.push({
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x,
          y,
          rotation: Math.random() * 360,
          opacity: 0.4 + Math.random() * 0.2, // 增加透明度范围到0.4-0.6
          scale: 1.1 + Math.random() * 0.3,
        });
      }
    }
    return positions;
  };

  // 修改文字生成部分，增加间距
  const generateScatteredText = (text: string): ScatteredChar[] => {
    const colors = [
      '#d00b57',
      '#eb89a7',
      '#a789eb',
      '#89eba7',
      '#eba789',
    ];
    
    // 计算基础参数
    const centerX = 50; // 画布中心X
    const centerY = 50; // 画布中心Y
    const totalChars = text.length;
    
    // 计算对角线布局参数
    const angle = -35; // 对角线倾斜角度
    const spacing = 2.0; // 从1.2改为2.0增加间距
    
    // 计算文字总长度时考虑更大的间距
    const totalLength = (totalChars - 1) * spacing * fontSize;
    const halfLength = totalLength / 2;
    
    // 生成字符位置
    return text.split('').map((char, index) => {
      // 计算每个字符在对角线上的相对位置（-0.5到0.5之间）
      const relativePosition = (index - (totalChars - 1) / 2) / (totalChars - 1);
      
      // 计算字符在对角线上的偏移量
      const offset = relativePosition * halfLength;
      
      // 计算字符的最终位置
      const radians = (angle * Math.PI) / 180;
      const x = centerX + (offset * Math.cos(radians) / 4); // 除以4是为了缩小范围
      const y = centerY + (offset * Math.sin(radians) / 4);
      
      // 计算字符的旋转角度（基础角度加上小幅随机偏移）
      const rotation = angle + (Math.random() - 0.5) * 10;
      
      // 计算每个字符的随机Y轴偏移（波浪效果）
      const waveOffset = Math.sin(relativePosition * Math.PI) * 3;
      
      return {
        char: char === 'I' ? 'i' : char === 'l' ? 'L' : char,
        x: x + (Math.random() - 0.5) * 2,
        y: y + waveOffset + (Math.random() - 0.5) * 2,
        rotation,
        scale: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.4 + Math.random() * 0.2,
        fontSize: fontSize,
        fontFamily: fontFamily
      };
    });
  };

  // 处理生成图片
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (!canvasRef.current) return;
      
      if (!styles.includes('dynamic')) {
        // 如果没有选择动态效果，使用原的静态图片生成方式
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: undefined,
          scale: 2,
          logging: false,
        });
        
        const link = document.createElement('a');
        link.download = 'xhs-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        // 优化GIF生成参数
        const frames: string[] = [];
        const frameCount = 6; // 减少帧数
        
        for (let i = 0; i < frameCount; i++) {
          const dataUrl = await htmlToImage.toPng(canvasRef.current, {
            backgroundColor: undefined,
            pixelRatio: 1.5,
          });
          frames.push(dataUrl);
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        gifshot.createGIF({
          images: frames,
          gifWidth: canvasRef.current.offsetWidth * 1.5,
          gifHeight: canvasRef.current.offsetHeight * 1.5,
          interval: 0.2,
          numFrames: frameCount,
          frameDuration: 1,
          sampleInterval: 12,
          quality: 8,
        }, function(obj) {
          if(!obj.error && obj.image) {
            const link = document.createElement('a');
            link.download = 'xhs-image.gif';
            link.href = obj.image;
            link.click();
          }
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const scatteredChars = generateScatteredText(mainText);
  const emojis = generateRandomEmojis();
  const lines = generateRandomLines();

  // 添加动态效果的样式
  const dynamicStyle = {
    animation: 'float 3s ease-in-out infinite',
  };

  // 修改动画式，使其更适合捕获
  const getAnimationStyle = (index: number) => ({
    animation: styles.includes('dynamic') 
      ? `float 3s ease-in-out infinite ${(index * 0.2) % 1}s`
      : undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold">{TEXTS.TITLE}</h1>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  {TEXTS.IMPORTANT_NOTICE}
                </p>
                <p className="mt-2 text-sm text-yellow-600">
                  {TEXTS.RISK_WARNING}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold">{TEXTS.USAGE_TITLE}</p>
          <ul className="list-disc pl-5 space-y-1">
            {Object.values(TEXTS.USAGE_STEPS).map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {TEXTS.INPUTS.TOP_TEXT.LABEL}
            </label>
            <TextField
              fullWidth
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder={TEXTS.INPUTS.TOP_TEXT.PLACEHOLDER}
              variant="outlined"
              size="small"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {TEXTS.INPUTS.WECHAT.LABEL} <span className="text-red-500">{TEXTS.INPUTS.WECHAT.REQUIRED}</span>
            </label>
            <TextField
              fullWidth
              required
              value={mainText}
              onChange={(e) => setMainText(e.target.value)}
              placeholder="请输入微信号"
              variant="outlined"
              size="small"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {TEXTS.INPUTS.BOTTOM_TEXT.LABEL}
            </label>
            <TextField
              fullWidth
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder={TEXTS.INPUTS.BOTTOM_TEXT.PLACEHOLDER}
              variant="outlined"
              size="small"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {TEXTS.INPUTS.FONT_SETTINGS.TITLE}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {TEXTS.INPUTS.FONT_SETTINGS.SIZE}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
                    onClick={() => {
                      const newSize = Math.max(20, fontSize - 2);
                      setFontSize(newSize);
                    }}
                  >
                    -
                  </button>
                  <TextField
                    type="number"
                    value={fontSize}
                    onChange={(e) => {
                      const value = e.target.value;
                      const size = Number(value);
                      if (!isNaN(size) && size >= 20 && size <= 100) {
                        setFontSize(size);
                      }
                    }}
                    inputProps={{ 
                      min: 20, 
                      max: 100,
                      step: 2,
                      style: { 
                        textAlign: 'center',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }
                    }}
                    size="small"
                    fullWidth
                  />
                  <button
                    className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
                    onClick={() => {
                      const newSize = Math.min(100, fontSize + 2);
                      setFontSize(newSize);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {TEXTS.INPUTS.FONT_SETTINGS.STYLE}
                </label>
                <TextField
                  select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  size="small"
                  fullWidth
                >
                  {fontOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {TEXTS.INPUTS.BACKGROUND.TITLE}
            </label>
            <div className="flex flex-wrap gap-4 justify-center">
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={styles.includes('lines')}
                    onChange={(e) => {
                      if(e.target.checked) {
                        setStyles([...styles, 'lines']);
                      } else {
                        setStyles(styles.filter(s => s !== 'lines'));
                      }
                    }}
                  />
                }
                label={TEXTS.INPUTS.BACKGROUND.LINES}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={styles.includes('emoji')}
                    onChange={(e) => {
                      if(e.target.checked) {
                        setStyles([...styles, 'emoji']);
                      } else {
                        setStyles(styles.filter(s => s !== 'emoji'));
                      }
                    }}
                  />
                }
                label={TEXTS.INPUTS.BACKGROUND.EMOJI}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={styles.includes('dynamic')}
                    onChange={(e) => {
                      if(e.target.checked) {
                        setStyles([...styles, 'dynamic']);
                      } else {
                        setStyles(styles.filter(s => s !== 'dynamic'));
                      }
                    }}
                  />
                }
                label={TEXTS.INPUTS.BACKGROUND.DYNAMIC}
              />
            </div>
          </div>
        </div>

        <div 
          ref={canvasRef}
          className="relative bg-white border rounded-lg p-6 mb-6"
          style={{ 
            height: '500px', 
            overflow: 'hidden',
            background: 'linear-gradient(to bottom right, #fff5f5, #fff)',
          }}
        >
          {styles.includes('lines') && lines.map((line, i) => (
            <div
              key={`line-${i}`}
              className="absolute"
              style={{
                left: `${line.x1}%`,
                top: `${line.y1}%`,
                width: `${line.length}%`,
                height: '1.8px', // 增加线条粗细从1px到1.8px
                background: line.color,
                transform: `rotate(${line.angle}rad)`,
                opacity: 0.2, // 稍微增加透明度从0.15到0.2
                transformOrigin: '0 0',
                pointerEvents: 'none',
                transition: styles.includes('dynamic') ? 'none' : 'all 0.3s ease',
                animation: styles.includes('dynamic') 
                  ? `lineWave 4s ease-in-out infinite ${(i * 0.05)}s`
                  : 'none',
                boxShadow: '0 0 2px rgba(0,0,0,0.1)', // 添加轻微阴影效果
              }}
            />
          ))}

          {styles.includes('emoji') && emojis.map((emoji, i) => (
            <div
              key={`emoji-${i}`}
              className="absolute"
              style={{
                left: `${emoji.x}%`,
                top: `${emoji.y}%`,
                transform: `rotate(${emoji.rotation}deg) scale(${emoji.scale})`,
                fontSize: '24px',
                opacity: emoji.opacity,
                pointerEvents: 'none',
                userSelect: 'none',
                willChange: 'transform',
                ...getAnimationStyle(i),
              }}
            >
              {emoji.emoji}
            </div>
          ))}
          
          <div className="relative z-10 text-center h-full flex flex-col justify-between">
            {topText && (
              <p 
                className="text-gray-600" 
                style={{ 
                  fontSize: '16px',
                  opacity: 0.2 + Math.random() * 0.2
                }}
              >
                {topText}
              </p>
            )}
            
            <div className="relative flex-grow" style={{ 
              minHeight: '300px',
              margin: '20px 0',
              position: 'relative',
              overflow: 'visible', // 修改这里，允许内容溢出
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {scatteredChars.map((char, i) => (
                <div
                  key={`char-${i}`}
                  className="absolute inline-block"
                  style={{
                    left: `${char.x}%`,
                    top: `${char.y}%`,
                    transform: `rotate(${char.rotation}deg)`,
                    fontSize: `${char.fontSize}px`,
                    fontFamily: char.fontFamily,
                    color: char.color,
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: char.opacity,
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                  }}
                >
                  {char.char}
                </div>
              ))}
            </div>
            
            {bottomText && (
              <p 
                className="text-gray-600" 
                style={{ 
                  fontSize: '16px',
                  opacity: 0.2 + Math.random() * 0.2
                }}
              >
                {bottomText}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="contained"
          fullWidth
          onClick={handleGenerate}
          disabled={!mainText || isGenerating}
          style={{
            background: 'linear-gradient(45deg, #FF385C 30%, #FF5B79 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          }}
        >
          {isGenerating ? TEXTS.BUTTONS.GENERATE.GENERATING : TEXTS.BUTTONS.GENERATE.DEFAULT}
        </Button>

        <div className="mt-4 text-sm text-gray-500">
          <p>{TEXTS.TIPS.TITLE}</p>
          <ul className="list-disc pl-5 space-y-1">
            {TEXTS.TIPS.ITEMS.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;