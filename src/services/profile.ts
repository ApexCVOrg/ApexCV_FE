import { API_ENDPOINTS } from '@/lib/constants/constants';
import apiService from './api';

export interface Address {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  country: string;
  addressNumber: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: string;
  status?: string;
  addresses: Address[];
  isVerified: boolean;
}

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>(API_ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
