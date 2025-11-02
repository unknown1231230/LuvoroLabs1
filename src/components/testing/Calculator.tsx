"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isDeg, setIsDeg] = useState(false); // false for RAD, true for DEG

  // --- Custom Dragging Logic ---
  const [position, setPosition] = useState({ x: window.innerWidth / 4, y: window.innerHeight / 4 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (calculatorRef.current) {
      const rect = calculatorRef.current.getBoundingClientRect();
      setOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleDragStart(e.clientX, e.clientY);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (isDragging) {
      setPosition({
        x: clientX - offset.x,
        y: clientY - offset.y,
      });
    }
  }, [isDragging, offset]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  }, [handleDragMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleDragEnd, handleTouchMove]);
  // --- End Custom Dragging Logic ---

  const evaluateExpression = (expr: string) => {
    try {
      const degToRad = (deg: number) => deg * (Math.PI / 180);
      
      let safeExpr = expr
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      // Handle trig functions with deg/rad conversion
      if (isDeg) {
        safeExpr = safeExpr
          .replace(/sin\(/g, `Math.sin(${degToRad.toString()}(`)
          .replace(/cos\(/g, `Math.cos(${degToRad.toString()}(`)
          .replace(/tan\(/g, `Math.tan(${degToRad.toString()}(`);
      } else {
        safeExpr = safeExpr
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(');
      }
      
      // Using Function constructor for safer evaluation
      const finalResult = new Function('return ' + safeExpr)();
      // Round to avoid floating point inaccuracies
      return Number(finalResult.toPrecision(15));
    } catch (error) {
      return 'Error';
    }
  };

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      if (input === '') return;
      const evalResult = evaluateExpression(input);
      setResult(String(evalResult));
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1));
    } else if (['sin', 'cos', 'tan', 'sqrt', 'log', 'ln'].includes(value)) {
      setInput(input + value + '(');
    } else {
      setInput(input + value);
    }
  };

  const buttons = [
    'sin', 'cos', 'tan', 'C', 'DEL',
    'log', 'ln', '(', ')', '/',
    '7', '8', '9', '*', 'sqrt',
    '4', '5', '6', '-', '^',
    '1', '2', '3', '+', 'π',
    '0', '.', 'e', '='
  ];

  return (
    <div
      ref={calculatorRef}
      className="fixed z-50"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <Card className="w-[90vw] max-w-[320px] shadow-2xl">
        <CardHeader
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="handle cursor-move flex flex-row items-center justify-between p-2 bg-muted/50"
        >
          <CardTitle className="text-sm font-semibold">Scientific Calculator</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-2">
          <div className="bg-muted rounded p-2 text-right mb-2">
            <div className="text-xs text-muted-foreground h-5 truncate">{input || '0'}</div>
            <div className="text-xl font-bold h-8">{result}</div>
          </div>
          <div className="flex items-center space-x-2 mb-2 justify-end">
            <Label htmlFor="mode-switch">RAD</Label>
            <Switch id="mode-switch" checked={isDeg} onCheckedChange={setIsDeg} />
            <Label htmlFor="mode-switch">DEG</Label>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {buttons.map((btn) => (
              <Button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                variant="outline"
                className={cn(
                  "text-sm p-1 h-10",
                  btn === '=' ? 'col-span-2 bg-primary text-primary-foreground hover:bg-primary/90' : ''
                )}
              >
                {btn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator;