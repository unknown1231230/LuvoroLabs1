"use client";

import React, { useState, useEffect } from 'react';

const LineReader = () => {
  const [yPosition, setYPosition] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setYPosition(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className="fixed left-0 w-full h-8 bg-blue-500/20 pointer-events-none z-50 border-y border-blue-500"
      style={{ top: `${yPosition - 16}px` }} // Center the ruler on the cursor
    />
  );
};

export default LineReader;