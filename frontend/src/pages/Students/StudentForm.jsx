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
} from 'lucide-react';
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
};

export default function StudentForm({ onSubmit, initialData, onCancel, loading = false }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData);

  useEffect(() => {
    setForm(
      initialData
        ? {
            studentNumber: initialData.studentNumber || '',
            fullName: initialData.fullName || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            course: initialData.course || '',
            year: initialData.year || '',
            batch: initialData.batch || '',
            semester: initialData.semester || '',
          }
        : emptyForm
    );
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 animate-fade-in">
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
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <User size={16} />
              </div>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Roll Number (Create only) */}
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Roll Number / Student ID <span className="text-rose-400">*</span>
              </label>
              <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
                <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                  <Hash size={16} />
                </div>
                <input
                  name="studentNumber"
                  value={form.studentNumber}
                  onChange={handleChange}
                  placeholder="e.g. 122563060"
                  required
                  className="h-full w-full bg-transparent px-3 font-mono text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
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
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <BookOpen size={16} />
              </div>
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="e.g. MCA, MBA, BCA"
                required
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Batch */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Batch Interval <span className="text-rose-400">*</span>
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <CalendarRange size={16} />
              </div>
              <input
                name="batch"
                value={form.batch}
                onChange={handleChange}
                placeholder="e.g. 2025-2027"
                required
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Current Semester <span className="text-rose-400">*</span>
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Layers size={16} />
              </div>
              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="e.g. 2nd Semester"
                required
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Academic Year <span className="text-rose-400">*</span>
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Calendar size={16} />
              </div>
              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="e.g. 1st Year"
                required
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
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
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@institution.edu"
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Mobile Phone
            </label>
            <div className="group flex h-10 w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a1026]/80 transition-all duration-150 focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <div className="flex h-full w-10 shrink-0 items-center justify-center border-r border-white/[0.06] bg-white/[0.03] text-slate-500 transition-colors group-focus-within:text-cyan-300">
                <Phone size={16} />
              </div>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="h-full w-full bg-transparent px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-600 sm:text-sm"
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
          className="w-full font-bold sm:w-auto"
        >
          {isEdit ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
}
