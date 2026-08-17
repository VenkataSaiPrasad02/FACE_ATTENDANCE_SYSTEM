import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

const inputClassName = `w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900
  transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100`;

export default function AttendanceFilter({ initialFilters = {}, onFilter }) {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(() => ({ ...emptyFilters, ...initialFilters }));

  useEffect(() => {
    studentService.getAll(0, 200).then((page) => setStudents(page.content || [])).catch(() => setStudents([]));
  }, []);

  const handleChange = (event) => {
    const updated = { ...filters, [event.target.name]: event.target.value };
    setFilters(updated);
    onFilter(Object.fromEntries(Object.entries(updated).filter(([, value]) => value !== '')));
  };

  const handleClear = () => {
    setFilters(emptyFilters);
    onFilter({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const isActive = activeFilterCount > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FilterField label="Student" icon={UserRound}>
          <select name="studentId" value={filters.studentId} onChange={handleChange} className={inputClassName}>
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentNumber} — {student.fullName}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Exact date" icon={CalendarRange}>
          <input type="date" name="date" value={filters.date} onChange={handleChange} className={inputClassName} />
        </FilterField>

        <FilterField label="Start date">
          <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className={inputClassName} />
        </FilterField>

        <FilterField label="End date">
          <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className={inputClassName} />
        </FilterField>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <FilterField label="Status">
            <select name="status" value={filters.status} onChange={handleChange} className={inputClassName}>
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
            </select>
          </FilterField>
        </div>

        {isActive && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="sm:mb-0.5">
            <Button
              variant="ghost"
              size="md"
              icon={X}
              onClick={handleClear}
              className="border border-gray-200 bg-white hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3"
        >
          <Filter size={14} className="text-blue-600" />
          <span className="text-xs font-medium text-blue-700">
            {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} applied — showing filtered results
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

function FilterField({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
        {Icon && <Icon size={13} className="text-blue-500" />}
        {label}
      </span>
      {children}
    </label>
  );
}
