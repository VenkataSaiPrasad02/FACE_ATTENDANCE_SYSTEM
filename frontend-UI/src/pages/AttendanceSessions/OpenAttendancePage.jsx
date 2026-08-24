import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Radio,
  MapPin,
  Timer,
  XCircle,
  RefreshCw,
  ChevronDown,
  Users2,
  CalendarRange,
  StopCircle,
  LocateFixed,
  CheckCircle2,
} from 'lucide-react';

import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import attendanceSessionService from '../../services/attendanceSessionService';
import { getErrorMessage } from '../../utils/errorMessages';

/*
 * Teacher control room for mobile attendance:
 *   pick batch -> pin current location -> open a 10-minute session ->
 *   watch it live -> close early if needed.
 * All policy (radius, duration, eligibility) is enforced server-side.
 */
export default function OpenAttendancePage() {
  const { username } = useAuth();

  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [pageError, setPageError] = useState('');

  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('');
  const [semester, setSemester] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);

  const [geoStatus, setGeoStatus] = useState('idle'); // idle | locating | granted | denied | unsupported
  const [coords, setCoords] = useState(null);
  const [geoAccuracy, setGeoAccuracy] = useState(null);

  const [opening, setOpening] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // {type:'success'|'error', text}

  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const tickRef = useRef(null);
  const [, forceTick] = useState(0);

  // =========================================================
  // DATA LOADING
  // =========================================================

  const loadPeriods = useCallback(async () => {
    setLoadingPeriods(true);
    try {
      const { data } = await attendanceSessionService.getOpenablePeriods();
      setPeriods(Array.isArray(data) ? data : []);
      setPageError('');
    } catch (err) {
      setPageError(getErrorMessage(err, 'Unable to load academic periods.'));
    } finally {
      setLoadingPeriods(false);
    }
  }, []);

  const loadActive = useCallback(async () => {
    try {
      const { data } = await attendanceSessionService.getActive();
      setActiveSessions(Array.isArray(data) ? data : []);
    } catch {
      /* transient — next poll retries */
    } finally {
      setLoadingActive(false);
    }
  }, []);

  useEffect(() => {
    loadPeriods();
    loadActive();

    // Re-render every second so live countdowns stay honest.
    tickRef.current = setInterval(() => forceTick((t) => t + 1), 1000);

    return () => clearInterval(tickRef.current);
  }, [loadPeriods, loadActive]);

  // =========================================================
  // CASCADE OPTIONS — derived purely from period data
  // =========================================================

  const courses = useMemo(
    () => [...new Set(periods.map((p) => p.course))].sort(),
    [periods]
  );

  const batches = useMemo(
    () =>
      [
        ...new Set(
          periods
            .filter((p) => !course || p.course === course)
            .map((p) => p.batch)
        ),
      ].sort(),
    [periods, course]
  );

  const semesters = useMemo(
    () =>
      [
        ...new Set(
          periods
            .filter((p) => (!course || p.course === course) && (!batch || p.batch === batch))
            .map((p) => String(p.semester))
        ),
      ].sort((a, b) => Number(a) - Number(b)),
    [periods, course, batch]
  );

  useEffect(() => {
    setSelectedPeriodId(null);
  }, [course, batch, semester]);

  const matchingPeriod = useMemo(
    () =>
      periods.find(
        (p) =>
          (!course || p.course === course) &&
          (!batch || p.batch === batch) &&
          (!semester || String(p.semester) === semester)
      ) || null,
    [periods, course, batch, semester]
  );

  const selectedPeriod = selectedPeriodId
    ? periods.find((p) => p.id === selectedPeriodId) || null
    : matchingPeriod;

  // =========================================================
  // GEOLOCATION
  // =========================================================

  const requestLocation = () => {
    setFeedback(null);

    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }

    setGeoStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoAccuracy(position.coords.accuracy);
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 }
    );
  };

  // =========================================================
  // ACTIONS
  // =========================================================

  const handleOpen = async () => {
    if (!selectedPeriod || !coords) return;

    setOpening(true);
    setFeedback(null);

    try {
      const { data } = await attendanceSessionService.open({
        academicPeriodId: selectedPeriod.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setFeedback({
        type: 'success',
        text: `Attendance is live for ${sessionTitle(data)}. Students can check in for the next ${Math.round(
          (data.remainingSeconds ?? 600) / 60
        )} minutes.`,
      });
      await loadActive();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setOpening(false);
    }
  };

  const handleClose = async (sessionId) => {
    setClosingId(sessionId);
    setFeedback(null);

    try {
      await attendanceSessionService.close(sessionId);
      setFeedback({ type: 'success', text: 'Session closed.' });
      await loadActive();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setClosingId(null);
    }
  };

  const formatCountdown = (isoOrRemaining, remainingSeconds) => {
    let total =
      typeof remainingSeconds === 'number'
        ? remainingSeconds
        : Math.max(0, Math.round((new Date(isoOrRemaining).getTime() - Date.now()) / 1000));
    total = Math.max(0, total);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const sessionTitle = (session) =>
    session.periodName ||
    `${session.course} · ${session.batch} · Sem ${session.semester}`;

  const geoLabel = {
    idle: 'Not captured yet',
    locating: 'Getting your location…',
    granted: coords
      ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}${
          geoAccuracy != null ? ` (±${Math.round(geoAccuracy)} m)` : ''
        }`
      : 'Captured',
    denied: 'Location permission declined',
    unsupported: 'Geolocation unavailable in this browser',
  }[geoStatus];

  return (
    <AnimatedGradientBackground type="attendance" className="min-h-full rounded-2xl">
      <div className="mx-auto w-full max-w-3xl animate-fade-in pb-10">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-300/25 bg-gradient-to-br from-indigo-500/20 to-violet-400/15 text-violet-300 shadow-glow-sm">
            <Radio size={26} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300 shadow-glow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)]" />
              Session Control
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Open Attendance
            </h1>

            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Start a live session so your students can mark attendance from their own phones.
            </p>
          </div>
        </div>

        {/* ==================== PAGE ERROR ==================== */}
        {pageError && (
          <Card glass className="mb-5 flex items-center justify-between gap-3 p-4">
            <p className="text-xs font-medium text-rose-300">{pageError}</p>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadPeriods}>
              Retry
            </Button>
          </Card>
        )}

        {/* ==================== OPEN FORM ==================== */}
        <Card glass className="animate-slide-up p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-white">
            <Users2 size={17} className="text-cyan-300" />
            Choose the class
          </h2>

          {loadingPeriods ? (
            <div className="mt-4 space-y-2.5">
              <div className="h-11 w-full rounded-xl skeleton-block" />
              <div className="h-11 w-full rounded-xl skeleton-block opacity-80" />
              <div className="h-11 w-full rounded-xl skeleton-block opacity-60" />
            </div>
          ) : (
            <>
              {/* Course */}
              <label className="mt-4 mb-1.5 block text-xs font-semibold tracking-tight text-slate-300">
                Course
              </label>
              <SelectShell icon={CalendarRange}>
                <select value={course} onChange={(e) => setCourse(e.target.value)}>
                  <option value="">All courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </SelectShell>

              {/* Batch */}
              <label className="mt-4 mb-1.5 block text-xs font-semibold tracking-tight text-slate-300">
                Batch
              </label>
              <SelectShell icon={Users2}>
                <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                  <option value="">All batches</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </SelectShell>

              {/* Semester */}
              <label className="mt-4 mb-1.5 block text-xs font-semibold tracking-tight text-slate-300">
                Semester
              </label>
              <SelectShell icon={CalendarRange}>
                <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                  <option value="">All semesters</option>
                  {semesters.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </SelectShell>

              {/* Resolved target */}
              <div
                className={`
                  mt-4 rounded-xl border px-4 py-3 text-xs leading-relaxed backdrop-blur-md
                  ${
                    selectedPeriod
                      ? 'border-cyan-300/25 bg-cyan-400/[0.07] text-cyan-200'
                      : 'border-white/[0.07] bg-white/[0.02] text-slate-500'
                  }
                `}
              >
                {selectedPeriod ? (
                  <>
                    <span className="font-bold">Ready:</span>{' '}
                    {selectedPeriod.name ||
                      `${selectedPeriod.course} · ${selectedPeriod.batch} · Semester ${selectedPeriod.semester}`}
                    {selectedPeriod.startDate && (
                      <span className="text-slate-400">
                        {' '}
                        — valid {selectedPeriod.startDate}
                        {selectedPeriod.endDate ? ` → ${selectedPeriod.endDate}` : ''}
                      </span>
                    )}
                  </>
                ) : (
                  'Pick a specific course, batch and semester to target one class.'
                )}
              </div>
            </>
          )}

          {/* Location */}
          <h2 className="mt-6 flex items-center gap-2 border-t border-white/[0.08] pt-5 font-display text-base font-bold tracking-tight text-white">
            <LocateFixed size={17} className="text-emerald-300" />
            Pin your classroom location
          </h2>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            Students must be within 50 m of this point when they submit attendance.
          </p>

          <div
            className={`
              mt-3 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium backdrop-blur-md
              ${
                geoStatus === 'granted'
                  ? 'border-emerald-300/25 bg-emerald-400/[0.07] text-emerald-200'
                  : geoStatus === 'denied' || geoStatus === 'unsupported'
                  ? 'border-amber-300/25 bg-amber-400/[0.07] text-amber-200'
                  : 'border-white/[0.07] bg-white/[0.02] text-slate-400'
              }
            `}
          >
            <MapPin size={15} className="shrink-0" />
            <span className="min-w-0 break-all">{geoLabel}</span>
          </div>

          {(geoStatus === 'idle' || geoStatus === 'denied' || geoStatus === 'granted') && (
            <Button
              variant={geoStatus === 'granted' ? 'secondary' : 'primary'}
              size="md"
              icon={LocateFixed}
              loading={geoStatus === 'locating'}
              onClick={requestLocation}
              className="mt-3"
            >
              {geoStatus === 'granted' ? 'Refresh Location' : geoStatus === 'locating' ? 'Locating…' : 'Use My Current Location'}
            </Button>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`
                mt-4 flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium animate-fade-in
                ${
                  feedback.type === 'success'
                    ? 'border-emerald-300/25 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-300/25 bg-rose-500/10 text-rose-300'
                }
              `}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              ) : (
                <XCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <p className="leading-relaxed">{feedback.text}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            variant="success"
            size="lg"
            icon={Radio}
            disabled={!selectedPeriod || !coords}
            loading={opening}
            onClick={handleOpen}
            className="mt-5 w-full shadow-glow-sm"
          >
            {opening
              ? 'Opening session…'
              : !selectedPeriod
              ? 'Select a class first'
              : !coords
              ? 'Capture your location first'
              : `Open Attendance${selectedPeriod ? ` — ${selectedPeriod.name || `${selectedPeriod.course} ${selectedPeriod.batch} Sem ${selectedPeriod.semester}`}` : ''}`}
          </Button>
        </Card>

        {/* ==================== ACTIVE SESSIONS ==================== */}
        <Card
          glass
          className="animate-slide-up mt-5 p-5 opacity-0 sm:p-6"
          style={{ animationDelay: '90ms' }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-white">
              <Timer size={17} className="text-cyan-300" />
              Live Sessions
            </h2>

            <button
              type="button"
              onClick={loadActive}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {loadingActive ? (
            <div className="mt-4 space-y-2.5">
              <div className="h-16 w-full rounded-xl skeleton-block" />
            </div>
          ) : activeSessions.length === 0 ? (
            <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center text-xs text-slate-500">
              No sessions are currently open. Opened sessions appear here with a live countdown.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeSessions.map((session) => {
                const mine = username && session.teacherName === username;
                const urgent = (session.remainingSeconds ?? 9999) <= 120;

                return (
                  <li
                    key={session.id}
                    className="
                      flex flex-col gap-3 rounded-xl border border-white/[0.08]
                      bg-white/[0.03] p-4 backdrop-blur-md
                      sm:flex-row sm:items-center sm:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold tracking-tight text-white">
                        {sessionTitle(session)}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {session.teacherName}
                        {mine ? ' (you)' : ''} • opened{' '}
                        {session.openedAt
                          ? new Date(session.openedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5 self-start sm:self-center">
                      <span
                        className={`
                          inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-sm font-bold tabular-nums
                          ${
                            urgent
                              ? 'border-rose-300/30 bg-rose-500/10 text-rose-300'
                              : 'border-cyan-300/25 bg-cyan-400/10 text-cyan-200'
                          }
                        `}
                      >
                        <Timer size={13} />
                        {formatCountdown(session.expiresAt, session.remainingSeconds)}
                      </span>

                      <Button
                        variant="danger"
                        size="sm"
                        icon={StopCircle}
                        loading={closingId === session.id}
                        onClick={() => handleClose(session.id)}
                      >
                        Close
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AnimatedGradientBackground>
  );
}

/* =========================================================
   SELECT WRAPPER — matches AURORA input styling
========================================================= */

function SelectShell({ icon: Icon, children }) {
  return (
    <div
      className="
        group relative flex h-12 w-full items-center
        rounded-xl border border-white/10 bg-[#0a1026]/80
        backdrop-blur-md transition-all duration-200
        focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10
      "
    >
      <div className="flex items-center justify-center pl-3.5 pr-2 text-slate-500 transition-colors group-focus-within:text-cyan-300">
        <Icon size={17} />
      </div>

      {React.cloneElement(children, {
        className:
          'h-full w-full appearance-none bg-transparent py-0 pl-1 pr-8 text-[13px] font-medium text-slate-100 outline-none cursor-pointer',
      })}

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600"
      />
    </div>
  );
}
