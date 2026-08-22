import React, { useEffect, useState, useCallback } from 'react';
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

  // App state
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentService.getAll(0, 100);
      const studentList = response.content || [];
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const getSelectedStudent = useCallback(() => {
    return students.find((s) => s.id === Number(selectedId));
  }, [students, selectedId]);

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
    if (!selectedId) {
      setError('Please select a student from the list first.');
      return;
    }
    if (!capturedImage) {
      setError('No face frame captured.');
      return;
    }

    const imageBase64 = capturedImage.split(',')[1];
    const student = getSelectedStudent();

    setCameraState(CAMERA_STATES.PROCESSING);
    setError('');
    setLoading(true);

    try {
      await faceService.registerFace(Number(selectedId), imageBase64);
      setStudentName(student ? student.fullName : 'Student');
      setCameraState(CAMERA_STATES.SUCCESS);
      setSuccess(true);

      // Refresh student list to reflect new faceRegistered status
      const response = await studentService.getAll(0, 100);
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

  const selectedStudent = getSelectedStudent();

  return (
     <AnimatedGradientBackground
  type="face"
  className="min-h-full rounded-2xl"
>

    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xs">
            <Fingerprint size={26} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Biometric Enrollment
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Face Registration
            </h1>

            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Enroll and index student facial vectors for automated attendance matching.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md">
          <Shield size={15} className="text-indigo-600" />
          <span>AES-256 Biometric Protection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Student Selection & Profile Summary */}
        <div className="lg:col-span-1 space-y-5">
          <Card glass className="p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3.5 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              Select Student to Enroll
            </h3>

            {students.length === 0 ? (
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
                    htmlFor="student-select"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Select from roster
                  </label>

                  <select
                    id="student-select"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={
                      cameraState === CAMERA_STATES.PROCESSING ||
                      cameraState === CAMERA_STATES.SUCCESS
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
                  >
                    <option value="">Choose a student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.studentNumber} — {s.fullName} {s.faceRegistered ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Student Card */}
                {selectedStudent && (
                  <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 transition-all animate-fade-in">
                    <div className="flex items-center gap-3.5 mb-3">
                      <ProfileAvatar
                        name={selectedStudent.fullName}
                        size="md"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {selectedStudent.fullName}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          ID: {selectedStudent.studentNumber}
                        </p>
                      </div>
                    </div>

                    {selectedStudent.faceRegistered ? (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100/70 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Face currently registered</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-100/70 px-3 py-1.5 text-xs font-semibold text-amber-800">
                        <Info size={14} className="text-amber-600" />
                        <span>Not enrolled yet</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions Box */}
                <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-xs">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" />
                    Enrollment Best Practices
                  </h4>
                  <ul className="space-y-1.5 text-slate-500 leading-relaxed text-[11.5px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Ensure bright, even front lighting</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Keep head straight and look directly at camera</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Ensure only one person is in the frame</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
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
          <Card glass className="p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Biometric Capture Viewfinder
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Align face inside the viewport guide and click Capture.
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
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
              <div className="mt-6 flex justify-center animate-slide-up">
                <Button
                  variant="primary"
                  size="xl"
                  icon={Fingerprint}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!selectedId}
                  className="min-w-64 rounded-2xl px-8 shadow-md hover:shadow-lg font-bold"
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