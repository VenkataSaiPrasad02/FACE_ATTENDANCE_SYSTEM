import React, { useState } from 'react';
import { ScanFace, CheckCircle, Shield } from 'lucide-react';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import PolishedCameraCapture, {
  CAMERA_STATES,
} from '../../components/PolishedCameraCapture';
import RecognitionResult from './RecognitionResult';
import attendanceService from '../../services/attendanceService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

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
  };

  const handleReCapture = () => {
    setCapturedImage(null);
    setError('');
    setResult(null);
    setCameraState(CAMERA_STATES.LIVE);
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;

    setCameraState(CAMERA_STATES.PROCESSING);
    setError('');
    setLoading(true);

    try {
      const imageBase64 = capturedImage.split(',')[1];
      const data = await attendanceService.recognize(imageBase64);
      setResult(data);
      setCameraState(CAMERA_STATES.SUCCESS);
    } catch (err) {
      console.error('Recognition error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Face recognition failed. No matching student record found.'
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
    <AnimatedGradientBackground
  type="attendance"
  className="min-h-full rounded-2xl"
>
    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
            <ScanFace size={26} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Biometrics Terminal
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Take Attendance
            </h1>

            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Capture student face via live camera feed to mark real-time presence.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md">
          <Shield size={15} className="text-indigo-600" />
          <span>Encrypted Biometric Matching</span>
        </div>
      </div>

      {/* Camera Terminal Card */}
      <Card glass className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Biometric Recognition Station
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Position face within the viewfinder guide frame and snap photo.
            </p>
          </div>

          <span className="w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
            Automated Ledger Sync
          </span>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
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

          {/* Submit Action Button when image is captured */}
          {cameraState === CAMERA_STATES.CAPTURED && (
            <div className="mt-6 flex justify-center animate-slide-up">
              <Button
                variant="success"
                size="xl"
                icon={CheckCircle}
                onClick={handleSubmit}
                loading={loading}
                className="min-w-64 rounded-2xl px-8 shadow-md hover:shadow-lg font-bold"
              >
                {loading ? 'Matching with Roster...' : 'Verify Face & Mark Attendance'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Recognition Result Card Display */}
      {cameraState === CAMERA_STATES.SUCCESS && result && (
        <RecognitionResult result={result} />
      )}
    </div>
    </AnimatedGradientBackground>
  );
}