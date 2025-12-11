import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import AddContentModal from '@/components/modals/AddContentModal';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="animate-fade-in">
        {children}
      </main>
      <BottomNav />
      <AddContentModal />
    </div>
  );
}
