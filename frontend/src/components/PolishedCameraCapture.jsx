import React, { useRef, useEffect, useState } from 'react';
import { Camera, RotateCcw, StopCircle, Play, AlertCircle } from 'lucide-react';
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
              height: { ideal: 720 },
            },
          });

          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        } catch (err) {
          console.error('Camera access error:', err);
          setCameraError(
            'Unable to access camera. Please check your browser permissions and ensure no other application is using it.'
          );
        }
      }
    };

    startCamera();

    // Cleanup: stop tracks when unmounting or leaving LIVE state
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
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onStop?.();
  };

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center justify-center animate-fade-in">
      {/* Camera Error Message */}
      {cameraError && (
        <div className="mb-4 flex w-full items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700 shadow-xs animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p className="leading-relaxed font-medium">{cameraError}</p>
        </div>
      )}

      {/* Viewfinder Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-950 shadow-xl ring-4 ring-indigo-500/5">
        {/* Face Guide Overlay - only in LIVE state */}
        {state === CAMERA_STATES.LIVE && <FaceGuideOverlay />}

        {/* Live Video Feed */}
        {state === CAMERA_STATES.LIVE && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {/* Captured Frame (Frozen Image) */}
        {(state === CAMERA_STATES.CAPTURED ||
          state === CAMERA_STATES.PROCESSING ||
          state === CAMERA_STATES.SUCCESS ||
          state === CAMERA_STATES.ERROR) &&
          capturedImage && (
            <img
              src={capturedImage}
              alt="Captured face biometric"
              className="h-full w-full object-cover animate-fade-in"
            />
          )}

        {/* Idle State Surface */}
        {state === CAMERA_STATES.IDLE && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900/90">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-300 shadow-inner">
              <Camera size={32} strokeWidth={1.75} />
            </div>
            <p className="text-sm font-bold text-slate-200 tracking-tight">
              Camera is currently offline
            </p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs">
              Click &quot;Start Camera&quot; to initialize video feed and begin facial recognition.
            </p>
          </div>
        )}

        {/* Processing State Overlay */}
        {state === CAMERA_STATES.PROCESSING && (
          <ProcessingAnimation message="Analyzing facial landmarks..." />
        )}

        {/* Success State Overlay */}
        {state === CAMERA_STATES.SUCCESS && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-md">
            <SuccessAnimation
              studentName={studentName}
              onDone={onDone}
              onReCapture={onReCapture}
            />
          </div>
        )}

        {/* Error State Overlay */}
        {state === CAMERA_STATES.ERROR && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-md">
            <ErrorAnimation error={error} onReCapture={onReCapture} />
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 p-2.5 backdrop-blur-md shadow-sm">
        {state === CAMERA_STATES.IDLE && (
          <Button
            onClick={onStart}
            icon={Play}
            size="lg"
            variant="primary"
            className="min-w-44 shadow-sm"
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
              className="px-6 shadow-sm"
            >
              Capture Frame
            </Button>

            <Button
              onClick={handleStop}
              variant="secondary"
              icon={StopCircle}
              size="lg"
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
            >
              Re-take Photo
            </Button>

            <Button
              onClick={handleStop}
              variant="ghost"
              icon={StopCircle}
              size="lg"
            >
              Cancel
            </Button>
          </>
        )}

        {state === CAMERA_STATES.PROCESSING && (
          <Button disabled loading size="lg" variant="primary">
            Processing Biometrics...
          </Button>
        )}
      </div>
    </div>
  );
}
