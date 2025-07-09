import { API_ENDPOINTS } from '@/lib/constants/constants';
import apiService from './api';

export interface ManagerSettings {
  general: {
    shopName: string;
    logoUrl?: string;
    timezone: string;
    currency: string;
  };
  account: {
    profile: {
      fullName: string;
      email: string;
      phone?: string;
      avatar?: string;
    };
    passwordLastChanged?: string;
  };
  userManagement: {
    roles: string[];
    canInvite: boolean;
  };
  inventory: {
    lowStockThreshold: number;
    slaDays: number;
  };
  localization: {
    defaultLanguage: string;
    enabledLocales: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    rules?: any;
  };
  integrations: {
    webhooks?: string[];
    apiKeys?: string[];
  };
}

class ManagerSettingsService {
  async getSectionSettings<T = any>(section: keyof ManagerSettings): Promise<T> {
    const url = `${API_ENDPOINTS.MANAGER.SETTINGS}/${section}`;
    const response = await apiService.get<T>(url);
    return response.data;
  }

  async updateSectionSettings<T = any>(section: keyof ManagerSettings, data: T): Promise<T> {
    const url = `${API_ENDPOINTS.MANAGER.SETTINGS}/${section}`;
    const response = await apiService.put<T>(url, data);
    return response.data;
  }
}

export const managerSettingsService = new ManagerSettingsService();
export default managerSettingsService;
