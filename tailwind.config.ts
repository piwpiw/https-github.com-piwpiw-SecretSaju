import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // `rgb(var(--x) / <alpha-value>)` 는 변수가 "15 23 42" 같은 채널
        // 숫자일 때만 동작한다. 예전에는 hex 를 담은 변수를 가리켜서
        // `rgb(#0f172a / 1)` 이라는 잘못된 CSS 가 만들어졌고, 브라우저가
        // 통째로 버리는 바람에 이 토큰들이 전부 죽어 있었다
        // (글자는 상속색, bg-surface 는 완전 투명).
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        secondary: "rgb(var(--secondary-rgb) / <alpha-value>)",
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        foreground: "rgb(var(--text-foreground-rgb) / <alpha-value>)",
        // 보조 텍스트. secondary 는 브랜드 보라색이라 글자용이 아니다.
        muted: "rgb(var(--text-muted-rgb) / <alpha-value>)",
        // surface 와 테두리는 테마에 따라 rgba 로 정의돼 자체 알파를 갖는다.
        // 채널로 쪼개면 그 알파가 사라지므로 변수를 그대로 쓴다.
        surface: "var(--surface)",
        "border-color": "var(--border-color)",
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "system-ui", "sans-serif"],
        display: ["var(--font-do-hyeon)", "sans-serif"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
