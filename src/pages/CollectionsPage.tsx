import { useState } from 'react';
import { Folder, Plus } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import FAB from '@/components/layout/FAB';
import FolderCard from '@/components/cards/FolderCard';
import EmptyState from '@/components/EmptyState';
import { FolderCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFolders } from '@/hooks/useFolders';
import { useItems } from '@/hooks/useItems';
import { useToast } from '@/hooks/use-toast';

export default function CollectionsPage() {
  const { folders, isLoading, createFolder, deleteFolder } = useFolders();
  const { items } = useItems();
  const { toast } = useToast();
  const [newFolderName, setNewFolderName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder(newFolderName.trim());
      toast({
        title: 'Folder created',
        description: `"${newFolderName}" has been created successfully.`,
      });
      setNewFolderName('');
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create folder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      toast({
        title: 'Folder deleted',
        description: 'The folder has been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete folder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getItemCount = (folderId: string) => {
    return items.filter(item => item.folder_id === folderId).length;
  };

  return (
    <AppLayout>
      <TopBar title="Collections" />
      
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground">Your Folders</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <FolderCardSkeleton key={i} />
            ))}
          </div>
        ) : folders.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No folders yet"
            description="Create folders to organize your bookmarks. Keep your content tidy and easy to find."
            actionLabel="Create Folder"
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                id={folder.id}
                name={folder.name}
                itemCount={getItemCount(folder.id)}
                onDelete={handleDeleteFolder}
              />
            ))}
          </div>
        )}
      </div>

      <FAB />
    </AppLayout>
  );
}
