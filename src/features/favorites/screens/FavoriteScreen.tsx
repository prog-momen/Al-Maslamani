import { useFavorites } from '@/src/features/favorites/hooks/useFavorites';
import { EmptyState, Header, ScreenWrapper } from '@/src/shared/ui';

export function FavoriteScreen() {
  const { favorites } = useFavorites();

  return (
    <ScreenWrapper>
      <Header title="Favorites" subtitle="Saved products" />
      {favorites.length === 0 ? (
        <EmptyState title="No favorites yet" description="TODO: Render favorite products list." />
      ) : null}
    </ScreenWrapper>
  );
}
