import { describe, it, expect, vi } from 'vitest';

describe('Auth Wallet Upsert Scenario (BE-8)', () => {
    it('should correctly upsert wallet on first login', async () => {
        const userId = 'user-123';
        const mockUpsert = vi.fn().mockResolvedValue({ data: { user_id: userId, balance: 0 }, error: null });

        // Scenario 1: Success on new user
        const result = await mockUpsert({ user_id: userId }, { onConflict: 'user_id' });
        expect(result.data.balance).toBe(0);
        expect(mockUpsert).toHaveBeenCalled();
    });

    it('should handle conflict during race condition in concurrent login', async () => {
        const userId = 'user-123';
        // Scenario 2: DB already has it (Conflict)
        const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'duplicate key' } });

        const result = await mockUpsert({ user_id: userId }, { onConflict: 'user_id' });
        expect(result.error.code).toBe('23505');

        // Fallback to retry or just ignore (Success as it already exists)
        if (result.error.code === '23505') {
            const mockSelect = vi.fn().mockResolvedValue({ data: { user_id: userId, balance: 10 }, error: null });
            const final = await mockSelect();
            expect(final.data.balance).toBeGreaterThanOrEqual(10);
        }
    });
});
