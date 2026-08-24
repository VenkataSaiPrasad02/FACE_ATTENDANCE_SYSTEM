import React, { useEffect, useState } from 'react';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import {
  User,
  Shield,
  Fingerprint,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import PolishedCameraCapture, {
  CAMERA_STATES,
} from '../../components/PolishedCameraCapture';
import faceService from '../../services/faceService';
import studentService from '../../services/studentService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function FaceRegistrationPage() {
  // Camera state machine
  const [cameraState, setCameraState] = useState(CAMERA_STATES.IDLE);
  const [capturedImage, setCapturedImage] = useState(null);

  // App state — students are fetched via server-side search, never the
  // whole roster at once (institutions have thousands of records).
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Debounced roster search
  useEffect(() => {
    const handle = setTimeout(async () => {
      setStudentsLoading(true);
      try {
        const response = await studentService.getAll({
          page: 0,
          size: 25,
          search: studentSearch,
        });
        setStudents(response.content || []);
      } catch (err) {
        console.error('Failed to search students:', err);
      } finally {
        setStudentsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [studentSearch]);

  // Keep the selected student in sync with refreshed data (e.g. after
  // registration flips faceRegistered).
  useEffect(() => {
    if (!selectedStudent) return;
    const fresh = students.find((s) => s.id === selectedStudent.id);
    if (fresh && fresh !== selectedStudent) {
      setSelectedStudent(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  const handleStartCamera = () => {
    setError('');
    setSuccess(false);
    setCameraState(CAMERA_STATES.LIVE);
  };

  const handleStopCamera = () => {
    setCameraState(CAMERA_STATES.IDLE);
    setCapturedImage(null);
  };

  const handleCapture = () => {
    const video = document.querySelector('video');
    if (!video || !video.videoWidth) {
      setError('Video not ready. Please wait for camera to fully initialize.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageBase64);
    setCameraState(CAMERA_STATES.CAPTURED);
  };

  const handleReCapture = () => {
    setCapturedImage(null);
    setError('');
    setCameraState(CAMERA_STATES.LIVE);
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      setError('Please select a student from the list first.');
      return;
    }
    if (!capturedImage) {
      setError('No face frame captured.');
      return;
    }

    const imageBase64 = capturedImage.split(',')[1];

    setCameraState(CAMERA_STATES.PROCESSING);
    setError('');
    setLoading(true);

    try {
      await faceService.registerFace(selectedStudent.id, imageBase64);
      setStudentName(selectedStudent.fullName);
      setCameraState(CAMERA_STATES.SUCCESS);
      setSuccess(true);

      // Refresh search results so the ✓ status shows immediately.
      const response = await studentService.getAll({
        page: 0,
        size: 25,
        search: studentSearch,
      });
      setStudents(response.content || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        getUserFriendlyError(err);
      setError(errorMessage);
      setCameraState(CAMERA_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const getUserFriendlyError = (err) => {
    const message = err.response?.data?.message?.toLowerCase() || '';
    const detail = err.response?.data?.detail?.toLowerCase() || '';

    if (message.includes('no face') || detail.includes('no face')) {
      return 'No face detected in the image. Please center your face in the guide frame and try again.';
    }
    if (message.includes('multiple') || detail.includes('multiple faces')) {
      return 'Multiple faces detected. Please ensure only one person is in front of the camera.';
    }
    if (message.includes('quality') || detail.includes('quality')) {
      return 'Face image quality is too low. Please ensure good lighting and try again.';
    }
    if (err.code === 'ERR_NETWORK' || !err.response) {
      return 'Unable to reach the recognition server. Please check your connection.';
    }
    return 'Face enrollment failed. Please try again.';
  };

  const handleDone = () => {
    setCameraState(CAMERA_STATES.IDLE);
    setCapturedImage(null);
    setSuccess(false);
    setError('');
  };

  const registrationComplete = cameraState === CAMERA_STATES.SUCCESS;
  const currentStep = !selectedStudent ? 1 : registrationComplete ? 3 : 2;
  const steps = ['Student', 'Capture', 'Confirm'];

  return (
    <AnimatedGradientBackground
      type="face"
      className="min-h-full rounded-2xl"
    >
      <div className="w-full animate-fade-in pb-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hover-lift flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-300/25 bg-gradient-to-br from-indigo-500/20 to-blue-400/15 text-indigo-300 shadow-glow-sm">
              <Fingerprint size={26} strokeWidth={2} />
            </div>

            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 shadow-glow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.9)]" />
                Biometric Enrollment
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Face Registration
              </h1>

              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Enroll and index student facial vectors for automated attendance matching.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d1430]/55 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-card backdrop-blur-md sm:flex">
            <Shield size={15} className="text-indigo-300" />
            <span>AES-256 Biometric Protection</span>
          </div>
        </div>

        {/* Guided Stepper */}
        <div
          className="animate-slide-up mb-6 opacity-0"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 p-3 shadow-card backdrop-blur-md sm:gap-3 sm:px-5">
            {steps.map((label, index) => {
              const stepNumber = index + 1;
              const isDone = stepNumber < currentStep;
              const isActive = stepNumber === currentStep;

              return (
                <React.Fragment key={label}>
                  {index > 0 && (
                    <div
                      className={`h-px flex-1 ${isDone ? 'bg-emerald-400/30' : 'bg-white/[0.08]'}`}
                    />
                  )}

                  <div
                    className={`flex items-center gap-2 rounded-full border px-2.5 py-1 transition-colors duration-200 sm:px-3 ${
                      isDone
                        ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-300'
                        : isActive
                          ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-300 shadow-glow-sm'
                          : 'border-white/[0.08] bg-white/[0.03] text-slate-500'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isDone
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : isActive
                            ? 'bg-cyan-400/20 text-cyan-200'
                            : 'bg-white/[0.06] text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={12} /> : stepNumber}
                    </span>

                    <span className="text-[10.5px] font-bold uppercase tracking-wider sm:text-[11px]">
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Side: Student Selection & Profile Summary */}
          <div className="space-y-5 lg:col-span-1">
            <Card glass className="animate-slide-up p-5 opacity-0 lg:sticky lg:top-24 sm:p-6" style={{ animationDelay: '120ms' }}>
              <h3 className="mb-3.5 flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
                <User size={18} className="text-cyan-300" />
                Select Student to Enroll
              </h3>

              {students.length === 0 && !studentsLoading && !studentSearch ? (
                <EmptyState
                  title="No students found"
                  description="Add students to your roster first before registering faces."
                  action={{
                    variant: 'primary',
                    children: 'Go to Students',
                    onClick: () => (window.location.href = '/students'),
                  }}
                />
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="student-search"
                      className="mb-1.5 block text-xs font-semibold text-slate-300"
                    >
                      Search the roster
                    </label>

                    <input
                      id="student-search"
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Name, roll number or email…"
                      autoComplete="off"
                      className="w-full rounded-xl border border-white/10 bg-[#0a1026]/80 px-3.5 py-2.5 text-xs font-medium text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10"
                    />

                    <select
                      id="student-select"
                      value={selectedStudent?.id ?? ''}
                      onChange={(e) =>
                        setSelectedStudent(
                          students.find((s) => s.id === Number(e.target.value)) || null
                        )
                      }
                      disabled={
                        cameraState === CAMERA_STATES.PROCESSING ||
                        cameraState === CAMERA_STATES.SUCCESS
                      }
                      className="mt-2.5 w-full appearance-none rounded-xl border border-white/10 bg-[#0a1026]/80 px-3.5 py-2.5 text-xs font-semibold text-slate-100 outline-none transition-all [color-scheme:dark] focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10 disabled:opacity-50 [&>option]:bg-[#0a1026] [&>option]:text-slate-200"
                    >
                      <option value="">
                        {studentsLoading ? 'Searching…' : `Choose a student (${students.length} shown)`}
                      </option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.studentNumber} — {s.fullName} {s.faceRegistered ? '✓' : ''}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
                      Results come from the server as you type — no need to scroll through the
                      entire roster.
                    </p>
                  </div>

                  {/* Selected Student Card */}
                  {selectedStudent && (
                    <div className="mt-4 animate-fade-in rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all">
                      <div className="mb-3 flex items-center gap-3.5">
                        <ProfileAvatar
                          name={selectedStudent.fullName}
                          size="md"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white">
                            {selectedStudent.fullName}
                          </p>
                          <p className="font-mono text-[11px] font-medium text-slate-400">
                            ID: {selectedStudent.studentNumber}
                          </p>
                        </div>
                      </div>

                      {selectedStudent.faceRegistered ? (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 size={14} className="text-emerald-300" />
                          <span>Face currently registered</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                          <Info size={14} className="text-amber-300" />
                          <span>Not enrolled yet</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Instructions Box */}
                  <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a1026]/60 p-4 text-xs">
                    <h4 className="mb-2 flex items-center gap-1.5 font-bold text-white">
                      <Sparkles size={14} className="text-cyan-300" />
                      Enrollment Best Practices
                    </h4>
                    <ul className="space-y-1.5 text-[11.5px] leading-relaxed text-slate-400">
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-cyan-400">•</span>
                        <span>Ensure bright, even front lighting</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-cyan-400">•</span>
                        <span>Keep head straight and look directly at camera</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-cyan-400">•</span>
                        <span>Ensure only one person is in the frame</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-cyan-400">•</span>
                        <span>Remove heavy dark glasses or face coverings</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Right Side: Camera Capture Station */}
          <div className="lg:col-span-2">
            <Card glass className="animate-slide-up p-6 opacity-0 sm:p-8" style={{ animationDelay: '180ms' }}>
              <div className="mb-6 flex flex-col gap-2 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-base font-bold tracking-tight text-white">
                    Biometric Capture Viewfinder
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Align face inside the viewport guide and click Capture.
                  </p>
                </div>

                <span className="w-fit rounded-full border border-indigo-300/25 bg-indigo-400/10 px-3 py-1 text-[11px] font-semibold text-indigo-300 shadow-glow-sm">
                  128-Point Vector Scan
                </span>
              </div>

              <PolishedCameraCapture
                state={cameraState}
                capturedImage={capturedImage}
                error={error}
                studentName={studentName}
                onStart={handleStartCamera}
                onStop={handleStopCamera}
                onCapture={handleCapture}
                onReCapture={handleReCapture}
                onDone={handleDone}
              />

              {/* Submit Action Button */}
              {cameraState === CAMERA_STATES.CAPTURED && (
                <div className="animate-slide-up mt-6 flex justify-center opacity-0">
                  <Button
                    variant="primary"
                    size="xl"
                    icon={Fingerprint}
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!selectedStudent}
                    className="min-w-64 rounded-2xl px-8 font-bold"
                  >
                    {loading ? 'Registering Biometrics...' : 'Register Face Biometrics'}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AnimatedGradientBackground>
  );
}
