import React, { useState, useRef, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import CameraPage from './pages/CameraPage';
import PreviewPage from './pages/PreviewPage';
import { useCamera } from './hooks/useCamera';
import { useVideoRecording } from './hooks/useVideoRecording';
import { usePhotoProcessing } from './hooks/usePhotoProcessing';
import { useCountdown } from './hooks/useCountdown';
import { downloadPhotoStrip } from './utils/downloadUtils';
import { createLivePhotoVideo } from './utils/createLivePhotoVideo';
import { Instagram } from 'lucide-react';

/**
 * Main App component - Refactored version
 * Clean, maintainable, and scalable structure
 */
const ComicPhotobox = () => {
  const [page, setPage] = useState('landing');
  const [photos, setPhotos] = useState([]);
  const [layout, setLayout] = useState(3);
  const [filter, setFilter] = useState('normal');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [customMoment, setCustomMoment] = useState('');
  const [isCreatingGIF, setIsCreatingGIF] = useState(false);
  const [gifProgress, setGifProgress] = useState(0);
  const [videoClips, setVideoClips] = useState([]);

  // Refs
  const canvasRef = useRef(null);
  const downloadRef = useRef(null);

  // Custom hooks
  const { stream, videoRef, startCamera, stopCamera } = useCamera();
  const { startRecording, stopRecording, getVideoClip } = useVideoRecording();
  const filteredPhotos = usePhotoProcessing(photos, filter);
  const { countdown, isCountingDown, startCountdown } = useCountdown();

  // Initialize camera when on camera page
  useEffect(() => {
    if (page === 'camera' && videoRef.current && !stream) {
      console.log('Photobox Version: 0.0.2');
      startCamera().then((mediaStream) => {
        if (mediaStream) {
          // DON'T start recording here - wait until countdown starts
          // Recording will start in handleStartCountdown
        }
      }).catch((error) => {
        console.error('Failed to start camera:', error);
      });
    }
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [page]);

  // Handle countdown completion
  const handleCountdownComplete = async () => {
    await capturePhoto();
  };

  // Start countdown with callback
  const handleStartCountdown = () => {
    // Start recording ONLY when countdown starts
    if (stream && stream.active) {
      startRecording(stream);
    }
    startCountdown(3, handleCountdownComplete);
  };

  // Capture photo
  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    const targetWidth = 800;
    const targetHeight = 600;
    const targetAspect = targetWidth / targetHeight;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Calculate crop dimensions
    const videoAspect = video.videoWidth / video.videoHeight;
    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (videoAspect > targetAspect) {
      sourceHeight = video.videoHeight;
      sourceWidth = sourceHeight * targetAspect;
      sourceX = (video.videoWidth - sourceWidth) / 2;
      sourceY = 0;
    } else {
      sourceWidth = video.videoWidth;
      sourceHeight = sourceWidth / targetAspect;
      sourceX = 0;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    // Draw cropped image
    ctx.drawImage(
      video,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, targetWidth, targetHeight
    );

    const photoData = canvas.toDataURL('image/png');

    // Simpan foto terlebih dahulu untuk memastikan tidak ada yang hilang
    const newPhotos = [...photos];
    newPhotos[currentPhotoIndex] = photoData;
    setPhotos(newPhotos);

    // Get video clip for live photo
    let videoClip = null;
    try {
      // Wait untuk memastikan MediaRecorder siap
      await new Promise(resolve => setTimeout(resolve, 100));

      videoClip = await getVideoClip();
      if (videoClip) {
        console.log(`Video clip ${currentPhotoIndex} captured:`, {
          size: videoClip.size,
          type: videoClip.type
        });
        // Validate clip - must be at least 50KB for a valid video
        // Video webm memerlukan ukuran minimal yang cukup untuk header dan data
        if (videoClip.size < 50000) {
          console.warn(`Video clip ${currentPhotoIndex} is too small: ${videoClip.size} bytes (minimum 50KB required)`);
          videoClip = null;
        }
      } else {
        console.warn(`No video clip captured for photo ${currentPhotoIndex}`);
      }

      // Wait before restarting to ensure MediaRecorder is fully stopped and cleaned up
      // getVideoClip() menggunakan timeout 300ms, jadi tunggu sedikit lebih lama
      await new Promise(resolve => setTimeout(resolve, 500));

      // Restart recording for next photo (if not the last one)
      if (stream && stream.active && currentPhotoIndex < layout - 1) {
        startRecording(stream);
      }
    } catch (error) {
      console.error('Error getting video clip:', error);
      videoClip = null;
    }

    // Simpan video clip setelah foto sudah tersimpan
    const newVideoClips = [...videoClips];
    newVideoClips[currentPhotoIndex] = videoClip;
    setVideoClips(newVideoClips);

    // Check if this is the last photo (currentPhotoIndex adalah 0-based, layout adalah jumlah foto)
    // Jika ini adalah foto terakhir (index layout-1), atau semua foto sudah terisi
    const isLastPhoto = currentPhotoIndex >= layout - 1;
    let allPhotosFilled = true;
    for (let i = 0; i < layout; i++) {
      if (newPhotos[i] === null || newPhotos[i] === undefined) {
        allPhotosFilled = false;
        break;
      }
    }

    if (isLastPhoto || allPhotosFilled) {
      // Stop video recording
      stopRecording();
      stopCamera();
      setPage('preview');
    } else {
      // Continue to next photo
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  // Retake photo
  const retakePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);

    const newVideoClips = [...videoClips];
    newVideoClips[index] = null;
    setVideoClips(newVideoClips);

    setCurrentPhotoIndex(index);
    setPage('camera');

    // Restart camera and recording
    if (stream) {
      stopCamera();
    }
    // Camera will restart via useEffect
  };

  // Download photo strip
  const handleDownloadStrip = async () => {
    if (!canvasRef.current || !downloadRef.current) return;
    await downloadPhotoStrip(
      canvasRef.current,
      downloadRef.current,
      photos,
      layout,
      filter,
      customMoment
    );
  };

  // Download live photo
  const handleDownloadLivePhoto = async () => {
    const availableClips = videoClips.filter(clip => clip !== null);
    if (availableClips.length === 0) {
      alert('Tidak ada video untuk dibuat Live Photo! Pastikan video sudah direkam saat mengambil foto.');
      return;
    }

    setIsCreatingGIF(true);
    setGifProgress(0);

    try {
      const videoBlob = await createLivePhotoVideo(
        videoClips,
        layout,
        filter,
        customMoment,
        setGifProgress
      );

      const fileExtension = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const url = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `live-photo-strip-${Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsCreatingGIF(false);
      setGifProgress(0);
    } catch (error) {
      console.error('Error creating Live Photo video:', error);
      alert('Error saat membuat Live Photo video: ' + error.message);
      setIsCreatingGIF(false);
      setGifProgress(0);
    }
  };

  // Reset all
  const resetAll = () => {
    setPhotos([]);
    setCurrentPhotoIndex(0);
    setVideoClips([]);
    setPage('landing');
    stopCamera();
  };

  // Handle start from landing page
  const handleStart = () => {
    setPhotos(new Array(layout).fill(null));
    setVideoClips(new Array(layout).fill(null));
    setCurrentPhotoIndex(0);
    setPage('camera');
  };

  // Footer component
  const Footer = () => (
    <footer className="bg-black text-white border-t-8 border-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <Instagram className="w-6 h-6" />
            <a
              href="https://instagram.com/faridghani.04"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-black hover:text-yellow-400 transition-colors"
            >
              @faridghani.04
            </a>
          </div>
          <div className="hidden md:block w-1 h-6 bg-white" />
          <div className="text-xl font-black">
            Ganny
          </div>
        </div>
      </div>
    </footer>
  );

  // Render Landing Page
  if (page === 'landing') {
    return (
      <div className="min-h-screen flex flex-col">
        <LandingPage
          layout={layout}
          setLayout={setLayout}
          filter={filter}
          setFilter={setFilter}
          onStart={handleStart}
        />
        <Footer />
      </div>
    );
  }

  // Render Camera Page
  if (page === 'camera') {
    return (
      <div className="min-h-screen flex flex-col">
        <CameraPage
          videoRef={videoRef}
          currentPhotoIndex={currentPhotoIndex}
          layout={layout}
          countdown={countdown}
          isCountingDown={isCountingDown}
          onStartCountdown={handleStartCountdown}
          onBack={resetAll}
        />
        <Footer />
      </div>
    );
  }

  // Render Preview Page
  return (
    <div className="min-h-screen flex flex-col">
      <PreviewPage
        filteredPhotos={filteredPhotos}
        layout={layout}
        filter={filter}
        setFilter={setFilter}
        customMoment={customMoment}
        setCustomMoment={setCustomMoment}
        onRetakePhoto={retakePhoto}
        onDownloadStrip={handleDownloadStrip}
        onDownloadLivePhoto={handleDownloadLivePhoto}
        isCreatingGIF={isCreatingGIF}
        gifProgress={gifProgress}
        onStartOver={resetAll}
      />
      <Footer />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <a ref={downloadRef} style={{ display: 'none' }}>
        Download
      </a>
    </div>
  );
};

export default ComicPhotobox;
