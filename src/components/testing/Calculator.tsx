"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  // --- Custom Dragging Logic ---
  const [position, setPosition] = useState({ x: window.innerWidth / 4, y: window.innerHeight / 4 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (calculatorRef.current) {
      const rect = calculatorRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      e.preventDefault(); // Prevents text selection while dragging
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  }, [isDragging, offset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  // --- End Custom Dragging Logic ---

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      try {
        const evalResult = eval(input.replace(/%/g, '/100'));
        setResult(String(evalResult));
      } catch (error) {
        setResult('Error');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1));
    } else {
      setInput(input + value);
    }
  };

  const buttons = [
    'C', 'DEL', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '='
  ];

  return (
    <div
      ref={calculatorRef}
      className="fixed z-50"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <Card className="w-64 shadow-2xl">
        <CardHeader
          onMouseDown={handleMouseDown}
          className="handle cursor-move flex flex-row items-center justify-between p-2 bg-muted/50"
        >
          <CardTitle className="text-sm font-semibold">Calculator</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-2">
          <div className="bg-muted rounded p-2 text-right mb-2">
            <div className="text-xs text-muted-foreground h-5">{input || '0'}</div>
            <div className="text-xl font-bold h-8">{result}</div>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {buttons.map((btn) => (
              <Button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                variant="outline"
                className={btn === '=' ? 'col-span-2' : ''}
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