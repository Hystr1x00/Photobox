import { useRef } from 'react';

/**
 * Custom hook for video recording
 * @returns {Object} - { startRecording, stopRecording, getVideoClip }
 */
export const useVideoRecording = () => {
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRecordingStartTime = useRef(null);

  const startRecording = (mediaStream) => {
    try {
      // Stop and clean up previous recording if any
      // IMPORTANT: Don't clear chunks here - they might still be needed by getVideoClip()
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          try {
            // Just stop the recorder - getVideoClip() should have already attached its listener
            // Don't attach any new listeners here to avoid duplicate calls
            if (mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.requestData();
            }
            // Wait a bit before stopping to ensure data is requested
            setTimeout(() => {
              try {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                  mediaRecorderRef.current.stop();
                }
              } catch (e) {
                console.warn('Error stopping MediaRecorder in timeout:', e);
              }
            }, 50);
            // Don't clear chunks or reference here - getVideoClip() needs them
            // The reference will be replaced when we create new MediaRecorder below
          } catch (e) {
            console.warn('Error stopping previous MediaRecorder:', e);
            mediaRecorderRef.current = null;
            // Don't clear chunks - getVideoClip() might still need them
          }
        } else {
          // Already inactive - getVideoClip() should have already taken the chunks
          mediaRecorderRef.current = null;
        }
      }
      // Don't clear chunks here - they will be cleared in getVideoClip() after blob is created

      // Check if stream is still active
      if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
        console.warn('MediaStream is not active, cannot start recording');
        return;
      }

      // Check if any video track is still active
      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
        console.warn('Video track is not live, cannot start recording');
        return;
      }

      videoRecordingStartTime.current = Date.now();

      // Prioritize VP8 for better compatibility and stability
      // VP9 sometimes causes demuxer errors in some browsers when recorded with MediaRecorder
      const mimeTypes = [
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9',
        'video/webm'
      ];

      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options.mimeType = type;
          break;
        }
      }

      if (!options.mimeType) {
        console.warn('No supported video codec found');
        return;
      }

      const mediaRecorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = mediaRecorder;

      // DON'T clear chunks here - getVideoClip() might still need them from previous recording
      // Chunks will be cleared in getVideoClip() after blob is successfully created
      // New chunks will be added to the array, and getVideoClip() will only take chunks from current recording

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log('Chunk received:', { size: event.data.size, totalChunks: recordedChunksRef.current.length });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
      };

      // Increase timeslice to 200ms to ensure better chunk integrity and avoid header issues
      // 50ms is too small and can cause "DEMUXER_ERROR_COULD_NOT_OPEN"
      mediaRecorder.start(200);
      console.log(`Video recording started with ${options.mimeType}`);
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const getVideoClip = () => {
    return new Promise((resolve) => {
      let promiseResolved = false;

      const safeResolve = (value) => {
        if (!promiseResolved) {
          promiseResolved = true;
          console.log('getVideoClip: resolving with value:', value ? `blob size ${value.size}` : 'null');
          resolve(value);
        } else {
          console.log('getVideoClip: already resolved, ignoring duplicate resolve');
        }
      };

      if (!mediaRecorderRef.current) {
        console.warn('MediaRecorder not initialized');
        safeResolve(null);
        return;
      }

      const currentState = mediaRecorderRef.current.state;

      // If already inactive, get chunks that were recorded
      if (currentState === 'inactive') {
        const chunks = [...recordedChunksRef.current];
        console.log('MediaRecorder inactive, chunks available:', chunks.length);

        if (chunks.length > 0) {
          // Pastikan minimal ada beberapa chunk untuk video yang valid
          if (chunks.length < 2) {
            console.warn('Video clip has too few chunks:', chunks.length);
            recordedChunksRef.current = [];
            safeResolve(null);
            return;
          }

          // Don't clear chunks yet - wait until blob is created
          const blob = new Blob(chunks, { type: 'video/webm' });
          // Validasi ukuran minimal lebih ketat - minimal 50KB untuk video yang valid
          if (blob.size > 50000) {
            console.log('Video clip blob from inactive recorder:', { size: blob.size, type: blob.type, chunks: chunks.length });
            // Now safe to clear chunks
            recordedChunksRef.current = [];
            safeResolve(blob);
          } else {
            console.warn('Video clip blob too small:', blob.size, 'bytes (minimum 50KB required)');
            recordedChunksRef.current = [];
            safeResolve(null);
          }
        } else {
          console.warn('MediaRecorder inactive and no chunks available. Current chunks ref:', recordedChunksRef.current.length);
          safeResolve(null);
        }
        return;
      }

      // MediaRecorder is active - need to stop it first
      // DON'T copy chunks yet - wait until stop event fires
      let handleStopCalled = false;
      const currentRecorder = mediaRecorderRef.current; // Store reference to current recorder
      const recorderId = Date.now() + Math.random(); // Unique ID for this recorder instance

      // Set up handler BEFORE stopping
      // Use a more reliable approach: wait for stop event, then wait for all chunks
      const handleStop = (event) => {
        // Only process if this is the recorder we're waiting for
        if (event.target !== currentRecorder) {
          console.log('handleStop: ignoring event from different recorder');
          return;
        }

        if (handleStopCalled || promiseResolved) {
          // Already processed or resolved, ignore duplicate calls
          console.log('handleStop: already processed or resolved, ignoring. handleStopCalled:', handleStopCalled, 'promiseResolved:', promiseResolved);
          return;
        }
        handleStopCalled = true;
        console.log('handleStop: processing stop event for recorder', recorderId);

        // Wait for all chunks to arrive - use multiple checks to ensure completeness
        let checkCount = 0;
        const maxChecks = 20; // Check up to 20 times (2 seconds total)
        const checkInterval = 100; // Check every 100ms

        const checkChunks = () => {
          checkCount++;
          const currentChunks = [...recordedChunksRef.current];
          console.log(`handleStop: check ${checkCount}/${maxChecks}, chunks: ${currentChunks.length}`);

          if (promiseResolved) {
            return; // Already resolved
          }

          // If we've checked enough times or chunks seem stable, create blob
          if (checkCount >= maxChecks || (checkCount >= 5 && currentChunks.length > 0)) {
            if (currentChunks.length > 0) {
              // Pastikan minimal ada beberapa chunk untuk video yang valid
              if (currentChunks.length < 2) {
                console.warn('Video clip has too few chunks:', currentChunks.length);
                recordedChunksRef.current = [];
                safeResolve(null);
                return;
              }

              const blob = new Blob(currentChunks, { type: 'video/webm' });
              // Validasi ukuran minimal lebih ketat - minimal 50KB untuk video yang valid
              if (blob.size > 50000) {
                console.log('Video clip blob created:', { size: blob.size, type: blob.type, chunks: currentChunks.length });
                // Clear ALL chunks AFTER successful blob creation
                recordedChunksRef.current = [];
                safeResolve(blob);
              } else {
                console.warn('Video clip blob too small:', blob.size, 'bytes (minimum 50KB required)');
                recordedChunksRef.current = [];
                safeResolve(null);
              }
            } else {
              console.warn('No chunks collected for video clip after', checkCount, 'checks');
              safeResolve(null);
            }
          } else {
            // Continue checking
            setTimeout(checkChunks, checkInterval);
          }
        };

        // Start checking after a short delay to let chunks arrive
        setTimeout(checkChunks, checkInterval);
      };

      // Attach handler FIRST with once: true to ensure it only fires once
      currentRecorder.addEventListener('stop', handleStop, { once: true });

      // Request final data BEFORE stopping
      if (currentState === 'recording') {
        try {
          // Request data first
          mediaRecorderRef.current.requestData();
          // Wait longer to ensure requestData completes and chunk arrives
          setTimeout(() => {
            try {
              // Request data one more time to ensure we get the final chunk
              if (mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.requestData();
              }
              // Wait a bit more before stopping
              setTimeout(() => {
                try {
                  if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                  }
                } catch (e) {
                  console.error('Error stopping MediaRecorder:', e);
                  safeResolve(null);
                }
              }, 200); // Additional delay before stopping
            } catch (e) {
              console.warn('Error requesting final data again:', e);
              // Still try to stop
              try {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                }
              } catch (e2) {
                console.error('Error stopping MediaRecorder:', e2);
                safeResolve(null);
              }
            }
          }, 300); // Longer delay to ensure requestData completes
        } catch (e) {
          console.warn('Error requesting final data:', e);
          // Still try to stop
          try {
            mediaRecorderRef.current.stop();
          } catch (e2) {
            console.error('Error stopping MediaRecorder:', e2);
            safeResolve(null);
          }
        }
      } else {
        // Paused state - just stop
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping MediaRecorder:', e);
          safeResolve(null);
        }
      }
    });
  };

  return { startRecording, stopRecording, getVideoClip };
};

