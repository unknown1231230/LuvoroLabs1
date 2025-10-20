"use client";

import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="clouds"></div>
    </div>
  );
};

export default AnimatedBackground;