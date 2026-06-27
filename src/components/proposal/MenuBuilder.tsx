import { useState, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useProposalBuilderStore } from '@/stores/proposalStore';
import { DietMarker } from '@/components/ui/DietMarker';
import { TagBadge } from '@/components/ui/TagBadge';
import type { MenuCategory } from '@/lib/types';

export function MenuBuilder() {
  const { categories, items, loading } = useMenu();
  const { toggleItem, isSelected, getSelectedByCategory, totalCount } = useProposalBuilderStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Default to first category
  const currentCategoryId = activeCategory || categories[0]?.id || null;

  // Filter items for current category + search
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (currentCategoryId) {
      filtered = filtered.filter((i) => i.category_id === currentCategoryId);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.cuisine?.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [items, currentCategoryId, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-charcoal/15 bg-white
            text-charcoal placeholder:text-muted text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const count = getSelectedByCategory(cat.id).length;
            return (
              <CategoryTab
                key={cat.id}
                category={cat}
                isActive={cat.id === currentCategoryId}
                selectedCount={count}
                onClick={() => setActiveCategory(cat.id)}
              />
            );
          })}
        </div>
      )}

      {/* Dish grid */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-3">
        {filteredItems.map((item) => {
          const selected = isSelected(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item)}
              className={`
                group relative text-left rounded-xl border-2 p-4 transition-all duration-150
                ${selected
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-transparent bg-white hover:border-charcoal/10 hover:shadow-sm'
                }
              `}
            >
              {/* Selection indicator */}
              {selected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Image */}
              {item.image_url ? (
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-ivory">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-32 rounded-lg mb-3 bg-ivory flex items-center justify-center">
                  <span className="text-3xl opacity-30">🍽</span>
                </div>
              )}

              {/* Info */}
              <div className="flex items-start gap-2">
                <DietMarker tags={item.tags} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-charcoal truncate">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.cuisine && (
                      <span className="text-xs text-muted">{item.cuisine}</span>
                    )}
                    {item.tags
                      .filter((t) => t !== 'veg' && t !== 'non-veg')
                      .map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted text-sm">
          No dishes found{search ? ` matching "${search}"` : ' in this category'}.
        </div>
      )}

      {/* Sticky selection bar */}
      {totalCount() > 0 && (
        <div className="sticky bottom-4 mx-auto max-w-md">
          <div className="bg-charcoal text-white rounded-2xl shadow-lg px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              {totalCount()} {totalCount() === 1 ? 'dish' : 'dishes'} selected
            </span>
            <span className="text-xs text-white/60">
              Across {countCategories()} {countCategories() === 1 ? 'course' : 'courses'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Internal helper — count how many distinct categories have selections
function countCategories(): number {
  const items = useProposalBuilderStore.getState().getSelectedArray();
  const cats = new Set(items.map((i) => i.category_id));
  return cats.size;
}

// Category tab component
function CategoryTab({
  category,
  isActive,
  selectedCount,
  onClick,
}: {
  category: MenuCategory;
  isActive: boolean;
  selectedCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
        transition-colors duration-150 whitespace-nowrap
        ${isActive
          ? 'bg-charcoal text-white'
          : 'bg-white text-slate hover:bg-charcoal/5 border border-charcoal/10'
        }
      `}
    >
      {category.name}
      {selectedCount > 0 && (
        <span
          className={`
            inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold
            ${isActive ? 'bg-white text-charcoal' : 'bg-accent text-white'}
          `}
        >
          {selectedCount}
        </span>
      )}
    </button>
  );
}