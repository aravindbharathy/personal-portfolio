import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreatePublication, useUpdatePublication, type Publication } from '@/hooks/usePublications';
import { useToast } from '@/hooks/use-toast';

interface PublicationFormProps {
  publication?: Publication;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PublicationForm({
  publication,
  onSuccess,
  onCancel,
}: PublicationFormProps) {
  // Helper function to convert ISO string to datetime-local format
  const toDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    externalUrl: '',
    platform: 'MEDIUM',
    publishedAt: toDateTimeLocal(new Date().toISOString()),
    readTime: 5,
    imageUrl: '',
    featured: false,
    tagIds: [] as string[],
  });

  const createPublication = useCreatePublication();
  const updatePublication = useUpdatePublication();
  const { toast } = useToast();

  useEffect(() => {
    if (publication) {
      setFormData({
        title: publication.title || '',
        excerpt: publication.excerpt || publication.description || '',
        content: publication.content || '',
        externalUrl: publication.externalUrl || publication.url || '',
        platform: publication.platform || 'MEDIUM',
        publishedAt: toDateTimeLocal(publication.publishedAt || new Date().toISOString()),
        readTime: publication.readTime || 5,
        imageUrl: publication.imageUrl || '',
        featured: publication.featured || false,
        tagIds: publication.tags?.map((t: any) => t.tag?.id || t.id) || [],
      });
    }
  }, [publication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate excerpt length
    if (formData.excerpt.length < 10) {
      toast({
        title: 'Error',
        description: 'Excerpt must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      const submitData = {
        ...formData,
        publishedAt: new Date(formData.publishedAt).toISOString(),
        readTime: formData.readTime || undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      if (publication) {
        await updatePublication.mutateAsync({
          slug: publication.slug,
          data: submitData,
        });
        toast({
          title: 'Success',
          description: 'Publication updated successfully',
        });
      } else {
        await createPublication.mutateAsync(submitData);
        toast({
          title: 'Success',
          description: 'Publication created successfully',
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.details?.[0]?.message || error.message || 'Failed to save publication',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Article title"
          required
        />
      </div>

      {/* Excerpt */}
      <div>
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Brief summary (10-1000 characters)"
          required
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.excerpt.length} characters
        </p>
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Full article content (optional)"
          rows={4}
        />
      </div>

      {/* External URL */}
      <div>
        <Label htmlFor="externalUrl">Article URL *</Label>
        <Input
          id="externalUrl"
          type="url"
          value={formData.externalUrl}
          onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
          placeholder="https://..."
          required
        />
      </div>

      {/* Image URL */}
      <div>
        <Label htmlFor="imageUrl">Cover Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* Platform */}
      <div>
        <Label htmlFor="platform">Platform *</Label>
        <select
          id="platform"
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
          className="w-full px-3 py-2 border rounded-md bg-background"
          required
        >
          <option value="MEDIUM">Medium</option>
          <option value="SUBSTACK">Substack</option>
          <option value="EXTERNAL">External</option>
          <option value="INTERNAL">Internal</option>
        </select>
      </div>

      {/* Published At */}
      <div>
        <Label htmlFor="publishedAt">Published Date *</Label>
        <Input
          id="publishedAt"
          type="datetime-local"
          value={formData.publishedAt}
          onChange={(e) => {
            setFormData({ ...formData, publishedAt: e.target.value });
          }}
          required
        />
      </div>

      {/* Read Time */}
      <div>
        <Label htmlFor="readTime">Read Time (minutes)</Label>
        <Input
          id="readTime"
          type="number"
          min="1"
          value={formData.readTime}
          onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, featured: checked as boolean })
          }
        />
        <Label htmlFor="featured" className="cursor-pointer">
          Featured
        </Label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-6">
        <Button type="submit" disabled={createPublication.isPending || updatePublication.isPending}>
          {publication ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
