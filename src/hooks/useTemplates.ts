import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { MenuTemplate, MenuTemplateFull } from '@/lib/types';

export function useTemplates() {
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('menu_templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    setTemplates((data ?? []) as MenuTemplate[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  async function fetchTemplateFull(id: string): Promise<MenuTemplateFull> {
    const { data, error } = await supabase
      .from('menu_templates')
      .select('*, items:menu_template_items(*, menu_item:menu_items(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as MenuTemplateFull;
  }

  async function fetchEligibleTemplates(pax: number): Promise<MenuTemplate[]> {
    const { data } = await supabase
      .from('menu_templates')
      .select('*')
      .eq('is_active', true)
      .lte('min_pax', pax)
      .order('display_order');
    return (data ?? []) as MenuTemplate[];
  }

  async function createTemplate(
    template: { name: string; description?: string; min_pax: number; display_order: number }
  ): Promise<MenuTemplate> {
    const { data, error } = await supabase
      .from('menu_templates')
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    await fetchTemplates();
    return data as MenuTemplate;
  }

  async function updateTemplate(
    id: string,
    updates: Partial<Pick<MenuTemplate, 'name' | 'description' | 'min_pax' | 'display_order' | 'is_active'>>
  ) {
    const { error } = await supabase
      .from('menu_templates')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchTemplates();
  }

  async function deleteTemplate(id: string) {
    await supabase
      .from('menu_templates')
      .update({ is_active: false })
      .eq('id', id);
    await fetchTemplates();
  }

  async function saveTemplateItems(templateId: string, menuItemIds: string[]) {
    // Clear existing
    await supabase
      .from('menu_template_items')
      .delete()
      .eq('template_id', templateId);

    // Insert new
    if (menuItemIds.length > 0) {
      const rows = menuItemIds.map((menu_item_id) => ({
        template_id: templateId,
        menu_item_id,
      }));
      const { error } = await supabase
        .from('menu_template_items')
        .insert(rows);
      if (error) throw error;
    }
  }

  return {
    templates,
    loading,
    refetch: fetchTemplates,
    fetchTemplateFull,
    fetchEligibleTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    saveTemplateItems,
  };
}