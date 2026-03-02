import { KOREA_LOCATIONS } from '@/core/astronomy/true-solar-time';

/**
 * Golden Dataset for Saju Engine Validation
 * 기준: 검증된 만세력 결과(절기/진태양시 포함)
 */

type Location = {
  latitude: number;
  longitude: number;
  name?: string;
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
    isTimeUnknown?: boolean;
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
    gyeokguk?: string;
    daewunStart?: number;
  };
}

export const GOLDEN_DATASET: GoldenCase[] = [
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
        day: '경진',
        hour: '계미',
      },
    },
  },
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
        year: '계해',
        month: '을축',
        day: '무진',
        hour: '정사',
      },
    },
  },
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
        year: '갑자',
        month: '병인',
        day: '무진',
        hour: '계해',
      },
    },
  },
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
        hour: '을해',
      },
    },
  },
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
        day: '을축',
        hour: '병자',
      },
    },
  },
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
  {
    id: 'REF-UNKNOWN-TIME-001',
    description: '1982년 2월 20일 00:00 남자 (서울) - 시간 미상 시주 갑자 기준',
    input: {
      birthDate: new Date('1982-02-20'),
      birthTime: '00:00',
      location: KOREA_LOCATIONS.SEOUL,
      gender: 'M',
      isTimeUnknown: true,
    },
    expected: {
      fourPillars: {
        year: '임술',
        month: '임인',
        day: '갑술',
        hour: '갑자',
      },
    },
  },
];
