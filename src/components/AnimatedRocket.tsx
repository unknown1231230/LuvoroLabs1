"use client";

import React from 'react';
import { Rocket } from 'lucide-react';

const AnimatedRocket: React.FC = () => {
  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
      <Rocket 
        className="h-24 w-24 text-primary relative z-10 drop-shadow-lg" 
        style={{
          animation: 'float 3s ease-in-out infinite',
          filter: 'drop-shadow(0 10px 20px rgba(99, 102, 241, 0.3))',
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-2deg);
          }
          50% {
            transform: translateY(-20px) rotate(0deg);
          }
          75% {
            transform: translateY(-10px) rotate(2deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedRocket;