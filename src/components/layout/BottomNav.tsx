import { Home, Folder, Inbox, BarChart3, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/queue', icon: Inbox, label: 'Queue' },
  { to: '/collections', icon: Folder, label: 'Folders' },
  { to: '/review', icon: BarChart3, label: 'Review' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex flex-col items-center justify-center touch-target px-2 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
