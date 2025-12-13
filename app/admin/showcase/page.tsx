'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Upload, Trash2, ExternalLink, Plus, Save, Loader2, X, ArrowLeft } from 'lucide-react'
import imageCompression from 'browser-image-compression'
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

export default function AdminShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // 入力フォーム用
  const [newItem, setNewItem] = useState({
    title: '',
    price: '',
    ebay_url: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // データ取得
  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('showcase_items')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // 画像選択処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // 商品追加処理
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !newItem.title || !newItem.price) return

    setUploading(true)
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1000, useWebWorker: true }
      const compressedFile = await imageCompression(selectedFile, options)
      
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('showcase-images')
        .upload(fileName, compressedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('showcase-images')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('showcase_items')
        .insert({
          title: newItem.title,
          price: Number(newItem.price),
          ebay_url: newItem.ebay_url || null,
          image_url: publicUrl,
          is_sold: false
        })

      if (dbError) throw dbError

      setNewItem({ title: '', price: '', ebay_url: '' })
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      fetchItems()

    } catch (error) {
      console.error('Error adding item:', error)
      alert('Error adding item. Check console.')
    } finally {
      setUploading(false)
    }
  }

  // 削除処理
  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('showcase-images').remove([fileName])
      }

      const { error } = await supabase.from('showcase_items').delete().eq('id', id)
      if (error) throw error
      
      setItems(items.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  // SOLD切り替え
  const toggleSold = async (id: string, currentStatus: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, is_sold: !currentStatus } : item))

    const { error } = await supabase
      .from('showcase_items')
      .update({ is_sold: !currentStatus })
      .eq('id', id)
    
    if (error) {
      setItems(items.map(item => item.id === id ? { ...item, is_sold: currentStatus } : item))
      alert('Update failed')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-cyberpunk-gradient bg-clip-text text-transparent">
            Showcase Manager
          </h1>
          <Link href="/admin" className="flex items-center text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5 mr-1" /> Dashboard
          </Link>
        </div>

        {/* 追加フォーム */}
        <div className="bg-dark-card border border-gray-700 rounded-lg p-6 mb-10 shadow-lg shadow-black/50">
          <h2 className="text-xl font-bold mb-4 flex items-center text-white">
            <Plus className="w-5 h-5 mr-2 text-neon-pink" /> Add New Item
          </h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Item Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  className="w-full bg-black/50 border border-gray-600 rounded p-3 focus:border-neon-pink outline-none transition text-white"
                  placeholder="e.g. Rare Pikachu Card 1999"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-400 mb-1">Price ($) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                    className="w-full bg-black/50 border border-gray-600 rounded p-3 focus:border-neon-pink outline-none transition text-white"
                    placeholder="50"
                  />
                </div>
                <div className="flex-[1.5]">
                  <label className="block text-sm font-bold text-gray-400 mb-1">eBay URL (Optional)</label>
                  <input
                    type="url"
                    value={newItem.ebay_url}
                    onChange={e => setNewItem({...newItem, ebay_url: e.target.value})}
                    className="w-full bg-black/50 border border-gray-600 rounded p-3 focus:border-neon-pink outline-none transition text-white"
                    placeholder="https://ebay.com/itm/..."
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="bg-neon-pink text-white font-bold py-3 px-6 rounded-lg hover:bg-neon-pinkLight transition w-full disabled:opacity-50 shadow-lg shadow-neon-pink/20 mt-2"
              >
                {uploading ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Uploading...</div> : 'Add to Showcase'}
              </button>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg aspect-video relative bg-black/30 hover:bg-black/40 transition">
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-neon-pink transition flex flex-col items-center w-full h-full justify-center"
                >
                  <Upload className="w-10 h-10 mb-3" />
                  <span className="font-bold">Click to Upload Image</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-200">Current Inventory ({items.length})</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 mx-auto text-neon-cyan" /></div>
        ) : items.length === 0 ? (
           <div className="text-center py-20 text-gray-500 bg-dark-card rounded-lg border border-gray-800">No items yet. Add your first item above!</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-dark-card border border-gray-700 rounded-lg overflow-hidden relative group transition-all hover:border-neon-cyan">
                {/* 画像エリア */}
                <div className="aspect-square bg-black relative">
                  {/* 画像：売れたものは少しグレーにするだけ（隠さない） */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className={`w-full h-full object-cover transition-all ${item.is_sold ? 'grayscale-[50%]' : ''}`} 
                  />
                  
                  {/* SOLDバッジ：削除ボタンと被らないように「左上」に配置 */}
                  {item.is_sold && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 font-bold text-[10px] tracking-widest rounded shadow border border-red-400 z-10">
                      SOLD OUT
                    </div>
                  )}
                </div>
                
                {/* 情報エリア */}
                <div className="p-3">
                  <h3 className="font-bold truncate text-sm mb-1 text-white">{item.title}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-mono text-sm ${item.is_sold ? 'text-gray-400' : 'text-neon-cyan'}`}>
                      ${item.price}
                    </span>
                    {item.ebay_url && (
                        <a href={item.ebay_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white flex items-center">
                            eBay <ExternalLink size={10} className="ml-0.5" />
                        </a>
                    )}
                  </div>

                  {/* ステータス切り替えボタン */}
                  <button
                    onClick={() => toggleSold(item.id, item.is_sold)}
                    className={`w-full text-xs py-1.5 rounded font-bold border transition-colors ${
                        item.is_sold 
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-800' 
                        : 'border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white'
                    }`}
                  >
                    {item.is_sold ? 'Mark as Active' : 'Mark as SOLD'}
                  </button>
                </div>
                
                {/* 削除ボタン（右上） */}
                <button
                  onClick={() => handleDelete(item.id, item.image_url)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-20"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}