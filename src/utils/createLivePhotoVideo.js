import { applyPixelatedFilter } from './filters';
import {
  drawVideoPhotoDecorations,
  drawVideoHeaderDecorations,
  drawVideoFooterDecorations,
  drawVideoCornerDecorations,
  drawVideoSidePatternDots,
  drawVideoBorders
} from './videoUtils';

/**
 * Create live photo video from video clips
 * @param {Array<Blob>} videoClips - Array of video clip blobs
 * @param {number} layout - Number of photos in layout
 * @param {string} filter - Filter type to apply
 * @param {string} customMoment - Custom moment text
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Blob>} - Video blob
 */
export const createLivePhotoVideo = async (videoClips, layout, filter, customMoment, onProgress) => {
  const availableClips = videoClips.filter(clip => clip !== null && clip instanceof Blob && clip.size > 0);
  if (availableClips.length === 0) {
    throw new Error('Tidak ada video untuk dibuat Live Photo! Pastikan video sudah direkam saat mengambil foto.');
  }
  
  console.log(`Creating live photo with ${availableClips.length} video clips`);

  // Video settings - 1080x1920 vertical video with black background
  const videoWidth = 1080;
  const videoHeight = 1920;

  // Original photo strip dimensions
  const originalStripWidth = 800;
  const originalPhotoHeight = 600;
  const originalBorderWidth = 30;
  const originalInnerBorder = 20;
  const originalHeaderPadding = 80;
  const originalFooterPadding = 100;
  const originalTotalHeight = (originalPhotoHeight * layout) + (originalBorderWidth * 2) + (originalInnerBorder * (layout - 1)) + originalHeaderPadding + originalFooterPadding;

  // Calculate scale to fit strip in video height
  const maxStripHeight = videoHeight - 100;
  const scale = Math.min(maxStripHeight / originalTotalHeight, videoWidth / originalStripWidth);

  // Scaled dimensions
  const stripWidth = originalStripWidth * scale;
  const photoHeight = originalPhotoHeight * scale;
  const borderWidth = originalBorderWidth * scale;
  const innerBorder = originalInnerBorder * scale;
  const headerPadding = originalHeaderPadding * scale;
  const footerPadding = originalFooterPadding * scale;
  const totalHeight = originalTotalHeight * scale;

  // Center position for strip
  const stripX = (videoWidth - stripWidth) / 2;
  const stripY = (videoHeight - totalHeight) / 2;

  onProgress(10);

  // Create canvas for video
  const videoCanvas = document.createElement('canvas');
  videoCanvas.width = videoWidth;
  videoCanvas.height = videoHeight;
  const videoCtx = videoCanvas.getContext('2d');

  // Create video stream from canvas
  const canvasStream = videoCanvas.captureStream(30);

  // Try to use mp4 codec, fallback to webm
  let mimeType = 'video/webm;codecs=vp9';
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    mimeType = 'video/webm';
  }

  const mediaRecorder = new MediaRecorder(canvasStream, {
    mimeType: mimeType,
    videoBitsPerSecond: 5000000
  });

  const chunks = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    mediaRecorder.onerror = (error) => {
      reject(error);
    };

    // Start recording dengan timeslice yang lebih kecil untuk video yang lebih smooth
    mediaRecorder.start(50); // 50ms timeslice untuk video yang lebih halus
    onProgress(20);

    // Load all video elements - skip invalid videos instead of failing completely
    // Use Promise.allSettled to handle errors gracefully
    const videoLoadPromises = videoClips.map((clip, index) => {
      if (clip === null) {
        return Promise.resolve({ status: 'fulfilled', value: null });
      }

      return new Promise((resolve, reject) => {
        // Validate clip dengan validasi yang lebih ketat
        if (!clip || !(clip instanceof Blob)) {
          reject(new Error(`Video ${index} is not a valid Blob`));
          return;
        }

        if (clip.size === 0) {
          reject(new Error(`Video ${index} is empty`));
          return;
        }

        // Validasi ukuran minimal - video webm memerlukan minimal 50KB untuk valid
        if (clip.size < 50000) {
          reject(new Error(`Video ${index} is too small (${clip.size} bytes, minimum 50KB required)`));
          return;
        }

        // Create a new blob URL to ensure it's fresh
        // Sometimes blob URLs can become invalid, so we create a new one
        const objectURL = URL.createObjectURL(clip);
        
        // Validate blob before creating video element
        // Read first few bytes to check if blob is valid
        const reader = new FileReader();
        reader.onloadend = () => {
          const arrayBuffer = reader.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Check for WebM header (EBML header starts with 0x1A 0x45 0xDF 0xA3)
          // Or at least check if it's not all zeros
          let hasValidData = false;
          for (let i = 0; i < Math.min(100, uint8Array.length); i++) {
            if (uint8Array[i] !== 0) {
              hasValidData = true;
              break;
            }
          }
          
          if (!hasValidData) {
            URL.revokeObjectURL(objectURL);
            reject(new Error(`Video ${index} appears to be empty or invalid (all zeros)`));
            return;
          }
          
          // Now create video element
          const videoElement = document.createElement('video');
          videoElement.src = objectURL;
          videoElement.muted = true;
          videoElement.playsInline = true;
          videoElement.loop = false;
          videoElement.preload = 'metadata';
          videoElement.crossOrigin = 'anonymous';

          let resolved = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              URL.revokeObjectURL(objectURL);
              reject(new Error(`Video ${index} failed to load metadata (timeout)`));
            }
          }, 20000); // 20 second timeout - longer for large files

          const cleanup = () => {
            clearTimeout(timeout);
          };

          videoElement.onloadedmetadata = () => {
            if (resolved) return;
            cleanup();
            // Ensure video is ready
            if (videoElement.readyState >= 1 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
              resolved = true;
              resolve({ video: videoElement, index, objectURL });
            } else {
              resolved = true;
              URL.revokeObjectURL(objectURL);
              reject(new Error(`Video ${index} metadata loaded but not ready (width: ${videoElement.videoWidth}, height: ${videoElement.videoHeight})`));
            }
          };

          videoElement.onerror = (event) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            URL.revokeObjectURL(objectURL);
            const error = videoElement.error;
            const errorMessage = error 
              ? `Code: ${error.code}, Message: ${error.message || 'Unknown error'}`
              : 'Unknown error';
            
            // Log detailed error for debugging
            console.error(`Video ${index} load error:`, {
              code: error?.code,
              message: error?.message,
              blobSize: clip.size,
              blobType: clip.type
            });
            
            reject(new Error(`Video ${index} failed to load: ${errorMessage}`));
          };

          // Try to load
          videoElement.load();
        };
        
        reader.onerror = () => {
          URL.revokeObjectURL(objectURL);
          reject(new Error(`Video ${index} failed to read blob data`));
        };
        
        // Read first 1KB to validate
        reader.readAsArrayBuffer(clip.slice(0, 1024));
      }).catch((error) => {
        // Log error but don't fail completely - return null for this video
        console.warn(`Video ${index} failed to load, will be skipped:`, error.message);
        return null;
      });
    });

    Promise.allSettled(videoLoadPromises).then((results) => {
      // Extract valid video elements, skip failed ones
      // Keep original index mapping for correct positioning
      const validVideoElements = [];
      
      results.forEach((result, originalIndex) => {
        if (result.status === 'fulfilled' && result.value !== null && result.value !== undefined) {
          // Ensure video property exists and is valid
          if (result.value.video && result.value.video instanceof HTMLVideoElement) {
            // Preserve original index for correct positioning
            validVideoElements.push({
              ...result.value,
              originalIndex: originalIndex
            });
          } else {
            console.warn(`Video ${originalIndex} has invalid video element`);
          }
        } else {
          if (result.status === 'rejected') {
            console.warn(`Video ${originalIndex} failed:`, result.reason);
          }
        }
      });
      
      console.log(`Loaded ${validVideoElements.length} out of ${videoClips.length} video elements`);
      
      if (validVideoElements.length === 0) {
        throw new Error('Tidak ada video yang valid untuk dibuat Live Photo! Pastikan video sudah direkam dengan benar.');
      }
      
      onProgress(30);

      // Video timing settings
      const secondsPerPhoto = 3;
      const holdDuration = 2;
      const loopCount = 3;
      const totalVideoDuration = (secondsPerPhoto + holdDuration) * loopCount * 1000;

      // Start all videos - ensure video is valid before playing
      validVideoElements.forEach(({ video, originalIndex }) => {
        if (video && video instanceof HTMLVideoElement) {
          try {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => {
                console.warn(`Video ${originalIndex} failed to play:`, e);
              });
            }
          } catch (e) {
            console.warn(`Video ${originalIndex} play error:`, e);
          }
        } else {
          console.warn(`Video ${originalIndex} is not a valid video element`);
        }
      });

      // Draw video strip frame by frame
      const photoStartY = stripY + borderWidth + headerPadding;
      const drawWidth = stripWidth - (borderWidth * 2);
      const targetAspect = drawWidth / photoHeight;
      const startTime = Date.now();
      const headerY = stripY + 25 * scale;

      let animationFrameId = null;
      const drawFrame = () => {
        const elapsed = Date.now() - startTime;
        
        // Update progress during rendering
        const progress = 30 + Math.min(65, (elapsed / totalVideoDuration) * 65);
        onProgress(Math.round(progress));
        
        if (elapsed >= totalVideoDuration) {
          // Stop all videos
          validVideoElements.forEach(({ video, objectURL }) => {
            video.pause();
            if (objectURL) {
              URL.revokeObjectURL(objectURL);
            } else {
              URL.revokeObjectURL(video.src);
            }
          });

          // Stop recording
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          canvasStream.getTracks().forEach(track => track.stop());
          onProgress(100);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          return;
        }

        // Calculate which loop we're in and time within current loop cycle
        const loopCycleDuration = secondsPerPhoto + holdDuration;
        const timeInCycle = elapsed % (loopCycleDuration * 1000);
        const timeInCycleSeconds = timeInCycle / 1000;
        const currentLoop = Math.floor(elapsed / (loopCycleDuration * 1000));

        // Clear canvas - black background
        videoCtx.fillStyle = '#000000';
        videoCtx.fillRect(0, 0, videoWidth, videoHeight);

        // Draw white background for photo strip
        videoCtx.fillStyle = '#ffffff';
        videoCtx.fillRect(stripX, stripY, stripWidth, totalHeight);

        // Draw header
        drawVideoHeaderDecorations(videoCtx, stripX, stripWidth, headerY, scale);

        // Draw corners
        drawVideoCornerDecorations(videoCtx, stripX, stripY, stripWidth, totalHeight, scale);

        // Draw all video frames simultaneously
        validVideoElements.forEach(({ video, originalIndex }) => {
          // Ensure video is valid before processing
          if (!video || !(video instanceof HTMLVideoElement)) {
            console.warn(`Video ${originalIndex} is not valid, skipping`);
            return;
          }

          // Use originalIndex for correct positioning
          const yPos = photoStartY + (originalIndex * (photoHeight + innerBorder));

          const maxVideoTime = Math.min(video.duration || 3, secondsPerPhoto);
          let currentFrameTime = 0;

          if (timeInCycleSeconds < secondsPerPhoto) {
            currentFrameTime = Math.min(timeInCycleSeconds, maxVideoTime - 0.01);

            if (video.readyState >= 2) {
              try {
                if (Math.abs(video.currentTime - currentFrameTime) > 0.05) {
                  video.currentTime = currentFrameTime;
                }
                if (video.paused) {
                  const playPromise = video.play();
                  if (playPromise !== undefined) {
                    playPromise.catch(e => console.log(`Video ${originalIndex} play error:`, e));
                  }
                }
              } catch (e) {
                console.warn(`Video ${originalIndex} error during playback:`, e);
              }
            } else if (video.readyState >= 1) {
              try {
                video.currentTime = currentFrameTime;
              } catch (e) {
                // Ignore errors during loading
                console.warn(`Video ${index} error setting currentTime:`, e);
              }
            }
          } else {
            currentFrameTime = Math.max(0, maxVideoTime - 0.01);

            if (video.readyState >= 2) {
              if (Math.abs(video.currentTime - currentFrameTime) > 0.05) {
                video.currentTime = currentFrameTime;
              }
              if (!video.paused) {
                video.pause();
              }
            }
          }

          // Calculate fade transition
          const fadeDuration = 0.4;
          let currentOpacity = 1;
          let loopStartOpacity = 0;
          let showLoopStart = false;

          if (timeInCycleSeconds >= loopCycleDuration - fadeDuration && currentLoop < loopCount - 1) {
            const fadeProgress = (loopCycleDuration - timeInCycleSeconds) / fadeDuration;
            currentOpacity = fadeProgress;
            loopStartOpacity = 1 - fadeProgress;
            showLoopStart = true;
          } else if (timeInCycleSeconds < fadeDuration && currentLoop > 0) {
            currentOpacity = timeInCycleSeconds / fadeDuration;
            loopStartOpacity = 1 - currentOpacity;
            showLoopStart = true;
          }

          // Calculate crop
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

          // Create temporary canvas for crossfade blending
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = drawWidth;
          tempCanvas.height = photoHeight;
          const tempCtx = tempCanvas.getContext('2d');

          // Fill with white background
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, drawWidth, photoHeight);

          // Draw loop start frame first (if crossfading)
          if (showLoopStart && loopStartOpacity > 0.01) {
            if (!video || !(video instanceof HTMLVideoElement)) {
              return; // Skip if video is invalid
            }

            const savedTime = video.currentTime;
            const savedPaused = video.paused;

            try {
              video.currentTime = 0;
              if (video.readyState >= 2) {
                tempCtx.save();
                tempCtx.globalAlpha = loopStartOpacity;
                tempCtx.drawImage(
                  video,
                  sourceX, sourceY, sourceWidth, sourceHeight,
                  0, 0, drawWidth, photoHeight
                );
                tempCtx.globalAlpha = 1;
                tempCtx.restore();
              }
            } catch (e) {
              console.warn(`Video ${originalIndex} error during loop start:`, e);
            }

            if (video && video instanceof HTMLVideoElement) {
              try {
                video.currentTime = savedTime;
                if (!savedPaused && video.paused) {
                  const playPromise = video.play();
                  if (playPromise !== undefined) {
                    playPromise.catch(e => console.warn(`Video ${originalIndex} play error:`, e));
                  }
                }
              } catch (e) {
                console.warn(`Video ${originalIndex} error:`, e);
              }
            }
          }

          // Draw current frame
          if (currentOpacity > 0.01) {
            const clampedCurrentTime = Math.max(0, Math.min(maxVideoTime - 0.01, currentFrameTime));
            if (video.readyState >= 2 && Math.abs(video.currentTime - clampedCurrentTime) > 0.05) {
              video.currentTime = clampedCurrentTime;
            }

            tempCtx.save();
            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.globalAlpha = currentOpacity;
            tempCtx.drawImage(
              video,
              sourceX, sourceY, sourceWidth, sourceHeight,
              0, 0, drawWidth, photoHeight
            );
            tempCtx.globalAlpha = 1;
            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.restore();
          }

          // Draw the blended result to main canvas
          videoCtx.drawImage(tempCanvas, stripX + borderWidth, yPos);

          // Apply filter
          const imageData = videoCtx.getImageData(stripX + borderWidth, yPos, drawWidth, photoHeight);
          const filteredData = applyPixelatedFilter(videoCtx, imageData, filter);
          videoCtx.putImageData(filteredData, stripX + borderWidth, yPos);

          // Draw decorations
          drawVideoPhotoDecorations(videoCtx, stripX, stripWidth, borderWidth, yPos, photoHeight, index, layout, scale);
        });

        // Draw footer
        const footerY = stripY + totalHeight - 20 * scale;
        drawVideoFooterDecorations(videoCtx, stripX, stripWidth, footerY, customMoment, scale);

        // Draw side pattern dots
        drawVideoSidePatternDots(videoCtx, stripX, stripY, stripWidth, totalHeight, scale);

        // Draw borders
        drawVideoBorders(videoCtx, stripX, stripY, stripWidth, totalHeight, scale);

        animationFrameId = requestAnimationFrame(drawFrame);
      };

      // Start drawing
      console.log('Starting video rendering...');
      drawFrame();
    }).catch((error) => {
      console.error('Error loading video elements:', error);
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      canvasStream.getTracks().forEach(track => track.stop());
      reject(error);
    });
  });
};

