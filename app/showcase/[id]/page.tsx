'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Share2, CheckCircle, XCircle } from 'lucide-react'

// 型定義
type ShowcaseItem = {
  id: string
  title: string
  price: number
  image_url: string
  ebay_url: string | null
  is_sold: boolean
  category: string | null
}

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<ShowcaseItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchItem = async () => {
      // params.id を使ってデータを取得
      const { data } = await supabase
        .from('showcase_items')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (data) setItem(data)
      setLoading(false)
    }
    fetchItem()
  }, [params.id])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-neon-pink border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Item Not Found</h1>
        <Link href="/showcase" className="text-neon-cyan hover:underline">
          Back to Showcase
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* ヘッダー */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/showcase" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Back to List
        </Link>
        <Link href="/" className="text-xl font-bold bg-cyberpunk-gradient bg-clip-text text-transparent hidden sm:block">
          Personal Shopper
        </Link>
        <div className="w-20">{/* スペース調整用 */}</div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* 左側：画像エリア */}
          <div className="relative">
            <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.image_url} 
                alt={item.title} 
                className={`w-full h-full object-cover transition-transform duration-700 ${item.is_sold ? 'grayscale' : 'group-hover:scale-105'}`} 
              />
              
              {item.is_sold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="bg-red-600 text-white px-8 py-3 text-2xl font-bold tracking-widest rounded border-2 border-red-400 rotate-[-10deg] shadow-lg">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 右側：詳細情報エリア */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700">
                  {item.category || 'Anime Goods'}
                </span>
                {item.is_sold ? (
                  <span className="flex items-center gap-1 text-red-500 text-sm font-bold">
                    <XCircle size={14} /> Sold Out
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500 text-sm font-bold">
                    <CheckCircle size={14} /> Available Now
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {item.title}
              </h1>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-bold text-neon-cyan">${item.price}</span>
                <span className="text-gray-500 text-sm">USD</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-800">
              {/* アクションボタン */}
              {!item.is_sold && item.ebay_url ? (
                <a 
                  href={item.ebay_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-neon-pink hover:bg-neon-pinkLight text-white font-bold rounded-xl flex items-center justify-center gap-3 text-lg transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                >
                  <ShoppingBag size={24} />
                  Buy Now on eBay
                </a>
              ) : (
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <p className="text-gray-300 mb-4 font-bold">Want something like this?</p>
                  <Link 
                    href="/requests/new" 
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 border border-gray-600 transition-colors"
                  >
                    Request Similar Item
                  </Link>
                </div>
              )}

              <button 
                onClick={handleShare}
                className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <CheckCircle size={18} className="text-green-500" /> : <Share2 size={18} />}
                {copied ? 'Link Copied!' : 'Share this Item'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}