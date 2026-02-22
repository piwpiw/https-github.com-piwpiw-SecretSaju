import { KOREA_LOCATIONS } from '@/core/astronomy/true-solar-time';

/**
 * Golden Dataset for Saju Engine Validation
 * 
 * 검증된 사주 데이터셋 (Ground Truth)
 * - 기준: sajuplus.net 및 한국천문연구원 만세력
 * - 용도: 자동화 테스트 및 회귀 테스트
 */

type Location = {
    latitude: number;
    longitude: number;
    name?: string; // KOREA_LOCATIONS.SEOUL has a name, but some test cases provide only lat/lon
};

export interface GoldenCase {
    id: string;
    description: string;
    input: {
        birthDate: Date;
        birthTime: string;
        location: Location;
        gender: 'M' | 'F';
        calendarType?: 'solar' | 'lunar';
        useYaJaSi?: boolean;
    };
    expected: {
        pillars?: {
            year: string;
            month: string;
            day: string;
            hour: string;
        };
        fourPillars?: {
            year: string;
            month: string;
            day: string;
            hour: string;
        };
        gyeokguk?: string; // 예: "정관격"
        daewunStart?: number; // 대운수
    };
}

export const GOLDEN_DATASET: GoldenCase[] = [
    // 1. 표준 케이스 (일반적인 시간)
    {
        id: 'STD-001',
        description: '1990년 5월 15일 14:30 남자 (서울)',
        input: {
            birthDate: new Date('1990-05-15'),
            birthTime: '14:30',
            location: KOREA_LOCATIONS.SEOUL,
            gender: 'M',
            useYaJaSi: true,
        },
        expected: {
            fourPillars: {
                year: '경오',
                month: '신사',
                day: '경진', // 1990-05-15 Correct
                hour: '계미', // 14:30 -> 미시 (경진일 계미시)
            },
            gyeokguk: '기타', // TODO: Implement real Gyeokguk logic (currently placeholder)
            daewunStart: 2,
        },
    },

    // 2. 입춘 경계 (입춘 전)
    // 1984년 입춘: 2월 4일 23:18
    {
        id: 'BND-IPCHUN-PRE',
        description: '1984년 2월 4일 12:00 (입춘 전)',
        input: {
            birthDate: new Date('1984-02-04'),
            birthTime: '12:00',
            location: KOREA_LOCATIONS.SEOUL,
            gender: 'M',
            useYaJaSi: true,
        },
        expected: {
            fourPillars: {
                year: '계해', // 아직 1983년 기운
                month: '을축',
                day: '무진', // 무진일
                hour: '무오', // 무진일의 오시 -> 무오시
            },
            daewunStart: 5, // 역행: 입춘(2/4) -> 대한(1/21) 14일 / 3 = 4.66 -> 5 (반올림)
        },
    },

    // 3. 입춘 경계 (입춘 후 -> 전으로 밀림?)
    // 1984년 2월 4일 23:30 -> 진태양시 22:58.
    // 절기(입춘)는 절대시간(23:18) 기준이므로 표준시 23:30은 입춘 후!
    // 년주, 월주는 입춘 후(1984) 적용.
    // 시주는 진태양시(22:58) 기준 해시(21:30-23:30) 적용.
    {
        id: 'BND-IPCHUN-POST',
        description: '1984년 2월 4일 23:30 (입춘 후 표준시, 해시 진태양시)',
        input: {
            birthDate: new Date('1984-02-04'),
            birthTime: '23:30',
            location: KOREA_LOCATIONS.SEOUL,
            gender: 'M',
            useYaJaSi: true,
        },
        expected: {
            fourPillars: {
                year: '갑자', // 입춘 후 (표준시 기준)
                month: '병인',
                day: '무진', // 무진일
                hour: '계해', // 무진일의 해시 -> 계해시 (진태양시 22:58)
            },
        },
    },

    // 4. 야자시 테스트 (밤 11시 30분 -> 10시 58분)
    // 2024-01-01 23:30 -> 22:58 (해시)
    {
        id: 'BND-YAJASI',
        description: '2024년 1월 1일 23:30 (진태양시 보정 -> 해시)',
        input: {
            birthDate: new Date('2024-01-01'),
            birthTime: '23:30',
            location: KOREA_LOCATIONS.SEOUL,
            gender: 'F',
            useYaJaSi: true,
        },
        expected: {
            fourPillars: {
                year: '계묘',
                month: '갑자',
                day: '갑자',
                hour: '을해', // 해시 (22:58)
            },
        },
    },

    // 5. 조자시 테스트 (새벽 0시 30분 -> 전날 밤 11시 58분)
    // 2024-01-02 00:30 -> 2024-01-01 23:58 (자시)
    // 일주는 표준시 기준 (1월 2일 을축)
    // 시주는 진태양시 기준 (23:58 자시) -> 을축일의 자시 (병자)
    {
        id: 'BND-JOJASI',
        description: '2024년 1월 2일 00:30 (표준시 일주, 진태양시 시주)',
        input: {
            birthDate: new Date('2024-01-02'),
            birthTime: '00:30',
            location: KOREA_LOCATIONS.SEOUL,
            gender: 'F',
            useYaJaSi: true,
        },
        expected: {
            fourPillars: {
                year: '계묘',
                month: '갑자',
                day: '을축', // 표준시 기준 다음날
                hour: '병자', // 을축일의 자시
            },
        },
    },

    // 6. 윤달 및 평달 체크
    {
        id: 'BND-LUNAR-001',
        description: '1990년 음력 4월 21일 14:30 남자 (서울) - 05-15 호환',
        input: {
            birthDate: new Date('1990-04-21'),
            birthTime: '14:30',
            location: { latitude: 37.5665, longitude: 126.978 },
            gender: 'M',
            calendarType: 'lunar',
        },
        expected: {
            fourPillars: {
                year: '경오',
                month: '신사',
                day: '경진',
                hour: '계미',
            },
        },
    },
];
