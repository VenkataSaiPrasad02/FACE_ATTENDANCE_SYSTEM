import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentSearch({ onSearch }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(nextValue), 300);
  };

  const handleClear = () => {
    clearTimeout(timerRef.current);
    setValue('');
    onSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Search size={18} />
      </div>
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">Search students</span>
        <input
          type="search"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by student name or number..."
          className={`w-full rounded-xl border bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 ${
            focused
              ? 'border-blue-500 ring-4 ring-blue-100'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        />
        {value && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            aria-label="Clear student search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={16} />
          </motion.button>
        )}
      </label>
      <p className="text-xs text-gray-500 sm:whitespace-nowrap">Results update as you type</p>
    </motion.div>
  );
}
