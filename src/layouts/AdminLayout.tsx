import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  TreePine,
  Building2,
  Home,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canModerate, loading, role, county } = useAdminAuth();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !canModerate) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [canModerate, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!canModerate) return null;

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
    { path: '/admin/verifications', icon: ClipboardCheck, label: 'Verifications', exact: false },
    { path: '/admin/users', icon: Users, label: 'Users', exact: false },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', exact: false },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <img src="/square-logo.webp" alt="LeafSwipe" className="h-6 w-6 md:h-8 md:w-8" />
          <div>
            <h1 className="text-lg md:text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
        {county && (
          <p className="text-xs text-muted-foreground mt-2">County: {county}</p>
        )}
      </div>

      <Separator />

      <nav className="flex-1 p-3 md:p-4 space-y-2">
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <Home className="h-4 w-4 mr-3" />
            Home
          </Button>
        </Link>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant={isActive(item.path, item.exact) ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <Separator />

      <div className="p-3 md:p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-14 border-b bg-card flex items-center px-4 md:hidden z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-3">
          <img src="/square-logo.webp" alt="LeafSwipe" className="h-5 w-5" />
          <h1 className="text-base font-bold">Admin Panel</h1>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
