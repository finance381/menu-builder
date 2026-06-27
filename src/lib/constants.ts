export const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Reception',
  'Birthday',
  'Anniversary',
  'Corporate Event',
  'Conference',
  'Product Launch',
  'Kitty Party',
  'Baby Shower',
  'Retirement',
  'Other',
] as const;

export const CUISINES = [
  'North Indian',
  'South Indian',
  'Mughlai',
  'Chinese',
  'Continental',
  'Italian',
  'Mexican',
  'Thai',
  'Japanese',
  'Lebanese',
  'Fusion',
  'Street Food',
  'Mithai / Sweets',
] as const;

export const DIET_TAGS = [
  'veg',
  'non-veg',
  'vegan',
  'jain',
  'egg-free',
  'gluten-free',
  'nut-free',
] as const;

export const TAG_LABELS: Record<string, string> = {
  veg: 'Veg',
  'non-veg': 'Non-Veg',
  vegan: 'Vegan',
  jain: 'Jain',
  'egg-free': 'Egg Free',
  'gluten-free': 'Gluten Free',
  'nut-free': 'Nut Free',
};

export const TAG_COLORS: Record<string, string> = {
  veg: 'bg-veg-green/10 text-veg-green border-veg-green/30',
  'non-veg': 'bg-nonveg-red/10 text-nonveg-red border-nonveg-red/30',
  vegan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  jain: 'bg-amber-50 text-amber-700 border-amber-200',
  'egg-free': 'bg-sky-50 text-sky-700 border-sky-200',
  'gluten-free': 'bg-purple-50 text-purple-700 border-purple-200',
  'nut-free': 'bg-orange-50 text-orange-700 border-orange-200',
};