import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useVenues } from '@/hooks/useVenues';
import { EVENT_TYPES } from '@/lib/constants';
import type { ProposalFormData } from '@/lib/types';
import { useEventTypes } from '@/hooks/useEventTypes';

interface ProposalFormProps {
  initialData?: Partial<ProposalFormData>;
  onSubmit: (data: ProposalFormData) => void;
  loading?: boolean;
}

export function ProposalForm({ initialData, onSubmit, loading }: ProposalFormProps) {
  const { venues } = useVenues();
  const { eventTypes } = useEventTypes();
  const [form, setForm] = useState<ProposalFormData>({
    guest_name: initialData?.guest_name || '',
    guest_phone: initialData?.guest_phone || '',
    guest_email: initialData?.guest_email || '',
    venue_id: initialData?.venue_id || '',
    event_type: initialData?.event_type || '',
    event_date: initialData?.event_date || '',
    expected_pax: initialData?.expected_pax || '',
    notes: initialData?.notes || '',
  });

  const update = (field: keyof ProposalFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guest details */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3 uppercase tracking-wide">
          Guest Details
        </h3>
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
          <Input
            label="Guest Name"
            value={form.guest_name}
            onChange={(e) => update('guest_name', e.target.value)}
            placeholder="Full name"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.guest_phone}
            onChange={(e) => update('guest_phone', e.target.value)}
            placeholder="+91 98765 43210"
          />
          <Input
            label="Email"
            type="email"
            value={form.guest_email}
            onChange={(e) => update('guest_email', e.target.value)}
            placeholder="guest@email.com"
            className="tablet:col-span-2"
          />
        </div>
      </div>

      {/* Event details */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3 uppercase tracking-wide">
          Event Details
        </h3>
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
          <Select
            label="Venue"
            value={form.venue_id}
            onChange={(e) => update('venue_id', e.target.value)}
            placeholder="Select a venue"
            options={venues.map((v) => ({ value: v.id, label: v.name }))}
            required
          />
          <Select
            label="Event Type"
            value={form.event_type}
            onChange={(e) => update('event_type', e.target.value)}
            placeholder="Select event type"
            options={eventTypes.map((t) => ({ value: t.name, label: t.name }))}
          />
          <Input
            label="Event Date"
            type="date"
            value={form.event_date}
            onChange={(e) => update('event_date', e.target.value)}
          />
          <Input
            label="Expected Guests"
            type="number"
            value={form.expected_pax}
            onChange={(e) => update('expected_pax', e.target.value)}
            placeholder="Number of guests"
            min={1}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate mb-1">
          Special Requests / Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          placeholder="Any special dietary requirements, preferences, or notes..."
          className="w-full rounded-lg border border-charcoal/15 bg-white px-3.5 py-2.5
            text-charcoal placeholder:text-muted text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            transition-colors duration-150 resize-none"
        />
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full tablet:w-auto">
        Continue to Menu
      </Button>
    </form>
  );
}