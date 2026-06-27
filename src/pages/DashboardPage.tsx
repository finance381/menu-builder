import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProposals } from '@/hooks/useProposals';
import type { ProposalWithVenue } from '@/lib/types';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const [proposals, setProposals] = useState<ProposalWithVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchMyProposals, deleteProposal } = useProposals();
  const navigate = useNavigate();

  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    try {
      const data = await fetchMyProposals();
      setProposals(data);
    } catch (err) {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete the menu for "${name}"? This can't be undone.`)) return;
    try {
      await deleteProposal(id);
      setProposals((prev) => prev.filter((p) => p.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No menus yet"
        description="Start building a menu for your next event."
        action={
          <Link to="/proposals/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Menu
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-charcoal">My Menus</h1>
        <Link to="/proposals/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            New Menu
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
        {proposals.map((p) => {
          const date = p.event_date
            ? new Date(p.event_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : null;

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-charcoal/10 p-5 hover:shadow-md transition-shadow cursor-pointer group relative"
              onClick={() => navigate(`/proposals/${p.id}`)}
            >
              {/* Status badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.status === 'finalized'
                      ? 'bg-veg-green/10 text-veg-green'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {p.status === 'finalized' ? 'Finalized' : 'Draft'}
                </span>

                {p.status === 'draft' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id, p.guest_name);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Guest name */}
              <h3 className="font-semibold text-charcoal text-lg mb-2 truncate">
                {p.guest_name}
              </h3>

              {/* Details */}
              <div className="space-y-1.5 text-sm text-muted">
                {p.event_type && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{p.event_type}</span>
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{date}</span>
                  </div>
                )}
                {p.expected_pax && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>{p.expected_pax} guests</span>
                  </div>
                )}
              </div>

              {/* Venue */}
              {p.venue && (
                <p className="text-xs text-muted mt-3 pt-3 border-t border-charcoal/5 truncate">
                  {p.venue.name}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}