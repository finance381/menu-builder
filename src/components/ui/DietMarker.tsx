interface DietMarkerProps {
  tags: string[];
  size?: 'sm' | 'md';
}

export function DietMarker({ tags, size = 'md' }: DietMarkerProps) {
  const isNonVeg = tags.includes('non-veg');
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`
        inline-flex items-center justify-center border-2 rounded-sm
        ${sizeClass}
        ${isNonVeg ? 'border-nonveg-red' : 'border-veg-green'}
      `}
      title={isNonVeg ? 'Non-Vegetarian' : 'Vegetarian'}
    >
      <span
        className={`
          block rounded-full
          ${dotSize}
          ${isNonVeg ? 'bg-nonveg-red' : 'bg-veg-green'}
        `}
      />
    </span>
  );
}