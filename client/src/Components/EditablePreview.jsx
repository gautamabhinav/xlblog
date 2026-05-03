import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiEye, FiX, FiCheck } from 'react-icons/fi';
import { useTheme, cn } from '../Hooks/useTheme';

/**
 * EditablePreview Component
 * Provides inline editing with live preview toggle
 * 
 * @param {Object} props
 * @param {Array} props.fields - Array of editable fields: { key, label, type, value }
 * @param {Function} props.onSave - Callback when changes are saved
 * @param {Boolean} props.isAdmin - Whether user is admin (controls edit permissions)
 * @param {String} props.title - Section title
 */
export const EditablePreview = ({ 
  fields = [], 
  onSave = () => {}, 
  isAdmin = false, 
  title = 'Content' 
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: field.value }), {})
  );
  const { colors } = useTheme();

  const handleFieldChange = useCallback((key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(editedData);
    setIsEditMode(false);
  }, [editedData, onSave]);

  const handleCancel = useCallback(() => {
    setEditedData(fields.reduce((acc, field) => ({ ...acc, [field.key]: field.value }), {}));
    setIsEditMode(false);
  }, [fields]);

  if (!isAdmin && isEditMode) {
    setIsEditMode(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border p-4 md:p-6',
        colors.border.light,
        colors.bg.card,
        colors.text.primary
      )}
    >
      {/* Header with title and toggle button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn('text-lg md:text-xl font-semibold', colors.text.accent)}>
          {title}
        </h3>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              'p-2 rounded-lg transition-colors flex items-center gap-2',
              isEditMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-yellow-400'
            )}
            title={isEditMode ? 'Cancel edit' : 'Edit content'}
          >
            {isEditMode ? (
              <>
                <FiX size={18} />
                <span className="hidden sm:inline text-sm">Cancel</span>
              </>
            ) : (
              <>
                <FiEdit2 size={18} />
                <span className="hidden sm:inline text-sm">Edit</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditMode ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-2">
                <label className={cn('text-sm font-medium', colors.text.secondary)}>
                  {field.label}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={editedData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    rows={field.rows || 4}
                    maxLength={field.maxLength}
                    className={cn(
                      'p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none',
                      colors.bg.input,
                      colors.text.primary,
                      'border border-zinc-600 dark:border-zinc-600'
                    )}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={editedData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    min={field.min}
                    max={field.max}
                    className={cn(
                      'p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400',
                      colors.bg.input,
                      colors.text.primary,
                      'border border-zinc-600 dark:border-zinc-600'
                    )}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={editedData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    maxLength={field.maxLength}
                    className={cn(
                      'p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400',
                      colors.bg.input,
                      colors.text.primary,
                      'border border-zinc-600 dark:border-zinc-600'
                    )}
                    placeholder={field.placeholder}
                  />
                )}
                
                {field.maxLength && (
                  <div className={cn('text-xs', colors.text.tertiary)}>
                    {(editedData[field.key] || '').length} / {field.maxLength}
                  </div>
                )}
              </div>
            ))}

            {/* Save/Cancel buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-600">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                <FiCheck size={18} />
                <span>Save Changes</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition-colors',
                  colors.bg.secondary,
                  colors.text.primary,
                  'hover:opacity-80'
                )}
              >
                <FiX size={18} />
                <span>Cancel</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <div className={cn('text-xs font-semibold uppercase tracking-wide', colors.text.tertiary)}>
                  {field.label}
                </div>
                <div className={cn(
                  'p-3 rounded-md break-words',
                  colors.bg.secondary,
                  colors.text.primary
                )}>
                  {field.type === 'textarea' ? (
                    <p className="whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {editedData[field.key] || '—'}
                    </p>
                  ) : (
                    editedData[field.key] || '—'
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EditablePreview;
