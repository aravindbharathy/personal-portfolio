import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTags, useCreateTag } from '@/hooks/useTags';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const TAG_CATEGORIES = [
  { value: 'RESEARCH_METHOD', label: 'Research Method' },
  { value: 'INDUSTRY', label: 'Industry' },
  { value: 'TOPIC', label: 'Topic' },
  { value: 'TOOL', label: 'Tool' },
  { value: 'SKILL', label: 'Skill' },
];

export default function AdminTags() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', category: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTag.name || !newTag.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTag.mutateAsync(newTag);
      toast({ title: 'Success', description: 'Tag created successfully' });
      setDialogOpen(false);
      setNewTag({ name: '', category: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create tag',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </AdminLayout>
    );
  }

  // Group tags by category
  const tagsByCategory = tags?.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tags</h1>
            <p className="text-muted-foreground mt-1">Manage content categorization tags</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                  <DialogDescription>Add a new tag to categorize your content</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Tag Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., User Interviews"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTag.category} onValueChange={(value) => setNewTag({ ...newTag, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Tag</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!tagsByCategory || Object.keys(tagsByCategory).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tags yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {TAG_CATEGORIES.map((category) => {
              const categoryTags = tagsByCategory[category.value] || [];
              if (categoryTags.length === 0) return null;

              return (
                <Card key={category.value}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categoryTags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                          {tag.count !== undefined && ` (${tag.count})`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
