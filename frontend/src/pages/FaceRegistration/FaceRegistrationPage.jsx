import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AlertCircle, Shield, Fingerprint } from 'lucide-react';
import PolishedCameraCapture, { CAMERA_STATES } from '../../components/PolishedCameraCapture';
import faceService from '../../services/faceService';
import studentService from '../../services/studentService';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

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
      if (studentList.length > 0 && !selectedId) {
        setSelectedId(studentList[0].id);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const getSelectedStudent = useCallback(() => {
    return students.find(s => s.id === Number(selectedId));
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
      setError('Please select a student first.');
      return;
    }
    if (!capturedImage) {
      setError('No image captured.');
      return;
    }

    const imageBase64 = capturedImage.split(',')[1];
    const student = getSelectedStudent();

    setCameraState(CAMERA_STATES.PROCESSING);
    setError('');
    setLoading(true);

    try {
      await faceService.registerFace(Number(selectedId), imageBase64);
      setStudentName(student ? student.fullName : 'Unknown');
      setCameraState(CAMERA_STATES.SUCCESS);
      setSuccess(true);

      // Refresh student list
      const response = await studentService.getAll(0, 100);
      setStudents(response.content || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
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
      return 'No face detected in the image. Please position your face within the frame and try again.';
    }
    if (message.includes('multiple') || detail.includes('multiple faces')) {
      return 'Multiple faces detected. Please ensure only one person is in frame.';
    }
    if (message.includes('quality') || detail.includes('quality')) {
      return 'Face quality is too low. Please ensure good lighting and try again.';
    }
    if (err.code === 'ERR_NETWORK' || !err.response) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }
    return 'Face registration failed. Please try again.';
  };

  const handleDone = () => {
    setCameraState(CAMERA_STATES.IDLE);
    setCapturedImage(null);
    setSuccess(false);
    setError('');
  };

  const selectedStudent = getSelectedStudent();

  return (
    <div className="mx-auto max-w-7xl">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
            <Fingerprint size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Face Registration</h1>
            <p className="text-gray-500 text-base">Securely enroll student biometric data for attendance tracking</p>
          </div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 font-medium"
        >
          <Shield size={16} />
          <span>End-to-end encrypted biometric enrollment</span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student Selection Panel - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Select Student
            </h3>

            {students.length === 0 ? (
              <EmptyState
                title="No students available"
                description="Add students first to register their faces."
                action={{
                  variant: 'primary',
                  children: 'Add Student',
                  onClick: () => window.location.href = '/students'
                }}
              />
            ) : (
              <>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  disabled={cameraState === CAMERA_STATES.PROCESSING || cameraState === CAMERA_STATES.SUCCESS}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-white text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  <option value="">-- Select a student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentNumber} — {s.fullName}
                    </option>
                  ))}
                </select>

                {/* Selected Student Info Card */}
                <AnimatePresence mode="wait">
                  {selectedStudent && (
                    <motion.div
                      key={selectedStudent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {selectedStudent.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{selectedStudent.fullName}</div>
                          <div className="text-sm text-gray-600">{selectedStudent.studentNumber}</div>
                        </div>
                      </div>
                      {selectedStudent.faceRegistered && (
                        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Face already registered
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-blue-600" />
                    Instructions
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Ensure good lighting conditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Look directly at the camera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Position face within the guide frame</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Remove glasses if possible</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Camera Capture Panel - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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

            {/* Submit Button */}
            {cameraState === CAMERA_STATES.CAPTURED && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-center"
              >
                <Button
                  variant="primary"
                  size="lg"
                  icon={Fingerprint}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!selectedId}
                  className="min-w-64 rounded-xl px-8 shadow-lg shadow-blue-500/30"
                >
                  🔒 Register Face Securely
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
