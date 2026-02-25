---
description: Next.js API Route 생성 — 표준 에러핸들링과 검증 포함
---

# API Route Generator Skill

Next.js App Router API route를 프로젝트 표준에 맞게 생성.

## Template

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * {{METHOD}} /api/{{PATH}}
 * @description {{DESCRIPTION}}
 */
export async function {{METHOD}}(request: NextRequest) {
  try {
    // 1. Input validation
    {{VALIDATION}}

    // 2. Business logic
    {{LOGIC}}

    // 3. Response
    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('[API] /api/{{PATH}} error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
```

## Standards

### Request Parsing
```typescript
// GET: URL params
const { searchParams } = new URL(request.url);
const code = searchParams.get('code');

// POST: JSON body
const body = await request.json();
const { field1, field2 } = body;
```

### Validation Pattern
```typescript
if (!code || typeof code !== 'string') {
  return NextResponse.json(
    { success: false, error: 'Missing required parameter: code' },
    { status: 400 }
  );
}
```

### Supabase Usage
```typescript
import { getSupabaseAdmin } from '@/lib/supabase';

const supabase = getSupabaseAdmin();
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

if (error) throw error;
```

### Response Format
```typescript
// 성공
{ success: true, data: {…} }

// 실패
{ success: false, error: "Error message" }
```

### Cache Headers
```typescript
// 캐시 가능 (정적 데이터)
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
});

// 캐시 불가 (개인 데이터)
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'no-store' }
});
```

## Steps

### 1. API 파일 생성
- `write_to_file`로 `src/app/api/{{PATH}}/route.ts` 생성
- Template 적용, 변수 치환

### 2. 타입 검증
// turbo
- `npx tsc --noEmit`

## Cost Rules
- **예산**: 최대 5 tool calls
