import { cn } from '../../utils/constants';

export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-700', className)} />;
}
