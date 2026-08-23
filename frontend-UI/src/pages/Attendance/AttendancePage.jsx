import React, { useState } from 'react';
import { ScanFace, CheckCircle, Shield, Activity } from 'lucide-react';
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

  const statusChips = [
    {
      key: 'Scanning',
      active: cameraState === CAMERA_STATES.LIVE,
      chipClass: 'border-cyan-300/40 bg-cyan-400/10 text-cyan-300 shadow-glow-sm',
      dotClass:
        'h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]',
    },
    {
      key: 'Processing',
      active: cameraState === CAMERA_STATES.PROCESSING,
      chipClass: 'border-indigo-300/40 bg-indigo-400/10 text-indigo-300',
      dotClass:
        'h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.9)]',
    },
    {
      key: 'Idle',
      active: cameraState === CAMERA_STATES.IDLE,
      chipClass: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
      dotClass: 'h-1.5 w-1.5 rounded-full bg-slate-500',
    },
  ];

  const phaseMeta = {
    [CAMERA_STATES.IDLE]: {
      label: 'Standing By',
      hint: 'Initialize the camera feed to begin a biometric scan.',
      accent: 'text-slate-300',
    },
    [CAMERA_STATES.LIVE]: {
      label: 'Scanning',
      hint: 'Center the student face inside the guide frame.',
      accent: 'text-cyan-300',
    },
    [CAMERA_STATES.CAPTURED]: {
      label: 'Frame Captured',
      hint: 'Review the snapshot, then verify to mark attendance.',
      accent: 'text-cyan-300',
    },
    [CAMERA_STATES.PROCESSING]: {
      label: 'Matching Biometrics',
      hint: 'Comparing face vector against the enrolled roster.',
      accent: 'text-indigo-300',
    },
    [CAMERA_STATES.SUCCESS]: {
      label: 'Attendance Marked',
      hint: 'Record synced with the institutional ledger.',
      accent: 'text-emerald-300',
    },
    [CAMERA_STATES.ERROR]: {
      label: 'Recognition Failed',
      hint: 'Retake the photo to run the scan again.',
      accent: 'text-rose-300',
    },
  };
  const phase = phaseMeta[cameraState];

  return (
    <AnimatedGradientBackground
      type="attendance"
      className="min-h-full rounded-2xl"
    >
      <div className="w-full animate-fade-in pb-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hover-lift flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-gradient-to-br from-emerald-500/20 to-teal-400/15 text-emerald-300 shadow-glow-sm">
              <ScanFace size={26} strokeWidth={2} />
            </div>

            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 shadow-glow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                Live Biometrics Terminal
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Take Attendance
              </h1>

              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Capture student face via live camera feed to mark real-time presence.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d1430]/55 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-card backdrop-blur-md sm:flex">
            <Shield size={15} className="text-cyan-300" />
            <span>Encrypted Biometric Matching</span>
          </div>
        </div>

        {/* Camera Terminal Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Camera Stage */}
          <Card
            glass
            className="animate-slide-up p-6 opacity-0 sm:p-8 lg:col-span-2"
            style={{ animationDelay: '80ms' }}
          >
            <div className="mb-6 flex flex-col gap-2 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-base font-bold tracking-tight text-white">
                  Biometric Recognition Station
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Position face within the viewfinder guide frame and snap photo.
                </p>
              </div>

              <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-300 shadow-glow-sm">
                Automated Ledger Sync
              </span>
            </div>

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
              <div className="animate-slide-up mt-6 flex justify-center opacity-0">
                <Button
                  variant="success"
                  size="xl"
                  icon={CheckCircle}
                  onClick={handleSubmit}
                  loading={loading}
                  className="min-w-64 rounded-2xl px-8 font-bold"
                >
                  {loading ? 'Matching with Roster...' : 'Verify Face & Mark Attendance'}
                </Button>
              </div>
            )}
          </Card>

          {/* Right Column: Live Status Panel */}
          <Card
            glass
            className="animate-slide-up h-fit p-5 opacity-0 lg:sticky lg:top-24 sm:p-6"
            style={{ animationDelay: '160ms' }}
          >
            <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
              <Activity size={16} className="text-cyan-300" />
              Live Status Panel
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Recognition pipeline telemetry.
            </p>

            {/* State Chip Row */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {statusChips.map((chip) => (
                <span
                  key={chip.key}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                    chip.active
                      ? chip.chipClass
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-600'
                  }`}
                >
                  <span className={chip.active ? chip.dotClass : 'h-1.5 w-1.5 rounded-full bg-slate-700'} />
                  {chip.key}
                </span>
              ))}
            </div>

            {/* Phase Readout */}
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Current Phase
              </p>
              <p className={`mt-1 font-display text-sm font-bold tracking-tight ${phase.accent}`}>
                {phase.label}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{phase.hint}</p>
            </div>

            {/* Instructions List */}
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Scan Protocol
              </p>
              <ul className="mt-2 space-y-2 text-[11.5px] leading-relaxed text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">&bull;</span>
                  <span>Position the face fully inside the guide frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">&bull;</span>
                  <span>Ensure bright, even front lighting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">&bull;</span>
                  <span>Only one person should be visible in frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">&bull;</span>
                  <span>Hold still while the shutter captures</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Recognition Result Card Display */}
        {cameraState === CAMERA_STATES.SUCCESS && result && (
          <RecognitionResult result={result} />
        )}
      </div>
    </AnimatedGradientBackground>
  );
}
