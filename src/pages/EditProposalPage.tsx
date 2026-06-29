import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { MenuBuilder } from '@/components/proposal/MenuBuilder';
import { Button } from '@/components/ui/Button';
import { useProposals } from '@/hooks/useProposals';
import { useMenu } from '@/hooks/useMenu';
import { useProposalBuilderStore } from '@/stores/proposalStore';
import type { ProposalFull, MenuItem } from '@/lib/types';
import toast from 'react-hot-toast';

export function EditProposalPage() {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<ProposalFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { fetchProposal, saveProposalItems } = useProposals();
  const { categories, subcategories, items: allMenuItems } = useMenu();
  const { clearAll, toggleItem, getSelectedArray, totalCount } = useProposalBuilderStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadAndHydrate(id);
    return () => clearAll();
  }, [id]);

  async function loadAndHydrate(proposalId: string) {
    try {
      const data = await fetchProposal(proposalId);
      setProposal(data);

      if (data.status === 'finalized') {
        toast.error('Cannot edit a finalized menu');
        navigate(`/proposals/${proposalId}`);
        return;
      }

      // Hydrate the builder store with existing selections
      clearAll();
      data.items.forEach((pi) => {
        const menuItem = allMenuItems.find((mi) => mi.id === pi.menu_item_id);
        if (menuItem) toggleItem(menuItem);
      });
    } catch {
      toast.error('Menu not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!proposal) return;
    if (totalCount() === 0) {
      toast.error('Select at least one dish');
      return;
    }

    setSaving(true);
    try {
      await saveProposalItems(proposal.id, getSelectedArray(), categories, subcategories);
      toast.success('Menu updated!');
      navigate(`/proposals/${proposal.id}`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(`/proposals/${proposal.id}`)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to menu
        </button>

        <Button onClick={handleSave} loading={saving} disabled={totalCount() === 0}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <h1 className="font-display text-2xl font-semibold text-charcoal mb-1">
        Edit Menu
      </h1>
      <p className="text-sm text-muted mb-6">
        {proposal.guest_name}
        {proposal.event_type ? ` · ${proposal.event_type}` : ''}
      </p>

      <MenuBuilder />
    </div>
  );
}