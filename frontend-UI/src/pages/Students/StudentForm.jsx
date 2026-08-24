import React, { useEffect, useState } from 'react';
import {
  User,
  Hash,
  GraduationCap,
  CalendarRange,
  Layers,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Sparkles,
  UserRound,
  Wand2,
  CheckCircle2,
} from 'lucide-react';

import autoFillService from '../../services/autoFillService';
import Button from '../../components/ui/Button';

const emptyForm = {
  studentNumber: '',
  fullName: '',
  email: '',
  phone: '',
  course: '',
  year: '',
  batch: '',
  semester: '',
  teacherId: '',
};

/*
 * Fields populated by the selected auto-fill configuration. Tracked so
 * the UI can show an "auto-filled" hint until the admin edits the value
 * manually (manual override is always allowed).
 */
const AUTO_FILL_FIELDS = ['course', 'batch', 'year', 'semester'];

export default function StudentForm({ onSubmit, initialData, onCancel, loading = false, teachers = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [autoFilled, setAutoFilled] = useState({});
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (isEdit) {
      setForm({
        studentNumber: initialData.studentNumber || '',
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        course: initialData.course || '',
        year: initialData.year || '',
        batch: initialData.batch || '',
        semester: initialData.semester || '',
        teacherId:
          initialData.teacherId === null || initialData.teacherId === undefined
            ? ''
            : String(initialData.teacherId),
      });
      setAutoFilled({});
    } else {
      setForm(emptyForm);
      setAutoFilled({});

      /*
       * Load presets only for creation. The active preset (if any) is
       * pre-selected but nothing is applied until the admin confirms.
       */
      let cancelled = false;
      autoFillService
        .getAll()
        .then((data) => {
          if (cancelled) return;
          const list = Array.isArray(data) ? data : [];
          setConfigs(list);
          const active = list.find((config) => config.active);
          if (active) {
            setSelectedConfigId(String(active.id));
            applyConfig(active, { silent: true });
          }
        })
        .catch(() => {
          /* Auto-fill is a convenience — never block the form */
        });
      return () => {
        cancelled = true;
      };
    }
  }, [initialData]);

  const applyConfig = (config, { silent = false } = {}) => {
    setForm((prev) => ({
      ...prev,
      course: config.course || prev.course,
      batch: config.batch || prev.batch,
      year: config.year || prev.year,
      semester: config.semester || prev.semester,
    }));

    setAutoFilled({
      course: Boolean(config.course),
      batch: Boolean(config.batch),
      year: Boolean(config.year),
      semester: Boolean(config.semester),
    });

    if (!silent) {
      // Values stay editable; touching a field clears its badge below.
    }
  };

  const handleConfigChange = (event) => {
    const id = event.target.value;
    setSelectedConfigId(id);

    if (!id) {
      setAutoFilled({});
      return;
    }

    const config = configs.find(
      (item) => String(item.id) === id
    );

    if (config) {
      applyConfig(config);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Manual override — clear the auto-filled hint for this field.
    if (AUTO_FILL_FIELDS.includes(name)) {
      setAutoFilled((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        teacherId: form.teacherId ? Number(form.teacherId) : null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const autoFillBadge = (field) =>
    autoFilled[field] ? (
      <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-violet-300 align-middle">
        <Wand2 size={9} />
        AUTO-FILLED
      </span>
    ) : null;

  const inputShell =
    'group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10';

  const iconShell =
    'flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300';

  const inputClass =
    'h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm';

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 animate-fade-in">
      {/* SECTION 0: Auto Fill (create mode only) */}
      {!isEdit && configs.length > 0 && (
        <div className="rounded-2xl border border-violet-300/20 bg-gradient-to-br from-[#161038]/80 via-[#0d1430]/70 to-[#0a1229]/70 p-4 shadow-card backdrop-blur-sm sm:p-5">
          <div className="mb-1 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-300/25 bg-violet-400/10 text-violet-300">
                <Sparkles size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white sm:text-sm">
                  Auto Fill Configuration
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pre-fill common academic details — every field stays editable
                </p>
              </div>
            </div>
          </div>

          <div className={`${inputShell} mt-4`}>
            <div className={iconShell}>
              <Wand2 size={16} />
            </div>
            <select
              value={selectedConfigId}
              onChange={handleConfigChange}
              className={`${inputClass} cursor-pointer appearance-none`}
            >
              <option value="">No auto fill (enter manually)</option>
              {configs.map((config) => (
                <option key={config.id} value={String(config.id)}>
                  {config.name}
                  {config.active ? '  (default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SECTION 1: Student Identity */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 p-4 shadow-card backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/10 text-cyan-300">
              <User size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white sm:text-sm">
                Student Information
              </h4>
              <p className="text-[11px] text-slate-500">
                Personal identity and institutional registration code
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-400">
            Step 1
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div className={isEdit ? 'sm:col-span-2' : ''}>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Full Student Name <span className="text-rose-400">*</span>
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <User size={16} />
              </div>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Roll Number (Create only) */}
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Roll Number / Student ID <span className="text-rose-400">*</span>
              </label>
              <div className={inputShell}>
                <div className={iconShell}>
                  <Hash size={16} />
                </div>
                <input
                  name="studentNumber"
                  value={form.studentNumber}
                  onChange={handleChange}
                  placeholder="e.g. 23MCA001"
                  required
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Academic Program & Hierarchy */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 p-4 shadow-card backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-300/25 bg-sky-400/10 text-sky-300">
              <GraduationCap size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white sm:text-sm">
                Academic Curriculum Details
              </h4>
              <p className="text-[11px] text-slate-500">
                Course program, batch year, semester, and academic standing
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-400">
            Step 2
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Course */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Course / Program <span className="text-rose-400">*</span>
              {autoFillBadge('course')}
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <BookOpen size={16} />
              </div>
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="e.g. MCA, MBA, BCA"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Batch */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Batch Interval <span className="text-rose-400">*</span>
              {autoFillBadge('batch')}
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <CalendarRange size={16} />
              </div>
              <input
                name="batch"
                value={form.batch}
                onChange={handleChange}
                placeholder="e.g. 2025-2027"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Current Semester <span className="text-rose-400">*</span>
              {autoFillBadge('semester')}
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <Layers size={16} />
              </div>
              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="e.g. 2nd Semester"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Academic Year <span className="text-rose-400">*</span>
              {autoFillBadge('year')}
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <Calendar size={16} />
              </div>
              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="e.g. 1st Year"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Teacher assignment */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Assigned Teacher{' '}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <UserRound size={16} />
              </div>
              <select
                name="teacherId"
                value={form.teacherId}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer appearance-none`}
              >
                <option value="">No teacher assigned</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={String(teacher.id)}>
                    {teacher.fullName ||
                      teacher.teacherName ||
                      teacher.name ||
                      `Teacher #${teacher.id}`}
                    {teacher.department ? ` - ${teacher.department}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Communication & Contact Details */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d1430]/55 p-4 shadow-card backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
              <Mail size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white sm:text-sm">
                Contact & Communication
              </h4>
              <p className="text-[11px] text-slate-500">
                Direct email and phone number for attendance alerts
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-400">
            Step 3
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Institutional Email
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@institution.edu"
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Mobile Phone
            </label>
            <div className={inputShell}>
              <div className={iconShell}>
                <Phone size={16} />
              </div>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            variant="secondary"
            type="button"
            onClick={onCancel}
            disabled={submitting || loading}
            className="w-full font-semibold sm:w-auto"
          >
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          type="submit"
          loading={submitting || loading}
          icon={isEdit ? undefined : CheckCircle2}
          className="w-full font-bold sm:w-auto"
        >
          {isEdit ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
}
