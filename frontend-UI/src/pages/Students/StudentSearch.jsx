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
    <div className="flex w-full animate-fade-in flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-300">
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
          className={`w-full rounded-xl border bg-[#0a1026]/80 py-2.5 pl-4 pr-10 text-xs font-medium text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 sm:text-sm ${
            focused
              ? 'border-cyan-300/60 ring-4 ring-cyan-400/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear student search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-slate-200 focus:outline-none"
          >
            <X size={15} />
          </button>
        )}
      </label>

      <p className="text-[11px] font-medium text-slate-500 sm:whitespace-nowrap">
        Live search with auto-debounce
      </p>
    </div>
  );
}
