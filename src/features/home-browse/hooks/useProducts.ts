import { useQuery } from '@tanstack/react-query';

import { productsService } from '@/src/features/home-browse/services/products.service';

export function useProducts() {
  const query = useQuery({
    queryKey: ['products', 'list'],
    queryFn: async () => {
      const { data, error } = await productsService.listProducts();
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    ...query,
    products: query.data ?? [],
  };
}
