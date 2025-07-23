
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
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: string;
  status?: string;
  addresses: Address[];
  isVerified: boolean;
  // Body measurements for size recommendation
  height?: number;
  weight?: number;
  footLength?: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  addresses?: Address[];
  height?: number;
  weight?: number;
  footLength?: number;
}

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data;
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data;
  }
}

export const profileService = new ProfileService();
export default profileService;
