import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

export interface Publication {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description?: string; // Fallback for compatibility
  content?: string;
  externalUrl: string;
  url?: string; // Fallback for compatibility
  imageUrl?: string;
  platform: string;
  publishedAt: string;
  readTime?: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
}

export function usePublications(params?: Record<string, any>) {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  return useQuery({
    queryKey: ['publications', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Publication[]>>(`/api/publications${queryString}`);
      return response.data || [];
    },
  });
}

export function usePublication(slug: string) {
  return useQuery({
    queryKey: ['publication', slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Publication>>(`/api/publications/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<ApiResponse<Publication>>('/api/publications', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useUpdatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: any }) => {
      const response = await api.put<ApiResponse<Publication>>(`/api/publications/${slug}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      queryClient.invalidateQueries({ queryKey: ['publication', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useDeletePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      await api.delete(`/api/publications/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useTogglePublishPublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.patch<ApiResponse<{ published: boolean }>>(`/api/publications/${slug}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}
