# Refactoring Documentation

## Struktur Baru

### 📁 Folders
```
src/
├── components/          # Reusable UI components
│   └── CountdownOverlay.jsx
├── pages/              # Page components
│   └── LandingPage.jsx
├── hooks/              # Custom React hooks
│   ├── useCamera.js
│   ├── useVideoRecording.js
│   ├── usePhotoProcessing.js
│   └── useCountdown.js
├── utils/              # Utility functions
│   └── filters.js
├── constants/          # Constants and configuration
│   ├── filters.js
│   └── layouts.js
└── App.jsx            # Main app (to be refactored)
```

## Status Refactoring

### ✅ Completed
- [x] `utils/filters.js` - Filter functions extracted
- [x] `hooks/useCamera.js` - Camera management
- [x] `hooks/useVideoRecording.js` - Video recording logic
- [x] `hooks/usePhotoProcessing.js` - Photo processing with filters
- [x] `hooks/useCountdown.js` - Countdown functionality
- [x] `components/CountdownOverlay.jsx` - Countdown UI component
- [x] `pages/LandingPage.jsx` - Landing page component
- [x] `constants/filters.js` - Filter constants
- [x] `constants/layouts.js` - Layout constants

### 🔄 To Do
- [ ] Extract `downloadStrip` function to `utils/canvasUtils.js`
- [ ] Extract `downloadGIF` function to `utils/videoUtils.js`
- [ ] Create `pages/CameraPage.jsx` component
- [ ] Create `pages/PreviewPage.jsx` component
- [ ] Refactor `App.jsx` to use all new components and hooks
- [ ] Extract canvas drawing functions to `utils/canvasUtils.js`
- [ ] Extract video processing functions to `utils/videoUtils.js`

## Next Steps

1. **Extract Canvas Functions**: Move `downloadStrip` and all canvas drawing logic to `utils/canvasUtils.js`
2. **Extract Video Functions**: Move `downloadGIF` and video processing to `utils/videoUtils.js`
3. **Create CameraPage**: Extract camera page UI to `pages/CameraPage.jsx`
4. **Create PreviewPage**: Extract preview page UI to `pages/PreviewPage.jsx`
5. **Refactor App.jsx**: Update main App.jsx to use all new components

## Usage Example

```jsx
import { useCamera } from './hooks/useCamera';
import { useVideoRecording } from './hooks/useVideoRecording';
import { applyPixelatedFilter } from './utils/filters';

// In your component
const { stream, videoRef, startCamera } = useCamera();
const { startRecording, getVideoClip } = useVideoRecording();
```

