# Coding Standards - Secret Saju

**TypeScript/React Best Practices**

---

## 🎯 Core Principles

1. **Clarity > Cleverness**: Write code for humans, not machines
2. **Consistency > Personal Preference**: Follow team standards
3. **Type Safety > Flexibility**: Strict TypeScript always
4. **Tested > Untested**: Write tests for critical logic

---

## 📝 File Naming

### Convention: `kebab-case.tsx`

```
✅ Good:
src/components/birth-input-form.tsx
src/lib/kakao-auth.ts
src/app/api/saju/calculate/route.ts

❌ Bad:
src/components/BirthInputForm.tsx  // PascalCase
src/lib/kakaoAuth.ts                // camelCase
src/app/api/SajuCalculate.ts        // Mixed
```

**Exception**: React components export PascalCase:
```typescript
// File: birth-input-form.tsx
export function BirthInputForm() { ... }
```

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Routes
│   ├── layout.tsx
│   └── api/                # API endpoints
│       └── */route.ts
├── components/             # React components
│   ├── ui/                 # Reusable UI (buttons, inputs)
│   └── [feature]/          # Feature-specific
├── core/                   # Business logic (pure functions)
│   ├── api/
│   ├── astronomy/
│   ├── calendar/
│   └── myeongni/
├── lib/                    # Utilities & integrations
│   ├── supabase.ts
│   ├── kakao-auth.ts
│   └── errors.ts
├── types/                  # TypeScript types
│   └── api.ts
└── config/                 # Configuration
    └── env.ts
```

---

## 💻 TypeScript Standards

### 1. **Always Use Strict Mode**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 2. **Explicit Return Types** (for public functions)

```typescript
// ✅ Good: Clear contract
export function calculateAge(birthDate: Date): number {
  return new Date().getFullYear() - birthDate.getFullYear();
}

// ❌ Bad: Inferred return type (unclear)
export function calculateAge(birthDate: Date) {
  return new Date().getFullYear() - birthDate.getFullYear();
}
```

### 3. **Interface vs Type**

**Use `interface` for**:
- Object shapes
- Extendable contracts

**Use `type` for**:
- Unions
- Primitives
- Complex types

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

type Gender = 'M' | 'F';
type CalendarType = 'solar' | 'lunar';

// ❌ Bad
type User = {
  id: string;
  name: string;
};
```

### 4. **No `any` (ever)**

```typescript
// ❌ Bad
function process(data: any) { ... }

// ✅ Good: Use `unknown` if type is truly unknown
function process(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}

// ✅ Better: Define the type
interface ProcessInput {
  birthDate: string;
  gender: Gender;
}
function process(data: ProcessInput) { ... }
```

### 5. **Null Safety**

```typescript
// ✅ Good: Handle null/undefined
function getName(user?: User): string {
  return user?.name ?? 'Unknown';
}

// ❌ Bad: Can crash
function getName(user?: User): string {
  return user.name; // Error if user is undefined
}
```

---

## ⚛️ React Standards

### 1. **Function Components Only**

```typescript
// ✅ Good: Function component
export function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// ❌ Bad: Class component (legacy)
export class MyComponent extends React.Component { ... }
```

### 2. **Props Interface**

```typescript
// ✅ Good: Explicit interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ Bad: Inline props
export function Button({ label, onClick }: { label: string; onClick: () => void }) { ... }
```

### 3. **Client vs Server Components**

```typescript
// Server Component (default in App Router)
export default function Page() {
  const data = await fetch(...); // Can use async/await
  return <div>{data}</div>;
}

// Client Component (for interactivity)
'use client';

export function Counter() {
  const [count, setCount] = useState(0); // Needs 'use client'
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Rule**: Only add `'use client'` when needed (hooks, event handlers).

### 4. **Custom Hooks**

```typescript
// ✅ Good: Reusable logic
function useUser() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  
  return user;
}

// Usage
function Profile() {
  const user = useUser();
  return <div>{user?.name}</div>;
}
```

**Naming**: Always prefix with `use`

---

## 🎨 Component Standards

### 1. **Component File Structure**

```typescript
// birth-input-form.tsx

'use client'; // If needed

import { useState } from 'react';
import type { BirthInfo } from '@/types';

// 1. Types/Interfaces
interface BirthInputFormProps {
  onSubmit: (data: BirthInfo) => void;
}

// 2. Main Component
export function BirthInputForm({ onSubmit }: BirthInputFormProps) {
  const [date, setDate] = useState('');
  
  const handleSubmit = () => {
    onSubmit({ date, time: '12:00' });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
}

// 3. Helper functions (if small)
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ko-KR');
}
```

### 2. **Conditional Rendering**

```typescript
// ✅ Good: Clear and explicit
{isLoading ? <Spinner /> : <Content />}
{user && <WelcomeMessage name={user. name} />}
{error && <ErrorBanner message={error.message} />}

// ❌ Bad: Too complex
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Content data={data} /> : null}

// ✅ Better: Extract to variable
const content = isLoading ? <Spinner />
  : error ? <Error />
  : data ? <Content data={data} />
  : null;

return <div>{content}</div>;
```

### 3. **Event Handlers**

```typescript
// ✅ Good: Named functions
function handleClick() {
  console.log('Clicked');
}

<button onClick={handleClick}>Click</button>

// ⚠️ Acceptable: Inline for simple cases
<button onClick={() => setCount(count + 1)}>+</button>

// ❌ Bad: Complex inline
<button onClick={() => {
  const result = doSomething();
  if (result) {
    updateState(result);
    sendAnalytics();
  }
}}>Click</button>
```

---

## 🎨 Styling Standards

### 1. **TailwindCSS Classes**

```typescript
// ✅ Good: Logical grouping
<div className="
  flex items-center justify-between
  p-4 mb-2
  bg-white rounded-lg shadow-md
  hover:shadow-lg transition-shadow
">
  ...
</div>

// ❌ Bad: Random order, too long
<div className="transition-shadow hover:shadow-lg p-4 mb-2 rounded-lg flex bg-white items-center shadow-md justify-between">
```

### 2. **Conditional Classes**

```typescript
import { cn } from '@/lib/utils'; // clsx + tailwind-merge

// ✅ Good: Helper function
<button className={cn(
  "px-4 py-2 rounded",
  variant === 'primary' && "bg-purple-600 text-white",
  variant === 'secondary' && "bg-gray-200 text-gray-800",
  disabled && "opacity-50 cursor-not-allowed"
)}>
  {label}
</button>
```

### 3. **Responsive Design**

```typescript
// ✅ Good: Mobile-first
<div className="
  w-full          // Mobile: full width
  md:w-1/2        // Tablet: half width
  lg:w-1/3        // Desktop: one-third width
">
```

---

## 🔧 API Route Standards

### 1. **File Structure**

```typescript
// src/app/api/saju/calculate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse input
    const body = await request.json();
    
    // 2. Validate
    if (!isValid(body)) {
      throw new ValidationError('Invalid input');
    }
    
    // 3. Process
    const result = await processData(body);
    
    // 4. Return
    return NextResponse.json(result);
    
  } catch (error) {
    return formatErrorResponse(error);
  }
}
```

### 2. **Error Handling**

```typescript
// ✅ Good: Use custom errors
throw new ValidationError(ErrorMessages.INVALID_BIRTH_DATE);

// ❌ Bad: Generic errors
throw new Error('Invalid date');
```

---

## 📦 Import Standards

### 1. **Import Order**

```typescript
// 1. React & Next.js
import { useState } from 'react';
import { NextRequest } from 'next/server';

// 2. External libraries
import { format } from 'date-fns';

// 3. Internal utilities
import { calculateSaju } from '@/core/api/saju-engine';
import { formatErrorResponse } from '@/lib/errors';

// 4. Types
import type { SajuInput, SajuResult } from '@/types/api';

// 5. Styles (if any)
import './styles.css';
```

### 2. **Path Aliases**

```typescript
// ✅ Good: Use @/ alias
import { Button } from '@/components/ui/button';
import { calculateSaju } from '@/core/api/saju-engine';

// ❌ Bad: Relative paths
import { Button } from '../../../components/ui/button';
import { calculateSaju } from '../../../../core/api/saju-engine';
```

---

## 🧪 Testing Standards

### 1. **Test File Naming**

```
src/core/calendar/ganji.ts      → ganji.test.ts
src/components/button.tsx       → button.test.tsx
```

### 2. **Test Structure**

```typescript
// ganji.test.ts
import { describe, it, expect } from 'vitest';
import { get60Ganji } from './ganji';

describe('get60Ganji', () => {
  it('should return correct ganji for known date', () => {
    const result = get60Ganji(new Date('1990-01-01'));
    expect(result).toEqual({ stem: '己', branch: '巳' });
  });
  
  it('should handle leap years', () => {
    // ...
  });
  
  it('should throw error for invalid dates', () => {
    expect(() => get60Ganji(new Date('invalid'))).toThrow();
  });
});
```

---

## 📐 Code Formatting

### 1. **Prettier Config**

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Run**: `npm run format`

### 2. **ESLint Rules**

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "no-console": "warn",           // Prevent console.log in production
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

**Run**: `npm run lint`

---

## 💬 Comments & Documentation

### 1. **When to Comment**

```typescript
// ✅ Good: Complex algorithm
/**
 * Calculate True Solar Time by adjusting for longitude difference.
 * Korea Standard Time is based on 135°E, so we need to correct for the
 * observer's actual longitude to get accurate hour pillar.
 */
function getTrueSolarTime(date: Date, longitude: number): Date {
  const offset = (longitude - 135) * 4; // 4 minutes per degree
  return new Date(date.getTime() + offset * 60 * 1000);
}

// ❌ Bad: Obvious code
// Increment counter by 1
counter = counter + 1;
```

### 2. **JSDoc for Public APIs**

```typescript
/**
 * Calculate high-precision saju (Four Pillars) for a given birth time.
 * 
 * @param input - Birth information including date, time, gender
 * @returns Complete saju analysis with elements, gods, and fortune periods
 * @throws {ValidationError} If birth date is invalid or in the future
 * 
 * @example
 * ```typescript
 * const result = await calculateHighPrecisionSaju({
 *   birthDate: new Date('1990-01-15'),
 *   birthTime: '14:30',
 *   gender: 'M'
 * });
 * ```
 */
export async function calculateHighPrecisionSaju(input: SajuInput): Promise<SajuResult> {
  // ...
}
```

---

## 🚨 Common Mistakes to Avoid

### 1. **State Management**

```typescript
// ❌ Bad: Mutating state
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Don't do this!

// ✅ Good: Create new array
setItems([...items, 4]);
```

### 2. **useEffect Dependencies**

```typescript
// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId should be in deps!

// ✅ Good: Complete dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 3. **Async/Await in useEffect**

```typescript
// ❌ Bad: Can't make useEffect async
useEffect(async () => {
  const data = await fetchData();
}, []);

// ✅ Good: IIFE or separate function
useEffect(() => {
  (async () => {
    const data = await fetchData();
    setData(data);
  })();
}, []);
```

---

## ✅ Pre-Commit Checklist

Before every commit:

- [ ] `npm run lint` passes
- [ ] `npm run type-check` (or `tsc --noEmit`) passes  
- [ ] Tests pass (`npm run test`)
- [ ] No `console.log` statements (except intentional)
- [ ] No `any` types
- [ ] Imports cleaned up (no unused)

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Best Practices](https://react.dev/learn)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

**Document Owner**: Engineering Team Lead  
**Last Updated**: 2026-01-31  
**Enforced By**: ESLint + Prettier + Code Reviews
