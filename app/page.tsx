import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-dark-bg">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-cyberpunk-gradient bg-clip-text text-transparent">
          Personal Shopper App
        </h1>
        <p className="text-neon-pinkLight text-lg md:text-xl mb-8">
          海外ファン向けの推し活グッズ代理購入アプリ
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              ログイン / 新規登録
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

