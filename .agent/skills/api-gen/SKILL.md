---
name: api-gen
description: Next.js API Route 생성 — 표준 에러핸들링과 검증 포함
---

# API Route Generator Skill

Next.js App Router API route를 프로젝트 표준에 맞게 생성.
**Context Engineering**: 생성 전 기존 API 현황 확인 필수.

---

## Pre-Flight Check (생성 전 필수)
```
1. grep_search → "src/app/api/" (기존 API 목록 파악, 중복 생성 방지)
2. view_file → src/lib/supabase.ts (클라이언트 함수 명 확인)
3. CONTEXT_ENGINE.md §8 Error Catalog → Supabase/Toss 에러 패턴 확인
```

---

## Template

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * {{METHOD}} /api/{{PATH}}
 * @description {{DESCRIPTION}}
 * @team T3 Backend
 */
export async function {{METHOD}}(request: NextRequest) {
  try {
    // 1. Authentication check (T9 Security 패턴 준수)
    {{AUTH_CHECK}}

    // 2. Input validation
    {{VALIDATION}}

    // 3. Business logic
    {{LOGIC}}

    // 4. Response
    return NextResponse.json({ success: true, data: result });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[API] /api/{{PATH}} error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
    );
  }
}
```

---

## Standards

### Request Parsing
```typescript
// GET
const { searchParams } = new URL(request.url);
const param = searchParams.get('key');

// POST
const body = await request.json();
const { field1, field2 } = body;
```

### Validation Pattern
```typescript
if (!field || typeof field !== 'string') {
  return NextResponse.json(
    { success: false, error: 'Missing required parameter: field' },
    { status: 400 }
  );
}
```

### Supabase Pattern
```typescript
import { getSupabaseAdmin } from '@/lib/supabase';
const supabase = getSupabaseAdmin();
const { data, error } = await supabase.from('table').select('*').eq('col', val);
if (error) throw error;
```

### Cache Headers
```typescript
// Static data
headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
// Private data
headers: { 'Cache-Control': 'no-store' }
```

---

## Execution Steps

### 1. Pre-Flight (Context 확인)
- 기존 API 탐색 (중복 방지)
- 인증 필요 여부 T9 Security 패턴 참조

### 2. 파일 생성
```
write_to_file → src/app/api/{{PATH}}/route.ts
```
Template 적용, 변수 치환, 인증 미들웨어 연결

### 3. 타입 검증
// turbo
```powershell
npx tsc --noEmit
```

### 4. Handoff (T2 Frontend용 API 계약서)
```json
{ "endpoint": "METHOD /api/path", "request": {}, "response": {} }
```

---

## Cost Rules
- **예산**: 최대 5 tool calls (Pre-Flight 포함)
