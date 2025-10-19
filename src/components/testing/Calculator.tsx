"use client";

import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      try {
        // Using eval is generally unsafe, but acceptable for this simple, controlled calculator context.
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
    <Draggable handle=".handle">
      <div className="fixed top-1/4 left-1/4 z-50">
        <Card className="w-64 shadow-2xl">
          <CardHeader className="handle cursor-move flex flex-row items-center justify-between p-2 bg-muted/50">
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
    </Draggable>
  );
};

export default Calculator;