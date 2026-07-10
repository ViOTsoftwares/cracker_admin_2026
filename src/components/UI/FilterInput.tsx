'use client';
import React from 'react';

type FilterInputProps = {
  type?: 'text' | 'number';
  value: string | number;
  placeholder?: string;
  onChange: (value: string) => void;
};

export const FilterInput: React.FC<FilterInputProps> = ({
  type = 'text',
  value,
  placeholder,
  onChange,
}) => {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="
        h-11 w-full rounded-lg border border-gray-300
        bg-white px-4 py-2.5 text-sm text-gray-700
        shadow-sm transition
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
        dark:border-white/10 dark:bg-gray-900
        dark:text-white/90 dark:focus:border-indigo-400
      "
    />
  );
};
