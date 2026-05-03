import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiTag, FiMessageCircle } from 'react-icons/fi';
import { useTheme, cn } from '../Hooks/useTheme';

/**
 * Improved BlogCard Component
 * - Theme-aware styling (dark/light mode)
 * - Better accessibility and responsive design
 * - Consistent spacing and typography
 * - Optional edit mode button for admins
 */
const BlogCard = ({ 
  data, 
  isAdmin = false, 
  onEdit = null,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  // Utility function to extract text safely
  const getText = (value, max = 120) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string')
      return value.length > max ? value.slice(0, max) + '...' : value;
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value.name && typeof value.name === 'string') return value.name;
      if (value.title && typeof value.title === 'string') return value.title;
      if (value.content) return getText(value.content, max);
      try {
        return JSON.stringify(value).slice(0, max) + '...';
      } catch (e) {
        return '';
      }
    }
    return String(value);
  };

  // Extract data safely
  const categoryLabel = useMemo(
    () => data?.category?.name || getText(data?.category),
    [data?.category]
  );
  const contentPreview = useMemo(
    () => getText(data?.content, 150),
    [data?.content]
  );
  const authorLabel = useMemo(
    () => data?.author || getText(data?.createdBy) || 'Unknown',
    [data?.author, data?.createdBy]
  );
  const commentsCount = useMemo(
    () => Array.isArray(data?.comments) ? data.comments.length : 0,
    [data?.comments]
  );
  const thumbnailSrc = useMemo(
    () => data?.thumbnail?.secure_url || data?.previewImage || null,
    [data?.thumbnail, data?.previewImage]
  );

  const createdDate = useMemo(() => {
    if (!data?.createdAt) return null;
    try {
      return new Date(data.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  }, [data?.createdAt]);

  const handleCardClick = () => {
    navigate('/blog/description', { state: { ...data } });
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={handleCardClick}
      className={cn(
        'rounded-xl overflow-hidden cursor-pointer group h-full flex flex-col',
        'transition-all duration-300',
        colors.bg.card,
        colors.border.light,
        'border shadow-md hover:shadow-2xl',
        colors.shadow.md,
        className
      )}
      role="article"
      tabIndex={0}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 h-48">
        {thumbnailSrc ? (
          <img
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            src={thumbnailSrc}
            alt={getText(data?.title) || 'blog thumbnail'}
            loading="lazy"
          />
        ) : (
          <div className={cn(
            'h-full w-full flex items-center justify-center',
            colors.bg.tertiary
          )}>
            <div className={cn('text-center', colors.text.tertiary)}>
              <div className="text-3xl mb-2">📄</div>
              <span className="text-sm">No image</span>
            </div>
          </div>
        )}

        {/* Category Badge */}
        {categoryLabel && (
          <div className="absolute top-3 right-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/90 text-black text-xs font-semibold backdrop-blur-sm"
            >
              <FiTag size={12} />
              {categoryLabel}
            </motion.div>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className={cn('p-4 flex-1 flex flex-col gap-3', colors.text.primary)}>
        {/* Title */}
        <h2 className={cn(
          'text-lg font-bold line-clamp-2 leading-tight',
          colors.text.accent
        )}>
          {getText(data?.title) || 'Untitled'}
        </h2>

        {/* Description Preview */}
        <p className={cn('text-sm line-clamp-2', colors.text.secondary)}>
          {contentPreview || 'No description available'}
        </p>

        {/* Metadata */}
        <div className="flex-1" />
        <div className={cn('space-y-2 text-xs', colors.text.tertiary)}>
          {/* Author */}
          <div className="flex items-center gap-2">
            <FiUser size={14} />
            <span className="truncate">{authorLabel}</span>
          </div>

          {/* Date */}
          {createdDate && (
            <div className="flex items-center gap-2">
              <FiCalendar size={14} />
              <span>{createdDate}</span>
            </div>
          )}

          {/* Comments count */}
          {commentsCount > 0 && (
            <div className="flex items-center gap-2">
              <FiMessageCircle size={14} />
              <span>{commentsCount} comment{commentsCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className={cn(
        'px-4 py-3 border-t flex items-center justify-between',
        colors.border.light,
        colors.bg.secondary
      )}>
        {isAdmin && onEdit && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(data);
            }}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
          >
            Edit
          </motion.button>
        )}
        <div className={cn('text-xs font-medium', colors.text.secondary)}>
          {data?.readingTime || '5 min'} read
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;
