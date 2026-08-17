import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';
import holidayService from '../../services/holidayService';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getSecondSaturday(year, month) {
  const firstDay = new Date(year, month, 1);

  const firstSaturdayOffset =
    (6 - firstDay.getDay() + 7) % 7;

  return 1 + firstSaturdayOffset + 7;
}

export default function CalendarPage() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [holidayReason, setHolidayReason] =
    useState('');

  const [holidays, setHolidays] = useState({});

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString(
    'default',
    {
      month: 'long'
    }
  );

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const secondSaturday =
    getSecondSaturday(year, month);

  /*
   * =========================================================
   * LOAD HOLIDAYS FROM DATABASE
   * =========================================================
   */

  useEffect(() => {
    const loadHolidays = async () => {
      setLoading(true);
      setError('');

      try {
        const startDate = formatDate(
          new Date(year, month, 1)
        );

        const endDate = formatDate(
          new Date(
            year,
            month + 1,
            0
          )
        );

        const response =
          await holidayService.getHolidays(
            startDate,
            endDate
          );

        const holidayMap = {};

        response.forEach((holiday) => {
          holidayMap[holiday.holidayDate] =
            holiday;
        });

        setHolidays(holidayMap);
      } catch (err) {
        console.error(
          'Failed to load holidays:',
          err
        );

        setError(
          err.response?.data?.message ||
            'Failed to load holidays.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadHolidays();
  }, [year, month]);

  /*
   * =========================================================
   * CALENDAR DAYS
   * =========================================================
   */

  const calendarDays = useMemo(() => {
    const days = [];

    for (
      let i = 0;
      i < firstDay;
      i += 1
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      days.push(day);
    }

    return days;
  }, [firstDay, daysInMonth]);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month - 1,
        1
      )
    );

    setSelectedDate(null);
    setHolidayReason('');
    setError('');
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month + 1,
        1
      )
    );

    setSelectedDate(null);
    setHolidayReason('');
    setError('');
  };

  const goToToday = () => {
    setCurrentDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(null);
    setHolidayReason('');
    setError('');
  };

  /*
   * =========================================================
   * DATE SELECTION
   * =========================================================
   */

  const handleDateClick = (day) => {
    if (!day) {
      return;
    }

    const date = new Date(
      year,
      month,
      day
    );

    const dateKey = formatDate(date);

    setSelectedDate(date);

    setHolidayReason(
      holidays[dateKey]?.reason || ''
    );

    setError('');
  };

  /*
   * =========================================================
   * SAVE HOLIDAY TO DATABASE
   * =========================================================
   */

  const handleSaveHoliday = async () => {
    if (!selectedDate) {
      return;
    }

    const reason =
      holidayReason.trim();

    if (!reason) {
      setError(
        'Please enter a holiday reason.'
      );

      return;
    }

    const dateKey =
      formatDate(selectedDate);

    setSaving(true);
    setError('');

    try {
      const savedHoliday =
        await holidayService.createHoliday(
          dateKey,
          reason
        );

      setHolidays((previous) => ({
        ...previous,
        [dateKey]: savedHoliday
      }));

      setHolidayReason('');

      setSelectedDate(null);
    } catch (err) {
      console.error(
        'Failed to save holiday:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to save holiday.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * DELETE HOLIDAY FROM DATABASE
   * =========================================================
   */

  const handleRemoveHoliday = async () => {
    if (!selectedDate) {
      return;
    }

    const dateKey =
      formatDate(selectedDate);

    const holiday =
      holidays[dateKey];

    if (!holiday?.id) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await holidayService.deleteHoliday(
        holiday.id
      );

      setHolidays((previous) => {
        const updated = {
          ...previous
        };

        delete updated[dateKey];

        return updated;
      });

      setHolidayReason('');
      setSelectedDate(null);
    } catch (err) {
      console.error(
        'Failed to delete holiday:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to remove holiday.'
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * =========================================================
   * DATE HELPERS
   * =========================================================
   */

  const isToday = (day) => {
    if (!day) {
      return false;
    }

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const getDayType = (day) => {
    if (!day) {
      return 'empty';
    }

    const date = new Date(
      year,
      month,
      day
    );

    const dateKey =
      formatDate(date);

    /*
     * Database holiday has highest priority.
     */

    if (holidays[dateKey]) {
      return 'holiday';
    }

    /*
     * Sunday
     */

    if (date.getDay() === 0) {
      return 'sunday';
    }

    /*
     * 2nd Saturday
     */

    if (
      date.getDay() === 6 &&
      day === secondSaturday
    ) {
      return 'second-saturday';
    }

    /*
     * 4th Saturday remains working.
     */

    return 'working';
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="mx-auto w-full max-w-7xl">

      {/* HEADER */}

      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <CalendarDays size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Academic Calendar
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage working days and holidays
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Today
          </button>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError('')}
            className="rounded-lg p-1 hover:bg-red-100"
            aria-label="Close error"
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* CALENDAR CARD */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:p-7">

        {/* MONTH HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <button
            type="button"
            onClick={goToPreviousMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">

            <h2 className="text-2xl font-bold text-gray-900">
              {monthName} {year}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Select a date to manage holidays
            </p>

          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">

            <Loader2
              size={16}
              className="animate-spin"
            />

            Loading holidays...

          </div>
        )}

        {/* LEGEND */}

        <div className="mb-6 flex flex-wrap gap-4 text-xs text-gray-600">

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            Today
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            Working Day
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            Sunday
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            2nd Saturday
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            Holiday
          </div>

        </div>

        {/* WEEKDAYS */}

        <div className="mb-2 grid grid-cols-7 gap-2">

          {[
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
          ].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-400"
            >
              {day}
            </div>
          ))}

        </div>

        {/* DATES */}

        <div className="grid grid-cols-7 gap-2">

          {calendarDays.map(
            (day, index) => {
              const type =
                getDayType(day);

              const date = day
                ? new Date(
                    year,
                    month,
                    day
                  )
                : null;

              const dateKey = date
                ? formatDate(date)
                : null;

              const selected =
                selectedDate &&
                dateKey ===
                  formatDate(
                    selectedDate
                  );

              return (
                <button
                  key={`${day}-${index}`}
                  type="button"
                  disabled={!day}
                  onClick={() =>
                    handleDateClick(day)
                  }
                  className={`
                    relative min-h-20 rounded-xl border p-2 text-left transition
                    ${
                      !day
                        ? 'cursor-default border-transparent bg-transparent'
                        : 'border-gray-100 bg-gray-50 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                    }
                    ${
                      selected
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    }
                  `}
                >

                  {day && (
                    <>
                      <span
                        className={`
                          flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                          ${
                            isToday(day)
                              ? 'bg-blue-600 text-white'
                              : type ===
                                  'holiday'
                                ? 'bg-purple-100 text-purple-700'
                                : type ===
                                    'sunday'
                                  ? 'bg-red-100 text-red-600'
                                  : type ===
                                      'second-saturday'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-gray-700'
                          }
                        `}
                      >
                        {day}
                      </span>

                      <span
                        className={`
                          mt-2 block text-[10px] font-medium
                          ${
                            type ===
                            'holiday'
                              ? 'text-purple-600'
                              : type ===
                                  'sunday'
                                ? 'text-red-500'
                                : type ===
                                    'second-saturday'
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                          }
                        `}
                      >
                        {type === 'holiday'
                          ? 'Holiday'
                          : type === 'sunday'
                            ? 'Sunday'
                            : type ===
                                'second-saturday'
                              ? '2nd Saturday'
                              : 'Working Day'}
                      </span>

                      {type ===
                        'holiday' && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-purple-500" />
                      )}
                    </>
                  )}

                </button>
              );
            }
          )}

        </div>

      </div>

      {/* SELECTED DATE PANEL */}

      {selectedDate && (
        <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">

          <div className="mb-5 flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Selected Date
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString(
                  'en-IN',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }
                )}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setHolidayReason('');
              }}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>

          </div>

          <label
            htmlFor="holiday-reason"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Holiday Reason
          </label>

          <input
            id="holiday-reason"
            type="text"
            value={holidayReason}
            onChange={(event) =>
              setHolidayReason(
                event.target.value
              )
            }
            placeholder="Example: Independence Day"
            maxLength={255}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <div className="mt-4 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={
                handleSaveHoliday
              }
              disabled={
                saving ||
                deleting ||
                !holidayReason.trim()
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? 'Saving...'
                : 'Make This Date a Holiday'}

            </button>

            {selectedDate &&
              holidays[
                formatDate(
                  selectedDate
                )
              ] && (
                <button
                  type="button"
                  onClick={
                    handleRemoveHoliday
                  }
                  disabled={
                    saving ||
                    deleting
                  }
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {deleting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {deleting
                    ? 'Removing...'
                    : 'Remove Holiday'}

                </button>
              )}

          </div>

        </div>
      )}

    </div>
  );
}