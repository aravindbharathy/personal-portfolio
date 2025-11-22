import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  usePublications,
  useDeletePublication,
  useTogglePublishPublication,
  type Publication,
} from '@/hooks/usePublications';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PublicationForm from '@/components/admin/PublicationForm';

export default function AdminPublications() {
  // Fetch all publications (no published filter for admin view)
  const { data, isLoading } = usePublications({});
  const deletePublication = useDeletePublication();
  const togglePublish = useTogglePublishPublication();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<Publication | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [publicationToEdit, setPublicationToEdit] = useState<Publication | null>(null);

  const handleDelete = async () => {
    if (!publicationToDelete) return;

    try {
      await deletePublication.mutateAsync(publicationToDelete.slug);
      toast({
        title: 'Success',
        description: 'Publication deleted successfully',
      });
      setDeleteDialogOpen(false);
      setPublicationToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete publication',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (publication: Publication) => {
    try {
      await togglePublish.mutateAsync(publication.slug);
      toast({
        title: 'Success',
        description: `Publication ${publication.published ? 'unpublished' : 'published'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update publication',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading publications...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const publications = data || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Publications</h1>
            <p className="text-muted-foreground mt-1">Manage your published articles</p>
          </div>
          <Button onClick={() => { setPublicationToEdit(null); setFormDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Publication
          </Button>
        </div>

        {publications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No publications yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {publications.map((publication) => (
              <Card key={publication.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{publication.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {publication.excerpt || publication.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">
                          Draft
                        </Badge>
                        <Badge variant="outline">{publication.platform}</Badge>
                        {publication.readTime && (
                          <Badge variant="outline">{publication.readTime} min read</Badge>
                        )}
                        {publication.featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleTogglePublish(publication)}
                      >
                        {publication.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => { setPublicationToEdit(publication); setFormDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setPublicationToDelete(publication);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {publication.tags.map((tag) => (
                      <Badge key={tag.tag.id} variant="secondary" className="text-xs">
                        {tag.tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{publicationToEdit ? 'Edit Publication' : 'Create New Publication'}</DialogTitle>
          </DialogHeader>
          <PublicationForm
            publication={publicationToEdit || undefined}
            onSuccess={() => {
              setFormDialogOpen(false);
              setPublicationToEdit(null);
            }}
            onCancel={() => {
              setFormDialogOpen(false);
              setPublicationToEdit(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{publicationToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
