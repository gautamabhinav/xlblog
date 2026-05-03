import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useTheme, cn } from '../Hooks/useTheme';

/**
 * FormInput Component
 * - Theme-aware with dark/light mode support
 * - Multiple input types (text, email, password, number, textarea)
 * - Built-in validation
 * - Error and success states
 * - Animated transitions
 * - Character counter
 * - Loading state
 * 
 * @param {Object} props
 * @param {String} props.label - Input label
 * @param {String} props.type - Input type (text, email, password, number, textarea)
 * @param {String} props.value - Input value
 * @param {Function} props.onChange - Change callback
 * @param {String} props.placeholder - Placeholder text
 * @param {String} props.error - Error message
 * @param {String} props.success - Success message
 * @param {Boolean} props.loading - Loading state
 * @param {Number} props.maxLength - Max character length
 * @param {Number} props.rows - Rows for textarea
 * @param {String} props.pattern - Regex pattern for validation
 * @param {Boolean} props.required - Required field
 * @param {Function} props.validate - Custom validation function
 */
export const FormInput = ({
  label,
  type = 'text',
  value = '',
  onChange,
  placeholder = '',
  error = '',
  success = '',
  loading = false,
  maxLength = null,
  rows = 4,
  pattern = null,
  required = false,
  validate = null,
  disabled = false,
  icon: Icon = null,
  onBlur = null,
  className = '',
}) => {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;

    // Client-side validation
    if (validate && newValue.trim()) {
      const validationResult = validate(newValue);
      setValidationError(validationResult || '');
    } else {
      setValidationError('');
    }

    onChange?.(e);
  };

  const handleBlur = (e) => {
    setTouched(true);
    onBlur?.(e);
  };

  const finalError = error || validationError;
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const charCount = value?.length || 0;
  const isValid = !finalError && touched && value.trim();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className={cn('text-sm font-semibold', colors.text.primary)}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Icon on left */}
        {Icon && (
          <div className={cn('absolute left-3 top-3 pointer-events-none', colors.text.secondary)}>
            <Icon size={18} />
          </div>
        )}

        {/* Input / Textarea */}
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            disabled={disabled}
            className={cn(
              'w-full p-3 rounded-lg font-medium resize-none focus:outline-none focus:ring-2 transition-all duration-200',
              Icon ? 'pl-10' : '',
              colors.bg.input,
              colors.text.primary,
              'border',
              finalError
                ? 'border-red-500 focus:ring-red-400'
                : isValid
                ? 'border-green-500 focus:ring-green-400'
                : 'border-zinc-600 focus:ring-yellow-400',
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-70',
              loading ? 'opacity-60 cursor-wait' : ''
            )}
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            pattern={pattern}
            required={required}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 transition-all duration-200',
              Icon ? 'pl-10' : '',
              colors.bg.input,
              colors.text.primary,
              'border',
              finalError
                ? 'border-red-500 focus:ring-red-400'
                : isValid
                ? 'border-green-500 focus:ring-green-400'
                : 'border-zinc-600 focus:ring-yellow-400',
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-70',
              loading ? 'opacity-60 cursor-wait' : ''
            )}
          />
        )}

        {/* Password visibility toggle */}
        {type === 'password' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn('absolute right-3 top-3 cursor-pointer', colors.text.secondary)}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </motion.button>
        )}

        {/* Status icons */}
        {touched && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'absolute right-3 top-3',
              type === 'password' && !showPassword ? 'right-10' : ''
            )}
          >
            {finalError ? (
              <FiAlertCircle size={18} className="text-red-500" />
            ) : isValid ? (
              <FiCheckCircle size={18} className="text-green-500" />
            ) : null}
          </motion.div>
        )}

        {/* Loading spinner */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={cn(
              'absolute right-3 top-3',
              type === 'password' && !showPassword ? 'right-10' : ''
            )}
          >
            <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
          </motion.div>
        )}
      </div>

      {/* Character counter */}
      {maxLength && (
        <div className={cn('text-xs text-right', charCount > maxLength * 0.8 ? 'text-yellow-400' : colors.text.tertiary)}>
          {charCount} / {maxLength}
        </div>
      )}

      {/* Error message */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: finalError ? 1 : 0, y: finalError ? 0 : -5 }}
        transition={{ duration: 0.2 }}
        className="h-5"
      >
        {finalError && <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <FiAlertCircle size={14} />
          {finalError}
        </p>}
      </motion.div>

      {/* Success message */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: success ? 1 : 0, y: success ? 0 : -5 }}
        transition={{ duration: 0.2 }}
        className="h-5"
      >
        {success && (
          <p className="text-xs text-green-500 font-medium flex items-center gap-1">
            <FiCheckCircle size={14} />
            {success}
          </p>
        )}
      </motion.div>

      {/* Helper text */}
      {!finalError && !success && (
        <p className={cn('text-xs', colors.text.tertiary)}>
          {type === 'email' && 'Enter a valid email address'}
          {type === 'password' && 'Minimum 8 characters'}
        </p>
      )}
    </div>
  );
};

/**
 * FormGroup Component
 * - Groups multiple form inputs
 * - Theme-aware
 * - Handles form layout
 */
export const FormGroup = ({
  title,
  description,
  children,
  columns = 1,
  className = '',
}) => {
  const { colors } = useTheme();

  return (
    <div className={cn('p-4 md:p-6 rounded-lg border', colors.bg.card, colors.border.light, className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className={cn('text-lg font-semibold mb-2', colors.text.accent)}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn('text-sm', colors.text.secondary)}>
              {description}
            </p>
          )}
        </div>
      )}

      <div className={cn(
        'grid gap-4 md:gap-6',
        `grid-cols-1 ${columns > 1 ? `md:grid-cols-${Math.min(columns, 3)}` : ''}`
      )}>
        {children}
      </div>
    </div>
  );
};

export default FormInput;
