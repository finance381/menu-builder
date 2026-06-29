// ============================================
// Database types (mirrors the SQL schema)
// ============================================

export type UserRole = 'admin' | 'rep';
export type ProposalStatus = 'draft' | 'finalized';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  icon: string | null;
  created_at: string;
}

export interface MenuSubcategory {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  tags: string[];
  cuisine: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  created_by: string;
  venue_id: string | null;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  event_type: string | null;
  event_date: string | null;
  expected_pax: number | null;
  template_id: string | null;
  status: ProposalStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  menu_item_id: string | null;
  item_name_snapshot: string;
  category_name_snapshot: string;
  subcategory_name_snapshot: string | null;
  category_display_order: number;
  tags_snapshot: string[];
  created_at: string;
}

// ============================================
// Joined / enriched types used in the UI
// ============================================

export interface MenuItemWithCategory extends MenuItem {
  category: MenuCategory;
}

export interface ProposalWithVenue extends Proposal {
  venue: Venue | null;
}

export interface ProposalFull extends ProposalWithVenue {
  items: ProposalItem[];
  created_by_profile: Profile | null;
}

// ============================================
// Form / input types
// ============================================

export interface ProposalFormData {
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  venue_id: string;
  event_type: string;
  event_date: string;
  expected_pax: string;
  notes: string;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  category_id: string;
  tags: string[];
  cuisine: string;
  image_url: string;
}

// ============================================
// Supabase Database type (minimal, for client)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; full_name: string }; Update: Partial<Profile> };
      venues: {
        Row: Venue;
        Insert: Partial<Omit<Venue, 'id' | 'created_at' | 'updated_at' | 'is_active'>> & { name: string };
        Update: Partial<Omit<Venue, 'id' | 'created_at' | 'updated_at'>>;
      };
      menu_categories: {
        Row: MenuCategory;
        Insert: Partial<Omit<MenuCategory, 'id' | 'created_at'>> & { name: string };
        Update: Partial<Omit<MenuCategory, 'id' | 'created_at'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'is_active'>> & { name: string; category_id: string };
        Update: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      proposals: { Row: Proposal; Insert: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'status'> & Partial<Pick<Proposal, 'id' | 'status'>>; Update: Partial<Proposal> };
      proposal_items: { Row: ProposalItem; Insert: Omit<ProposalItem, 'id' | 'created_at'> & Partial<Pick<ProposalItem, 'id'>>; Update: Partial<ProposalItem> };
      menu_templates: {
        Row: MenuTemplate;
        Insert: Partial<Omit<MenuTemplate, 'id' | 'created_at' | 'is_active'>> & { name: string };
        Update: Partial<Omit<MenuTemplate, 'id' | 'created_at'>>;
      };
      menu_template_items: {
        Row: MenuTemplateItem;
        Insert: Omit<MenuTemplateItem, 'id' | 'created_at'>;
        Update: Partial<MenuTemplateItem>;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}

export interface EventType {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// ============================================
// Menu Templates (base menus)
// ============================================

export interface MenuTemplate {
  id: string;
  name: string;
  description: string | null;
  min_pax: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuTemplateItem {
  id: string;
  template_id: string;
  menu_item_id: string;
  created_at: string;
}

export interface MenuTemplateWithItems extends MenuTemplate {
  items: MenuTemplateItem[];
}

export interface MenuTemplateFull extends MenuTemplate {
  items: (MenuTemplateItem & { menu_item: MenuItem })[];
}