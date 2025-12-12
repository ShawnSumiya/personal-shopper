import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // サイバーパンク・アニメ風のカラーパレット定義
        dark: {
          bg: '#0f0f13',      // 背景：ほぼ黒に近い紺
          card: '#1a1a23',    // カード背景
          text: '#e2e8f0',    // メインテキスト
        },
        neon: {
          pink: '#ff0080',       // メインアクセント
          pinkLight: '#ff4da6',  // 薄いピンク
          blue: '#00f0ff',       // サイバーブルー
          purple: '#7928ca',     // 紫
        },
      },
      backgroundImage: {
        'cyberpunk-gradient': 'linear-gradient(to right, #ff0080, #7928ca)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
export default config;