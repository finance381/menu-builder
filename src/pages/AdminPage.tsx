import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DietMarker } from '@/components/ui/DietMarker';
import { useMenu } from '@/hooks/useMenu';
import { useVenues } from '@/hooks/useVenues';
import { supabase } from '@/lib/supabase';
import { CUISINES, DIET_TAGS, TAG_LABELS } from '@/lib/constants';
import type { MenuItem, Venue, MenuCategory } from '@/lib/types';
import toast from 'react-hot-toast';
import { GripVertical } from 'lucide-react';
import { useEventTypes } from '@/hooks/useEventTypes';

type AdminTab = 'items' | 'categories' | 'venues' | 'eventTypes';

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('items');

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-charcoal mb-6">Admin</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-charcoal/10">
        {([
          ['items', 'Menu Items'],
          ['categories', 'Categories'],
          ['venues', 'Venues'],
          ['eventTypes', 'Event Types'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-charcoal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'items' && <MenuItemsAdmin />}
      {tab === 'categories' && <CategoriesAdmin />}
      {tab === 'venues' && <VenuesAdmin />}
      {tab === 'eventTypes' && <EventTypesAdmin />}
    </div>
  );
}

// ============================================
// MENU ITEMS ADMIN
// ============================================
function MenuItemsAdmin() {
  const { categories, items, refetch } = useMenu();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    tags: [] as string[],
    cuisine: '',
    image_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  function resetForm() {
    setForm({ name: '', description: '', category_id: '', tags: [], cuisine: '', image_url: '' });
    setEditing(null);
    setAdding(false);
  }

  function startEdit(item: MenuItem) {
    setEditing(item);
    setAdding(true);
    setForm({
      name: item.name,
      description: item.description || '',
      category_id: item.category_id,
      tags: item.tags,
      cuisine: item.cuisine || '',
      image_url: item.image_url || '',
    });
  }

  async function handleSave() {
    if (!form.name || !form.category_id) {
      toast.error('Name and category are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        category_id: form.category_id,
        tags: form.tags,
        cuisine: form.cuisine || null,
        image_url: form.image_url || null,
      };

      if (editing) {
        await supabase.from('menu_items').update(payload).eq('id', editing.id);
        toast.success('Item updated');
      } else {
        await supabase.from('menu_items').insert(payload);
        toast.success('Item added');
      }

      resetForm();
      refetch();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await supabase.from('menu_items').update({ is_active: false }).eq('id', item.id);
    toast.success('Item removed');
    refetch();
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  }

  const filtered = filterCategory
    ? items.filter((i) => i.category_id === filterCategory)
    : items;

  return (
    <div>
      {/* Add/Edit form */}
      {adding ? (
        <div className="bg-white rounded-xl border border-charcoal/10 p-5 mb-6">
          <h3 className="font-semibold text-charcoal mb-4">
            {editing ? 'Edit Item' : 'Add New Item'}
          </h3>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 mb-4">
            <Input
              label="Dish Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Select
              label="Category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              placeholder="Select category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
            <Select
              label="Cuisine"
              value={form.cuisine}
              onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
              placeholder="Select cuisine"
              options={CUISINES.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Image URL"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
            <div className="tablet:col-span-2">
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the dish"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate mb-2">Diet Tags</label>
            <div className="flex flex-wrap gap-2">
              {DIET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.tags.includes(tag)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-slate border-charcoal/15 hover:border-charcoal/30'
                  }`}
                >
                  {TAG_LABELS[tag] || tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Update' : 'Add Item'}
            </Button>
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            placeholder="All categories"
            options={[
              { value: '', label: 'All categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            className="w-48"
          />
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-charcoal/10 px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <DietMarker tags={item.tags} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                <p className="text-xs text-muted truncate">
                  {categories.find((c) => c.id === item.category_id)?.name}
                  {item.cuisine ? ` · ${item.cuisine}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(item)}
                className="p-1.5 rounded-lg text-muted hover:text-charcoal hover:bg-charcoal/5"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CATEGORIES ADMIN
// ============================================
function CategoriesAdmin() {
  const { categories, refetch, updateCategory, reorderCategories } = useMenu();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [orderedCats, setOrderedCats] = useState(categories);

  useEffect(() => {
    setOrderedCats(categories);
  }, [categories]);

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.display_order), 0);
    await supabase.from('menu_categories').insert({ name: name.trim(), display_order: maxOrder + 1 });
    setName('');
    setSaving(false);
    toast.success('Category added');
    refetch();
  }

  async function handleDelete(cat: MenuCategory) {
    if (!confirm(`Delete "${cat.name}"? Items in this category will also be removed.`)) return;
    await supabase.from('menu_categories').delete().eq('id', cat.id);
    toast.success('Category deleted');
    refetch();
  }

  function startEdit(cat: MenuCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return;
    try {
      await updateCategory(editingId, { name: editName.trim() });
      toast.success('Category renamed');
    } catch {
      toast.error('Failed to rename');
    }
    setEditingId(null);
    setEditName('');
  }

  function handleDragStart(id: string) {
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setOrderedCats((prev) => {
      const fromIdx = prev.findIndex((c) => c.id === draggedId);
      const toIdx = prev.findIndex((c) => c.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  async function handleDragEnd() {
    if (!draggedId) return;
    setDraggedId(null);
    const ids = orderedCats.map((c) => c.id);
    try {
      await reorderCategories(ids);
      toast.success('Order updated');
    } catch {
      toast.error('Failed to reorder');
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="max-w-xs"
        />
        <Button onClick={handleAdd} loading={saving} disabled={!name.trim()}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <p className="text-xs text-muted mb-3">Drag to reorder. Changes save automatically.</p>

      <div className="space-y-2">
        {orderedCats.map((cat) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(cat.id)}
            onDragOver={(e) => handleDragOver(e, cat.id)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-lg border border-charcoal/10 px-4 py-3 flex items-center justify-between transition-opacity ${
              draggedId === cat.id ? 'opacity-40' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <GripVertical className="w-4 h-4 text-muted cursor-grab shrink-0" />
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="max-w-xs"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                  <Button size="sm" onClick={saveEdit}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-charcoal">{cat.name}</p>
                  <p className="text-xs text-muted">Order: {cat.display_order}</p>
                </div>
              )}
            </div>
            {editingId !== cat.id && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-1.5 rounded-lg text-muted hover:text-charcoal hover:bg-charcoal/5"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// VENUES ADMIN
// ============================================
function VenuesAdmin() {
  const { venues, refetch } = useVenues();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' });
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!form.name.trim()) return;
    setSaving(true);
    await supabase.from('venues').insert({
      name: form.name.trim(),
      address: form.address || null,
      city: form.city || null,
      phone: form.phone || null,
    });
    setForm({ name: '', address: '', city: '', phone: '' });
    setAdding(false);
    setSaving(false);
    toast.success('Venue added');
    refetch();
  }

  async function handleDelete(venue: Venue) {
    if (!confirm(`Delete "${venue.name}"?`)) return;
    await supabase.from('venues').update({ is_active: false }).eq('id', venue.id);
    toast.success('Venue removed');
    refetch();
  }

  return (
    <div>
      {adding ? (
        <div className="bg-white rounded-xl border border-charcoal/10 p-5 mb-6">
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 mb-4">
            <Input
              label="Venue Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} loading={saving}>Add Venue</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" />
            Add Venue
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {venues.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-lg border border-charcoal/10 px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-charcoal">{v.name}</p>
              <p className="text-xs text-muted">{[v.address, v.city].filter(Boolean).join(', ')}</p>
            </div>
            <button
              onClick={() => handleDelete(v)}
              className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EVENT TYPES ADMIN
// ============================================
function EventTypesAdmin() {
  const { eventTypes, refetch } = useEventTypes();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    const maxOrder = eventTypes.reduce((max, e) => Math.max(max, e.display_order), 0);
    await supabase.from('event_types').insert({ name: name.trim(), display_order: maxOrder + 1 });
    setName('');
    setSaving(false);
    toast.success('Event type added');
    refetch();
  }

  async function handleDelete(et: { id: string; name: string }) {
    if (!confirm(`Delete "${et.name}"?`)) return;
    await supabase.from('event_types').update({ is_active: false }).eq('id', et.id);
    toast.success('Event type removed');
    refetch();
  }

  function startEdit(et: { id: string; name: string }) {
    setEditingId(et.id);
    setEditName(et.name);
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return;
    await supabase.from('event_types').update({ name: editName.trim() }).eq('id', editingId);
    toast.success('Event type renamed');
    setEditingId(null);
    setEditName('');
    refetch();
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New event type"
          className="max-w-xs"
        />
        <Button onClick={handleAdd} loading={saving} disabled={!name.trim()}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {eventTypes.map((et) => (
          <div
            key={et.id}
            className="bg-white rounded-lg border border-charcoal/10 px-4 py-3 flex items-center justify-between"
          >
            {editingId === et.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="max-w-xs"
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                />
                <Button size="sm" onClick={saveEdit}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-charcoal">{et.name}</p>
                  <p className="text-xs text-muted">Order: {et.display_order}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(et)}
                    className="p-1.5 rounded-lg text-muted hover:text-charcoal hover:bg-charcoal/5"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(et)}
                    className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
