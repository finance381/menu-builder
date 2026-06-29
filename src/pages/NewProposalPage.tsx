import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProposalForm } from '@/components/proposal/ProposalForm';
import { MenuBuilder } from '@/components/proposal/MenuBuilder';
import { Button } from '@/components/ui/Button';
import { useProposals } from '@/hooks/useProposals';
import { useMenu } from '@/hooks/useMenu';
import { useProposalBuilderStore } from '@/stores/proposalStore';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ProposalFormData } from '@/lib/types';
import toast from 'react-hot-toast';

type Step = 'details' | 'menu';

export function NewProposalPage() {
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState<ProposalFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { categories } = useMenu();
  const { createProposal, saveProposalItems } = useProposals();
  const { getSelectedArray, totalCount, clearAll } = useProposalBuilderStore();
  const navigate = useNavigate();

  function handleFormSubmit(data: ProposalFormData) {
    setFormData(data);
    setStep('menu');
  }

  async function handleSave() {
    if (!formData || !user) return;
    if (totalCount() === 0) {
      toast.error('Select at least one dish');
      return;
    }

    setSaving(true);
    try {
      const proposal = await createProposal({
        created_by: user.id,
        guest_name: formData.guest_name,
        guest_phone: formData.guest_phone || null,
        guest_email: formData.guest_email || null,
        venue_id: formData.venue_id || null,
        event_type: formData.event_type || null,
        event_date: formData.event_date || null,
        expected_pax: formData.expected_pax ? parseInt(formData.expected_pax) : null,
        notes: formData.notes || null,
        template_id: null,
      });

      await saveProposalItems(proposal.id, getSelectedArray(), categories);
      clearAll();
      toast.success('Menu saved!');
      navigate(`/proposals/${proposal.id}`);
    } catch (err) {
      toast.error('Failed to save menu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'details'
                ? 'bg-accent text-white'
                : 'bg-accent/10 text-accent'
            }`}
          >
            1
          </span>
          <span className={`text-sm font-medium ${step === 'details' ? 'text-charcoal' : 'text-muted'}`}>
            Event Details
          </span>
        </div>
        <div className="w-8 h-px bg-charcoal/15" />
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'menu'
                ? 'bg-accent text-white'
                : 'bg-charcoal/10 text-muted'
            }`}
          >
            2
          </span>
          <span className={`text-sm font-medium ${step === 'menu' ? 'text-charcoal' : 'text-muted'}`}>
            Build Menu
          </span>
        </div>
      </div>

      {/* Step content */}
      {step === 'details' && (
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-semibold text-charcoal mb-6">
            New Menu
          </h1>
          <div className="bg-white rounded-2xl border border-charcoal/10 p-6">
            <ProposalForm onSubmit={handleFormSubmit} initialData={formData ?? undefined} />
          </div>
        </div>
      )}

      {step === 'menu' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setStep('details')}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to details
            </button>

            <Button onClick={handleSave} loading={saving} disabled={totalCount() === 0}>
              Save Menu
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <h1 className="font-display text-2xl font-semibold text-charcoal mb-1">
            Build the Menu
          </h1>
          <p className="text-sm text-muted mb-6">
            {formData?.guest_name ? `For ${formData.guest_name}` : 'Select dishes'}
            {formData?.event_type ? ` · ${formData.event_type}` : ''}
          </p>

          <MenuBuilder />
        </div>
      )}
    </div>
  );
}