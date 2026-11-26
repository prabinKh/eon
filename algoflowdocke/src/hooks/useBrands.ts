import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandService, type Brand } from '@/api/brandService';
import { useStore } from '@/frontend/context/StoreContext';

export const useBrands = () => {
  const { companySlug } = useStore();

  const { data: dbBrands = [], isLoading: loading } = useQuery({
    queryKey: ['brands', companySlug],
    queryFn: () => brandService.getAll(undefined, { company: companySlug }),
  });

  const brands = useMemo(() => {
    if (!Array.isArray(dbBrands)) return [];
    return dbBrands.filter((b) => b.is_active !== false);
  }, [dbBrands]);

  return { brands, loading };
};
