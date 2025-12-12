/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public", // 生成されたファイルをpublicフォルダに出力
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // 開発中は無効にする（キャッシュでバグるのを防ぐため）
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  // 既存の設定（エラー無視など）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withPWA(nextConfig);