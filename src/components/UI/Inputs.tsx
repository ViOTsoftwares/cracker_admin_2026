import React from "react";
import { getImageUrl } from "@/lib/imageHelper";

export const InputField = ({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
  name?: string;
  type?: string;
  value?: string;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>

    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${error ? "border-red-500" : "border-gray-300"}
        ${props.disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
      `}
    />

    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const TextareaField = ({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
  name?: string;
  value?: string;
  rows?: number;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>

    <textarea
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${error ? "border-red-500" : "border-gray-300"}
        ${props.disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
      `}
    />

    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const FileField = ({
  label,
  error,
  preview,
  onChange,
}: {
  label: string;
  error?: string;
  preview?: string | null;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>

    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="block w-full text-sm
        file:mr-4 file:rounded-md file:border-0
        file:bg-blue-600 file:px-4 file:py-2
        file:text-white hover:file:bg-blue-700"
    />
    {preview && (
      <div className="flex items-center gap-4">
        <img
          src={getImageUrl(preview)}
          alt="Logo preview"
          className="h-16 w-16 rounded-lg border object-contain bg-gray-50"
        />
        <span className="text-xs text-gray-500">Preview</span>
      </div>
    )}

    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);



interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
}

export const SelectField = ({
  label,
  options,
  error,
  disabled = false,
  ...props
}: SelectFieldProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        {...props}
        disabled={disabled}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
        `}
      >
        <option value="">Select {label}</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
