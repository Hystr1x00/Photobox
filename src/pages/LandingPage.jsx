import React from 'react';
import { Camera, Zap } from 'lucide-react';
import { FILTERS, getFilterPreviewStyle } from '../constants/filters';
import { LAYOUTS } from '../constants/layouts';

/**
 * Landing page component
 * @param {Object} props
 * @param {number} props.layout - Current selected layout
 * @param {Function} props.setLayout - Function to set layout
 * @param {string} props.filter - Current selected filter
 * @param {Function} props.setFilter - Function to set filter
 * @param {Function} props.onStart - Callback when start button is clicked
 */
const LandingPage = ({ layout, setLayout, filter, setFilter, onStart }) => {
  return (
    <div className="flex-1 bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pixelated background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 6px),
                           repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 6px)`
        }}
      />

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Title with pixelated effect */}
        <div className="relative mb-12">
          <div className="absolute -inset-4 bg-black transform rotate-2" />
          <div className="relative bg-white border-8 border-black p-6 transform -rotate-1">
            <h1
              className="text-5xl md:text-8xl font-black text-black mb-2 tracking-tight"
              style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}
            >
              PHOTO
            </h1>
            <h1
              className="text-5xl md:text-8xl font-black text-black tracking-tight"
              style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}
            >
              STRIP
            </h1>
          </div>
          <div className="absolute -bottom-6 -right-6 bg-black text-white px-4 py-2 font-black text-sm rotate-12 border-4 border-black">
            RETRO!
          </div>
        </div>

        {/* Description box */}
        <div className="bg-black text-white p-8 md:p-10 border-8 border-black shadow-2xl mb-10 relative">
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-white" />
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-white" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white" />

          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8" fill="white" />
            <p className="text-2xl md:text-3xl font-black">CLASSIC PIXELATED</p>
            <Zap className="w-8 h-8" fill="white" />
          </div>
          <p className="text-base md:text-lg font-bold">
            Retro comic style meets modern photobox!
          </p>
        </div>

        {/* Layout selection */}
        <div className="mb-8">
          <p className="text-xl font-black mb-4 tracking-wider">SELECT LAYOUT:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {LAYOUTS.map((layoutOption) => (
              <button
                key={layoutOption}
                onClick={() => setLayout(layoutOption)}
                className={`px-10 py-5 text-xl font-black border-6 border-black transition-all transform hover:scale-105 hover:${
                  layoutOption === 3 ? '-rotate-1' : 'rotate-1'
                } relative ${
                  layout === layoutOption ? 'bg-black text-white' : 'bg-white text-black'
                }`}
                style={{ borderWidth: '6px' }}
              >
                <span className="relative z-10">{layoutOption} FRAMES</span>
                {layout === layoutOption && (
                  <div className="absolute -top-2 -right-2 bg-white text-black px-2 py-1 text-xs font-black rotate-12">
                    ★
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full sm:w-auto px-16 py-8 bg-black text-white text-3xl md:text-4xl font-black border-8 border-black transform hover:scale-105 transition-all shadow-2xl hover:shadow-3xl flex items-center justify-center gap-4 mx-auto relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          <Camera className="w-10 h-10 relative z-10 group-hover:text-black transition-colors" />
          <span className="relative z-10 group-hover:text-black transition-colors">START!</span>
        </button>

        {/* Filter preview */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {FILTERS.map((f) => {
            const previewStyle = getFilterPreviewStyle(f.value);
            return (
              <div
                key={f.value}
                className="border-4 border-black bg-white p-4 transform hover:-rotate-2 transition-transform"
              >
                <div
                  className="w-full h-20 bg-black mb-2 relative overflow-hidden"
                  style={previewStyle}
                />
                <p className="font-black text-sm text-center">{f.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

