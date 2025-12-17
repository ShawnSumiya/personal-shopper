'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, ExternalLink, CheckCircle, XCircle, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression' // ★圧縮ライブラリ

// データ型定義
type ShowcaseItem = {
  id: string
  title: string
  price: number
  image_url: string
  ebay_url: string | null
  is_sold: boolean
  category: string | null
}

export default function AdminShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false) // 画像アップロード中フラグ
  
  // 新規登録用フォームの状態
  const [newItem, setNewItem] = useState({
    title: '',
    price: '',
    image_url: '',
    ebay_url: '',
    category: 'Hololive'
  })

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. 初期データ読み込み & 管理者チェック
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'shawn.sumiya@gmail.com') {
        router.push('/mypage')
        return
      }
      fetchItems()
    }
    init()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('showcase_items')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setItems(data)
    setLoading(false)
  }

  // ★画像の圧縮＆アップロード処理
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    try {
      // 1. 画像圧縮の設定
      const options = {
        maxSizeMB: 0.5, // 0.5MB以下に圧縮
        maxWidthOrHeight: 1200, // 最大幅1200px
        useWebWorker: true,
      }

      // 2. 圧縮実行
      const compressedFile = await imageCompression(file, options)

      // 3. ファイル名をユニークにする（衝突防止）
      const fileName = `${Date.now()}-${file.name}`
      
      // 4. Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from('showcase') // ★バケット名
        .upload(fileName, compressedFile)

      if (error) throw error

      // 5. 公開URLを取得
      const { data: publicData } = supabase.storage
        .from('showcase')
        .getPublicUrl(fileName)

      // 6. フォームにURLをセット
      setNewItem(prev => ({ ...prev, image_url: publicData.publicUrl }))

    } catch (error) {
      console.error('Upload Error:', error)
      alert('画像のアップロードに失敗しました。')
    } finally {
      setUploadingImage(false)
    }
  }

  // 商品追加 (Create)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.image_url) {
      alert('画像をアップロードしてください')
      return
    }
    
    setIsSubmitting(true)

    const { error } = await supabase
      .from('showcase_items')
      .insert([
        {
          title: newItem.title,
          price: Number(newItem.price),
          image_url: newItem.image_url,
          ebay_url: newItem.ebay_url || null,
          category: newItem.category,
          is_sold: false
        }
      ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setNewItem({ title: '', price: '', image_url: '', ebay_url: '', category: 'Hololive' })
      fetchItems()
    }
    setIsSubmitting(false)
  }

  // 売り切れ切り替え
  const toggleSoldStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('showcase_items')
      .update({ is_sold: !currentStatus })
      .eq('id', id)

    if (!error) {
      setItems(items.map(item => 
        item.id === id ? { ...item, is_sold: !currentStatus } : item
      ))
    }
  }

  // 削除
  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return
    const { error } = await supabase
      .from('showcase_items')
      .delete()
      .eq('id', id)
    if (!error) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Manage Showcase</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 左側：商品追加フォーム */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card border border-gray-800 rounded-xl p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="text-neon-pink" /> Add New Item
              </h2>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                {/* 画像アップロードエリア */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Item Image</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-neon-pink transition-colors relative bg-black/50">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-4 text-neon-cyan">
                        <Loader2 className="animate-spin mb-2" />
                        <span className="text-xs">Compressing & Uploading...</span>
                      </div>
                    ) : newItem.image_url ? (
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={newItem.image_url} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                        <button 
                          type="button"
                          onClick={() => setNewItem({...newItem, image_url: ''})}
                          className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center py-8">
                        <Upload className="text-gray-500 mb-2" size={32} />
                        <span className="text-sm text-gray-400 font-bold">Click to Upload</span>
                        <span className="text-xs text-gray-600 mt-1">Auto-compressed</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-pink outline-none transition"
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                    placeholder="e.g. Hololive 3rd Gen Set"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-pink outline-none"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <select 
                      className="w-full bg-black border border-gray-700 rounded p-2 text-white outline-none"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                    >
                      <option value="Hololive">Hololive</option>
                      <option value="Pokemon">Pokemon</option>
                      <option value="Anime Goods">Anime Goods</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">eBay URL (Optional)</label>
                  <input 
                    type="url" 
                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-pink outline-none"
                    value={newItem.ebay_url}
                    onChange={e => setNewItem({...newItem, ebay_url: e.target.value})}
                    placeholder="https://ebay.com/itm/..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || uploadingImage || !newItem.image_url}
                  className="w-full bg-neon-pink hover:bg-neon-pinkLight text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'List Item'}
                </button>
              </form>
            </div>
          </div>

          {/* 右側：商品リスト */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading items...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-dark-card rounded-xl border border-gray-800">
                No items in showcase yet.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${item.is_sold ? 'bg-gray-900/50 border-gray-800 opacity-60' : 'bg-dark-card border-gray-700'}`}>
                  {/* 画像 */}
                  <div className="w-24 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-gray-800 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg truncate pr-4">{item.title}</h3>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="text-neon-cyan font-mono font-bold text-xl mb-2">${item.price}</div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleSoldStatus(item.id, item.is_sold)}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold border transition-colors ${
                          item.is_sold 
                            ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' 
                            : 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30'
                        }`}
                      >
                        {item.is_sold ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        {item.is_sold ? 'SOLD OUT' : 'ON SALE'}
                      </button>

                      {item.ebay_url && (
                        <a 
                          href={item.ebay_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-gray-400 hover:text-white flex items-center gap-1 text-xs"
                        >
                          <ExternalLink size={12} /> eBay
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}