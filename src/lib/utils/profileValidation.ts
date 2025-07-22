import { UpdateProfileRequest, Address } from '@/services/profile';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateProfileData(data: UpdateProfileRequest): ValidationResult {
  const errors: string[] = [];

  // Validate fullName
  if (data.fullName !== undefined) {
    if (!data.fullName.trim()) {
      errors.push('Full name cannot be empty');
    } else if (data.fullName.length < 2) {
      errors.push('Full name must be at least 2 characters long');
    } else if (data.fullName.length > 100) {
      errors.push('Full name cannot exceed 100 characters');
    }
  }

  // Validate email
  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errors.push('Email cannot be empty');
    } else if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  // Validate phone
  if (data.phone !== undefined && data.phone) {
    // Allow Vietnamese phone numbers: 0xxxxxxxxx, +84xxxxxxxxx, 84xxxxxxxxx
    const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
    const cleanPhone = data.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Please enter a valid phone number (e.g., 0359731884, +84901234567)');
    }
  }

  // Validate addresses
  if (data.addresses !== undefined) {
    if (!Array.isArray(data.addresses)) {
      errors.push('Addresses must be an array');
    } else {
      data.addresses.forEach((address, index) => {
        const addressErrors = validateAddress(address, index);
        errors.push(...addressErrors);
      });
    }
  }

  // Validate measurements
  if (data.height !== undefined && data.height !== null) {
    if (data.height < 50 || data.height > 250) {
      errors.push('Height must be between 50 and 250 cm');
    }
  }

  if (data.weight !== undefined && data.weight !== null) {
    if (data.weight < 20 || data.weight > 300) {
      errors.push('Weight must be between 20 and 300 kg');
    }
  }

  if (data.footLength !== undefined && data.footLength !== null) {
    // Frontend and backend both use mm (150-350mm)
    if (data.footLength < 150 || data.footLength > 350) {
      errors.push('Foot length must be between 150 and 350 mm');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateAddress(address: Address, index: number): string[] {
  const errors: string[] = [];

  if (!address.recipientName?.trim()) {
    errors.push(`Address ${index + 1}: Recipient name is required`);
  }

  if (!address.street?.trim()) {
    errors.push(`Address ${index + 1}: Street is required`);
  }

  if (!address.city?.trim()) {
    errors.push(`Address ${index + 1}: City is required`);
  }

  if (!address.state?.trim()) {
    errors.push(`Address ${index + 1}: State is required`);
  }

  if (!address.country?.trim()) {
    errors.push(`Address ${index + 1}: Country is required`);
  }

  return errors;
}

export function cleanProfileData(data: UpdateProfileRequest): UpdateProfileRequest {
  const cleaned = { ...data };

  // Remove empty strings and null values
  Object.keys(cleaned).forEach(key => {
    const value = cleaned[key as keyof typeof cleaned];
    if (value === '' || value === null || value === undefined) {
      delete cleaned[key as keyof typeof cleaned];
    }
  });

  // Clean string fields
  if (cleaned.fullName) {
    cleaned.fullName = cleaned.fullName.trim();
  }

  if (cleaned.email) {
    cleaned.email = cleaned.email.trim().toLowerCase();
  }

  if (cleaned.phone) {
    cleaned.phone = cleaned.phone.trim();
  }

  // Handle foot length (already in mm)
  if (cleaned.footLength !== undefined && cleaned.footLength !== null) {
    console.log('FootLength (mm):', cleaned.footLength);
    // No conversion needed, already in mm
  }

  // Clean addresses
  if (cleaned.addresses) {
    cleaned.addresses = cleaned.addresses.map(addr => ({
      ...addr,
      recipientName: addr.recipientName?.trim() || '',
      street: addr.street?.trim() || '',
      city: addr.city?.trim() || '',
      state: addr.state?.trim() || '',
      country: addr.country?.trim() || '',
      addressNumber: addr.addressNumber?.trim() || '',
      isDefault: Boolean(addr.isDefault),
    }));
  }

  return cleaned;
} 