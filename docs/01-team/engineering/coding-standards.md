# Coding Standards - Secret Saju (압축 요약)

## 핵심 원칙
1. **Clarity > Cleverness** — 사람이 읽는 코드
2. **Consistency > Personal Preference** — 팀 표준 우선
3. **Type Safety > Flexibility** — strict TypeScript 항상
4. **Tested > Untested** — 핵심 로직은 테스트 필수

## 파일 명명
- 파일명: `kebab-case.tsx` (예: `birth-input-form.tsx`)
- 컴포넌트 export: `PascalCase` (예: `export function BirthInputForm`)
- API 라우트: `src/app/api/[feature]/route.ts`

## TypeScript 규칙

```typescript
// ✅ strict mode 필수 (tsconfig)
// ✅ public 함수는 return type 명시
// ✅ 객체 → interface, 유니온/프리미티브 → type
// ❌ any 절대 금지 → unknown 또는 구체적 타입 사용
// ✅ Null safety: user?.name ?? 'Unknown'

type Gender = 'M' | 'F';
interface User { id: string; name: string; }
```

## React 규칙

```typescript
// ✅ 함수형 컴포넌트만 사용 (class 컴포넌트 금지)
// ✅ Props는 명시적 interface로 선언
// ✅ 'use client'는 hooks/이벤트 핸들러 필요할 때만
// ✅ Custom hook은 항상 use 접두사

// 조건부 렌더링: 복잡하면 변수로 추출
const content = isLoading ? <Spinner /> : <Content />;
```

## 스타일링

```typescript
// cn() 유틸리티 사용 (clsx + tailwind-merge)
import { cn } from '@/lib/app/utils';
<button className={cn("base", variant === 'primary' && "bg-purple-600")} />

// Mobile-first responsive: w-full md:w-1/2 lg:w-1/3
```

## API Route 구조

```typescript
// parse → validate → process → return
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValid(body)) throw new ValidationError('...');
    const result = await processData(body);
    return NextResponse.json(result);
  } catch (error) {
    return formatErrorResponse(error);
  }
}
// 에러: 커스텀 에러 클래스 사용 (throw new ValidationError(...))
```

## Import 순서

```typescript
// 1. React/Next.js
// 2. 외부 라이브러리
// 3. 내부 (@/ alias 사용, 상대경로 금지)
// 4. type imports
import type { SajuInput } from '@/types/api';
```

## 테스트 (Vitest)

```typescript
// 파일: ganji.ts → ganji.test.ts
describe('get60Ganji', () => {
  it('should return correct ganji', () => { ... });
  it('should handle edge cases', () => { ... });
});
```

## 포맷팅
```json
// .prettierrc: semi:true, singleQuote:true, tabWidth:2, printWidth:100
// .eslintrc: no-console:warn, no-unused-vars:error, no-explicit-any:error
```

**명령어**: `npm run lint` / `npm run format` / `npx tsc --noEmit`

Last Updated: 2026-03-08
