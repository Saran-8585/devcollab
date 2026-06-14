import { cn } from '../../utils/constants';

export default function Select({ className, children, options, value, onChange, placeholder, ...props }) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      value={value}
      onChange={onChange}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {(options || []).map(opt => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}
