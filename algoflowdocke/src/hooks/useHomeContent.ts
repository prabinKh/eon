import { useQuery } from '@tanstack/react-query';
import { homeContentService, type HomePageContent } from '@/api/homeContentService';
import { useStore } from '@/frontend/context/StoreContext';

export const useHomeContent = () => {
  const { companySlug } = useStore();

  const { data: content, isLoading: loading, refetch } = useQuery({
    queryKey: ['home-content', companySlug],
    queryFn: () => homeContentService.get(),
  });

  return { content, loading, refetch };
};
