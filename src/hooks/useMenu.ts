import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MenuCategory, MenuSubcategory, MenuItem } from '@/lib/types';

export function useMenu() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [subcategories, setSubcategories] = useState<MenuSubcategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoading(true);

    const [catResult, subResult, itemResult] = await Promise.all([
      supabase
        .from('menu_categories')
        .select('*')
        .order('display_order'),
      supabase
        .from('menu_subcategories')
        .select('*')
        .order('display_order'),
      supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('name'),
    ]);

    if (catResult.data) setCategories(catResult.data);
    if (subResult.data) setSubcategories(subResult.data);
    if (itemResult.data) setItems(itemResult.data);
    setLoading(false);
  }

  function getItemsByCategory(categoryId: string) {
    return items.filter((item) => item.category_id === categoryId);
  }

  function getItemById(id: string) {
    return items.find((item) => item.id === id);
  }

  async function updateCategory(id: string, updates: { name?: string; display_order?: number }) {
    const { error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    fetchMenu();
  }

  async function reorderCategories(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) => 
      supabase.from('menu_categories').update({ display_order: index + 1 }).eq('id', id)
    );
    await Promise.all(updates);
    fetchMenu();
  }

  function getSubcategoriesByCategory(categoryId: string) {
    return subcategories.filter((s) => s.category_id === categoryId);
  }

  return {
    categories,
    subcategories,
    items,
    loading,
    getItemsByCategory,
    getItemById,
    getSubcategoriesByCategory,
    refetch: fetchMenu,
    updateCategory,
    reorderCategories,
  };
}