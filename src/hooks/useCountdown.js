import { useState } from 'react';

/**
 * Custom hook for countdown functionality
 * @returns {Object} - { countdown, isCountingDown, startCountdown }
 */
export const useCountdown = () => {
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const startCountdown = (duration = 3, onComplete) => {
    setIsCountingDown(true);
    setCountdown(duration);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          if (onComplete) {
            onComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return { countdown, isCountingDown, startCountdown };
};

