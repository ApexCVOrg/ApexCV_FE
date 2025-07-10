import api from './api';

export interface FavoriteProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
  sizes: { size: string; stock: number }[];
  colors: string[];
  tags: string[];
  status: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
}

export interface FavoritesResponse {
  success: boolean;
  data: {
    favorites: FavoriteProduct[];
    count: number;
  };
}

export interface CheckFavoriteResponse {
  success: boolean;
  data: {
    isFavorite: boolean;
    productId: string;
  };
}

export interface ToggleFavoriteResponse {
  success: boolean;
  message: string;
  data: {
    favorites: FavoriteProduct[];
    count: number;
    isFavorite: boolean;
  };
}

class FavoritesService {
  private baseURL = '/favorites';

  // Lấy danh sách sản phẩm yêu thích
  async getFavorites(): Promise<FavoritesResponse> {
    try {
      const response = await api.get<FavoritesResponse>(this.baseURL);
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new Error('Failed to fetch favorites');
    }
  }

  // Kiểm tra sản phẩm có trong favorites không
  async checkFavorite(productId: string): Promise<CheckFavoriteResponse> {
    try {
      const response = await api.get<CheckFavoriteResponse>(`${this.baseURL}/check/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      throw new Error('Failed to check favorite status');
    }
  }

  // Thêm sản phẩm vào favorites
  async addToFavorites(productId: string): Promise<ToggleFavoriteResponse> {
    try {
      const response = await api.post<ToggleFavoriteResponse>(`${this.baseURL}/add/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Failed to add to favorites');
    }
  }

  // Xóa sản phẩm khỏi favorites
  async removeFromFavorites(productId: string): Promise<ToggleFavoriteResponse> {
    try {
      const response = await api.delete<ToggleFavoriteResponse>(`${this.baseURL}/remove/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Failed to remove from favorites');
    }
  }

  // Toggle thêm/xóa favorites
  async toggleFavorite(productId: string): Promise<ToggleFavoriteResponse> {
    try {
      const response = await api.post<ToggleFavoriteResponse>(`${this.baseURL}/toggle/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('Failed to toggle favorite');
    }
  }

  // Xóa tất cả favorites
  async clearAllFavorites(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`${this.baseURL}/clear`);
      return response.data;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw new Error('Failed to clear favorites');
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService; 