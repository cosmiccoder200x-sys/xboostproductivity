import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddContentModal } from '@/hooks/useAddContentModal';

export default function FAB() {
  const { openModal } = useAddContentModal();

  return (
    <Button
      onClick={openModal}
      size="icon"
      className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-fab z-40 md:bottom-8 transition-transform hover:scale-105 active:scale-95"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
