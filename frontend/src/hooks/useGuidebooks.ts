import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

export interface GuidebookArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  readTime?: number;
  externalUrl?: string;
  url?: string;
  order: number;
}

export interface Guidebook {
  id: string;
  title: string;
  slug: string;
  area: string;
  description: string;
  purpose?: string;
  targetAudience?: string;
  coverImage?: string;
  totalReadTime?: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  articles?: GuidebookArticle[];
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
}

export function useGuidebooks(params?: Record<string, any>) {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  return useQuery({
    queryKey: ['guidebooks', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Guidebook[]>>(`/api/guidebooks${queryString}`);
      return response.data || [];
    },
  });
}

export function useGuidebook(slug: string) {
  return useQuery({
    queryKey: ['guidebook', slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Guidebook>>(`/api/guidebooks/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useCreateGuidebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<ApiResponse<Guidebook>>('/api/guidebooks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useUpdateGuidebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: any }) => {
      const response = await api.put<ApiResponse<Guidebook>>(`/api/guidebooks/${slug}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['guidebook', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useDeleteGuidebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      await api.delete(`/api/guidebooks/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useTogglePublishGuidebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.patch<ApiResponse<{ published: boolean }>>(`/api/guidebooks/${slug}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useAddArticleToGuidebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: { publicationId: string; order: number; customTitle?: string; customExcerpt?: string } }) => {
      const response = await api.post(`/api/guidebooks/${slug}/articles`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['guidebook', variables.slug] });
    },
  });
}

export function useRemoveArticleFromGuidebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, articleId }: { slug: string; articleId: string }) => {
      await api.delete(`/api/guidebooks/${slug}/articles/${articleId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['guidebook', variables.slug] });
    },
  });
}

export function useReorderGuidebookArticles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, articles }: { slug: string; articles: Array<{ id: string; order: number }> }) => {
      const response = await api.patch(`/api/guidebooks/${slug}/articles/reorder`, { articles });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['guidebook', variables.slug] });
    },
  });
}
