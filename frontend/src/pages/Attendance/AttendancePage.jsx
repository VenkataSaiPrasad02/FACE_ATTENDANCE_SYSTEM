import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScanFace } from 'lucide-react';
import PolishedCameraCapture, {
  CAMERA_STATES,
} from '../../components/PolishedCameraCapture';
import RecognitionResult from './RecognitionResult';
import attendanceService from '../../services/attendanceService';
import Button from '../../components/ui/Button';

export default function AttendancePage() {
  const [cameraState, setCameraState] = useState(CAMERA_STATES.IDLE);
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartCamera = () => {
    setError('');
    setResult(null);
    setCameraState(CAMERA_STATES.LIVE);
  };

  const handleStopCamera = () => {
    setCameraState(CAMERA_STATES.IDLE);
    setCapturedImage(null);
    setResult(null);
    setError('');
  };

  const handleCapture = () => {
    const captureStart = performance.now();

    const video = document.querySelector('video');

    if (!video?.videoWidth) {
      setError(
        'Video is not ready yet. Please wait for the camera to initialize.'
      );
      return;
    }

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      setError('Unable to capture camera frame.');
      return;
    }

    context.drawImage(video, 0, 0);

    const captured = canvas.toDataURL('image/jpeg', 0.9);

    setCapturedImage(captured);
    setCameraState(CAMERA_STATES.CAPTURED);

    const captureEnd = performance.now();

    console.log(
      `[PERF] Frontend - capture + JPEG/Base64: ${(
        captureEnd - captureStart
      ).toFixed(2)} ms`
    );

    console.log(
      `[PERF] Frontend - image dimensions: ${video.videoWidth}x${video.videoHeight}`
    );

    console.log(
      `[PERF] Frontend - Base64 payload: ${(
        captured.length / 1024
      ).toFixed(2)} KB`
    );
  };

  const handleReCapture = () => {
    setCapturedImage(null);
    setError('');
    setResult(null);
    setCameraState(CAMERA_STATES.LIVE);
  };

  const handleSubmit = async () => {
    if (!capturedImage) {
      return;
    }

    const totalStart = performance.now();

    setCameraState(CAMERA_STATES.PROCESSING);
    setError('');
    setLoading(true);

    try {
      const base64Start = performance.now();

      const imageBase64 = capturedImage.split(',')[1];

      const base64End = performance.now();

      console.log(
        `[PERF] Frontend - extract Base64: ${(
          base64End - base64Start
        ).toFixed(2)} ms`
      );

      console.log(
        `[PERF] Frontend - request payload Base64 size: ${(
          imageBase64.length / 1024
        ).toFixed(2)} KB`
      );

      console.log(
        '[PERF] Recognition request START'
      );

      const requestStart = performance.now();

      const data = await attendanceService.recognize(imageBase64);

      const requestEnd = performance.now();

      const requestTime = requestEnd - requestStart;
      const totalTime = requestEnd - totalStart;

      console.log(
        `[PERF] Frontend - attendance API request/response: ${requestTime.toFixed(
          2
        )} ms`
      );

      console.log(
        `[PERF] Frontend - recognition TOTAL: ${totalTime.toFixed(2)} ms`
      );

      console.log(
        '[PERF] Recognition request END',
        data
      );

      setResult(data);
      setCameraState(CAMERA_STATES.SUCCESS);
    } catch (err) {
      const requestEnd = performance.now();

      const totalTime = requestEnd - totalStart;

      console.error(
        `[PERF] Frontend - recognition FAILED after ${totalTime.toFixed(
          2
        )} ms`
      );

      console.error(
        '[PERF] Recognition error:',
        err
      );

      if (err.response) {
        console.error(
          `[PERF] Backend HTTP status: ${err.response.status}`
        );

        console.error(
          '[PERF] Backend response:',
          err.response.data
        );
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'Face recognition failed.'
      );

      setCameraState(CAMERA_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setCameraState(CAMERA_STATES.IDLE);
    setCapturedImage(null);
    setResult(null);
    setError('');
  };

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
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 18,
            }}
            className="w-fit rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg shadow-emerald-500/20"
          >
            <ScanFace size={28} className="text-white" />
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Take attendance
            </h1>

            <p className="mt-1 text-base text-gray-500">
              Use facial recognition to mark attendance in real time.
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
          AI-powered facial recognition ready
        </motion.div>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Recognition terminal
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Start the camera, capture a clear face, then confirm the result.
            </p>
          </div>

          <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Secure session
          </span>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-2 py-2">
          <PolishedCameraCapture
            state={cameraState}
            capturedImage={capturedImage}
            error={error}
            studentName={result?.studentName}
            onStart={handleStartCamera}
            onStop={handleStopCamera}
            onCapture={handleCapture}
            onReCapture={handleReCapture}
            onDone={handleDone}
          />

          <AnimatePresence>
            {cameraState === CAMERA_STATES.CAPTURED && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 flex justify-center"
              >
                <Button
                  variant="success"
                  size="lg"
                  icon={ScanFace}
                  onClick={handleSubmit}
                  loading={loading}
                  className="min-w-64 rounded-xl px-8 shadow-lg shadow-emerald-500/30"
                >
                  Recognize & mark attendance
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}