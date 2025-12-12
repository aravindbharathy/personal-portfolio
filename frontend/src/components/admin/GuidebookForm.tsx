import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCreateGuidebook, useUpdateGuidebook, type Guidebook } from '@/hooks/useGuidebooks';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

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
    coverImage: '',
    featured: false,
    published: false,
  });

  const [targetAudiences, setTargetAudiences] = useState<string[]>([]);
  const [newAudience, setNewAudience] = useState('');

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
        coverImage: guidebook.coverImage || '',
        featured: guidebook.featured || false,
        published: guidebook.published || false,
      });
      // Parse existing targetAudience (comma-separated) into array
      if (guidebook.targetAudience) {
        setTargetAudiences(
          guidebook.targetAudience.split(',').map(a => a.trim()).filter(Boolean)
        );
      } else {
        setTargetAudiences([]);
      }
    }
  }, [guidebook]);

  const addAudience = () => {
    const trimmed = newAudience.trim();
    if (trimmed && !targetAudiences.includes(trimmed)) {
      setTargetAudiences([...targetAudiences, trimmed]);
      setNewAudience('');
    }
  };

  const removeAudience = (index: number) => {
    setTargetAudiences(targetAudiences.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (targetAudiences.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one target audience',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Clean up data - remove empty optional fields
      // Join targetAudiences array into comma-separated string
      const submitData = {
        title: formData.title,
        area: formData.area,
        description: formData.description,
        purpose: formData.purpose,
        targetAudience: targetAudiences.join(', '),
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

      {/* Target Audiences */}
      <div className="space-y-3">
        <Label>Target Audiences *</Label>
        <p className="text-sm text-muted-foreground">
          Add each target audience separately (e.g., "UX Researchers", "Product Managers", etc.)
        </p>

        {/* Display existing audiences */}
        {targetAudiences.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border rounded-md bg-muted/50">
            {targetAudiences.map((audience, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-sm py-1 px-3 flex items-center gap-2"
              >
                {audience}
                <button
                  type="button"
                  onClick={() => removeAudience(index)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add new audience */}
        <div className="flex gap-2">
          <Input
            value={newAudience}
            onChange={(e) => setNewAudience(e.target.value)}
            placeholder="e.g., UX Researchers"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAudience();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addAudience}
            disabled={!newAudience.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
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
