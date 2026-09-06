// Utility functions index

// Merge Tailwind class names conditionally
export { clsx as cn } from 'clsx';

// Format date to readable form
export const formatDate = (date, options = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(date).toLocaleDateString('en-US', options);

// Convert seconds to MM:SS format
export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Truncate string to max length
export const truncate = (str, max = 100) =>
  str?.length > max ? `${str.slice(0, max)}...` : str;

// Get color class based on score
export const getScoreColor = (score) => {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
};
