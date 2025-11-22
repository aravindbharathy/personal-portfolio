import { useQuery } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

export interface TimelineItem {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  excerpt: string;
  date: string;
  url: string;
  tags: string[];
  readTime?: number;
  platform?: string;
}

export function useTimeline(params?: Record<string, any>) {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

  return useQuery({
    queryKey: ['timeline', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ items: TimelineItem[]; hasMore: boolean; total: number }>>(`/api/timeline${queryString}`);
      return response.data;
    },
  });
}
