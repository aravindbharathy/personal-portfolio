import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateGuidebook, useUpdateGuidebook, type Guidebook } from '@/hooks/useGuidebooks';
import { useToast } from '@/hooks/use-toast';

interface GuidebookFormProps {
  guidebook?: Guidebook;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GuidebookForm({
  guidebook,
  onSuccess,
  onCancel,
}: GuidebookFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    area: '',
    description: '',
    purpose: '',
    targetAudience: '',
    coverImage: '',
    featured: false,
    published: false,
  });

  const createGuidebook = useCreateGuidebook();
  const updateGuidebook = useUpdateGuidebook();
  const { toast } = useToast();

  useEffect(() => {
    if (guidebook) {
      setFormData({
        title: guidebook.title || '',
        area: guidebook.area || '',
        description: guidebook.description || '',
        purpose: guidebook.purpose || '',
        targetAudience: guidebook.targetAudience || '',
        coverImage: guidebook.coverImage || '',
        featured: guidebook.featured || false,
        published: guidebook.published || false,
      });
    }
  }, [guidebook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clean up data - remove empty optional fields
      const submitData = {
        title: formData.title,
        area: formData.area,
        description: formData.description,
        purpose: formData.purpose,
        targetAudience: formData.targetAudience,
        featured: formData.featured,
        published: formData.published,
        ...(formData.coverImage && { coverImage: formData.coverImage }),
      };

      if (guidebook) {
        await updateGuidebook.mutateAsync({
          slug: guidebook.slug,
          data: submitData,
        });
        toast({
          title: 'Success',
          description: 'Guidebook updated successfully',
        });
      } else {
        await createGuidebook.mutateAsync(submitData);
        toast({
          title: 'Success',
          description: 'Guidebook created successfully',
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Guidebook save error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.details?.[0]?.message || error.message || 'Failed to save guidebook',
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
          placeholder="Guidebook title"
          required
        />
      </div>

      {/* Area */}
      <div>
        <Label htmlFor="area">Area *</Label>
        <Input
          id="area"
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          placeholder="e.g., User Research, Design Strategy, Product Management"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the guidebook"
          required
          rows={3}
        />
      </div>

      {/* Purpose */}
      <div>
        <Label htmlFor="purpose">Purpose *</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="What will readers learn from this guidebook?"
          required
          rows={3}
        />
      </div>

      {/* Target Audience */}
      <div>
        <Label htmlFor="targetAudience">Target Audience *</Label>
        <Input
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
          placeholder="Who is this guidebook for?"
          required
        />
      </div>

      {/* Cover Image */}
      <div>
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          type="url"
          value={formData.coverImage}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, published: checked as boolean })
            }
          />
          <Label htmlFor="published" className="cursor-pointer">
            Published
          </Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-6">
        <Button type="submit" disabled={createGuidebook.isPending || updateGuidebook.isPending}>
          {guidebook ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
