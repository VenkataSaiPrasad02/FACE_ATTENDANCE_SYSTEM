import { useEffect, useState } from 'react';
import { GraduationCap, CalendarRange, Calendar } from 'lucide-react';

const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];
const COURSES = ['MCA', 'MBA', 'BCA', 'BBA'];

export default function AcademicPeriodForm({
  initialData = null,
  onSubmit,
  onCancel
}) {

  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    course: '',
    batch: '',
    semester: '',
    startDate: '',
    endDate: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {

    if (initialData) {

      setFormData({
        course: initialData.course || '',
        batch: initialData.batch || '',
        semester: initialData.semester || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || ''
      });

    } else {

      setFormData({
        course: '',
        batch: '',
        semester: '',
        startDate: '',
        endDate: ''
      });

    }

  }, [initialData]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (!formData.course.trim()) {
      setError('Course is required.');
      return;
    }

    if (!formData.batch.trim()) {
      setError('Batch is required.');
      return;
    }

    if (!/^\d{4}-\d{4}$/.test(formData.batch.trim())) {
      setError('Batch must be in the format YYYY-YYYY, e.g. 2025-2027.');
      return;
    }

    if (!formData.semester.trim()) {
      setError('Semester is required.');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required.');
      return;
    }

    if (!formData.endDate) {
      setError('End date is required.');
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError('End date must not be before start date.');
      return;
    }

    try {

      setSaving(true);

      const data = {
        course: formData.course.trim(),
        batch: formData.batch.trim(),
        semester: formData.semester.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      await onSubmit(data);

    } catch (e) {

      setError(
        e?.response?.data?.message ||
        e?.message ||
        'Failed to save academic period.'
      );

    } finally {

      setSaving(false);

    }

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">

        {/* Course */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Course <span className="text-red-500">*</span>
          </label>

          <div className="group flex h-14 items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
              <GraduationCap size={20} />
            </div>

            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="h-full w-full cursor-pointer bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none"
            >
              <option value="">Select course</option>
              {COURSES.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Batch <span className="text-red-500">*</span>
          </label>

          <div className="group flex h-14 items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
              <CalendarRange size={20} />
            </div>

            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              maxLength={20}
              placeholder="2025-2027"
              className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <p className="mt-1.5 text-xs text-slate-500">
            Full batch range only, e.g. 2025-2027.
          </p>
        </div>

        {/* Semester */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Semester <span className="text-red-500">*</span>
          </label>

          <div className="group flex h-14 items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
              <GraduationCap size={20} />
            </div>

            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="h-full w-full cursor-pointer bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none"
            >
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Start Date <span className="text-red-500">*</span>
          </label>

          <div className="group flex h-14 items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
              <Calendar size={20} />
            </div>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none"
            />
          </div>
        </div>

        {/* End Date */}

        <div className="sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            End Date <span className="text-red-500">*</span>
          </label>

          <div className="group flex h-14 items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors group-focus-within:border-blue-100 group-focus-within:text-blue-600">
              <Calendar size={20} />
            </div>

            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="h-full w-full bg-transparent pl-4 pr-4 text-sm font-medium text-slate-900 outline-none"
            />
          </div>
        </div>

      </div>

      {/* Buttons */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:from-rose-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white align-[-3px]" />
          )}
          {saving
            ? 'Saving...'
            : isEdit
              ? 'Update Period'
              : 'Schedule Period'}
        </button>

      </div>

    </form>
  );
}