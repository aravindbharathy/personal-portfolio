import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: string;
  count?: number;
}

export function useTags(category?: string) {
  const queryString = category ? `?category=${category}` : '';

  return useQuery({
    queryKey: ['tags', category],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Tag[]>>(`/api/tags${queryString}`);
      return response.data;
    },
  });
}

export function useTagsByCategory() {
  return useQuery({
    queryKey: ['tags', 'categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Record<string, Tag[]>>>('/api/tags/categories');
      return response.data;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; category: string }) => {
      const response = await api.post<ApiResponse<Tag>>('/api/tags', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
