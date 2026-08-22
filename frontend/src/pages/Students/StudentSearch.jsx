import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

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
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center animate-fade-in">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Search size={18} strokeWidth={2.2} />
      </div>

      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">Search student roster</span>
        <input
          type="search"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by student name, roll number, or email..."
          className={`w-full rounded-xl border bg-white py-2.5 pl-4 pr-10 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 ${
            focused
              ? 'border-indigo-500 ring-4 ring-indigo-500/10'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear student search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
          >
            <X size={15} />
          </button>
        )}
      </label>

      <p className="text-[11px] font-medium text-slate-400 sm:whitespace-nowrap">
        Live search with auto-debounce
      </p>
    </div>
  );
}
