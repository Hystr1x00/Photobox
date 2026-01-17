import React from 'react';
import { Download, RotateCcw, Layout, Filter, ArrowLeft, Video } from 'lucide-react';
import { FILTERS } from '../constants/filters';

/**
 * Preview page component
 * @param {Object} props
 * @param {Array<string>} props.filteredPhotos - Array of filtered photo data URLs
 * @param {number} props.layout - Layout count
 * @param {string} props.filter - Current filter
 * @param {Function} props.setFilter - Function to set filter
 * @param {string} props.customMoment - Custom moment text
 * @param {Function} props.setCustomMoment - Function to set custom moment
 * @param {Function} props.onRetakePhoto - Callback when retake photo is clicked
 * @param {Function} props.onDownloadStrip - Callback when download strip is clicked
 * @param {Function} props.onDownloadLivePhoto - Callback when download live photo is clicked
 * @param {boolean} props.isCreatingGIF - Whether GIF is being created
 * @param {number} props.gifProgress - GIF creation progress
 * @param {Function} props.onStartOver - Callback when start over is clicked
 */
const PreviewPage = ({
  filteredPhotos,
  layout,
  filter,
  setFilter,
  customMoment,
  setCustomMoment,
  onRetakePhoto,
  onDownloadStrip,
  onDownloadLivePhoto,
  isCreatingGIF,
  gifProgress,
  onStartOver
}) => {
  return (
    <div className="flex-1 bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 md:p-10 border-8 border-black shadow-2xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-2">PREVIEW</h2>
              <p className="text-lg font-bold opacity-70">Your pixelated masterpiece!</p>
            </div>
            <button
              onClick={onStartOver}
              className="px-6 py-3 bg-black text-white font-black hover:bg-gray-800 transition-colors flex items-center gap-2 border-4 border-black transform hover:-rotate-2"
            >
              <ArrowLeft className="w-5 h-5" />
              START OVER
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview Strip */}
            <div className="lg:col-span-2">
              <div className="bg-white border-8 border-black p-6 shadow-xl">
                <div className="space-y-4">
                  {filteredPhotos.map((filteredSrc, index) => {
                    if (!filteredSrc) return null;
                    return (
                      <div key={index} className="relative group">
                        <div
                          className="border-6 border-black relative overflow-hidden bg-black"
                          style={{ borderWidth: '6px' }}
                        >
                          <img
                            src={filteredSrc}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute top-4 left-4 bg-white border-4 border-black px-3 py-1 font-black text-lg">
                            #{index + 1}
                          </div>
                        </div>
                        <button
                          onClick={() => onRetakePhoto(index)}
                          className="absolute top-4 right-4 p-3 bg-yellow-400 border-4 border-black opacity-0 group-hover:opacity-100 transition-all hover:scale-110 transform hover:rotate-12 font-black"
                          title="Retake photo"
                        >
                          <RotateCcw className="w-6 h-6" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Filter Selection */}
              <div className="bg-white border-6 border-black p-6 shadow-lg" style={{ borderWidth: '6px' }}>
                <div className="flex items-center gap-3 mb-6">
                  <Filter className="w-8 h-8" />
                  <h3 className="text-2xl font-black">FILTER</h3>
                </div>
                <div className="space-y-3">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`w-full px-5 py-4 text-left font-black border-4 border-black transition-all transform hover:scale-105 hover:-rotate-1 relative ${
                        filter === f.value
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {f.name}
                      {filter === f.value && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">★</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Info */}
              <div className="bg-black text-white border-6 border-black p-6" style={{ borderWidth: '6px' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Layout className="w-8 h-8" />
                  <h3 className="text-2xl font-black">LAYOUT</h3>
                </div>
                <div className="text-center py-6 border-4 border-white">
                  <p className="text-6xl font-black">{layout}</p>
                  <p className="text-xl font-bold mt-2">FRAMES</p>
                </div>
              </div>

              {/* Custom Moment Text */}
              <div className="bg-white border-6 border-black p-6 shadow-lg" style={{ borderWidth: '6px' }}>
                <div className="mb-4">
                  <label className="block text-xl font-black mb-3">MOMENT</label>
                  <input
                    type="text"
                    value={customMoment}
                    onChange={(e) => setCustomMoment(e.target.value)}
                    placeholder="e.g., Birthday Party, Graduation..."
                    maxLength={40}
                    className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  />
                  <p className="text-xs text-gray-500 mt-2">Tulis momen spesial ini</p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-4">
                {/* Download Photo Strip */}
                <button
                  onClick={onDownloadStrip}
                  className="w-full py-8 bg-yellow-400 text-black text-2xl font-black hover:bg-yellow-300 transition-all flex items-center justify-center gap-4 border-6 border-black transform hover:scale-105 hover:rotate-1 shadow-xl relative overflow-hidden group"
                  style={{ borderWidth: '6px' }}
                >
                  <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <Download className="w-8 h-8 relative z-10 group-hover:text-white transition-colors" />
                  <span className="relative z-10 group-hover:text-white transition-colors">DOWNLOAD STRIP!</span>
                </button>

                {/* Download Live Photo */}
                <button
                  onClick={onDownloadLivePhoto}
                  disabled={isCreatingGIF}
                  className={`w-full py-8 text-white text-2xl font-black transition-all flex items-center justify-center gap-4 border-6 border-black transform shadow-xl relative overflow-hidden group ${
                    isCreatingGIF
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 hover:scale-105 hover:-rotate-1'
                  }`}
                  style={{ borderWidth: '6px' }}
                >
                  {!isCreatingGIF && (
                    <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  )}
                  {isCreatingGIF ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
                      <span className="relative z-10">CREATING VIDEO... {gifProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-8 h-8 relative z-10 group-hover:text-black transition-colors" />
                      <span className="relative z-10 group-hover:text-black transition-colors">DOWNLOAD LIVE PHOTO!</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;

