import { forwardRef } from 'react';
import type { ProposalFull } from '@/lib/types';

interface PrintableMenuProps {
  proposal: ProposalFull;
}

export const PrintableMenu = forwardRef<HTMLDivElement, PrintableMenuProps>(
  ({ proposal }, ref) => {
    // Group items by category, sorted by display order
    const grouped = proposal.items.reduce(
      (acc, item) => {
        const key = item.category_name_snapshot;
        if (!acc[key]) {
          acc[key] = { order: item.category_display_order, items: [] };
        }
        acc[key].items.push(item);
        return acc;
      },
      {} as Record<string, { order: number; items: typeof proposal.items }>
    );

    const sortedCategories = Object.entries(grouped).sort(
      ([, a], [, b]) => a.order - b.order
    );

    const eventDate = proposal.event_date
      ? new Date(proposal.event_date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

    return (
      <div id="print-area" ref={ref}>
        <div className="max-w-2xl mx-auto py-12 px-8 font-display">
          {/* Header ornament */}
          <div className="text-center mb-2">
            <span className="text-gold text-2xl">✦</span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold text-charcoal tracking-wide">
              Menu
            </h1>
            <div className="w-16 h-px bg-gold mx-auto mt-3 mb-4" />

            {/* Event info */}
            <div className="space-y-1 text-sm text-slate">
              {proposal.guest_name && (
                <p className="font-medium text-charcoal">{proposal.guest_name}</p>
              )}
              {proposal.event_type && <p>{proposal.event_type}</p>}
              {eventDate && <p>{eventDate}</p>}
              {proposal.venue?.name && (
                <p className="text-muted">{proposal.venue.name}</p>
              )}
              {proposal.expected_pax && (
                <p className="text-muted">{proposal.expected_pax} guests</p>
              )}
            </div>
          </div>

          {/* Menu sections */}
          <div className="space-y-8">
            {sortedCategories.map(([categoryName, { items }]) => (
              <div key={categoryName} className="text-center">
                {/* Category heading */}
                <h2 className="font-display text-lg font-semibold text-accent uppercase tracking-widest mb-3">
                  {categoryName}
                </h2>
                <div className="w-8 h-px bg-gold/50 mx-auto mb-4" />

                {/* Dishes */}
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-center gap-2">
                      {/* Veg/Non-veg marker */}
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-sm border ${
                          item.tags_snapshot.includes('non-veg')
                            ? 'border-nonveg-red bg-nonveg-red/20'
                            : 'border-veg-green bg-veg-green/20'
                        }`}
                      />
                      <span className="font-display text-sm text-charcoal">
                        {item.item_name_snapshot}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {proposal.notes && (
            <div className="mt-10 pt-6 border-t border-charcoal/10 text-center">
              <p className="text-xs text-muted italic">{proposal.notes}</p>
            </div>
          )}

          {/* Footer ornament */}
          <div className="text-center mt-10">
            <div className="w-16 h-px bg-gold mx-auto mb-3" />
            <span className="text-gold text-lg">✦</span>
          </div>
        </div>
      </div>
    );
  }
);

PrintableMenu.displayName = 'PrintableMenu';