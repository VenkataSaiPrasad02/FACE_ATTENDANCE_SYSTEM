import React, { useEffect, useState } from 'react';
import { CalendarRange, Filter, UserRound, X } from 'lucide-react';
import studentService from '../../services/studentService';
import Button from '../../components/ui/Button';

const emptyFilters = {
  studentId: '',
  date: '',
  startDate: '',
  endDate: '',
  status: '',
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#0a1026]/80 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-100 outline-none transition-all [color-scheme:dark] placeholder:text-slate-600 hover:border-white/20 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10 [&>option]:bg-[#0a1026] [&>option]:text-slate-200';

export default function AttendanceFilter({ initialFilters = {}, onFilter }) {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    ...initialFilters,
  }));

  useEffect(() => {
    studentService
      .getAll(0, 200)
      .then((page) => setStudents(page.content || []))
      .catch(() => setStudents([]));
  }, []);

  const handleChange = (event) => {
    const updated = { ...filters, [event.target.name]: event.target.value };
    setFilters(updated);
    onFilter(
      Object.fromEntries(
        Object.entries(updated).filter(([, value]) => value !== '')
      )
    );
  };

  const handleClear = () => {
    setFilters(emptyFilters);
    onFilter({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const isActive = activeFilterCount > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Student Filter */}
        <FilterField label="Student" icon={UserRound}>
          <select
            name="studentId"
            value={filters.studentId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentNumber} — {student.fullName}
              </option>
            ))}
          </select>
        </FilterField>

        {/* Exact Date */}
        <FilterField label="Exact Date" icon={CalendarRange}>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className={inputClass}
          />
        </FilterField>

        {/* Start Date */}
        <FilterField label="From Date">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className={inputClass}
          />
        </FilterField>

        {/* End Date */}
        <FilterField label="To Date">
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className={inputClass}
          />
        </FilterField>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-3.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <FilterField label="Attendance Status">
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
            </select>
          </FilterField>
        </div>

        {isActive && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              icon={X}
              onClick={handleClear}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3.5 py-2.5 text-xs text-cyan-300 shadow-glow-sm animate-fade-in">
          <Filter size={14} className="text-cyan-300" />
          <span className="font-semibold">
            {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'} applied
          </span>
        </div>
      )}
    </div>
  );
}

function FilterField({ label, icon: Icon, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {Icon && <Icon size={13} className="text-cyan-300/80" />}
        {label}
      </span>
      {children}
    </label>
  );
}
