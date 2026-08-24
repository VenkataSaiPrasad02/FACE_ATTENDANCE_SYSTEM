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
import { toast } from 'react-toastify';

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

// ============================================================
// ✨ AUTO FILL — sample data generator
//
// Pure convenience for create mode: produces ONE realistic,
// internally consistent student record that is written straight
// into the existing controlled form state. It never touches
// readonly/disabled flags (there are none), never submits, and
// every value can be edited freely before "Add Student".
//
// Academic fields prefer the active auto-fill configuration
// (admin-curated, guaranteed valid); the fallback pool matches
// values already used by this institution.
// ============================================================

const SAMPLE_FIRST_NAMES = [
  'Rahul', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya',
  'Karthik', 'Divya', 'Rohan', 'Meera', 'Aditya', 'Kavya',
  'Nikhil', 'Pooja', 'Sanjay', 'Harini',
];

const SAMPLE_LAST_NAMES = [
  'Sharma', 'Reddy', 'Kumar', 'Iyer', 'Patel', 'Rao',
  'Nair', 'Verma', 'Menon', 'Das', 'Gupta', 'Krishnan',
];

const SAMPLE_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com'];

const SAMPLE_ACADEMIC_FALLBACK = {
  course: 'MCA',
  batch: '2025-2027',
  year: '1st Year',
  semester: '2nd Semester',
};

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

function generateSampleStudent(academicPreset) {
  const firstName = pickRandom(SAMPLE_FIRST_NAMES);
  const lastName = pickRandom(SAMPLE_LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;

  // rahul.kumar -> rahul.kumar@gmail.com (matches the generated name)
  const emailSlug = fullName
    .toLowerCase()
    .replace(/[^a-z]+/g, '.')
    .replace(/^\.|\.$/g, '');

  const academic = {
    course: academicPreset?.course || SAMPLE_ACADEMIC_FALLBACK.course,
    batch: academicPreset?.batch || SAMPLE_ACADEMIC_FALLBACK.batch,
    year: academicPreset?.year || SAMPLE_ACADEMIC_FALLBACK.year,
    semester:
      academicPreset?.semester != null
        ? String(academicPreset.semester).includes('Semester')
          ? String(academicPreset.semester)
          : `${academicPreset.semester} Semester`
        : SAMPLE_ACADEMIC_FALLBACK.semester,
  };

  return {
    fullName,
    // Login id / roll number — unique-looking per generation.
    studentNumber: `STU${Math.floor(10000 + Math.random() * 90000)}`,
    email: `${emailSlug}@${pickRandom(SAMPLE_EMAIL_DOMAINS)}`,
    phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
    ...academic,
  };
}

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

  /*
   * ✨ Auto Fill — writes generated sample values into the SAME form
   * state used for manual entry. Nothing becomes readonly or disabled;
   * the admin can edit any field (or clear it) before submitting, and
   * only what is in the form at submit time reaches the backend.
   */
  const handleAutoFill = () => {
    // Prefer the active preset so academic values stay institution-valid.
    const preset =
      configs.find((config) => config.active) || configs[0] || null;

    const sample = generateSampleStudent(preset);

    setForm((prev) => ({
      ...prev,
      ...sample,
    }));

    setAutoFilled({
      course: Boolean(sample.course),
      batch: Boolean(sample.batch),
      year: Boolean(sample.year),
      semester: Boolean(sample.semester),
    });

    toast.info('Sample details filled — every field stays editable.');
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-white/[0.06] pb-3">
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

          {!isEdit && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  icon={Sparkles}
                  onClick={handleAutoFill}
                  title="Fills the form with realistic sample values you can edit"
                >
                  Auto Fill
                </Button>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-400">
                  Step 1
                </span>
              </div>
              <span className="text-right text-[9.5px] font-medium leading-tight text-slate-500">
                Fills editable sample values — change anything before saving
              </span>
            </div>
          )}

          {isEdit && (
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-400">
              Step 1
            </span>
          )}
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
