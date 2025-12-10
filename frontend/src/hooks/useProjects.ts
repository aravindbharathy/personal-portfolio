import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

export interface ProjectGridPicture {
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface ProjectPictureGrid {
  id?: string;
  position: 'before_objectives' | 'after_objectives' | 'before_methodology' | 'after_methodology' | 'before_findings' | 'after_findings' | 'before_impact' | 'after_impact';
  columns: 1 | 2 | 3;
  order: number;
  pictures: ProjectGridPicture[];
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  overview: string;
  objectives: string;
  methodology: string;
  findings: string;
  impact: string;

  // Custom section headings
  objectivesHeading?: string;
  methodologyHeading?: string;
  findingsHeading?: string;
  impactHeading?: string;

  coverImage?: string;
  timeframe?: string;
  duration?: string;
  role?: string;
  teamSize?: string;
  participants?: string;
  researchType: string;
  industry?: string;
  methodsUsed: string[];
  featured: boolean;
  published: boolean;
  publishedAt?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  images?: Array<{ id: string; url: string; alt: string; caption?: string; order: number }>;
  links?: Array<{ title: string; url: string }>;
  pictureGrids?: ProjectPictureGrid[];
}

export function useProjects(params?: Record<string, any>) {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Project[]>>(`/api/projects${queryString}`);
      return response.data || [];
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Project>>(`/api/projects/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Project[]>>('/api/projects/featured');
      return response.data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<ApiResponse<Project>>('/api/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: any }) => {
      const response = await api.put<ApiResponse<Project>>(`/api/projects/${slug}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      await api.delete(`/api/projects/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useTogglePublishProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.patch<ApiResponse<{ published: boolean }>>(`/api/projects/${slug}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}
