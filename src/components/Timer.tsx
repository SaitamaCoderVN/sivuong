'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, CheckCircle } from 'lucide-react';

interface TimerProps {
  onComplete: (minutes: number) => void;
}

export default function Timer({ onComplete }: TimerProps) {
  const [minutesInput, setMinutesInput] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (minutesInput <= 0) return;
    setTimeLeft(minutesInput * 60);
    setIsActive(true);
    setIsFinished(false);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    onComplete(minutesInput);
    setIsFinished(false);
    setTimeLeft(0);
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
      {!isActive && !isFinished ? (
        <div className="flex flex-col items-center space-y-4">
          <label className="text-gray-600 font-medium">Study Duration (minutes)</label>
          <input
            type="number"
            value={minutesInput}
            onChange={(e) => setMinutesInput(Number(e.target.value))}
            className="w-32 text-center text-4xl font-bold bg-transparent border-b-2 border-indigo-400 focus:outline-none focus:border-indigo-600 transition-colors"
            min="1"
            max="180"
          />
          <button
            onClick={startTimer}
            className="group flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200"
          >
            <Play className="fill-current" size={24} />
            <span>Start Session</span>
          </button>
        </div>
      ) : isFinished ? (
        <div className="flex flex-col items-center space-y-6 animate-bounce">
          <div className="text-6xl font-black text-indigo-600">00:00</div>
          <button
            onClick={handleComplete}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-full font-black text-2xl transition-all hover:scale-110 active:scale-95 shadow-xl shadow-green-200"
          >
            <CheckCircle size={32} />
            <span>Complete Session</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6">
          <div className="text-8xl font-black text-indigo-600 tabular-nums">
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={stopTimer}
            className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-600 px-6 py-3 rounded-full font-bold transition-all"
          >
            <Square size={20} className="fill-current" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
}
