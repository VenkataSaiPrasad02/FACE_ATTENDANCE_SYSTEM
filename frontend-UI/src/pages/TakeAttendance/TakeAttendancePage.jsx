import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Radio,
  MapPin,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  GraduationCap,
  UserRound,
  Ruler,
  Timer,
  CameraOff,
} from 'lucide-react';

import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PolishedCameraCapture, {
  CAMERA_STATES,
} from '../../components/PolishedCameraCapture';
import { useAuth } from '../../hooks/useAuth';
import attendanceSessionService from '../../services/attendanceSessionService';
import { getErrorMessage } from '../../utils/errorMessages';

const SESSION_POLL_INTERVAL_MS = 30_000;

/*
 * Mobile-first student flow:
 *   wait for teacher session -> verify location -> scan face ->
 *   server-validated result. Every acceptance decision is made by the
 *   backend; the UI only presents it.
 */
export default function TakeAttendancePage() {
  const { username } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null); // {available, session}
  const [loadError, setLoadError] = useState('');

  const [geoStatus, setGeoStatus] = useState('idle'); // idle | prompt | granted | denied | unsupported
  const [coords, setCoords] = useState(null);

  const [cameraState, setCameraState] = useState(CAMERA_STATES.IDLE);
  const [capturedImage, setCapturedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null); // {type:'success'|'duplicate'|'error', text}

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const pollTimerRef = useRef(null);
  const tickRef = useRef(null);

  // =========================================================
  // SESSION POLLING
  // =========================================================

  const loadSession = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await attendanceSessionService.getMySession();
      setSessionInfo(data);
      setLoadError('');

      if (data?.available && data?.session) {
        const remaining = Number(
          data.session.remainingSeconds ??
            Math.max(
              0,
              Math.round(
                (new Date(data.session.expiresAt).getTime() - Date.now()) / 1000
              )
            )
        );
        setRemainingSeconds(remaining);
      }
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSession();

    pollTimerRef.current = setInterval(() => {
      /*
       * Only re-poll while the student is waiting — never interrupt an
       * in-flight camera capture or submission.
       */
      if (
        cameraState === CAMERA_STATES.IDLE &&
        !submitting &&
        !resultMessage
      ) {
        loadSession({ silent: true });
      }
    }, SESSION_POLL_INTERVAL_MS);

    return () => clearInterval(pollTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSession]);

  // =========================================================
  // COUNTDOWN TICK
  // =========================================================

  useEffect(() => {
    if (!sessionInfo?.available) return undefined;

    tickRef.current = setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [sessionInfo?.available]);

  // Auto-refresh when the countdown hits zero so the UI flips to
  // "no session" without user action.
  useEffect(() => {
    if (sessionInfo?.available && remainingSeconds === 0 && !submitting && !resultMessage) {
      loadSession({ silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  const countdownLabel = useMemo(() => {
    const total = Math.max(0, remainingSeconds);
    const minutes = String(Math.floor(total / 60)).padStart(2, '0');
    const seconds = String(total % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  // =========================================================
  // GEOLOCATION
  // =========================================================

  const requestLocation = () => {
    setResultMessage(null);

    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }

    setGeoStatus('prompt');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoStatus('granted');
        setCameraState(CAMERA_STATES.LIVE);
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 15_000 }
    );
  };

  // =========================================================
  // CAMERA HANDLERS
  // =========================================================

  const handleCapture = () => {
    const video = document.querySelector('video');

    if (!video?.videoWidth) {
      setResultMessage({
        type: 'error',
        text: 'Camera is still warming up. Please try again.',
      });
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      setResultMessage({ type: 'error', text: 'Unable to capture camera frame.' });
      return;
    }

    context.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    setCameraState(CAMERA_STATES.CAPTURED);
  };

  const handleReCapture = () => {
    setCapturedImage(null);
    setResultMessage(null);
    setCameraState(CAMERA_STATES.LIVE);
  };

  const resetFlow = () => {
    setCapturedImage(null);
    setResultMessage(null);
    setCoords(null);
    setGeoStatus('idle');
    setCameraState(CAMERA_STATES.IDLE);
    loadSession({ silent: true });
  };

  // =========================================================
  // SUBMIT ATTEMPT
  // =========================================================

  const handleSubmit = async () => {
    if (!capturedImage || !coords || !sessionInfo?.session) return;

    setCameraState(CAMERA_STATES.PROCESSING);
    setSubmitting(true);

    try {
      await attendanceSessionService.takeAttendance(sessionInfo.session.id, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        imageBase64: capturedImage.split(',')[1],
      });

      setCameraState(CAMERA_STATES.SUCCESS);
      setResultMessage({ type: 'success' });
    } catch (err) {
      const code = err?.response?.data?.code;
      const message = getErrorMessage(err);

      // Already marked earlier today — present it as a calm confirmation.
      if (code === 'DUPLICATE_ATTENDANCE') {
        setCameraState(CAMERA_STATES.SUCCESS);
        setResultMessage({ type: 'duplicate', text: message });
      } else {
        setCameraState(CAMERA_STATES.ERROR);
        setResultMessage({ type: 'error', text: message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RENDER HELPERS
  // =========================================================

  const session = sessionInfo?.session;
  const hasSession = Boolean(sessionInfo?.available && session);

  return (
    <AnimatedGradientBackground type="attendance" className="min-h-full rounded-2xl">
      <div className="mx-auto w-full max-w-2xl animate-fade-in pb-10">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm">
            <Smartphone size={26} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 shadow-glow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
              Student Self Attendance
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Mark My Attendance
            </h1>

            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Attendance opens only while your teacher runs a live session for your batch.
            </p>
          </div>
        </div>

        {/* ==================== LOADING ==================== */}
        {loading && (
          <Card glass className="p-6">
            <div className="space-y-2.5">
              <div className="h-5 w-44 rounded-lg skeleton-block" />
              <div className="h-4 w-full rounded-lg skeleton-block opacity-80" />
              <div className="h-4 w-3/4 rounded-lg skeleton-block opacity-60" />
              <div className="h-36 w-full rounded-2xl skeleton-block opacity-50" />
            </div>
          </Card>
        )}

        {/* ==================== LOAD ERROR ==================== */}
        {!loading && loadError && (
          <Card glass className="animate-slide-up p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-300/25 bg-rose-500/10 text-rose-300">
              <XCircle size={26} />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">{loadError}</p>
            <Button
              variant="secondary"
              icon={RefreshCw}
              className="mt-5"
              onClick={() => loadSession()}
            >
              Try Again
            </Button>
          </Card>
        )}

        {/* ==================== NO ACTIVE SESSION ==================== */}
        {!loading && !loadError && !hasSession && (
          <Card glass className="animate-slide-up p-8 text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
              <CameraOff size={30} className="text-slate-400" />
              <span className="status-dot-live absolute -right-1 -top-1" aria-hidden="true" />
            </div>

            <h2 className="mt-5 font-display text-lg font-bold tracking-tight text-white">
              No attendance session is open right now
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
              You’re all set otherwise. Attendance becomes available the moment your
              teacher opens a session for your course, batch and semester — this page
              checks automatically.
            </p>

            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={refreshing}
              className="mt-6"
              onClick={() => loadSession({ silent: true })}
            >
              {refreshing ? 'Checking…' : 'Check Again'}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Timer size={13} />
              Auto-checks every 30 seconds
            </p>
          </Card>
        )}

        {/* ==================== SESSION ACTIVE ==================== */}
        {!loading && !loadError && hasSession && (
          <>
            {/* Session card */}
            <Card glass className="animate-slide-up overflow-hidden p-0">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Attendance Open
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-sm font-bold tabular-nums ${
                    remainingSeconds <= 60
                      ? 'border-rose-300/30 bg-rose-500/10 text-rose-300'
                      : 'border-cyan-300/25 bg-cyan-400/10 text-cyan-200'
                  }`}
                >
                  <Timer size={14} />
                  {countdownLabel}
                </span>
              </div>

              <div className="space-y-3 px-5 py-5">
                <div className="flex items-start gap-3">
                  <GraduationCap size={17} className="mt-0.5 shrink-0 text-cyan-300" />
                  <div>
                    <p className="font-display text-base font-bold tracking-tight text-white">
                      {session.periodName ||
                        `${session.course} · ${session.batch} · Semester ${session.semester}`}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {session.course} — {session.batch}, Semester {session.semester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <UserRound size={16} className="shrink-0 text-slate-500" />
                  <span>
                    Opened by <span className="font-semibold text-slate-200">{session.teacherName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Ruler size={16} className="shrink-0 text-slate-500" />
                  <span>You must be within {session.radiusMeters || 50} m of the classroom</span>
                </div>
              </div>
            </Card>

            {/* Camera / location stage */}
            <Card
              glass
              className="animate-slide-up mt-5 p-5 opacity-0 sm:p-6"
              style={{ animationDelay: '80ms' }}
            >
              {/* Pre-camera guidance */}
              {cameraState === CAMERA_STATES.IDLE && (
                <div className="py-2 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm">
                    <Radio size={26} strokeWidth={2} />
                  </div>

                  <h2 className="mt-4 font-display text-base font-bold tracking-tight text-white">
                    Ready to check in?
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
                    We’ll confirm you’re inside the classroom area, then take a quick
                    face photo to verify it’s really you.
                  </p>

                  {resultMessage?.type === 'error' && (
                    <div className="mx-auto mt-4 flex max-w-sm items-start gap-2.5 rounded-xl border border-rose-300/25 bg-rose-500/10 p-3 text-left text-rose-300 animate-fade-in">
                      <XCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
                      <p className="text-xs font-medium leading-relaxed">{resultMessage.text}</p>
                    </div>
                  )}

                  {geoStatus === 'denied' && (
                    <div className="mx-auto mt-4 flex max-w-sm items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-400/10 p-3 text-left text-amber-300 animate-fade-in">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-amber-400" />
                      <p className="text-xs font-medium leading-relaxed">
                        Location permission was declined. Attendance requires it — please
                        allow location access for this site and try again.
                      </p>
                    </div>
                  )}

                  {geoStatus === 'unsupported' && (
                    <div className="mx-auto mt-4 flex max-w-sm items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-400/10 p-3 text-left text-amber-300 animate-fade-in">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-amber-400" />
                      <p className="text-xs font-medium leading-relaxed">
                        Your browser doesn’t support location detection. Please use a
                        modern browser (Chrome, Safari, Edge).
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    icon={ShieldCheck}
                    onClick={requestLocation}
                    loading={geoStatus === 'prompt'}
                    className="mt-6 min-w-56 shadow-glow-sm"
                  >
                    {geoStatus === 'prompt'
                      ? 'Verifying location…'
                      : geoStatus === 'granted'
                      ? 'Continue to Face Scan'
                      : 'Start Attendance'}
                  </Button>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin size={12} />
                    Your location is used only to validate this attendance session.
                  </p>
                </div>
              )}

              {/* Camera flow */}
              {cameraState !== CAMERA_STATES.IDLE && (
                <>
                  <PolishedCameraCapture
                    state={cameraState}
                    capturedImage={capturedImage}
                    error={resultMessage?.type === 'error' ? resultMessage.text : undefined}
                    studentName={username}
                    onStart={requestLocation}
                    onStop={resetFlow}
                    onCapture={handleCapture}
                    onReCapture={handleReCapture}
                    onDone={resetFlow}
                  />

                  {cameraState === CAMERA_STATES.CAPTURED && (
                    <div className="animate-slide-up mt-5 flex justify-center opacity-0">
                      <Button
                        variant="success"
                        size="lg"
                        icon={CheckCircle2}
                        onClick={handleSubmit}
                        loading={submitting}
                        className="min-w-64 rounded-2xl px-8 font-bold"
                      >
                        {submitting ? 'Verifying…' : 'Verify & Mark Present'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Verification checklist */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <ChecklistItem
                done
                label="Session active"
                detail={`${countdownLabel} left`}
              />
              <ChecklistItem
                done={Boolean(coords)}
                label="Location verified"
                detail={
                  coords
                    ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                    : geoStatus === 'prompt'
                    ? 'Checking…'
                    : 'Waiting'
                }
              />
              <ChecklistItem
                done={false}
                label="Face verification"
                detail={
                  cameraState === CAMERA_STATES.PROCESSING
                    ? 'Scanning face…'
                    : cameraState === CAMERA_STATES.CAPTURED
                    ? 'Ready to submit'
                    : cameraState === CAMERA_STATES.SUCCESS
                    ? 'Verified ✓'
                    : 'Pending photo'
                }
                pending={cameraState === CAMERA_STATES.PROCESSING}
              />
            </div>
          </>
        )}

        {/* ==================== SUCCESS OVERLAY CARD ==================== */}
        {resultMessage && resultMessage.type === 'success' && (
          <SuccessPanel
            title="Attendance marked"
            message={`You're marked present, ${username || ''}. See you in the next session!`}
            duplicate={false}
            onDone={resetFlow}
          />
        )}

        {resultMessage && resultMessage.type === 'duplicate' && (
          <SuccessPanel
            title="Already marked today"
            message={resultMessage.text}
            duplicate
            onDone={resetFlow}
          />
        )}
      </div>
    </AnimatedGradientBackground>
  );
}

/* =========================================================
   CHECKLIST ITEM
========================================================= */

function ChecklistItem({ done, label, detail, pending }) {
  return (
    <div
      className={`
        flex items-center gap-3 rounded-xl border px-3.5 py-3 backdrop-blur-md transition-colors duration-300
        ${
          done
            ? 'border-emerald-300/25 bg-emerald-400/[0.07]'
            : pending
            ? 'border-indigo-300/25 bg-indigo-400/[0.07]'
            : 'border-white/[0.07] bg-white/[0.02]'
        }
      `}
    >
      <span
        className={`
          flex h-7 w-7 shrink-0 items-center justify-center rounded-full
          ${done ? 'bg-emerald-400/15 text-emerald-300' : pending ? 'bg-indigo-400/15 text-indigo-300' : 'bg-white/[0.05] text-slate-500'}
        `}
      >
        {done ? (
          <CheckCircle2 size={15} />
        ) : pending ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>

      <div className="min-w-0">
        <p
          className={`truncate text-xs font-bold ${
            done ? 'text-emerald-200' : pending ? 'text-indigo-200' : 'text-slate-300'
          }`}
        >
          {label}
        </p>
        <p className="truncate text-[11px] text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

/* =========================================================
   SUCCESS PANEL
========================================================= */

function SuccessPanel({ title, message, duplicate, onDone }) {
  return (
    <Card
      glass
      className="
        animate-scale-in mt-5 overflow-hidden p-0 text-center
        ring-1 ring-emerald-300/20
      "
    >
      <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent px-6 pb-8 pt-10">
        <div className="pointer-events-none mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 shadow-[0_0_50px_-10px_rgba(52,211,153,0.6)]">
          <CheckCircle2 size={38} strokeWidth={2.2} className="text-emerald-300" />
        </div>

        <h2 className="font-display text-xl font-bold tracking-tight text-white">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-300 sm:text-sm">
          {message}
        </p>

        <Button
          variant="secondary"
          size="lg"
          className="mt-7 min-w-52"
          onClick={onDone}
        >
          Done
        </Button>
      </div>
    </Card>
  );
}
