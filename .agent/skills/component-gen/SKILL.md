---
name: component-gen
description: 럭셔리 프리미엄 UI 컴포넌트 생성 — 설계 기반 원샷 생성
---

# 🎨 Component Generator Skill

프로젝트의 **Premium Mystic** 디자인 가이드를 준수하는 React 컴포넌트를 생성합니다.

---

## 🚀 MCP Sequence (실행 시퀀스)

1. **DESIGN_CHECK**: `view_file` → `.agent/CONTEXT_ENGINE.md` §5 Design System 로드
2. **TOKEN_SCAN**: `view_file` → `src/app/globals.css`에서 관련 변수 확보
3. **STRUCTURE_PLAN**: `view_file_outline` → `src/components/` (기존 컴포넌트와 중복 확인)
4. **GENERATION**: `write_to_file` → 컴포넌트 생성 (Framer Motion 필수)
5. **QA_LINT**: `run_command` → `npx tsc --noEmit`

---

## 💎 Premium Design Standard

```tsx
/**
 * 1. Framer Motion 필수
 * 2. Glassmorphism 필수 (bg-white/5 backdrop-blur-md)
 * 3. Primary Gradient (cyan-400 to purple-500)
 */
import { motion } from 'framer-motion';

export const PremiumComponent = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
  >
    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-bold">
      Title
    </h3>
  </motion.div>
);
```

---

## 🔄 Auto-Collaboration Trigger (자동 협업)

- 컴포넌트 생성 완료 시 → **T10 Growth**에 Handoff (Analytics 이벤트 삽입 요청)
- 신규 토큰 필요 시 → **T6 Design**에 즉시 Handoff
