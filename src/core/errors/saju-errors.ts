/**
 * Saju Engine Error Definitions
 * 
 * Provides structured error handling for the Saju engine.
 */

export class SajuError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: Record<string, any>
    ) {
        super(message);
        this.name = 'SajuError';
    }
}

export class SajuValidationError extends SajuError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'VALIDATION_ERROR', context);
        this.name = 'SajuValidationError';
    }
}

export class SajuCalculationError extends SajuError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'CALCULATION_ERROR', context);
        this.name = 'SajuCalculationError';
    }
}

export class SajuResultError extends SajuError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'RESULT_ERROR', context);
        this.name = 'SajuResultError';
    }
}
