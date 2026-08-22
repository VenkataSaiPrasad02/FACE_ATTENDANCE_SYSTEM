import React, { useEffect, useState } from 'react';
import { GraduationCap, CalendarRange, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';

const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];
const COURSES = ['MCA', 'MBA', 'BCA', 'BBA'];

export default function AcademicPeriodForm({
  initialData = null,
  onSubmit,
  onCancel,
}) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    course: '',
    batch: '',
    semester: '',
    startDate: '',
    endDate: '',
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
        endDate: initialData.endDate || '',
      });
    } else {
      setFormData({
        course: '',
        batch: '',
        semester: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        endDate: formData.endDate,
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
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Course */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Course / Program <span className="text-rose-500">*</span>
          </label>
          <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-slate-100 bg-slate-50/50 text-slate-400">
              <GraduationCap size={16} />
            </div>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="h-full w-full cursor-pointer bg-transparent px-3 text-xs sm:text-sm font-semibold text-slate-800 outline-none"
            >
              <option value="">Select course</option>
              {COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Batch Interval <span className="text-rose-500">*</span>
          </label>
          <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-slate-100 bg-slate-50/50 text-slate-400">
              <CalendarRange size={16} />
            </div>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              maxLength={20}
              placeholder="e.g. 2025-2027"
              className="h-full w-full bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Use format YYYY-YYYY (e.g. 2025-2027).
          </p>
        </div>

        {/* Semester */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Semester <span className="text-rose-500">*</span>
          </label>
          <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-slate-100 bg-slate-50/50 text-slate-400">
              <GraduationCap size={16} />
            </div>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="h-full w-full cursor-pointer bg-transparent px-3 text-xs sm:text-sm font-semibold text-slate-800 outline-none"
            >
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-slate-100 bg-slate-50/50 text-slate-400">
              <Calendar size={16} />
            </div>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="h-full w-full bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            End Date <span className="text-rose-500">*</span>
          </label>
          <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 sm:max-w-[calc(50%-0.5rem)]">
            <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-slate-100 bg-slate-50/50 text-slate-400">
              <Calendar size={16} />
            </div>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="h-full w-full bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={saving}
          className="w-full sm:w-auto shadow-sm"
        >
          {isEdit ? 'Update Period' : 'Schedule Period'}
        </Button>
      </div>
    </form>
  );
}