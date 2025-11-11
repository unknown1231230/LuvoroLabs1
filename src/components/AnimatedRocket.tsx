"use client";

import React from 'react';
import { Rocket } from 'lucide-react';

const AnimatedRocket: React.FC = () => {
  return (
    <div className="relative inline-block">
      <Rocket 
        className="h-24 w-24 text-primary" 
        style={{
          animation: 'float 3s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedRocket;