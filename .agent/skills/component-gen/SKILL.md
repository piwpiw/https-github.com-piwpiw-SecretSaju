---
description: React 컴포넌트 생성 — 프로젝트 표준에 맞는 컴포넌트 빠른 생성
---

# Component Generator Skill

프로젝트 표준(Tailwind + Framer Motion + 디자인 토큰)에 맞는 React 컴포넌트를 빠르게 생성.

## Template

```tsx
'use client';

import { motion } from 'framer-motion';

interface {{NAME}}Props {
  // props
}

export default function {{NAME}}({ }: {{NAME}}Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/10"
    >
      {/* Content */}
    </motion.div>
  );
}
```

## Design Standards

### Colors (CSS Variables)
- Primary: `text-primary`, `bg-primary` → `#7C3AED`
- Secondary: `text-secondary`, `bg-secondary` → `#F59E0B`
- Background: `bg-background` → `#09090B`
- Foreground: `text-foreground` → `#FAFAFA`
- Zinc tones: `text-zinc-400`, `text-zinc-500` (보조 텍스트)

### Glass Effect
```tsx
className="glass rounded-2xl p-6 border border-white/10"
// = bg-[var(--surface)] backdrop-blur-xl border border-white/10
```

### Gradient Patterns
```tsx
// Header gradient (primary/violet)
className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700"
// CTA button (amber/yellow)
className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold"
// Neon cyber
className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)]"
```

### Animation Patterns
```tsx
// Entry: fade + slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Staggered list
transition={{ delay: index * 0.1 }}

// Hover: scale
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}

// Float (CSS class)
className="antigravity"
```

### Font Family
- 본문: `font-sans` → Noto Sans KR
- 제목/숫자: `font-display` → Do Hyeon

## Steps

### 1. 표준 확인
// turbo
- 이 SKILL.md의 Template & Design Standards 참조

### 2. 컴포넌트 생성
- `write_to_file`로 `src/components/` 에 생성
- Template의 `{{NAME}}`을 실제 이름으로 교체

### 3. 빌드 확인
// turbo
- `npx tsc --noEmit`

## Cost Rules
- **예산**: 최대 5 tool calls
- **원칙**: 기존 컴포넌트 참조 불필요, 이 템플릿 사용
