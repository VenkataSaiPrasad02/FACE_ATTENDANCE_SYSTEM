import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, StopCircle, Play } from 'lucide-react';
import Button from './ui/Button';
import FaceGuideOverlay from './FaceGuideOverlay';
import ProcessingAnimation from './ProcessingAnimation';
import SuccessAnimation from './SuccessAnimation';
import ErrorAnimation from './ErrorAnimation';

// State machine states
export const CAMERA_STATES = {
  IDLE: 'idle',
  LIVE: 'live',
  CAPTURED: 'captured',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

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
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState('');

  // Start camera when entering LIVE state
   useEffect(() => {
    const startCamera = async () => {
      if (state === CAMERA_STATES.LIVE && !streamRef.current) {
        try {
          setCameraError('');
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });

          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        } catch (err) {
          console.error('Camera access error:', err);
          setCameraError(
            'Unable to access camera. Please check permissions.'
          );
        }
      }
    };

    startCamera();

    // Cleanup: stop camera when leaving LIVE state or component unmounts
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

  // Handle cleanup when stopping camera
  const handleStop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    onStop();
  };

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center justify-center">
      {/* Camera Error Message */}
      {cameraError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {cameraError}
        </motion.div>
      )}

      {/* Camera Preview Container */}
      <div className="relative aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden shadow-xl ring-4 ring-emerald-500/10">
        {/* Face Guide Overlay - only in LIVE state */}
        {state === CAMERA_STATES.LIVE && <FaceGuideOverlay />}

        {/* Live Video Feed */}
        {state === CAMERA_STATES.LIVE && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Captured Frame - frozen during CAPTURED, PROCESSING, SUCCESS, ERROR states */}
        {(state === CAMERA_STATES.CAPTURED ||
          state === CAMERA_STATES.PROCESSING ||
          state === CAMERA_STATES.SUCCESS ||
          state === CAMERA_STATES.ERROR) && (
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-full h-full object-cover"
          />
        )}

        {/* Idle State - Camera not started */}
        {state === CAMERA_STATES.IDLE && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
            <Camera size={48} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">Camera not started</p>
            <p className="text-xs mt-1 opacity-60">Click "Start Camera" to begin</p>
          </div>
        )}

        {/* Processing Overlay */}
        <AnimatePresence>
          {state === CAMERA_STATES.PROCESSING && (
            <ProcessingAnimation message="Analyzing face..." />
          )}
        </AnimatePresence>

        {/* Success/Error Results - positioned inside camera container */}
        <AnimatePresence mode="wait">
          {state === CAMERA_STATES.SUCCESS && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center"
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
              className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center"
            >
              <ErrorAnimation error={error} onReCapture={onReCapture} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 flex flex-wrap justify-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3"
      >
        {state === CAMERA_STATES.IDLE && (
          <Button onClick={onStart} icon={Play} size="lg" className="min-w-44 rounded-xl shadow-lg shadow-blue-500/20">
            Start Camera
          </Button>
        )}

        {state === CAMERA_STATES.LIVE && (
          <>
            <Button onClick={onCapture} variant="success" icon={Camera} size="lg" className="rounded-xl px-6 shadow-lg shadow-emerald-500/20">
              Capture photo
            </Button>
            <Button onClick={handleStop} variant="secondary" icon={StopCircle} size="lg" className="rounded-xl">
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
            <Button onClick={handleStop} variant="secondary" icon={StopCircle} size="lg" className="rounded-xl">
              Stop
            </Button>
          </>
        )}

        {state === CAMERA_STATES.PROCESSING && (
          <Button disabled loading size="lg" className="rounded-xl">
            Processing...
          </Button>
        )}

        {/* No controls needed for SUCCESS/ERROR states - they have their own buttons */}
      </motion.div>
    </div>
  );
}
