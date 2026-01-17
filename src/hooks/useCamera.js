import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for camera management
 * @returns {Object} - { stream, videoRef, startCamera, stopCamera }
 */
export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: 1280, 
          height: 720,
          frameRate: { ideal: 30, min: 24 } // Pastikan frame rate minimal 24fps, ideal 30fps
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      console.error('Camera error:', err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
      throw err;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return { stream, videoRef, startCamera, stopCamera };
};

