"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Kinematics1DSimulation: React.FC = () => {
  const [initialPosition, setInitialPosition] = useState(0);
  const [initialVelocity, setInitialVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const [time, setTime] = useState(5);
  const [resultPosition, setResultPosition] = useState<number | null>(null);
  const [resultVelocity, setResultVelocity] = useState<number | null>(null);

  const calculateMotion = () => {
    // Using kinematic equations:
    // Δx = v₀t + ½at²  => x_f - x_i = v₀t + ½at² => x_f = x_i + v₀t + ½at²
    // v = v₀ + at
    const finalPosition = initialPosition + (initialVelocity * time) + (0.5 * acceleration * time * time);
    const finalVelocity = initialVelocity + (acceleration * time);

    setResultPosition(finalPosition);
    setResultVelocity(finalVelocity);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>1D Kinematics Simulator</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="initialPosition">Initial Position (m)</Label>
            <Input
              id="initialPosition"
              type="number"
              value={initialPosition}
              onChange={(e) => setInitialPosition(parseFloat(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initialVelocity">Initial Velocity (m/s)</Label>
            <Input
              id="initialVelocity"
              type="number"
              value={initialVelocity}
              onChange={(e) => setInitialVelocity(parseFloat(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acceleration">Acceleration (m/s²)</Label>
            <Input
              id="acceleration"
              type="number"
              value={acceleration}
              onChange={(e) => setAcceleration(parseFloat(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Time (s)</Label>
            <Input
              id="time"
              type="number"
              value={time}
              onChange={(e) => setTime(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <Button onClick={calculateMotion}>Calculate Motion</Button>
        {resultPosition !== null && resultVelocity !== null && (
          <div className="mt-4 p-4 border rounded-md bg-muted">
            <h3 className="font-semibold text-lg">Results at t = {time}s:</h3>
            <p>Final Position: <span className="font-bold">{resultPosition.toFixed(2)} m</span></p>
            <p>Final Velocity: <span className="font-bold">{resultVelocity.toFixed(2)} m/s</span></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Kinematics1DSimulation;