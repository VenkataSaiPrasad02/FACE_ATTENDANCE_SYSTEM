import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  RotateCcw,
  StopCircle,
  Play,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import Button from './ui/Button';
import FaceGuideOverlay from './FaceGuideOverlay';
import ProcessingAnimation from './ProcessingAnimation';
import SuccessAnimation from './SuccessAnimation';
import ErrorAnimation from './ErrorAnimation';

// =========================================================
// CAMERA STATES
// =========================================================

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

  // =======================================================
  // CAMERA FACING MODE
  // =======================================================
  // user        = front camera
  // environment = back camera
  // =======================================================

  const [facingMode, setFacingMode] = useState('user');

  // Prevent multiple camera initialization calls
  const startingCameraRef = useRef(false);


  // =======================================================
  // STOP CAMERA
  // =======================================================

  const stopCameraStream = () => {

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    startingCameraRef.current = false;
  };


  // =======================================================
  // START CAMERA
  // =======================================================

  const startCamera = async () => {

    if (startingCameraRef.current) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {

      setCameraError(
        'Camera access is not supported by this browser.'
      );

      return;
    }

    startingCameraRef.current = true;

    try {

      setCameraError('');

      // Stop previous camera first
      stopCameraStream();

      // ---------------------------------------------------
      // Request selected camera
      // ---------------------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: facingMode,
            },

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 960,
            },
          },

          audio: false,
        });


      streamRef.current = stream;


      // ---------------------------------------------------
      // Attach stream
      // ---------------------------------------------------

      if (videoRef.current) {

        videoRef.current.srcObject = stream;

        await videoRef.current
          .play()
          .catch(() => {});
      }

    } catch (err) {

      console.error(
        'Camera access error:',
        err
      );

      let message =
        'Unable to access camera. Please check your browser permissions.';

      // Permission denied
      if (
        err?.name ===
        'NotAllowedError'
      ) {
        message =
          'Camera permission was denied. Please allow camera access in your browser settings.';
      }

      // No camera
      else if (
        err?.name ===
        'NotFoundError'
      ) {
        message =
          'No camera was found on this device.';
      }

      // Camera already being used
      else if (
        err?.name ===
        'NotReadableError'
      ) {
        message =
          'The camera is already being used by another application.';
      }

      // HTTPS issue
      else if (
        err?.name ===
        'SecurityError'
      ) {
        message =
          'Camera access requires a secure connection (HTTPS).';
      }

      setCameraError(message);

    } finally {

      startingCameraRef.current = false;
    }
  };


  // =======================================================
  // START / RESTART CAMERA WHEN:
  //
  // 1. LIVE state begins
  // 2. facingMode changes
  // =======================================================

  useEffect(() => {

    if (state !== CAMERA_STATES.LIVE) {
      stopCameraStream();
      return;
    }

    startCamera();

    return () => {
      stopCameraStream();
    };

  }, [state, facingMode]);


  // =======================================================
  // FLIP CAMERA
  // =======================================================

  const handleFlipCamera = async () => {

    if (state !== CAMERA_STATES.LIVE) {
      return;
    }

    setCameraError('');

    setFacingMode((current) =>
      current === 'user'
        ? 'environment'
        : 'user'
    );
  };


  // =======================================================
  // STOP BUTTON
  // =======================================================

  const handleStop = () => {

    stopCameraStream();

    onStop?.();
  };


  // =======================================================
  // CAMERA LABEL
  // =======================================================

  const cameraLabel =
    facingMode === 'user'
      ? 'Front Camera'
      : 'Back Camera';


  // =======================================================
  // UI
  // =======================================================

  return (

    <div
      className="
        relative
        mx-auto
        flex
        w-full
        max-w-3xl
        flex-col
        items-center
        justify-center
        animate-fade-in
      "
    >

      {/* ===================================================
          CAMERA ERROR
      ==================================================== */}

      {cameraError && (

        <div
          className="
            mb-4
            flex
            w-full
            items-start
            gap-2.5
            rounded-xl
            border
            border-rose-400/30
            bg-rose-500/10
            p-3.5
            text-xs
            text-rose-300
            shadow-glow-sm
            animate-fade-in
          "
        >

          <AlertCircle
            size={16}
            className="
              mt-0.5
              shrink-0
              text-rose-400
            "
          />

          <p className="leading-relaxed font-medium">
            {cameraError}
          </p>

        </div>
      )}


      {/* ===================================================
          VIEWFINDER
      ==================================================== */}

      <div
        className="
          camera-viewfinder
          relative
          w-full
          overflow-hidden
          rounded-3xl

          aspect-[4/3]

          sm:aspect-video

          lg:max-w-2xl
        "
      >

        {/* =================================================
            FACE GUIDE
        ================================================== */}

        {state === CAMERA_STATES.LIVE && (
          <FaceGuideOverlay />
        )}


        {/* =================================================
            LIVE VIDEO
        ================================================== */}

        {state === CAMERA_STATES.LIVE && (

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
          />
        )}


        {/* =================================================
            CAPTURED IMAGE
        ================================================== */}

        {(state === CAMERA_STATES.CAPTURED ||
          state === CAMERA_STATES.PROCESSING ||
          state === CAMERA_STATES.SUCCESS ||
          state === CAMERA_STATES.ERROR) &&
          capturedImage && (

            <img
              src={capturedImage}
              alt="Captured face biometric"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                animate-fade-in
              "
            />
          )}


        {/* =================================================
            CAMERA LABEL
        ================================================== */}

        {state === CAMERA_STATES.LIVE && (

          <div
            className="
              absolute
              left-4
              top-4
              z-20
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/20
              bg-black/45
              px-3
              py-1.5
              text-[10px]
              font-semibold
              text-white
              shadow-lg
              backdrop-blur-md
            "
          >

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-red-400
              "
            />

            {cameraLabel}

          </div>
        )}


        {/* =================================================
            IDLE STATE
        ================================================== */}

        {state === CAMERA_STATES.IDLE && (

          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              bg-slate-900/90
              p-6
              text-center
              text-slate-400
            "
          >

            <div
              className="
                mb-3
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-3xl
                border
                border-white/10
                bg-white/5
                text-slate-300
                shadow-inner
              "
            >
              <Camera
                size={32}
                strokeWidth={1.75}
              />
            </div>

            <p
              className="
                text-sm
                font-bold
                tracking-tight
                text-slate-200
              "
            >
              Camera is currently offline
            </p>

            <p
              className="
                mt-1
                max-w-xs
                text-xs
                text-slate-400
              "
            >
              Click &quot;Start Camera&quot; to
              initialize video feed and begin
              facial recognition.
            </p>

          </div>
        )}


        {/* =================================================
            PROCESSING
        ================================================== */}

        {state === CAMERA_STATES.PROCESSING && (

          <ProcessingAnimation
            message="Analyzing facial landmarks..."
          />

        )}


        {/* =================================================
            SUCCESS
        ================================================== */}

        {state === CAMERA_STATES.SUCCESS && (

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-[#050816]/95
              backdrop-blur-md
            "
          >

            <SuccessAnimation
              studentName={studentName}
              onDone={onDone}
              onReCapture={onReCapture}
            />

          </div>
        )}


        {/* =================================================
            ERROR
        ================================================== */}

        {state === CAMERA_STATES.ERROR && (

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-[#050816]/95
              backdrop-blur-md
            "
          >

            <ErrorAnimation
              error={error}
              onReCapture={onReCapture}
            />

          </div>
        )}

      </div>


      {/* ===================================================
          CONTROLS
      ==================================================== */}

      <div
        className="
          mt-5
          flex
          w-full
          flex-wrap
          items-center
          justify-center
          gap-2.5
          rounded-2xl
          border
          border-white/[0.08]
          bg-[#0d1430]/60
          p-2.5
          shadow-card
          backdrop-blur-md
        "
      >

        {/* =================================================
            IDLE
        ================================================== */}

        {state === CAMERA_STATES.IDLE && (

          <Button
            onClick={onStart}
            icon={Play}
            size="lg"
            variant="primary"
            className="
              min-w-44
              shadow-sm
            "
          >
            Start Camera
          </Button>

        )}


        {/* =================================================
            LIVE
        ================================================== */}

        {state === CAMERA_STATES.LIVE && (

          <>

            {/* Capture */}

            <Button
              onClick={onCapture}
              variant="success"
              icon={Camera}
              size="lg"
              className="
                px-6
                shadow-sm
              "
            >
              Capture Frame
            </Button>


            {/* =================================================
                FLIP CAMERA
            ================================================= */}

            <Button
              onClick={handleFlipCamera}
              variant="secondary"
              icon={RefreshCw}
              size="lg"
              className="
                shadow-sm
                transition-transform
                duration-300
                active:scale-95
              "
              title="Switch front/back camera"
            >
              <span className="hidden sm:inline">
                Flip Camera
              </span>

              <span className="sm:hidden">
                Flip
              </span>
            </Button>


            {/* Stop */}

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


        {/* =================================================
            CAPTURED
        ================================================== */}

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


        {/* =================================================
            PROCESSING
        ================================================== */}

        {state === CAMERA_STATES.PROCESSING && (

          <Button
            disabled
            loading
            size="lg"
            variant="primary"
          >
            Processing Biometrics...
          </Button>

        )}

      </div>

    </div>
  );
}