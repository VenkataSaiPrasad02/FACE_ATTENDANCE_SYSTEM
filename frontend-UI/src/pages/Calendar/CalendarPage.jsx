import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import holidayService from '../../services/holidayService';
import AnimatedGradientBackground from '../../components/ui/AnimatedGradientBackground';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSecondSaturday(year, month) {
  const firstDay = new Date(year, month, 1);
  const firstSaturdayOffset = (6 - firstDay.getDay() + 7) % 7;
  return 1 + firstSaturdayOffset + 7;
}

export default function CalendarPage() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(null);
  const [holidayReason, setHolidayReason] = useState('');
  const [holidays, setHolidays] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', {
    month: 'long',
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const secondSaturday = getSecondSaturday(year, month);

  // Load Holidays
  useEffect(() => {
    const loadHolidays = async () => {
      setLoading(true);
      setError('');

      try {
        const startDate = formatDate(new Date(year, month, 1));
        const endDate = formatDate(new Date(year, month + 1, 0));

        const response = await holidayService.getHolidays(startDate, endDate);
        const holidayMap = {};

        response.forEach((holiday) => {
          holidayMap[holiday.holidayDate] = holiday;
        });

        setHolidays(holidayMap);
      } catch (err) {
        console.error('Failed to load holidays:', err);
        setError(err.response?.data?.message || 'Failed to load holidays.');
      } finally {
        setLoading(false);
      }
    };

    loadHolidays();
  }, [year, month]);

  // Calendar Days Grid Array
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i += 1) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day);
    }
    return days;
  }, [firstDay, daysInMonth]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setHolidayReason('');
    setError('');
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setHolidayReason('');
    setError('');
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(null);
    setHolidayReason('');
    setError('');
  };

  // Date Selection
  const handleDateClick = (day) => {
    if (!day) return;
    const date = new Date(year, month, day);
    const dateKey = formatDate(date);

    setSelectedDate(date);
    setHolidayReason(holidays[dateKey]?.reason || '');
    setError('');
  };

  // Save Holiday
  const handleSaveHoliday = async () => {
    if (!selectedDate) return;
    const reason = holidayReason.trim();

    if (!reason) {
      setError('Please enter a holiday reason.');
      return;
    }

    const dateKey = formatDate(selectedDate);
    setSaving(true);
    setError('');

    try {
      const savedHoliday = await holidayService.createHoliday(dateKey, reason);
      setHolidays((previous) => ({
        ...previous,
        [dateKey]: savedHoliday,
      }));
      setHolidayReason('');
      setSelectedDate(null);
    } catch (err) {
      console.error('Failed to save holiday:', err);
      setError(err.response?.data?.message || 'Failed to save holiday.');
    } finally {
      setSaving(false);
    }
  };

  // Remove Holiday
  const handleRemoveHoliday = async () => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    const holiday = holidays[dateKey];

    if (!holiday?.id) return;

    setDeleting(true);
    setError('');

    try {
      await holidayService.deleteHoliday(holiday.id);
      setHolidays((previous) => {
        const updated = { ...previous };
        delete updated[dateKey];
        return updated;
      });
      setHolidayReason('');
      setSelectedDate(null);
    } catch (err) {
      console.error('Failed to delete holiday:', err);
      setError(err.response?.data?.message || 'Failed to remove holiday.');
    } finally {
      setDeleting(false);
    }
  };

  const isToday = (day) => {
    if (!day) return false;
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const getDayType = (day) => {
    if (!day) return 'empty';
    const date = new Date(year, month, day);
    const dateKey = formatDate(date);

    if (holidays[dateKey]) return 'holiday';
    if (date.getDay() === 0) return 'sunday';
    if (date.getDay() === 6 && day === secondSaturday) return 'second-saturday';
    return 'working';
  };

  const selectedDateKey = selectedDate ? formatDate(selectedDate) : null;
  const isSelectedHoliday = Boolean(selectedDateKey && holidays[selectedDateKey]);

  return (
    <AnimatedGradientBackground
  type="calendar"
  className="min-h-full rounded-2xl"
>
    <div className="w-full animate-fade-in pb-8">
      {/* Header */}
      <div className="animate-slide-up mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/20 to-cyan-400/15 text-cyan-300 shadow-glow-sm">
            <CalendarDays size={24} strokeWidth={2} />
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
              Institutional Calendar
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Academic Calendar
            </h1>

            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Configure institutional holidays, working day schedules, and attendance calendar terms.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={goToToday}
          className="w-full sm:w-auto font-semibold"
        >
          Jump to Today
        </Button>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300 animate-fade-in">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="rounded-lg p-1 transition-colors hover:bg-rose-500/20"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Calendar Surface Card */}
      <Card glass className="p-5 sm:p-7">
        {/* Month Navigator Header */}
        <div className="mb-6 flex items-center justify-between border-b border-white/[0.08] pb-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 transition-colors hover:bg-white/[0.11] hover:text-white"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <h2 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
              {monthName} {year}
            </h2>
            <p className="text-[11px] font-medium text-slate-500">
              Click any calendar day to configure or view holiday details
            </p>
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 transition-colors hover:bg-white/[0.11] hover:text-white"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <Loader2 size={15} className="animate-spin text-cyan-400" />
            <span>Loading holiday definitions...</span>
          </div>
        )}

        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
            <span>Today</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span>Working Day</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span>Sunday</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            <span>2nd Saturday</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
            <span>Institutional Holiday</span>
          </div>
        </div>

        {/* Weekday Header */}
        <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
            <div
              key={day}
              className={`py-1.5 text-center text-[11px] font-bold uppercase tracking-wider ${
                idx === 0 ? 'text-rose-400' : 'text-slate-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((day, index) => {
            const type = getDayType(day);
            const date = day ? new Date(year, month, day) : null;
            const dateKey = date ? formatDate(date) : null;
            const isSelected =
              selectedDate && dateKey === formatDate(selectedDate);

            return (
              <button
                key={`${day}-${index}`}
                type="button"
                disabled={!day}
                onClick={() => handleDateClick(day)}
                className={`
                  relative min-h-16 rounded-2xl border p-2 text-left transition-all duration-150 sm:min-h-20
                  ${
                    !day
                      ? 'cursor-default border-transparent bg-transparent'
                      : type === 'holiday'
                        ? 'border-amber-300/20 bg-amber-400/10 hover:border-amber-300/40 hover:bg-amber-400/15'
                        : 'border-white/[0.06] bg-transparent hover:border-white/[0.14] hover:bg-white/[0.04]'
                  }
                  ${
                    isToday(day)
                      ? 'ring-1 ring-cyan-300/60 shadow-[0_0_16px_rgba(34,211,238,0.18)]'
                      : ''
                  }
                  ${
                    isSelected
                      ? 'border-cyan-300/40 bg-white/[0.06] ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-[#0b1128]'
                      : ''
                  }
                `}
              >
                {day && (
                  <>
                    <span
                      className={`
                        flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold
                        ${
                          isToday(day)
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-glow-sm'
                            : type === 'holiday'
                              ? 'bg-amber-400/15 text-amber-200'
                              : type === 'sunday'
                                ? 'bg-rose-500/10 text-rose-200'
                                : type === 'second-saturday'
                                  ? 'bg-sky-400/10 text-sky-200'
                                  : 'text-slate-200'
                        }
                      `}
                    >
                      {day}
                    </span>

                    <span
                      className={`
                        mt-1.5 block truncate text-[9.5px] font-bold sm:text-[10px]
                        ${
                          type === 'holiday'
                            ? 'text-amber-300'
                            : type === 'sunday'
                              ? 'text-rose-300'
                              : type === 'second-saturday'
                                ? 'text-sky-300'
                                : 'text-emerald-400'
                        }
                      `}
                    >
                      {type === 'holiday'
                        ? holidays[dateKey]?.reason || 'Holiday'
                        : type === 'sunday'
                          ? 'Sunday'
                          : type === 'second-saturday'
                            ? '2nd Sat'
                            : 'Working'}
                    </span>

                    {type === 'holiday' && (
                      <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Panel Card */}
      {selectedDate && (
        <Card glass className="relative mt-6 overflow-hidden p-6 animate-scale-in">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent opacity-60" />

          <div className="mb-4 flex items-start justify-between border-b border-white/[0.08] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Selected Calendar Date
              </span>

              <h3 className="font-display mt-0.5 text-base font-bold text-white">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setHolidayReason('');
              }}
              className="rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.07] hover:text-slate-200"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <label
              htmlFor="holiday-reason"
              className="mb-1.5 block text-xs font-semibold text-slate-300"
            >
              Holiday Description / Reason
            </label>

            <input
              id="holiday-reason"
              type="text"
              value={holidayReason}
              onChange={(event) => setHolidayReason(event.target.value)}
              placeholder="e.g. Independence Day, Annual Founder's Day"
              maxLength={255}
              className="w-full rounded-xl border border-white/10 bg-[#0a1026]/80 px-3.5 py-2.5 text-xs font-medium text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10 sm:text-sm"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={CheckCircle2}
              onClick={handleSaveHoliday}
              loading={saving}
              disabled={deleting || !holidayReason.trim()}
              className="font-bold"
            >
              {isSelectedHoliday ? 'Update Holiday Reason' : 'Mark as Institutional Holiday'}
            </Button>

            {isSelectedHoliday && (
              <Button
                variant="danger"
                size="md"
                icon={Trash2}
                onClick={handleRemoveHoliday}
                loading={deleting}
                disabled={saving}
                className="font-bold"
              >
                Remove Holiday
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
    </AnimatedGradientBackground>
  );
}
