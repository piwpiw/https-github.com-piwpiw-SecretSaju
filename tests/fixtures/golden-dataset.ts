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
  truthSourceClass?: 'commercial_regression' | 'policy_contract' | 'engine_policy_regression';
  input: {
    birthDate: Date;
    birthTime: string;
    location: Location;
    gender: 'M' | 'F';
    calendarType?: 'solar' | 'lunar';
    lineageProfileId?: string;
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

function civilDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export const GOLDEN_DATASET: GoldenCase[] = [
  {
    id: 'STD-001',
    description: '1990년 5월 15일 14:30 남자 (서울)',
    truthSourceClass: 'commercial_regression',
    input: {
      birthDate: civilDate(1990, 5, 15),
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
    truthSourceClass: 'commercial_regression',
    input: {
      birthDate: civilDate(1984, 2, 4),
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
    truthSourceClass: 'commercial_regression',
    input: {
      birthDate: civilDate(1984, 2, 4),
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
    truthSourceClass: 'policy_contract',
    input: {
      birthDate: civilDate(2024, 1, 1),
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
    truthSourceClass: 'policy_contract',
    input: {
      birthDate: civilDate(2024, 1, 2),
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
    truthSourceClass: 'commercial_regression',
    input: {
      birthDate: civilDate(1990, 4, 21),
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
    truthSourceClass: 'policy_contract',
    input: {
      birthDate: civilDate(1982, 2, 20),
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
  {
    id: 'POL-CIVIL-2330',
    description: '2024년 1월 1일 23:30 (civil_reference는 자시를 민간시 그대로 유지)',
    truthSourceClass: 'policy_contract',
    input: {
      birthDate: civilDate(2024, 1, 1),
      birthTime: '23:30',
      location: KOREA_LOCATIONS.SEOUL,
      gender: 'F',
      lineageProfileId: 'civil_reference',
    },
    expected: {
      fourPillars: {
        year: '계묘',
        month: '갑자',
        day: '갑자',
        hour: '갑자',
      },
    },
  },
  {
    id: 'HIS-DST-1988',
    description: '1988년 6월 1일 12:00 (서울 DST 기록 포함)',
    truthSourceClass: 'engine_policy_regression',
    input: {
      birthDate: civilDate(1988, 6, 1),
      birthTime: '12:00',
      location: KOREA_LOCATIONS.SEOUL,
      gender: 'M',
      lineageProfileId: 'modern_precision',
    },
    expected: {
      fourPillars: {
        year: '무진',
        month: '정사',
        day: '정해',
        hour: '병오',
      },
    },
  },
  {
    id: 'POL-STRICT-2355',
    description: '2024년 1월 1일 23:55 (modern_precision은 해시로 내려가도 엄격 야자시 stem 사용)',
    truthSourceClass: 'policy_contract',
    input: {
      birthDate: civilDate(2024, 1, 1),
      birthTime: '23:55',
      location: KOREA_LOCATIONS.SEOUL,
      gender: 'F',
      lineageProfileId: 'modern_precision',
    },
    expected: {
      fourPillars: {
        year: '계묘',
        month: '갑자',
        day: '갑자',
        hour: '정해',
      },
    },
  },
];
