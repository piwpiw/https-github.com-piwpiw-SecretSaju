# Design System - Secret Saju

**UI/UX Design Standards & Component Library**

---

## 🎨 Design Philosophy

### Core Principles

1. **Mystic yet Modern**: Blend traditional Korean aesthetics with contemporary UI design
2. **Clear Hierarchy**: Information should be scannable at a glance
3. **Micro-interactions**: Subtle animations enhance delight without distraction  
4. **Accessible**: WCAG 2.1 AA compliance minimum

---

## 🎨 Color Palette

### Theme: Mystic (Default)

```css
/* Primary Colors */
--color-primary-50:  #faf5ff;   /* Lightest purple */
--color-primary-100: #f3e8ff;
--color-primary-200: #e9d5ff;
--color-primary-300: #d8b4fe;
--color-primary-400: #c084fc;
--color-primary-500: #a855f7;   /* Brand purple */
--color-primary-600: #9333ea;   /* Primary CTA */
--color-primary-700: #7e22ce;
--color-primary-800: #6b21a8;
--color-primary-900: #581c87;   /* Darkest purple */

/* Neutral Colors */
--color-gray-50:  #fafafa;
--color-gray-100: #f4f4f5;
--color-gray-200: #e4e4e7;
--color-gray-300: #d4d4d8;
--color-gray-400: #a1a1aa;
--color-gray-500: #71717a;
--color-gray-600: #52525b;   /* Body text */
--color-gray-700: #3f3f46;
--color-gray-800: #27272a;   /* Headings */
--color-gray-900: #18181b;   /* Almost black */

/* Semantic Colors */
--color-success: #10b981;    /* Green */
--color-warning: #f59e0b;    /* Orange */
--color-error: #ef4444;      /* Red */
--color-info: #3b82f6;       /* Blue */

/* Five Elements */
--color-wood: #059669;       /* 木 (녹색) */
--color-fire: #dc2626;       /* 火 (빨강) */
--color-earth: #d97706;      /* 土 (갈색/금색) */
--color-metal: #cbd5e1;      /* 金 (은색) */
--color-water: #1e40af;      /* 水 (남색) */
```

### Theme: Minimal

```css
/* Primary Colors */
--color-primary-500: #000000;   /* Pure black */
--color-primary-600: #171717;

/* Backgrounds */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9fafb;

/* Text */
--color-text-primary: #111827;
--color-text-secondary: #6b7280;
```

### Theme: Cyber

```css
/* Neon Colors */
--color-primary-500: #06b6d4;   /* Cyan */
--color-accent: #ec4899;        /* Hot pink */

/* Dark Background */
--color-bg-primary: #0f172a;    /* Almost black */
--color-bg-secondary: #1e293b;
```

---

## 📐 Typography

### Font Family

```css
/* Korean */
font-family: 'Noto Sans KR', sans-serif;

/* Headings (optional) */
font-family: 'Do Hyeon', sans-serif;  /* Bold, playful */
```

### Type Scale

```css
/* Display (Hero sections) */
.text-display {
  font-size: 3.75rem;  /* 60px */
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* H1 */
.text-h1 {
  font-size: 2.25rem;  /* 36px */
  line-height: 2.5rem;
  font-weight: 700;
}

/* H2 */
.text-h2 {
  font-size: 1.875rem;  /* 30px */
  line-height: 2.25rem;
  font-weight: 600;
}

/* H3 */
.text-h3 {
  font-size: 1.5rem;  /* 24px */
  line-height: 2rem;
  font-weight: 600;
}

/* Body */
.text-body {
  font-size: 1rem;  /* 16px */
  line-height: 1.5rem;
  font-weight: 400;
}

/* Small */
.text-small {
  font-size: 0.875rem;  /* 14px */
  line-height: 1.25rem;
}

/* Caption */
.text-caption {
  font-size: 0.75rem;  /* 12px */
  line-height: 1rem;
  color: var(--color-gray-500);
}
```

---

## 📏 Spacing Scale

```css
/* Based on 4px units */
--spacing-0: 0px;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
```

**Usage**:
```tsx
<div className="p-4 mb-6">  {/* padding: 16px, margin-bottom: 24px */}
  <h2 className="text-h2 mb-2">Title</h2>
  <p className="text-body">Body text</p>
</div>
```

---

## 🎯 Component Library

### Button

```tsx
// Primary Button
<button className="
  px-6 py-3 
  bg-purple-600 hover:bg-purple-700
  text-white font-medium
  rounded-lg
  transition-colors duration-200
  shadow-md hover:shadow-lg
">
  사주 보기
</button>

// Secondary Button
<button className="
  px-6 py-3
  bg-white hover:bg-gray-50
  text-purple-600
  border-2 border-purple-600
  rounded-lg
  transition-all duration-200
">
  취소
</button>

// Ghost Button
<button className="
  px-4 py-2
  text-gray-600 hover:text-gray-900
  hover:bg-gray-100
  rounded
  transition-colors duration-200
">
  더 보기
</button>
```

**States**:
- Default: Normal state
- Hover: Slightly darker/lighter background
- Active: Even darker, slight scale down (`scale-95`)
- Disabled: 50% opacity, no hover effect

---

###Input Fields

```tsx
// Text Input
<input 
  className="
    w-full px-4 py-3
    border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-purple-500 focus:border-transparent
    transition-all duration-200
    placeholder:text-gray-400
  "
  placeholder="생년월일 (예: 1990-01-15)"
/>

// With Label
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    출생 시간
  </label>
  <input type="time" className="..." />
</div>

// Error State
<input 
  className="
    border-red-500 focus:ring-red-500
  "
/>
<p className="text-sm text-red-600 mt-1">
  미래 날짜는 입력할 수 없습니다
</p>
```

---

### Card

```tsx
// Basic Card
<div className="
  bg-white rounded-xl shadow-md
  p-6
  hover:shadow-lg transition-shadow duration-300
">
  <h3 className="text-h3 mb-4">사주팔자</h3>
  <p className="text-body text-gray-600">...</p>
</div>

// Glassmorphism Card (Mystic theme)
<div className="
  backdrop-blur-md bg-white/30
  border border-white/20
  rounded-xl shadow-xl
  p-6
">
  {/* Content */}
</div>
```

---

### Badge

```tsx
// Element Badge (Wood)
<span className="
  inline-flex items-center
  px-3 py-1
  rounded-full
  bg-green-100 text-green-800
  text-sm font-medium
">
  木 (목)
</span>

// Status Badge
<span className="
  px-2 py-1 rounded
  bg-purple-100 text-purple-800
  text-xs font-semibold uppercase
">
  Premium
</span>
```

---

### Modal

```tsx
// Backdrop
<div className="
  fixed inset-0 z-50
  bg-black/50 backdrop-blur-sm
  flex items-center justify-center
  p-4
">
  {/* Modal */}
  <div className="
    bg-white rounded-2xl shadow-2xl
    max-w-md w-full
    p-6
    transform transition-all duration-300
    scale-100 opacity-100
  ">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-h2">젤리 충전</h2>
      <button className="text-gray-400 hover:text-gray-600">
        ✕
      </button>
    </div>
    
    {/* Body */}
    <div className="mb-6">
      <p className="text-body text-gray-600">
        충전할 패키지를 선택해주세요.
      </p>
    </div>
    
    {/* Footer */}
    <div className="flex gap-3">
      <button className="...">취소</button>
      <button className="...">확인</button>
    </div>
  </div>
</div>
```

---

### Loading Spinner

```tsx
<div className="
  inline-block
  animate-spin
  rounded-full
  h-8 w-8
  border-4 border-gray-200
  border-t-purple-600
"></div>
```

---

## ✨ Animations & Transitions

### Micro-interactions

```css
/* Button press */
.button:active {
  transform: scale(0.95);
}

/* Card hover lift */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Fade in (on mount) */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### Framer Motion Examples

```tsx
// Page transition
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* Page content */}
</motion.div>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile first */
.container {
  width: 100%;
  
  /* Tablet (md) */
  @media (min-width: 768px) {
    max-width: 768px;
  }
  
  /* Desktop (lg) */
  @media (min-width: 1024px) {
    max-width: 1024px;
  }
  
  /* Large Desktop (xl) */
  @media (min-width: 1280px) {
    max-width: 1280px;
  }
}
```

**Tailwind Breakpoints**:
- `sm:` 640px (mobile landscape)
- `md:` 768px (tablet)
- `lg:` 1024px (desktop)
- `xl:` 1280px (large desktop)
- `2xl:` 1536px (extra large)

**Usage**:
```tsx
<div className="
  text-2xl      // Mobile: 24px
  md:text-4xl   // Tablet+: 36px
  lg:text-5xl   // Desktop+: 48px
">
  멋진 타이틀
</div>
```

---

## 🎭 Icons

### Icon Library

**Using**: Lucide React (lightweight, tree-shakeable)

```bash
npm install lucide-react
```

```tsx
import { Calendar, User, CreditCard, Star } from 'lucide-react';

<Calendar className="w-5 h-5 text-gray-600" />
<User size={20} />
<CreditCard className="w-6 h-6 text-purple-600" />
```

### Custom Icon Colors (Elements)

```tsx
// 木 (Wood)
<Leaf className="w-5 h-5 text-green-600" />

// 火 (Fire)
<Flame className="w-5 h-5 text-red-600" />

// 土 (Earth)
<Mountain className="w-5 h-5 text-amber-700" />

// 金 (Metal)
<Coins className="w-5 h-5 text-gray-400" />

// 水 (Water)
<Droplet className="w-5 h-5 text-blue-700" />
```

---

## 🌗 Dark Mode (Future)

```css
/* Light mode (default) */
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --text-primary: #f9fafb;
  }
}
```

**Tailwind Dark Mode**:
```tsx
<div className="
  bg-white text-gray-900
  dark:bg-gray-900 dark:text-gray-100
">
  {/* Content */}
</div>
```

---

## ♿ Accessibility

### Focus States

```css
/* Keyboard navigation */
button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.input:focus {
  ring: 2px solid var(--color-primary-500);
}
```

### ARIA Labels

```tsx
// Icon buttons need labels
<button aria-label="닫기">
  <X />
</button>

// Form inputs need labels (even if hidden)
<label htmlFor="birthdate" className="sr-only">
  생년월일
</label>
<input id="birthdate" ... />

// Loading states
<div role="status" aria-live="polite">
  {isLoading ? "계산 중..." : "완료"}
</div>
```

### Contrast Ratios

**WCAG AA Requirements**:
- Normal text (< 18px): 4.5:1 minimum
- Large text (>= 18px or 14px bold): 3:1 minimum
- UI components: 3:1 minimum

**Check with**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 📐 Layout Patterns

### Container

```tsx
<div className="
  max-w-7xl mx-auto
  px-4 sm:px-6 lg:px-8
  py-8
">
  {/* Content */}
</div>
```

### Grid Layout

```tsx
// 3-column grid (responsive)
<div className="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-6
">
  <Card />
  <Card />
  <Card />
</div>
```

### Flexbox Layout

```tsx
// Centered content
<div className="flex items-center justify-center min-h-screen">
  <Card />
</div>

// Space between (navbar)
<div className="flex items-center justify-between">
  <Logo />
  <Nav />
</div>
```

---

## 🎨 Design Tokens (Figma → Code)

**Figma File**: `secret-saju-design-system.fig`

**Sync Process**:
1. Designer updates Figma
2. Export design tokens (Figma Tokens plugin)
3. Update `tailwind.config.js`
4. Rebuild

---

## 📚 Component Storybook (Future)

**Goal**: Interactive component library

**Stack**: Storybook for React

```bash
# Install
npx storybook@latest init

# Run
npm run storybook
```

---

## ✅ Design Checklist

**Before Shipping UI**:
- [ ] Follows design system colors/typography
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Smooth transitions/animations
- [ ] Loading states handled
- [ ] Error states designed
- [ ] Empty states designed
- [ ] Dark mode compatible (if enabled)

---

## 📞 Design Resources

**Figma**: [link to design files]  
**Slack**: `#design` channel  
**Design Lead**: [name]

---

**Document Owner**: Design Team  
**Last Updated**: 2026-01-31  
**Next Review**: Quarterly (or when design system changes)
