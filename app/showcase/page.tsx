'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ExternalLink, ShoppingBag, Loader2, ArrowRight, LayoutGrid } from 'lucide-react'
import Link from 'next/link'

// 型定義
type ShowcaseItem = {
  id: string
  title: string
  price: number
  image_url: string
  ebay_url: string | null
  is_sold: boolean
}

export default function ShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from('showcase_items')
        .select('*')
        .order('created_at', { ascending: false }) // 新しい順
      
      if (data) setItems(data)
      setLoading(false)
    }
    fetchItems()
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* 簡易ヘッダー */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-gray-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold bg-cyberpunk-gradient bg-clip-text text-transparent">
          Personal Shopper
        </Link>
        <Link href="/requests/new" className="bg-neon-pink px-4 py-2 rounded-full font-bold text-sm hover:bg-neon-pinkLight transition text-white">
          Request Item
        </Link>
      </header>

      {/* ヘッダーエリア */}
      <div className="relative py-20 px-6 overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-0 w-full h-full bg-cyberpunk-gradient opacity-10 blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-cyberpunk-gradient bg-clip-text text-transparent tracking-tight">
            Curated Showcase
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Rare items we've hunted in Tokyo. <br className="hidden md:block" />
            Check our eBay store for available treasures or request something specific.
          </p>
        </div>
      </div>

      {/* 商品グリッド */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-12 h-12 text-neon-cyan" />
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden hover:border-neon-cyan transition-all duration-300 group"
              >
                {/* 画像エリア */}
                <div className="aspect-square bg-black relative overflow-hidden">
                  {/* 画像本体：売れたものは少しだけグレーにして区別（でもはっきり見える） */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.is_sold ? 'grayscale-[50%]' : ''}`} 
                  />
                  
                  {/* SOLD OUTタグ：画像を隠さないように右上に配置 */}
                  {item.is_sold && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 font-bold text-xs tracking-widest rounded shadow-lg border border-red-400 z-10">
                      SOLD OUT
                    </div>
                  )}

                  {/* eBayボタン（販売中のみ表示：変更なし） */}
                  {!item.is_sold && item.ebay_url && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <a 
                        href={item.ebay_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-black font-bold py-3 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center hover:bg-gray-200"
                      >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Buy on eBay
                      </a>
                    </div>
                  )}
                </div>

                {/* 情報エリア（変更なし） */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem] text-white">{item.title}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Reference Price</p>
                      <p className={`text-2xl font-bold font-mono ${item.is_sold ? 'text-gray-400 decoration-slate-500' : 'text-neon-cyan'}`}>
                        ${item.price}
                      </p>
                    </div>
                    
                    {!item.is_sold && item.ebay_url ? (
                      <a 
                        href={item.ebay_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={20} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空の状態 */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20 bg-dark-card/50 rounded-2xl border border-gray-800 border-dashed">
            <p className="text-gray-400 text-lg">Items are being hunted in Akihabara...</p>
            <p className="text-sm text-gray-600 mt-2">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}