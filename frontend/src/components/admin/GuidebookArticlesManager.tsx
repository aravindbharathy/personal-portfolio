import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useGuidebook,
  useAddArticleToGuidebook,
  useRemoveArticleFromGuidebook,
  type Guidebook,
} from '@/hooks/useGuidebooks';
import { usePublications } from '@/hooks/usePublications';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface GuidebookArticlesManagerProps {
  guidebook: Guidebook;
}

export default function GuidebookArticlesManager({ guidebook: initialGuidebook }: GuidebookArticlesManagerProps) {
  const { data: publications } = usePublications({});
  const { data: guidebook } = useGuidebook(initialGuidebook.slug);
  const addArticle = useAddArticleToGuidebook();
  const removeArticle = useRemoveArticleFromGuidebook();
  const { toast } = useToast();

  const [selectedPublicationId, setSelectedPublicationId] = useState<string>('');

  const allPublications = publications || [];
  const currentGuidebook = guidebook || initialGuidebook;
  const currentArticles = currentGuidebook.articles || [];

  // Filter out publications that are already in the guidebook
  const availablePublications = allPublications.filter(
    (pub) => !currentArticles.some((article) => article.id === pub.id)
  );

  const handleAddArticle = async () => {
    if (!selectedPublicationId) {
      toast({
        title: 'Error',
        description: 'Please select a publication',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addArticle.mutateAsync({
        slug: currentGuidebook.slug,
        data: {
          publicationId: selectedPublicationId,
          order: currentArticles.length,
        },
      });
      toast({
        title: 'Success',
        description: 'Chapter added successfully',
      });
      setSelectedPublicationId('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add chapter',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveArticle = async (articleId: string) => {
    try {
      await removeArticle.mutateAsync({
        slug: currentGuidebook.slug,
        articleId,
      });
      toast({
        title: 'Success',
        description: 'Chapter removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove chapter',
        variant: 'destructive',
      });
    }
  };

  const moveArticle = async (index: number, direction: 'up' | 'down') => {
    // This would require implementing the reorder functionality
    // For now, we'll show a toast that it's not implemented yet
    toast({
      title: 'Info',
      description: 'Reordering will be available in a future update',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Chapters</CardTitle>
        <CardDescription>
          Add publications as chapters to this guidebook
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new chapter */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="publication">Add Chapter</Label>
            <Select value={selectedPublicationId} onValueChange={setSelectedPublicationId}>
              <SelectTrigger id="publication">
                <SelectValue placeholder="Select a publication" />
              </SelectTrigger>
              <SelectContent>
                {availablePublications.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No available publications
                  </div>
                ) : (
                  availablePublications.map((pub) => (
                    <SelectItem key={pub.id} value={pub.id}>
                      {pub.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAddArticle}
            disabled={!selectedPublicationId || addArticle.isPending}
            className="mt-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Current chapters list */}
        <div>
          <Label className="mb-3 block">Current Chapters ({currentArticles.length})</Label>
          {currentArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No chapters yet. Add your first chapter above.
            </p>
          ) : (
            <div className="space-y-2">
              {currentArticles
                .sort((a, b) => a.order - b.order)
                .map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="w-12 justify-center">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{article.title}</p>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      {article.readTime && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {article.readTime} min read
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveArticle(index, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveArticle(index, 'down')}
                        disabled={index === currentArticles.length - 1}
                        className="h-8 w-8"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveArticle(article.id)}
                        disabled={removeArticle.isPending}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
