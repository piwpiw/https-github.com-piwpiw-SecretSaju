import { describe, it, expect } from 'vitest';
import * as Astro from '@/core/astronomy/true-solar-time';

describe('Astronomy Core: True Solar Time', () => {
    it('should calculate true solar time correctly for Seoul', () => {
        console.log('Available exports:', Object.keys(Astro));

        // 2024-01-01 12:00:00 KST
        const date = new Date('2024-01-01T12:00:00+09:00');
        const location = Astro.KOREA_LOCATIONS.SEOUL;

        // 서울 경도 126.98 (표준 135) -> -8.02도 차이
        // 1도 = 4분 -> 약 -32분
        // EOT 1월 1일 -> 약 -3분
        // 총 보정: 약 -35분 -> 11:25분 예상

        const trueTime = Astro.calculateTrueSolarTime(date, location);

        // Check if it's strictly a Date object
        expect(trueTime).toBeInstanceOf(Date);

        // Roughly check if it's shifted correctly (earlier than standard time)
        expect(trueTime.getTime()).toBeLessThan(date.getTime());
    });
});
