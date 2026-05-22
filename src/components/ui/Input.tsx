import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: boolean;
  variant?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  variant = 'input',
  options,
  className = '',
  id,
  ...props
}) => {
  const baseStyles = 'w-full bg-background-secondary border transition-all duration-200 outline-none px-4 py-3 text-sm rounded-lg text-text-primary placeholder:text-text-muted/50';

  const stateStyles = error
    ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/20'
    : success
    ? 'border-success/50 focus:border-success focus:ring-1 focus:ring-success/20'
    : 'border-purple-primary/20 focus:border-purple-primary focus:ring-1 focus:ring-purple-primary/20 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]';

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const renderInput = () => {
    switch (variant) {
      case 'textarea':
        return (
          <textarea
            id={inputId}
            className={`${baseStyles} ${stateStyles} min-h-[120px] resize-none ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      case 'select':
        return (
          <div className="relative">
            <select
              id={inputId}
              className={`${baseStyles} ${stateStyles} appearance-none ${className}`}
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <input
            id={inputId}
            className={`${baseStyles} ${stateStyles} h-12 ${className}`}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        );
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-[11px] text-danger font-medium ml-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
