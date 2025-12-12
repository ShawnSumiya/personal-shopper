/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScriptの型エラーを無視してビルドする（MVP用設定）
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLintのエラーを無視してビルドする
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

// update settings