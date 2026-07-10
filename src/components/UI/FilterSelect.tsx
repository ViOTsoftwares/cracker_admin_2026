'use client';
import React from 'react';

type FilterSelectProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  options,
  onChange,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        h-11 w-full rounded-lg border border-gray-300
        bg-white px-4 py-2.5 text-sm
        shadow-sm transition
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
        dark:border-white/10 dark:bg-gray-900 dark:text-white/90
      "
    >
      <option value="">All</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};
