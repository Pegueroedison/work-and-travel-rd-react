import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

function makeId(label?: string, id?: string) {
  return id || label?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; helpText?: string; errorText?: string; }
export function Input({ label, helpText, errorText, className = '', id, ...props }: InputProps) {
  const inputId = makeId(label, id);
  return (
    <div className="form-field">
      {label ? <label className="form-label" htmlFor={inputId}>{label}</label> : null}
      <input id={inputId} className={`input ${errorText ? 'input-error' : ''} ${className}`.trim()} aria-invalid={!!errorText} {...props} />
      {helpText && !errorText ? <p className="form-help">{helpText}</p> : null}
      {errorText ? <p className="form-error">{errorText}</p> : null}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; helpText?: string; errorText?: string; }
export function Textarea({ label, helpText, errorText, className = '', id, ...props }: TextareaProps) {
  const inputId = makeId(label, id);
  return (
    <div className="form-field">
      {label ? <label className="form-label" htmlFor={inputId}>{label}</label> : null}
      <textarea id={inputId} className={`input ${errorText ? 'input-error' : ''} ${className}`.trim()} aria-invalid={!!errorText} {...props} />
      {helpText && !errorText ? <p className="form-help">{helpText}</p> : null}
      {errorText ? <p className="form-error">{errorText}</p> : null}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; helpText?: string; errorText?: string; options: { value: string; label: string }[]; }
export function Select({ label, helpText, errorText, options, className = '', id, ...props }: SelectProps) {
  const inputId = makeId(label, id);
  return (
    <div className="form-field">
      {label ? <label className="form-label" htmlFor={inputId}>{label}</label> : null}
      <select id={inputId} className={`input ${errorText ? 'input-error' : ''} ${className}`.trim()} aria-invalid={!!errorText} {...props}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {helpText && !errorText ? <p className="form-help">{helpText}</p> : null}
      {errorText ? <p className="form-error">{errorText}</p> : null}
    </div>
  );
}
