import { cn } from '../../utils/constants';

export default function Avatar({ name, className, size = 'md' }) {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-lg', xl: 'w-16 h-16 text-2xl' };
  const colors = [
    'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-amber-600',
    'bg-pink-600', 'bg-teal-600', 'bg-indigo-600', 'bg-rose-600',
  ];
  const colorIndex = (name || '?').charCodeAt(0) % colors.length;
  return (
    <div className={cn('flex items-center justify-center rounded-full font-bold text-white', sizeMap[size], colors[colorIndex], className)}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}
