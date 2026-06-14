import { cn } from '../../utils/constants';

export default function Separator({ className }) {
  return <div className={cn('h-px bg-border', className)} />;
}
