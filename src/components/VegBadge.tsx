export function VegBadge({ isVeg, size = 'md' }: { isVeg: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const containerSizes = {
    sm: 'w-3.5 h-3.5 border',
    md: 'w-4 h-4 border-2',
    lg: 'w-5 h-5 border-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  if (isVeg) {
    return (
      <span
        title="Vegetarian"
        className={`inline-flex items-center justify-center rounded-xs border-emerald-600 bg-emerald-50 ${containerSizes[size]}`}
      >
        <span className={`rounded-full bg-emerald-600 ${dotSizes[size]}`} />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className={`inline-flex items-center justify-center rounded-xs border-rose-700 bg-rose-50 ${containerSizes[size]}`}
    >
      <span className={`rounded-full bg-rose-700 ${dotSizes[size]}`} />
    </span>
  );
}
