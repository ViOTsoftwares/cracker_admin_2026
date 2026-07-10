'use client';
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import '../../node_modules/react-datepicker/dist/react-datepicker.css';


type FilterDateProps = {
  value?: string;
  onChange: (value: string) => void;
};

export const FilterDate: React.FC<FilterDateProps> = ({
  value,
  onChange,
}) => {
  return (
    <ReactDatePicker
      selected={value ? new Date(value) : null}
      onChange={(date: Date | null) =>
        onChange(date ? date.toISOString().slice(0, 10) : '')
      }
      dateFormat="yyyy-MM-dd"
      className="
        h-11 w-full rounded-lg border border-gray-300
        bg-white px-4 py-2.5 text-sm
        shadow-sm transition
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
        dark:border-white/10 dark:bg-gray-900 dark:text-white/90
      "
    />
  );
};
