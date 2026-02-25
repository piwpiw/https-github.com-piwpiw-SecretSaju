---
description: Vitest 테스트 생성 — 함수 단위 테스트를 빠르게 생성
---

# Test Generator Skill

Vitest 기반 단위 테스트를 최소 비용으로 생성.

## Template

```typescript
import { describe, it, expect } from 'vitest';
import { {{FUNCTION}} } from '@/{{MODULE_PATH}}';

describe('{{FUNCTION}}', () => {
  it('정상 입력 시 올바른 결과', () => {
    const result = {{FUNCTION}}({{NORMAL_INPUT}});
    expect(result).{{MATCHER}}({{EXPECTED}});
  });

  it('경계값 처리', () => {
    const result = {{FUNCTION}}({{EDGE_INPUT}});
    expect(result).{{MATCHER}}({{EDGE_EXPECTED}});
  });

  it('잘못된 입력 시 에러/기본값', () => {
    expect(() => {{FUNCTION}}({{BAD_INPUT}})).toThrow();
    // 또는
    const result = {{FUNCTION}}({{BAD_INPUT}});
    expect(result).toBeNull();
  });
});
```

## Project Config

```
vitest.config.ts → src/__tests__/ 디렉토리
tsconfig paths: @/ → src/
```

## Testing Patterns

### 사주 엔진 테스트
```typescript
import { calculateSaju } from '@/lib/saju';

describe('calculateSaju', () => {
  it('2000-01-01 → 기준일 검증', () => {
    const result = calculateSaju(2000, 1, 1);
    expect(result).toBeDefined();
    expect(result.dayPillarIndex).toBeGreaterThanOrEqual(0);
    expect(result.dayPillarIndex).toBeLessThanOrEqual(59);
  });
});
```

### API Route 테스트
```typescript
// fetch mock 사용
const response = await fetch('/api/recommendations?code=GAP_JA&ageGroup=20s');
const data = await response.json();
expect(data.success).toBe(true);
```

### Validation 테스트
```typescript
import { validateBirthInput } from '@/lib/validation';

describe('validateBirthInput', () => {
  it('미래 날짜 거절', () => {
    const result = validateBirthInput({ year: 2030, month: 1, day: 1 });
    expect(result.isValid).toBe(false);
  });
});
```

## Steps

### 1. 대상 함수 확인
// turbo
- `view_code_item`으로 함수 시그니처만 확인

### 2. 테스트 생성
- `write_to_file`로 `src/__tests__/` 에 생성

### 3. 실행
// turbo
- `npx vitest run --reporter=verbose 2>&1 | Select-Object -Last 20`

## Cost Rules
- **예산**: 최대 6 tool calls
