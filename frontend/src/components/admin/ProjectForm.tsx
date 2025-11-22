import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCreateProject, useUpdateProject, type Project } from '@/hooks/useProjects';
import { useTags } from '@/hooks/useTags';
import { X, Plus } from 'lucide-react';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  overview: z.string().min(10, 'Overview must be at least 10 characters').max(1000),
  objectives: z.string().min(10, 'Objectives must be at least 10 characters'),
  methodology: z.string().min(10, 'Methodology must be at least 10 characters'),
  findings: z.string().min(10, 'Findings must be at least 10 characters'),
  impact: z.string().min(10, 'Impact must be at least 10 characters'),

  // Custom section headings
  objectivesHeading: z.string().min(1).max(100).optional(),
  methodologyHeading: z.string().min(1).max(100).optional(),
  findingsHeading: z.string().min(1).max(100).optional(),
  impactHeading: z.string().min(1).max(100).optional(),

  researchType: z.enum(['FOUNDATIONAL', 'EVALUATIVE', 'GENERATIVE', 'MIXED']),
  industry: z.string().optional(),
  duration: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.string().optional(),
  participants: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const { toast } = useToast();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: tagsData } = useTags();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [methodInput, setMethodInput] = useState('');
  const [methods, setMethods] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState({ title: '', url: '' });
  const [links, setLinks] = useState<Array<{ title: string; url: string }>>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          overview: project.overview,
          objectives: project.objectives,
          methodology: project.methodology,
          findings: project.findings,
          impact: project.impact,
          objectivesHeading: project.objectivesHeading || 'Research Objectives',
          methodologyHeading: project.methodologyHeading || 'Methodology & Approach',
          findingsHeading: project.findingsHeading || 'Key Findings & Insights',
          impactHeading: project.impactHeading || 'Impact & Outcomes',
          researchType: project.researchType,
          industry: project.industry || '',
          duration: project.duration || '',
          role: project.role || '',
          teamSize: project.teamSize || '',
          participants: project.participants || '',
          featured: project.featured,
          published: project.published,
        }
      : {
          objectivesHeading: 'Research Objectives',
          methodologyHeading: 'Methodology & Approach',
          findingsHeading: 'Key Findings & Insights',
          impactHeading: 'Impact & Outcomes',
          featured: false,
          published: false,
        },
  });

  useEffect(() => {
    if (project) {
      // Set tags
      if (project.tags) {
        setSelectedTags(project.tags.map(t => t.tag.id));
      }
      // Set methods
      if (project.methodsUsed && Array.isArray(project.methodsUsed)) {
        setMethods(project.methodsUsed as string[]);
      }
      // Set links
      if (project.links && Array.isArray(project.links)) {
        setLinks(project.links as Array<{ title: string; url: string }>);
      }
    }
  }, [project]);

  const researchType = watch('researchType');
  const featured = watch('featured');
  const published = watch('published');

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const payload = {
        ...data,
        // Only include custom headings if they have values
        objectivesHeading: data.objectivesHeading?.trim() || undefined,
        methodologyHeading: data.methodologyHeading?.trim() || undefined,
        findingsHeading: data.findingsHeading?.trim() || undefined,
        impactHeading: data.impactHeading?.trim() || undefined,
        // Only include optional metadata fields if they have values
        duration: data.duration?.trim() || undefined,
        role: data.role?.trim() || undefined,
        teamSize: data.teamSize?.trim() || undefined,
        participants: data.participants?.trim() || undefined,
        industry: data.industry?.trim() || undefined,
        tagIds: selectedTags,
        methodsUsed: methods,
        links: links.length > 0 ? links : undefined,
      };

      if (project) {
        await updateProject.mutateAsync({ slug: project.slug, data: payload });
        toast({ title: 'Success', description: 'Project updated successfully' });
      } else {
        await createProject.mutateAsync(payload);
        toast({ title: 'Success', description: 'Project created successfully' });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save project',
        variant: 'destructive',
      });
    }
  };

  const handleAddMethod = () => {
    if (methodInput.trim() && !methods.includes(methodInput.trim())) {
      setMethods([...methods, methodInput.trim()]);
      setMethodInput('');
    }
  };

  const handleRemoveMethod = (method: string) => {
    setMethods(methods.filter(m => m !== method));
  };

  const handleAddLink = () => {
    if (linkInput.url.trim()) {
      setLinks([...links, { title: linkInput.title.trim() || linkInput.url, url: linkInput.url.trim() }]);
      setLinkInput({ title: '', url: '' });
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const researchMethodTags = tagsData?.filter(t => t.category === 'RESEARCH_METHOD') || [];
  const industryTags = tagsData?.filter(t => t.category === 'INDUSTRY') || [];
  const topicTags = tagsData?.filter(t => t.category === 'TOPIC') || [];
  const toolTags = tagsData?.filter(t => t.category === 'TOOL') || [];
  const skillTags = tagsData?.filter(t => t.category === 'SKILL') || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="e.g., E-commerce Checkout Optimization"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Overview */}
      <div className="space-y-2">
        <Label htmlFor="overview">Overview *</Label>
        <Textarea
          id="overview"
          {...register('overview')}
          placeholder="Brief summary of the project..."
          rows={3}
        />
        {errors.overview && (
          <p className="text-sm text-destructive">{errors.overview.message}</p>
        )}
      </div>

      {/* Research Type */}
      <div className="space-y-2">
        <Label htmlFor="researchType">Research Type *</Label>
        <Select value={researchType} onValueChange={(value) => setValue('researchType', value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Select research type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FOUNDATIONAL">Foundational Research</SelectItem>
            <SelectItem value="EVALUATIVE">Evaluative Research</SelectItem>
            <SelectItem value="GENERATIVE">Generative Research</SelectItem>
            <SelectItem value="MIXED">Mixed Methods</SelectItem>
          </SelectContent>
        </Select>
        {errors.researchType && (
          <p className="text-sm text-destructive">{errors.researchType.message}</p>
        )}
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            {...register('industry')}
            placeholder="e.g., E-commerce, Healthcare"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            {...register('duration')}
            placeholder="e.g., 3 months, Q1 2024"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Your Role</Label>
          <Input
            id="role"
            {...register('role')}
            placeholder="e.g., Lead Researcher"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Input
            id="teamSize"
            {...register('teamSize')}
            placeholder="e.g., 5 people"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="participants">Participants</Label>
          <Input
            id="participants"
            {...register('participants')}
            placeholder="e.g., 20 users"
          />
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="objectivesHeading" className="text-muted-foreground text-xs">
            Section Heading (optional - defaults to "Research Objectives")
          </Label>
          <Input
            id="objectivesHeading"
            {...register('objectivesHeading')}
            placeholder="Research Objectives"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="objectives">Content *</Label>
          <Textarea
            id="objectives"
            {...register('objectives')}
            placeholder="What were the research goals and questions?"
            rows={4}
          />
          {errors.objectives && (
            <p className="text-sm text-destructive">{errors.objectives.message}</p>
          )}
        </div>
      </div>

      {/* Methodology */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="methodologyHeading" className="text-muted-foreground text-xs">
            Section Heading (optional - defaults to "Methodology & Approach")
          </Label>
          <Input
            id="methodologyHeading"
            {...register('methodologyHeading')}
            placeholder="Methodology & Approach"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="methodology">Content *</Label>
          <Textarea
            id="methodology"
            {...register('methodology')}
            placeholder="Describe the research approach and methods used..."
            rows={5}
          />
          {errors.methodology && (
            <p className="text-sm text-destructive">{errors.methodology.message}</p>
          )}
        </div>
      </div>

      {/* Methods Used */}
      <div className="space-y-2">
        <Label>Methods Used</Label>
        <div className="flex gap-2">
          <Input
            value={methodInput}
            onChange={(e) => setMethodInput(e.target.value)}
            placeholder="e.g., User Interviews"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMethod())}
          />
          <Button type="button" onClick={handleAddMethod} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {methods.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {methods.map((method) => (
              <Badge key={method} variant="secondary">
                {method}
                <button
                  type="button"
                  onClick={() => handleRemoveMethod(method)}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Findings */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="findingsHeading" className="text-muted-foreground text-xs">
            Section Heading (optional - defaults to "Key Findings & Insights")
          </Label>
          <Input
            id="findingsHeading"
            {...register('findingsHeading')}
            placeholder="Key Findings & Insights"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="findings">Content *</Label>
          <Textarea
            id="findings"
            {...register('findings')}
            placeholder="What did you discover? What were the key insights?"
            rows={5}
          />
          {errors.findings && (
            <p className="text-sm text-destructive">{errors.findings.message}</p>
          )}
        </div>
      </div>

      {/* Impact */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="impactHeading" className="text-muted-foreground text-xs">
            Section Heading (optional - defaults to "Impact & Outcomes")
          </Label>
          <Input
            id="impactHeading"
            {...register('impactHeading')}
            placeholder="Impact & Outcomes"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="impact">Content *</Label>
          <Textarea
            id="impact"
            {...register('impact')}
            placeholder="What was the impact of this research? How was it used?"
            rows={4}
          />
          {errors.impact && (
            <p className="text-sm text-destructive">{errors.impact.message}</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <Label>Related Links</Label>
        <div className="flex gap-2">
          <Input
            value={linkInput.title}
            onChange={(e) => setLinkInput({ ...linkInput, title: e.target.value })}
            placeholder="Link title"
            className="flex-1"
          />
          <Input
            value={linkInput.url}
            onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
            placeholder="URL"
            className="flex-1"
          />
          <Button type="button" onClick={handleAddLink} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {links.length > 0 && (
          <div className="space-y-2 mt-2">
            {links.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{link.title} - {link.url}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <Label>Tags</Label>

        {researchMethodTags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Research Methods</p>
            <div className="flex flex-wrap gap-2">
              {researchMethodTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {industryTags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Industries</p>
            <div className="flex flex-wrap gap-2">
              {industryTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {topicTags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Topics</p>
            <div className="flex flex-wrap gap-2">
              {topicTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {toolTags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Tools</p>
            <div className="flex flex-wrap gap-2">
              {toolTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {skillTags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skillTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="featured">Featured Project</Label>
          <Switch
            id="featured"
            checked={featured}
            onCheckedChange={(checked) => setValue('featured', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="published">Published</Label>
          <Switch
            id="published"
            checked={published}
            onCheckedChange={(checked) => setValue('published', checked)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
