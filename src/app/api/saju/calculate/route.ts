import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { calculateHighPrecisionSaju, SajuCalculationInput } from '@/core/api/saju-engine';
import { formatErrorResponse, ValidationError, SajuCalculationError, ErrorMessages } from '@/lib/errors';
import type { SajuCalculateRequest, SajuCalculateResponse } from '@/types/api';

/**
 * POST /api/saju/calculate
 * Calculate high-precision Saju (Four Pillars)
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const { user, error } = await getAuthenticatedUser(request);
        if (error) return error;

        // 2. Parse and validate request body
        const body: unknown = await request.json();

        if (!isValidCalculateRequest(body)) {
            throw new ValidationError(ErrorMessages.INVALID_BIRTH_DATE);
        }

        const { birthDate, birthTime, gender, isTimeUnknown, calendarType, location } = body as SajuCalculateRequest;

        // 3. Validate date
        const birthDateTime = new Date(birthDate);
        if (isNaN(birthDateTime.getTime())) {
            throw new ValidationError(ErrorMessages.INVALID_BIRTH_DATE);
        }

        // Check if date is in the future
        if (birthDateTime > new Date()) {
            throw new ValidationError(ErrorMessages.FUTURE_DATE);
        }

        // Check if date is too old (before 1900)
        if (birthDateTime.getFullYear() < 1900) {
            throw new ValidationError(ErrorMessages.TOO_OLD_DATE);
        }

        // 4. Validate time format
        if (birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) {
            throw new ValidationError(ErrorMessages.INVALID_BIRTH_TIME);
        }

        // 5. Prepare calculation input
        const input: SajuCalculationInput = {
            birthDate: birthDateTime,
            birthTime: birthTime || '00:00',
            gender: gender,
            isTimeUnknown: !!isTimeUnknown,
            calendarType: calendarType || 'solar',
            ...(location && { location }),
        };

        // 6. Calculate Saju
        const result = await calculateHighPrecisionSaju(input);

        // 7. Format response
        const response: SajuCalculateResponse = {
            ...result,
            trueSolarTime: result.trueSolarTime.toISOString(),
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('[Saju Calculate API Error]:', error);

        // Handle specific error types
        if (error instanceof ValidationError) {
            return formatErrorResponse(error);
        }

        if (error instanceof Error) {
            // Wrap unknown errors as SajuCalculationError
            const sajuError = new SajuCalculationError(
                '사주 계산 중 오류가 발생했습니다',
                'CALCULATION_FAILED',
                { originalError: error.message }
            );
            return formatErrorResponse(sajuError);
        }

        // Unexpected error
        return formatErrorResponse(new Error(ErrorMessages.INTERNAL_ERROR));
    }
}

/**
 * Type guard for SajuCalculateRequest
 */
function isValidCalculateRequest(data: unknown): data is SajuCalculateRequest {
    if (typeof data !== 'object' || data === null) return false;
    const req = data as any;

    return (
        typeof req.birthDate === 'string' &&
        typeof req.birthTime === 'string' &&
        (req.gender === 'M' || req.gender === 'F') &&
        (!req.calendarType || req.calendarType === 'solar' || req.calendarType === 'lunar')
    );
}
