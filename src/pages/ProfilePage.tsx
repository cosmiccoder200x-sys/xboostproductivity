import { User, Shield, Bell, Download, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { icon: User, label: 'Account', description: 'Manage your account settings' },
  { icon: Shield, label: 'Privacy', description: 'Control your privacy preferences' },
  { icon: Bell, label: 'Notifications', description: 'Configure notification settings' },
  { icon: Download, label: 'Export Data', description: 'Download your bookmarks' },
];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/auth');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'XB';
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <AppLayout>
      <TopBar title="Profile" />
      
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="divide-y divide-border">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
              onClick={() => toast({ title: 'Coming soon', description: `${item.label} settings will be available soon.` })}
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </Card>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Xboost v1.0.0 • Made with ❤️
        </p>
      </div>
    </AppLayout>
  );
}
