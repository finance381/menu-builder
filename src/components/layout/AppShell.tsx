import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, Settings, LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AppShell() {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent text-white'
        : 'text-slate hover:bg-charcoal/5'
    }`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-accent" />
            <span className="font-display text-xl font-semibold text-charcoal">
              Menu Builder
            </span>
          </NavLink>

          {/* Navigation */}
          <nav className="hidden tablet:flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              <LayoutGrid className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink to="/proposals/new" className={linkClass}>
              <Plus className="w-4 h-4" />
              New Menu
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                <Settings className="w-4 h-4" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden tablet:block">
              {profile?.full_name}
            </span>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-muted hover:text-charcoal hover:bg-charcoal/5 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="tablet:hidden flex items-center gap-1 px-4 pb-2">
          <NavLink to="/" end className={linkClass}>
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/proposals/new" className={linkClass}>
            <Plus className="w-4 h-4" />
            New
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              <Settings className="w-4 h-4" />
              Admin
            </NavLink>
          )}
        </nav>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}