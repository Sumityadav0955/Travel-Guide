// TextArea component for multi-line text input
import React from 'react';

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
  id?: string;
  name?: string;
  rows?: number;
  maxLength?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  label,
  error,
  id,
  name,
  rows = 4,
  maxLength
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`form-textarea ${error ? 'error' : ''}`}
      />
      {maxLength && value && (
        <div className="character-count">
          {value.length}/{maxLength}
        </div>
      )}
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default TextArea;