import { useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Custom hook to get theme-aware class names
 * Ensures consistent dark/light mode styling across the app
 */
export const useTheme = () => {
  // Note: Theme is managed in Layout.jsx via document.documentElement
  const isDarkMode = () => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  };

  // Theme-aware color palettes
  const colors = {
    bg: {
      primary: isDarkMode() ? 'bg-zinc-900' : 'bg-white',
      secondary: isDarkMode() ? 'bg-zinc-800' : 'bg-gray-100',
      tertiary: isDarkMode() ? 'bg-zinc-700' : 'bg-gray-200',
      card: isDarkMode() ? 'bg-zinc-800/60 dark:bg-zinc-800/60' : 'bg-white/90 dark:bg-zinc-800/60',
      hover: isDarkMode() ? 'hover:bg-zinc-700' : 'hover:bg-gray-100',
      input: isDarkMode() ? 'bg-zinc-800 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-800',
    },
    text: {
      primary: isDarkMode() ? 'text-white dark:text-white' : 'text-gray-900 dark:text-white',
      secondary: isDarkMode() ? 'text-gray-300 dark:text-gray-300' : 'text-gray-600 dark:text-gray-300',
      tertiary: isDarkMode() ? 'text-gray-400 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400',
      accent: 'text-yellow-400 dark:text-yellow-400',
    },
    border: {
      light: isDarkMode() ? 'border-zinc-700 dark:border-zinc-700' : 'border-gray-200 dark:border-zinc-700',
      medium: isDarkMode() ? 'border-zinc-600 dark:border-zinc-600' : 'border-gray-300 dark:border-zinc-600',
    },
    shadow: {
      sm: isDarkMode() ? 'shadow-md' : 'shadow-sm',
      md: isDarkMode() ? 'shadow-lg' : 'shadow-md',
      lg: isDarkMode() ? 'shadow-2xl' : 'shadow-lg',
    },
  };

  return {
    isDarkMode: isDarkMode(),
    colors,
  };
};

// Utility function to merge theme-aware classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
