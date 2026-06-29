import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Proposal, ProposalItem, ProposalWithVenue, ProposalFull, MenuItem, MenuCategory, MenuSubcategory } from '@/lib/types';

export function useProposals() {
  const [loading, setLoading] = useState(false);

  async function fetchMyProposals(): Promise<ProposalWithVenue[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, venue:venues(*)')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as ProposalWithVenue[];
  }

  async function fetchProposal(id: string): Promise<ProposalFull> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, venue:venues(*), items:proposal_items(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ProposalFull;
  }

  async function createProposal(
    proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'status'>
  ): Promise<Proposal> {
    const { data, error } = await supabase
      .from('proposals')
      .insert(proposal)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function updateProposal(
    id: string,
    updates: Partial<Proposal>
  ): Promise<Proposal> {
    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function deleteProposal(id: string) {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async function saveProposalItems(
    proposalId: string,
    selectedItems: MenuItem[],
    categories: MenuCategory[],
    subcategories: MenuSubcategory[]
  ) {
    // Clear existing items
    await supabase
      .from('proposal_items')
      .delete()
      .eq('proposal_id', proposalId);

    // Build snapshot rows
    const rows: Omit<ProposalItem, 'id' | 'created_at'>[] = selectedItems.map((item) => {
      const cat = categories.find((c) => c.id === item.category_id);
      const sub = subcategories.find((s) => s.id === item.subcategory_id);
      return {
        proposal_id: proposalId,
        menu_item_id: item.id,
        item_name_snapshot: item.name,
        category_name_snapshot: cat?.name ?? 'Other',
        subcategory_name_snapshot: sub?.name ?? null,
        category_display_order: cat?.display_order ?? 99,
        tags_snapshot: item.tags,
      };
    });

    if (rows.length > 0) {
      const { error } = await supabase
        .from('proposal_items')
        .insert(rows);

      if (error) throw error;
    }
  }

  async function finalizeProposal(id: string) {
    return updateProposal(id, { status: 'finalized' });
  }

  return {
    loading,
    setLoading,
    fetchMyProposals,
    fetchProposal,
    createProposal,
    updateProposal,
    deleteProposal,
    saveProposalItems,
    finalizeProposal,
  };
}