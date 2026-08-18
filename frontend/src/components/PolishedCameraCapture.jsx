import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, StopCircle, Play } from 'lucide-react';
import Button from './ui/Button';
import FaceGuideOverlay from './FaceGuideOverlay';
import ProcessingAnimation from './ProcessingAnimation';
import SuccessAnimation from './SuccessAnimation';
import ErrorAnimation from './ErrorAnimation';
import faceService from '../services/faceService';

// State machine states
export const CAMERA_STATES = {
  IDLE: 'idle',
  LIVE: 'live',
  CAPTURED: 'captured',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

const AUTO_DETECT_INTERVAL_MS = 700;
const STABLE_DETECTIONS_REQUIRED = 3;
const MIN_FACE_WIDTH_PX = 45;
const FACE_MARGIN_FACTOR = 0.65;
const MAX_DIGITAL_ZOOM = 3.2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Capture a small frame for face-location detection.
 * Recognition never receives these preview frames.
 */
function captureDetectionFrame(video) {
  if (!video?.videoWidth || !video?.videoHeight) {
    return null;
  }

  const maxWidth = 640;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  const width = Math.max(1, Math.round(video.videoWidth * scale));
  const height = Math.max(1, Math.round(video.videoHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { alpha: false });
  context.drawImage(video, 0, 0, width, height);

  return {
    image: canvas.toDataURL('image/jpeg', 0.72),
    width,
    height,
  };
}

/**
 * Capture the full-resolution frame and crop around the detected face.
 * This is the software/digital "zoom" used for recognition.
 */
function captureFaceCrop(video, detection) {
  if (!video?.videoWidth || !video?.videoHeight || !detection) {
    return null;
  }

  const scaleX = video.videoWidth / detection.imageWidth;
  const scaleY = video.videoHeight / detection.imageHeight;

  const faceX = detection.x * scaleX;
  const faceY = detection.y * scaleY;
  const faceWidth = detection.width * scaleX;
  const faceHeight = detection.height * scaleY;

  const margin = Math.max(faceWidth, faceHeight) * FACE_MARGIN_FACTOR;
  const cropSize = Math.max(faceWidth, faceHeight) + margin * 2;

  let cropX = faceX + faceWidth / 2 - cropSize / 2;
  let cropY = faceY + faceHeight / 2 - cropSize / 2;

  cropX = clamp(cropX, 0, Math.max(0, video.videoWidth - cropSize));
  cropY = clamp(cropY, 0, Math.max(0, video.videoHeight - cropSize));

  const actualCropWidth = Math.min(cropSize, video.videoWidth - cropX);
  const actualCropHeight = Math.min(cropSize, video.videoHeight - cropY);

  if (actualCropWidth <= 0 || actualCropHeight <= 0) {
    return null;
  }

  const outputSize = Math.round(
    clamp(Math.max(actualCropWidth, actualCropHeight), 320, 720)
  );

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext('2d', { alpha: false });
  context.drawImage(
    video,
    cropX,
    cropY,
    actualCropWidth,
    actualCropHeight,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

export default function PolishedCameraCapture({
  state = CAMERA_STATES.IDLE,
  capturedImage,
  error,
  studentName,
  onStart,
  onStop,
  onCapture,
  onReCapture,
  onDone,
  autoCapture = false,
  onAutoCapture,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const detectionBusyRef = useRef(false);
  const autoCaptureTriggeredRef = useRef(false);
  const stableFaceRef = useRef(null);
  const waitingForFaceExitRef = useRef(false);

  const [cameraError, setCameraError] = useState('');
  const [faceBox, setFaceBox] = useState(null);
  const [cameraStatus, setCameraStatus] = useState(
    autoCapture ? 'Looking for a face...' : ''
  );

  useEffect(() => {
    const startCamera = async () => {
      if (state !== CAMERA_STATES.LIVE || streamRef.current) {
        return;
      }

      try {
        setCameraError('');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError(
          'Unable to access camera. Please check camera permissions.'
        );
      }
    };

    startCamera();

    return () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
};
  }, [state]);

  useEffect(() => {
    if (state === CAMERA_STATES.IDLE) {
      waitingForFaceExitRef.current = false;
      stableFaceRef.current = null;
    }
  }, [state]);

  // Automatic face detection + best-frame selection.
  useEffect(() => {
    if (!autoCapture || state !== CAMERA_STATES.LIVE || !onAutoCapture) {
      return undefined;
    }

    autoCaptureTriggeredRef.current = false;
    stableFaceRef.current = null;
    setFaceBox(null);
    setCameraStatus('Looking for a face...');

    const detect = async () => {
      if (
        detectionBusyRef.current ||
        autoCaptureTriggeredRef.current ||
        !videoRef.current?.videoWidth
      ) {
        return;
      }

      detectionBusyRef.current = true;

      try {
        const frame = captureDetectionFrame(videoRef.current);

        if (!frame) {
          return;
        }

        const detection = await faceService.detectFace(
          frame.image.split(',')[1]
        );

        if (!detection?.faceDetected) {
          stableFaceRef.current = null;
          setFaceBox(null);

          if (waitingForFaceExitRef.current) {
            waitingForFaceExitRef.current = false;
            setCameraStatus('Ready — looking for the next face...');
          } else {
            setCameraStatus(
              detection?.message || 'Looking for a single clear face...'
            );
          }

          return;
        }

        if (waitingForFaceExitRef.current) {
          stableFaceRef.current = null;
          setFaceBox(detection);
          setCameraStatus(
            'Attendance already processed — step away for the next scan.'
          );
          return;
        }

        const faceWidth = detection.width;
        const faceHeight = detection.height;

        if (faceWidth < MIN_FACE_WIDTH_PX) {
          stableFaceRef.current = null;
          setFaceBox(detection);
          setCameraStatus('Face found — move a little closer...');
          return;
        }

        setFaceBox(detection);

        const previous = stableFaceRef.current;

        if (!previous) {
          stableFaceRef.current = {
            ...detection,
            stableCount: 1,
          };
          setCameraStatus('Face found — hold still...');
          return;
        }

        const previousCenterX = previous.x + previous.width / 2;
        const previousCenterY = previous.y + previous.height / 2;
        const currentCenterX = detection.x + detection.width / 2;
        const currentCenterY = detection.y + detection.height / 2;

        const centerDistance = Math.hypot(
          currentCenterX - previousCenterX,
          currentCenterY - previousCenterY
        );

        const referenceSize = Math.max(
          previous.width,
          previous.height,
          faceWidth,
          faceHeight
        );

        const sizeChange =
          Math.abs(faceWidth - previous.width) /
          Math.max(previous.width, 1);

        const isStable =
          centerDistance <= referenceSize * 0.18 &&
          sizeChange <= 0.2;

        const stableCount = isStable
          ? previous.stableCount + 1
          : 1;

        stableFaceRef.current = {
          ...detection,
          stableCount,
        };

        if (stableCount < STABLE_DETECTIONS_REQUIRED) {
          setCameraStatus('Face found — adjusting focus...');
          return;
        }

        // Capture one full-resolution frame and digitally zoom/crop to
        // the detected face. The recognition service receives only this
        // selected frame, not the preview frames.
        const faceImage = captureFaceCrop(videoRef.current, detection);

        if (!faceImage) {
          stableFaceRef.current = null;
          setCameraStatus('Could not capture the face clearly. Retrying...');
          return;
        }

        autoCaptureTriggeredRef.current = true;
        waitingForFaceExitRef.current = true;
        setCameraStatus('Face locked — recognizing...');

        onAutoCapture(faceImage);
      } catch (err) {
        console.error('Automatic face detection error:', err);
        setCameraStatus('Camera detection is retrying...');
      } finally {
        detectionBusyRef.current = false;
      }
    };

    detectionTimerRef.current = window.setInterval(
      detect,
      AUTO_DETECT_INTERVAL_MS
    );

    detect();

    return () => {
      if (detectionTimerRef.current) {
        window.clearInterval(detectionTimerRef.current);
        detectionTimerRef.current = null;
      }

      detectionBusyRef.current = false;
      stableFaceRef.current = null;
    };
  }, [autoCapture, state, onAutoCapture]);

  const handleStop = () => {
    if (detectionTimerRef.current) {
      window.clearInterval(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    onStop();
  };

  const zoomScale = faceBox
    ? clamp(220 / Math.max(faceBox.width, 1), 1, MAX_DIGITAL_ZOOM)
    : 1;

  const zoomOrigin = faceBox
    ? `${((faceBox.x + faceBox.width / 2) / Math.max(faceBox.imageWidth, 1)) * 100}% ${((faceBox.y + faceBox.height / 2) / Math.max(faceBox.imageHeight, 1)) * 100}%`
    : '50% 50%';

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center justify-center">
      {cameraError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {cameraError}
        </motion.div>
      )}

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900 shadow-xl ring-4 ring-emerald-500/10">
        {state === CAMERA_STATES.LIVE && (
          <FaceGuideOverlay autoCapture={autoCapture} faceDetected={!!faceBox} />
        )}

        {state === CAMERA_STATES.LIVE && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="relative z-0 h-full w-full object-cover transition-transform duration-500 ease-out"
            style={{
              transform: `scale(${autoCapture ? zoomScale : 1})`,
              transformOrigin: autoCapture ? zoomOrigin : '50% 50%',
            }}
          />
        )}

        {autoCapture && state === CAMERA_STATES.LIVE && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/45 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            {cameraStatus}
          </div>
        )}

        {(state === CAMERA_STATES.CAPTURED ||
          state === CAMERA_STATES.PROCESSING ||
          state === CAMERA_STATES.SUCCESS ||
          state === CAMERA_STATES.ERROR) && (
          <img
            src={capturedImage}
            alt="Captured face"
            className="h-full w-full object-cover"
          />
        )}

        {state === CAMERA_STATES.IDLE && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
            <Camera size={48} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">Camera not started</p>
            <p className="mt-1 text-xs opacity-60">
              Click &quot;Start Camera&quot; to begin
            </p>
          </div>
        )}

        <AnimatePresence>
          {state === CAMERA_STATES.PROCESSING && (
            <ProcessingAnimation message="Analyzing face..." />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {state === CAMERA_STATES.SUCCESS && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm"
            >
              <SuccessAnimation
                studentName={studentName}
                onDone={onDone}
                onReCapture={onReCapture}
              />
            </motion.div>
          )}

          {state === CAMERA_STATES.ERROR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm"
            >
              <ErrorAnimation error={error} onReCapture={onReCapture} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!autoCapture && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap justify-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3"
        >
          {state === CAMERA_STATES.IDLE && (
            <Button
              onClick={onStart}
              icon={Play}
              size="lg"
              className="min-w-44 rounded-xl shadow-lg shadow-blue-500/20"
            >
              Start Camera
            </Button>
          )}

          {state === CAMERA_STATES.LIVE && (
            <>
              <Button
                onClick={onCapture}
                variant="success"
                icon={Camera}
                size="lg"
                className="rounded-xl px-6 shadow-lg shadow-emerald-500/20"
              >
                Capture photo
              </Button>
              <Button
                onClick={handleStop}
                variant="secondary"
                icon={StopCircle}
                size="lg"
                className="rounded-xl"
              >
                Stop
              </Button>
            </>
          )}

          {state === CAMERA_STATES.CAPTURED && (
            <>
              <Button
                onClick={onReCapture}
                variant="secondary"
                icon={RotateCcw}
                size="lg"
                className="rounded-xl"
              >
                Re-capture
              </Button>
              <Button
                onClick={handleStop}
                variant="secondary"
                icon={StopCircle}
                size="lg"
                className="rounded-xl"
              >
                Stop
              </Button>
            </>
          )}

          {state === CAMERA_STATES.PROCESSING && (
            <Button disabled loading size="lg" className="rounded-xl">
              Processing...
            </Button>
          )}
        </motion.div>
      )}

      {autoCapture && state === CAMERA_STATES.LIVE && (
        <div className="mt-4 flex items-center justify-center">
          <Button
            onClick={handleStop}
            variant="secondary"
            icon={StopCircle}
            size="lg"
            className="rounded-xl"
          >
            Stop camera
          </Button>
        </div>
      )}
    </div>
  );
}
