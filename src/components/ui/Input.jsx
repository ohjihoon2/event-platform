import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

export const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  fullWidth = true,
  type = 'text',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const widthClass = fullWidth ? 'input-full' : '';
  const errorClass = error ? 'input-error' : '';

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-wrapper ${widthClass} ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <input 
          ref={ref}
          type={inputType}
          className={`input-field ${errorClass}`}
          style={isPassword ? { paddingRight: '2.5rem' } : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
              padding: 0
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
