/**
 * Utility functions for unit conversions
 */

/**
 * Convert millimeters to centimeters
 * @param mm - value in millimeters
 * @returns value in centimeters
 */
export function mmToCm(mm: number): number {
  return mm / 10;
}

/**
 * Convert centimeters to millimeters
 * @param cm - value in centimeters
 * @returns value in millimeters
 */
export function cmToMm(cm: number): number {
  return cm * 10;
}

/**
 * Format foot length for display
 * @param mm - foot length in millimeters
 * @returns formatted string with both mm and cm
 */
export function formatFootLength(mm: number): string {
  const cm = mmToCm(mm);
  return `${mm}mm (${cm.toFixed(1)}cm)`;
}

/**
 * Format foot length for display in cm only
 * @param mm - foot length in millimeters
 * @returns formatted string in cm
 */
export function formatFootLengthCm(mm: number): string {
  const cm = mmToCm(mm);
  return `${cm.toFixed(1)}cm`;
} 