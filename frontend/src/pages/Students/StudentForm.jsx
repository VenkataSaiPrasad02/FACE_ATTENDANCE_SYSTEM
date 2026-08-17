import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

export default function StudentForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState(emptyForm);

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
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Roll Number */}
        {!initialData && (
          <Field label="Roll Number" required>
            <input
              className={inputClassName}
              name="studentNumber"
              value={form.studentNumber}
              onChange={handleChange}
              placeholder="e.g. 122563060"
              required
            />
          </Field>
        )}

        {/* Student Name */}
        <Field
          label="Student Name"
          required
          className={initialData ? 'sm:col-span-2' : ''}
        >
          <input
            className={inputClassName}
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full name of student"
            required
          />
        </Field>

        {/* Gmail */}
        <Field label="Gmail">
          <input
            className={inputClassName}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
          />
        </Field>

        {/* Phone */}
        <Field label="Phone">
          <input
            className={inputClassName}
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Optional"
          />
        </Field>

        {/* Course */}
        <Field label="Course" required>
          <input
            className={inputClassName}
            name="course"
            value={form.course}
            onChange={handleChange}
            placeholder="e.g. MCA"
            required
          />
        </Field>

        {/* Batch */}
        <Field label="Batch" required>
          <input
            className={inputClassName}
            name="batch"
            value={form.batch}
            onChange={handleChange}
            placeholder="e.g. 2025-2027"
            required
          />
        </Field>

        {/* Semester */}
        <Field label="Semester" required>
          <input
            className={inputClassName}
            name="semester"
            value={form.semester}
            onChange={handleChange}
            placeholder="e.g. 2"
            required
          />
        </Field>

        {/* Year */}
        <Field label="Year" required>
          <input
            className={inputClassName}
            name="year"
            value={form.year}
            onChange={handleChange}
            placeholder="e.g. 1st Year"
            required
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            variant="secondary"
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl sm:w-auto"
          >
            Cancel
          </Button>
        )}

        <Button
          variant="primary"
          type="submit"
          className="w-full rounded-xl px-5 shadow-lg shadow-blue-500/20 sm:w-auto"
        >
          {initialData ? 'Save changes' : 'Create student'}
        </Button>
      </div>
    </motion.form>
  );
}

function Field({ label, required, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}