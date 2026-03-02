/**
 * Saju Input Validation Module
 * 
 * Validates user input before processing.
 */

import { SajuValidationError } from '../errors/saju-errors';
import type { SajuCalculationInput } from '../api/saju-engine';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateSajuInput(input: SajuCalculationInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Birth Date Validation
    const MIN_YEAR = 1900;
    const MAX_YEAR = 2100;

    if (!(input.birthDate instanceof Date) || isNaN(input.birthDate.getTime())) {
        errors.push('Invalid birth date provided.');
    } else {
        const year = input.birthDate.getFullYear();
        if (year < MIN_YEAR) {
            warnings.push(`Birth year ${year} is before ${MIN_YEAR}. Astronomical accuracy may be lower.`);
        }
        if (year > MAX_YEAR) {
            warnings.push(`Birth year ${year} is after ${MAX_YEAR}. Precision is not guaranteed.`);
        }
    }

    // 2. Birth Time Validation
    if (!input.birthTime) {
        errors.push('Birth time is required.');
    } else {
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        if (!timeRegex.test(input.birthTime)) {
            errors.push('Birth time must be in HH:mm format (24-hour) with minutes from 00 to 59.');
        }
    }

    // 3. Location Validation
    if (input.location) {
        const { latitude, longitude } = input.location;
        if (latitude < -90 || latitude > 90) {
            errors.push('Latitude must be between -90 and 90.');
        }
        if (longitude < -180 || longitude > 180) {
            errors.push('Longitude must be between -180 and 180.');
        }

        // Warning for non-Korea locations (if intended for Korea-centric logic)
        // Korea roughly: Lat 33-43, Long 124-132
        const isKorea = latitude >= 33 && latitude <= 43 && longitude >= 124 && longitude <= 132;
        if (!isKorea) {
            warnings.push('Location is outside Korea. Ensure timezone adjustments are correct.');
        }
    }

    // 4. Gender Validation
    if (input.gender && !['M', 'F'].includes(input.gender)) {
        errors.push('Gender must be "M" or "F".');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Throws validation error if input is invalid
 */
export function assertValidInput(input: SajuCalculationInput): void {
    const result = validateSajuInput(input);
    if (!result.isValid) {
        throw new SajuValidationError('Invalid Saju Input', { errors: result.errors });
    }
    // Warnings can be logged or handled by the caller
}
