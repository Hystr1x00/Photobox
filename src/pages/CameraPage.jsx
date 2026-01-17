import React from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import CountdownOverlay from '../components/CountdownOverlay';

/**
 * Camera page component
 * @param {Object} props
 * @param {Object} props.videoRef - Video element ref
 * @param {number} props.currentPhotoIndex - Current photo index
 * @param {number} props.layout - Total layout count
 * @param {number} props.countdown - Countdown value
 * @param {boolean} props.isCountingDown - Whether countdown is active
 * @param {Function} props.onStartCountdown - Callback when countdown starts
 * @param {Function} props.onBack - Callback when back button is clicked
 */
const CameraPage = ({
  videoRef,
  currentPhotoIndex,
  layout,
  countdown,
  isCountingDown,
  onStartCountdown,
  onBack
}) => {
  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b-8 border-black">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-black hover:bg-gray-800 transition-colors border-4 border-black transform hover:-rotate-2"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK
          </button>
          <div className="text-2xl md:text-4xl font-black tracking-wider">
            FRAME {currentPhotoIndex + 1}/{layout}
          </div>
        </div>
      </div>

      {/* Camera view */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="relative max-w-4xl w-full">
          {/* Main video frame */}
          <div className="border-8 border-white shadow-2xl relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto bg-black"
            />

            {/* Overlay grid for comic effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent 0px, transparent 99px, rgba(255,255,255,0.1) 99px, rgba(255,255,255,0.1) 100px), repeating-linear-gradient(90deg, transparent 0px, transparent 99px, rgba(255,255,255,0.1) 99px, rgba(255,255,255,0.1) 100px)'
              }}
            />

            {/* Countdown overlay */}
            <CountdownOverlay countdown={countdown} isCountingDown={isCountingDown} />
          </div>

          {/* Progress indicators */}
          <div className="absolute -top-6 left-0 right-0 flex justify-center gap-3">
            {Array.from({ length: layout }).map((_, i) => (
              <div
                key={i}
                className={`w-16 h-16 md:w-20 md:h-20 border-4 flex items-center justify-center font-black text-2xl transform transition-all ${
                  i < currentPhotoIndex
                    ? 'bg-white text-black border-white rotate-12 scale-90'
                    : i === currentPhotoIndex
                    ? 'bg-yellow-400 text-black border-black animate-pulse scale-110 rotate-0'
                    : 'bg-black text-white border-white opacity-50 -rotate-6'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Comic burst decoration */}
          <div className="absolute -bottom-8 -right-8 bg-yellow-400 border-4 border-black px-6 py-3 font-black text-lg transform rotate-12 hidden md:block">
            SAY CHEESE!
          </div>
        </div>
      </div>

      {/* Capture button */}
      <div className="p-6 md:p-8 bg-white border-t-8 border-black">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onStartCountdown}
            disabled={isCountingDown}
            className={`w-full py-8 bg-black text-white text-3xl md:text-4xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-4 border-8 border-black transform hover:scale-105 active:scale-95 relative overflow-hidden group ${
              isCountingDown ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
            <Camera className="w-12 h-12 relative z-10 group-hover:text-black transition-colors" />
            <span className="relative z-10 group-hover:text-black transition-colors">SNAP!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraPage;

