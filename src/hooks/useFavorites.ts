import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import favoritesService, { FavoriteProduct } from '@/services/favorites';

interface UseFavoritesReturn {
  favorites: FavoriteProduct[];
  favoritesCount: number;
  loading: boolean;
  error: string | null;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách favorites
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoritesCount(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await favoritesService.getFavorites();
      if (response.success) {
        setFavorites(response.data.favorites);
        setFavoritesCount(response.data.count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Kiểm tra sản phẩm có trong favorites không
  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.some(fav => fav._id === productId);
  }, [favorites]);

  // Toggle favorite với optimistic update
  const toggleFavorite = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to manage favorites');
    }

    const currentIsFavorite = isFavorite(productId);
    
    // Optimistic update
    if (currentIsFavorite) {
      setFavorites(prev => prev.filter(fav => fav._id !== productId));
      setFavoritesCount(prev => prev - 1);
    } else {
      // Nếu thêm vào favorites, cần có thông tin sản phẩm
      // Trong trường hợp này, chúng ta sẽ refresh sau khi toggle
    }

    try {
      const response = await favoritesService.toggleFavorite(productId);
      if (response.success) {
        setFavorites(response.data.favorites);
        setFavoritesCount(response.data.count);
        setError(null);
      }
    } catch (err) {
      // Revert optimistic update on error
      await fetchFavorites();
      throw err;
    }
  }, [isAuthenticated, isFavorite, fetchFavorites]);

  // Thêm vào favorites
  const addToFavorites = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add favorites');
    }

    if (isFavorite(productId)) {
      return; // Đã có trong favorites
    }

    try {
      const response = await favoritesService.addToFavorites(productId);
      if (response.success) {
        setFavorites(response.data.favorites);
        setFavoritesCount(response.data.count);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to favorites');
      throw err;
    }
  }, [isAuthenticated, isFavorite]);

  // Xóa khỏi favorites
  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove favorites');
    }

    if (!isFavorite(productId)) {
      return; // Không có trong favorites
    }

    // Optimistic update
    setFavorites(prev => prev.filter(fav => fav._id !== productId));
    setFavoritesCount(prev => prev - 1);

    try {
      const response = await favoritesService.removeFromFavorites(productId);
      if (response.success) {
        setFavorites(response.data.favorites);
        setFavoritesCount(response.data.count);
        setError(null);
      }
    } catch (err) {
      // Revert optimistic update on error
      await fetchFavorites();
      setError(err instanceof Error ? err.message : 'Failed to remove from favorites');
      throw err;
    }
  }, [isAuthenticated, isFavorite, fetchFavorites]);

  // Xóa tất cả favorites
  const clearAllFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Please login to clear favorites');
    }

    // Optimistic update
    setFavorites([]);
    setFavoritesCount(0);

    try {
      const response = await favoritesService.clearAllFavorites();
      if (response.success) {
        setError(null);
      }
    } catch (err) {
      // Revert optimistic update on error
      await fetchFavorites();
      setError(err instanceof Error ? err.message : 'Failed to clear favorites');
      throw err;
    }
  }, [isAuthenticated, fetchFavorites]);

  // Refresh favorites
  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  // Fetch favorites khi component mount hoặc authentication thay đổi
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    favoritesCount,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    clearAllFavorites,
    refreshFavorites,
  };
}; 