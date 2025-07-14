"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import favoritesService, { FavoriteProduct } from '@/services/favorites';
import { useAuth } from '@/hooks/useAuth';

interface FavoritesContextValue {
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

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
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
    if (!isAuthenticated) throw new Error('Please login to manage favorites');
    const currentIsFavorite = isFavorite(productId);
    // Optimistic update
    if (currentIsFavorite) {
      setFavorites(prev => prev.filter(fav => fav._id !== productId));
      setFavoritesCount(prev => prev - 1);
    } else {
      setFavorites(prev => [...prev, { _id: productId } as FavoriteProduct]); // Tạm thời thêm vào để UI update, sẽ sync lại sau
      setFavoritesCount(prev => prev + 1);
    }
    try {
      const response = await favoritesService.toggleFavorite(productId);
      if (response.success) {
        setFavorites(response.data.favorites);
        setFavoritesCount(response.data.count);
        setError(null);
      }
    } catch (err) {
      await fetchFavorites();
      throw err;
    }
  }, [isAuthenticated, isFavorite, fetchFavorites]);

  // Thêm vào favorites
  const addToFavorites = useCallback(async (productId: string) => {
    if (!isAuthenticated) throw new Error('Please login to add favorites');
    if (isFavorite(productId)) return;
    setFavorites(prev => [...prev, { _id: productId } as FavoriteProduct]);
    setFavoritesCount(prev => prev + 1);
    try {
      const response = await favoritesService.addToFavorites(productId);
      if (response.success) {
        setFavorites(response.data.favorites);
        setFavoritesCount(response.data.count);
        setError(null);
      }
    } catch (err) {
      await fetchFavorites();
      setError(err instanceof Error ? err.message : 'Failed to add to favorites');
      throw err;
    }
  }, [isAuthenticated, isFavorite, fetchFavorites]);

  // Xóa khỏi favorites
  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!isAuthenticated) throw new Error('Please login to remove favorites');
    if (!isFavorite(productId)) return;
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
      await fetchFavorites();
      setError(err instanceof Error ? err.message : 'Failed to remove from favorites');
      throw err;
    }
  }, [isAuthenticated, isFavorite, fetchFavorites]);

  // Xóa tất cả favorites
  const clearAllFavorites = useCallback(async () => {
    if (!isAuthenticated) throw new Error('Please login to clear favorites');
    setFavorites([]);
    setFavoritesCount(0);
    try {
      const response = await favoritesService.clearAllFavorites();
      if (response.success) setError(null);
    } catch (err) {
      await fetchFavorites();
      setError(err instanceof Error ? err.message : 'Failed to clear favorites');
      throw err;
    }
  }, [isAuthenticated, fetchFavorites]);

  // Refresh favorites
  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <FavoritesContext.Provider value={{
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
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}; 