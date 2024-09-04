import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  duration: number; // duration in seconds
  onComplete?: () => void; // callback when timer completes
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration, onComplete }) => {
  const [time, setTime] = useState(duration * 1000); // Time in milliseconds

  useEffect(() => {
    const savedTime = localStorage.getItem('savedTime');
    if (savedTime) {
      setTime(Number(savedTime));
    }

    const intervalId = setInterval(() => {
      setTime(prev => {
        if (prev <= 0) {
          clearInterval(intervalId);
          localStorage.removeItem('savedTime');
          if (onComplete) onComplete();
          return 0;
        }
        const newTime = prev - 100; // Decrement by 100 ms
        localStorage.setItem('savedTime', String(newTime)); // Save to local storage
        return newTime;
      });
    }, 100);

    return () => {
      clearInterval(intervalId);
      localStorage.removeItem('savedTime'); // Clean up on unmount
    };
  }, [onComplete]);

  if (time <= 0) return null; // Render nothing when the timer is up

  const days = Math.floor(time / (24 * 60 * 60 * 1000));
  const hours = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((time % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center mx-auto  justify-center bg-gray-800 p-6 rounded-lg text-teal-400 text-2xl font-mono">
      <div className="flex space-x-4   ">
        <div className="flex flex-col items-center">
          <div className="text-4xl">{formatTime(days)}</div>
          <div className="text-sm">Days</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl">{formatTime(hours)}</div>
          <div className="text-sm">Hours</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl">{formatTime(minutes)}</div>
          <div className="text-sm">Minutes</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl">{formatTime(seconds)}</div>
          <div className="text-sm">Seconds</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl">{formatTime(milliseconds)}</div>
          <div className="text-sm">Millisec</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
