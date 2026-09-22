import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  rightIcon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg border border-surface-300 bg-white
            px-3.5 py-2.5 text-sm text-surface-900
            placeholder:text-surface-400
            hover:border-surface-400
            focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none
            disabled:bg-surface-50 disabled:text-surface-500 disabled:cursor-not-allowed
            transition-colors duration-200
            ${icon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-surface-500">{helperText}</p>}
    </div>
  );
}

// ===== Textarea =====
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full rounded-lg border border-surface-300 bg-white
          px-3.5 py-2.5 text-sm text-surface-900
          placeholder:text-surface-400
          hover:border-surface-400
          focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none
          disabled:bg-surface-50 disabled:cursor-not-allowed
          transition-colors duration-200 min-h-[100px] resize-y
          ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}

// ===== Select =====
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, id, className = '', ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`
          w-full rounded-lg border border-surface-300 bg-white
          px-3.5 py-2.5 text-sm text-surface-900
          hover:border-surface-400
          focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none
          disabled:bg-surface-50 disabled:cursor-not-allowed
          transition-colors duration-200 appearance-none cursor-pointer
          ${error ? 'border-danger-500' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}
