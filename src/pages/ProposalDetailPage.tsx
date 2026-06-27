import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Lock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PrintableMenu } from '@/components/proposal/PrintableMenu';
import { useProposals } from '@/hooks/useProposals';
import type { ProposalFull } from '@/lib/types';
import toast from 'react-hot-toast';

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<ProposalFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const { fetchProposal, finalizeProposal } = useProposals();
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadProposal(id);
  }, [id]);

  async function loadProposal(proposalId: string) {
    try {
      const data = await fetchProposal(proposalId);
      setProposal(data);
    } catch {
      toast.error('Menu not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalize() {
    if (!proposal) return;
    if (!confirm('Finalize this menu? It will no longer be editable.')) return;

    setFinalizing(true);
    try {
      await finalizeProposal(proposal.id);
      setProposal({ ...proposal, status: 'finalized' });
      toast.success('Menu finalized');
    } catch {
      toast.error('Failed to finalize');
    } finally {
      setFinalizing(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!proposal) return null;

  // Group items for the summary view
  const grouped = proposal.items.reduce(
    (acc, item) => {
      const key = item.category_name_snapshot;
      if (!acc[key]) acc[key] = { order: item.category_display_order, items: [] };
      acc[key].items.push(item);
      return acc;
    },
    {} as Record<string, { order: number; items: typeof proposal.items }>
  );
  const sortedCategories = Object.entries(grouped).sort(([, a], [, b]) => a.order - b.order);

  return (
    <div>
      {/* Top bar — hidden when printing */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All menus
          </Link>

          <div className="flex items-center gap-2">
            {proposal.status === 'draft' && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/proposals/${proposal.id}/edit`)}>
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={handleFinalize} loading={finalizing}>
                  <Lock className="w-4 h-4" />
                  Finalize
                </Button>
              </>
            )}
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print Menu
            </Button>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-charcoal/10 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-charcoal">
                {proposal.guest_name}
              </h1>
              <p className="text-sm text-muted mt-1">
                {[proposal.event_type, proposal.venue?.name].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                proposal.status === 'finalized'
                  ? 'bg-veg-green/10 text-veg-green'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {proposal.status === 'finalized' ? 'Finalized' : 'Draft'}
            </span>
          </div>

          {/* Item summary by category */}
          <div className="space-y-4">
            {sortedCategories.map(([catName, { items }]) => (
              <div key={catName}>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                  {catName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ivory rounded-lg text-sm text-charcoal"
                    >
                      <span
                        className={`w-2 h-2 rounded-sm ${
                          item.tags_snapshot.includes('non-veg')
                            ? 'bg-nonveg-red'
                            : 'bg-veg-green'
                        }`}
                      />
                      {item.item_name_snapshot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Total count */}
          <div className="mt-4 pt-4 border-t border-charcoal/5 text-sm text-muted">
            {proposal.items.length} {proposal.items.length === 1 ? 'dish' : 'dishes'} across{' '}
            {sortedCategories.length} {sortedCategories.length === 1 ? 'course' : 'courses'}
          </div>
        </div>
      </div>

      {/* Printable menu — always rendered, visible only in print */}
      <div className="print:block hidden">
        <PrintableMenu ref={printRef} proposal={proposal} />
      </div>

      {/* Preview of printable menu on screen */}
      <div className="print:hidden">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Print Preview
        </h2>
        <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
          <PrintableMenu ref={printRef} proposal={proposal} />
        </div>
      </div>
    </div>
  );
}