export const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby',
  'PHP', 'Swift', 'Kotlin', 'SQL', 'CSS', 'HTML', 'Shell', 'Lua', 'R',
  'Dart', 'Scala', 'Elixir', 'C#', 'Perl', 'Haskell', 'Clojure'
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TASK_STATUSES = ['backlog', 'in_progress', 'in_review', 'done'];
export const PR_STATUSES = ['open', 'merged', 'closed'];
export const REVIEW_STATUSES = ['pending', 'approved', 'changes_requested'];
export const DISCUSSION_CATEGORIES = ['announcement', 'question', 'idea', 'poll', 'general'];

export const priorityColors = {
  Low: 'bg-slate-600 text-slate-200',
  Medium: 'bg-blue-600 text-blue-100',
  High: 'bg-amber-600 text-amber-100',
  Critical: 'bg-red-600 text-red-100',
};

export const statusColors = {
  backlog: 'bg-slate-600',
  in_progress: 'bg-blue-600',
  in_review: 'bg-amber-600',
  done: 'bg-green-600',
  open: 'bg-green-600',
  merged: 'bg-purple-600',
  closed: 'bg-red-600',
  pending: 'bg-slate-600',
  approved: 'bg-green-600',
  changes_requested: 'bg-red-600',
};

export const categoryColors = {
  announcement: 'bg-purple-600',
  question: 'bg-blue-600',
  idea: 'bg-amber-600',
  poll: 'bg-green-600',
  general: 'bg-slate-600',
};

export const labelColors = {
  Bug: 'bg-red-600',
  Feature: 'bg-blue-600',
  Enhancement: 'bg-green-600',
  Docs: 'bg-slate-600',
  Question: 'bg-amber-600',
};

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const sec = Math.floor((now - d) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
