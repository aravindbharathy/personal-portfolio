import { useQuery } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

export interface AdminStats {
  projects: {
    total: number;
    published: number;
    drafts: number;
    featured: number;
  };
  publications: {
    total: number;
    byPlatform: Record<string, number>;
    featured: number;
  };
  guidebooks: {
    total: number;
    published: number;
    drafts: number;
  };
  tags: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminStats>>('/api/admin/stats');
      return response.data;
    },
  });
}
