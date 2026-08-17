import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScanFace } from 'lucide-react';
import PolishedCameraCapture, { CAMERA_STATES } from '../../components/PolishedCameraCapture';
import RecognitionResult from './RecognitionResult';
import attendanceService from '../../services/attendanceService';

const RESULT_DISPLAY_MS = 3000;
const ERROR_RETRY_MS = 1800;

export default function AttendancePage() {
  const [cameraState, setCameraState] = useState(CAMERA_STATES.LIVE);
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resumeTimerRef = useRef(null);

  const clearResumeTimer = () => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const resumeCamera = useCallback((delay = 0) => {
    clearResumeTimer();

    resumeTimerRef.current = window.setTimeout(() => {
      setCapturedImage(null);
      setResult(null);
      setError('');
      setCameraState(CAMERA_STATES.LIVE);
      resumeTimerRef.current = null;
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      clearResumeTimer();
    };
  }, []);

  const handleStopCamera = useCallback(() => {
    clearResumeTimer();
    setCameraState(CAMERA_STATES.IDLE);
    setCapturedImage(null);
    setResult(null);
    setError('');
    setLoading(false);
  }, []);

  const handleAutoCapture = useCallback(
    async (imageDataUrl) => {
      if (
        loading ||
        cameraState !== CAMERA_STATES.LIVE
      ) {
        return;
      }

      setCapturedImage(imageDataUrl);
      setCameraState(CAMERA_STATES.PROCESSING);
      setError('');
      setLoading(true);

      try {
        const data = await attendanceService.recognize(
          imageDataUrl.split(',')[1]
        );

        setResult(data);
        setCameraState(CAMERA_STATES.SUCCESS);
        resumeCamera(RESULT_DISPLAY_MS);
      } catch (err) {
        const status = err.response?.status;
        const message =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          'Face recognition failed.';

        setError(message);
        setCameraState(CAMERA_STATES.ERROR);

        // The duplicate-attendance response is still a valid recognition
        // result. Show it briefly and then return to automatic scanning.
        resumeCamera(
          status === 409 ? RESULT_DISPLAY_MS : ERROR_RETRY_MS
        );
      } finally {
        setLoading(false);
      }
    },
    [cameraState, loading, resumeCamera]
  );

  const handleDone = useCallback(() => {
    resumeCamera(0);
  }, [resumeCamera]);

  const handleReCapture = useCallback(() => {
    resumeCamera(0);
  }, [resumeCamera]);

  return (
    <div className="mx-auto max-w-7xl">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7"
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <motion.div
            initial={{ scale: 0.85, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="w-fit rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg shadow-emerald-500/20"
          >
            <ScanFace size={28} className="text-white" />
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Take attendance
            </h1>
            <p className="mt-1 text-base text-gray-500">
              Stand in front of the camera. Face detection, zoom, capture,
              recognition, and attendance marking happen automatically.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
          Automatic face recognition ready
        </motion.div>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Recognition terminal
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              The camera automatically finds one face, digitally zooms to it,
              selects a stable frame, and sends only that frame for recognition.
            </p>
          </div>

          <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Auto capture
          </span>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-2 py-2">
          <PolishedCameraCapture
            state={cameraState}
            capturedImage={capturedImage}
            error={error}
            studentName={result?.studentName}
            onStop={handleStopCamera}
            onDone={handleDone}
            onReCapture={handleReCapture}
            autoCapture
            onAutoCapture={handleAutoCapture}
          />
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {cameraState === CAMERA_STATES.SUCCESS && result && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <RecognitionResult result={result} />
          </motion.div>
        )}

        {cameraState === CAMERA_STATES.ERROR && error && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <RecognitionResult error={error} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
