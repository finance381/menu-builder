import { TAG_LABELS, TAG_COLORS } from '@/lib/constants';

interface TagBadgeProps {
  tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  const label = TAG_LABELS[tag] || tag;
  const colors = TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${colors}`}>
      {label}
    </span>
  );
}