import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface About {
  id: string;
  name: string;
  title: string;
  bio: string;
  profilePic?: string;
  email?: string;
  phone?: string;
  location?: string;
  socialLinks?: SocialLink[];
  updatedAt: string;
  createdAt: string;
}

export function useAbout() {
  return useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<About>>('/api/about');
      return response.data;
    },
  });
}

export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<About>) => {
      const response = await api.put<ApiResponse<About>>('/api/about', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
    },
  });
}
