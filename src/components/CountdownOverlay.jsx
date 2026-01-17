import React from 'react';

/**
 * Countdown overlay component
 * @param {number} countdown - Current countdown value
 * @param {boolean} isCountingDown - Whether countdown is active
 */
const CountdownOverlay = ({ countdown, isCountingDown }) => {
  if (!isCountingDown || countdown === 0) {
    return null;
  }

  return (
    <div className="absolute top-8 left-0 right-0 flex justify-center z-10 pointer-events-none">
      <div className="bg-black bg-opacity-70 border-8 border-white px-12 py-8 transform -rotate-2">
        <div
          className="text-white text-8xl md:text-[150px] font-black animate-pulse text-center"
          style={{
            textShadow: '0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.6)',
            lineHeight: '1'
          }}
        >
          {countdown}
        </div>
      </div>
    </div>
  );
};

export default CountdownOverlay;

