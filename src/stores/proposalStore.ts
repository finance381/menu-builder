import { create } from 'zustand';
import type { MenuItem } from '@/lib/types';

interface ProposalBuilderState {
  // The items selected during menu building
  selectedItems: Map<string, MenuItem>;

  // Actions
  toggleItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  clearAll: () => void;
  isSelected: (itemId: string) => boolean;
  getSelectedArray: () => MenuItem[];
  getSelectedByCategory: (categoryId: string) => MenuItem[];
  totalCount: () => number;
}

export const useProposalBuilderStore = create<ProposalBuilderState>((set, get) => ({
  selectedItems: new Map(),

  toggleItem: (item) => {
    set((state) => {
      const next = new Map(state.selectedItems);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return { selectedItems: next };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const next = new Map(state.selectedItems);
      next.delete(itemId);
      return { selectedItems: next };
    });
  },

  clearAll: () => set({ selectedItems: new Map() }),

  isSelected: (itemId) => get().selectedItems.has(itemId),

  getSelectedArray: () => Array.from(get().selectedItems.values()),

  getSelectedByCategory: (categoryId) =>
    Array.from(get().selectedItems.values()).filter(
      (item) => item.category_id === categoryId
    ),

  totalCount: () => get().selectedItems.size,
}));