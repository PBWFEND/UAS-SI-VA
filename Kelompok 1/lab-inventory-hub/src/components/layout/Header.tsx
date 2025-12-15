import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FlaskConical, LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <FlaskConical className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">LabInventory</h1>
            <p className="text-xs text-muted-foreground">Sistem Manajemen Inventaris</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-lg bg-accent px-3 py-2 sm:flex">
            <User className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">{user?.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
