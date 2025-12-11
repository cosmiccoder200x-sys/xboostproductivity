import { Search, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title = 'Xboost' }: TopBarProps) {
  const { user } = useAuth();
  
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'XB';

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="touch-target">
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" asChild className="touch-target">
            <Link to="/profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
