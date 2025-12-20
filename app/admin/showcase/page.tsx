'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, ExternalLink, CheckCircle, XCircle, Upload, Loader2, Pencil, Save, X } from 'lucide-react' // ★アイコン追加
import imageCompression from 'browser-image-compression'

// データ型定義（priorityを追加）
type ShowcaseItem = {
  id: string
  title: string
  price: number
  image_url: string
  ebay_url: string | null
  is_sold: boolean
  category: string | null
  priority: number // ★追加: 並び替え用（数字が大きいほど上に来る）
}

export default function AdminShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // ★編集中のアイテムIDと、編集用の一時データ
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<ShowcaseItem>>({})

  // 新規登録用フォーム
  const [newItem, setNewItem] = useState({
    title: '',
    price: '',
    image_url: '',
    ebay_url: '',
    category: 'Hololive',
    priority: 0 // ★追加
  })

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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
      // ★並び順を変更: 優先度(priority)の高い順 -> 作成日の新しい順
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (data) setItems(data)
    setLoading(false)
  }

  // 画像アップロード（前回の修正版）
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: false }
      const compressedFile = await imageCompression(file, options)
      const fileName = `${Date.now()}-${file.name.split('.')[0]}.jpg`
      
      const { error } = await supabase.storage.from('showcase').upload(fileName, compressedFile, {
        contentType: 'image/jpeg', upsert: false
      })
      if (error) throw error

      const { data: publicData } = supabase.storage.from('showcase').getPublicUrl(fileName)
      setNewItem(prev => ({ ...prev, image_url: publicData.publicUrl }))
    } catch (error) {
      console.error('Upload Error:', error)
      alert('画像のアップロードに失敗しました。')
    } finally {
      setUploadingImage(false)
    }
  }

  // 新規追加
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.image_url) {
      alert('画像をアップロードしてください')
      return
    }
    setIsSubmitting(true)
    const { error } = await supabase.from('showcase_items').insert([{
      title: newItem.title,
      price: Number(newItem.price),
      image_url: newItem.image_url,
      ebay_url: newItem.ebay_url || null,
      category: newItem.category,
      priority: Number(newItem.priority) || 0, // ★追加
      is_sold: false
    }])
    if (error) alert('Error: ' + error.message)
    else {
      setNewItem({ title: '', price: '', image_url: '', ebay_url: '', category: 'Hololive', priority: 0 })
      fetchItems()
    }
    setIsSubmitting(false)
  }

  // ★編集モード開始
  const startEditing = (item: ShowcaseItem) => {
    setEditingId(item.id)
    setEditFormData(item)
  }

  // ★編集キャンセル
  const cancelEditing = () => {
    setEditingId(null)
    setEditFormData({})
  }

  // ★編集内容を保存（Update）
  const saveEditing = async () => {
    if (!editingId) return

    const { error } = await supabase
      .from('showcase_items')
      .update({
        title: editFormData.title,
        price: Number(editFormData.price),
        ebay_url: editFormData.ebay_url,
        category: editFormData.category,
        priority: Number(editFormData.priority), // ★優先度も更新
      })
      .eq('id', editingId)

    if (error) {
      alert('更新に失敗しました: ' + error.message)
    } else {
      setItems(items.map(item => (item.id === editingId ? { ...item, ...editFormData } as ShowcaseItem : item)))
      // 優先度が変わったかもしれないので並び替え直すなら fetchItems() でも良いが、
      // ここでは簡易的にリロードせずstate更新で対応（並び順を即反映させたい場合は fetchItems() を呼ぶ）
      fetchItems() // 並び順を反映させるため再取得
      cancelEditing()
    }
  }

  // 削除
  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return
    const { error } = await supabase.from('showcase_items').delete().eq('id', id)
    if (!error) setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
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
                {/* 画像 (省略なし) */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Item Image</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-neon-pink transition-colors relative bg-black/50">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-4 text-neon-cyan">
                        <Loader2 className="animate-spin mb-2" />
                        <span className="text-xs">Processing...</span>
                      </div>
                    ) : newItem.image_url ? (
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={newItem.image_url} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                        <button type="button" onClick={() => setNewItem({...newItem, image_url: ''})} className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-red-500 transition"><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center py-8">
                        <Upload className="text-gray-500 mb-2" size={32} />
                        <span className="text-sm text-gray-400 font-bold">Click to Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* タイトル */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input type="text" required className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-pink outline-none"
                    value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="Item Name" />
                </div>

                {/* 価格と優先度 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                    <input type="number" required className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-pink outline-none"
                      value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="100" />
                  </div>
                  <div>
                    <label className="block text-sm text-neon-cyan mb-1 font-bold">Priority</label>
                    <input type="number" className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-cyan outline-none"
                      value={newItem.priority} onChange={e => setNewItem({...newItem, priority: Number(e.target.value)})} placeholder="0" />
                    <p className="text-[10px] text-gray-500 mt-1">Larger number = Top</p>
                  </div>
                </div>

                {/* カテゴリ */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <select className="w-full bg-black border border-gray-700 rounded p-2 text-white outline-none"
                      value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                      <option value="Hololive">Hololive</option>
                      <option value="Pokemon">Pokemon</option>
                      <option value="Anime Goods">Anime Goods</option>
                    </select>
                </div>

                {/* eBay URL */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">eBay URL</label>
                  <input type="url" className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-pink outline-none"
                    value={newItem.ebay_url} onChange={e => setNewItem({...newItem, ebay_url: e.target.value})} placeholder="https://..." />
                </div>

                <button type="submit" disabled={isSubmitting || !newItem.image_url} className="w-full bg-neon-pink hover:bg-neon-pinkLight text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50">
                  {isSubmitting ? 'Adding...' : 'List Item'}
                </button>
              </form>
            </div>
          </div>

          {/* 右側：商品リスト（編集機能付き） */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? <div className="text-center py-10 text-gray-500">Loading...</div> : items.map((item) => (
              <div key={item.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${item.is_sold ? 'bg-gray-900/50 border-gray-800 opacity-60' : 'bg-dark-card border-gray-700'}`}>
                
                {/* ★編集中の場合 */}
                {editingId === item.id ? (
                  <div className="w-full space-y-3">
                    <div className="flex gap-4">
                      {/* 画像は編集不可（必要なら再アップロード機能を実装） */}
                      <div className="w-24 h-24 bg-black rounded-lg border border-gray-800 flex-shrink-0">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} className="w-full h-full object-cover opacity-50" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <input 
                          type="text" 
                          className="w-full bg-black border border-neon-cyan rounded p-2 text-white font-bold"
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        />
                        <div className="flex gap-2">
                           <input 
                            type="number" 
                            className="w-1/3 bg-black border border-neon-cyan rounded p-2 text-white"
                            placeholder="Price"
                            value={editFormData.price}
                            onChange={(e) => setEditFormData({...editFormData, price: Number(e.target.value)})}
                          />
                          <input 
                            type="number" 
                            className="w-1/3 bg-black border border-neon-cyan rounded p-2 text-white"
                            placeholder="Priority (Order)"
                            value={editFormData.priority}
                            onChange={(e) => setEditFormData({...editFormData, priority: Number(e.target.value)})}
                          />
                        </div>
                         <input 
                            type="text" 
                            className="w-full bg-black border border-neon-cyan rounded p-2 text-white text-xs"
                            placeholder="eBay URL"
                            value={editFormData.ebay_url || ''}
                            onChange={(e) => setEditFormData({...editFormData, ebay_url: e.target.value})}
                          />
                      </div>
                    </div>
                    
                    {/* 保存・キャンセルボタン */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                      <button onClick={cancelEditing} className="px-3 py-1 text-gray-400 hover:text-white flex items-center gap-1">
                        <X size={16} /> Cancel
                      </button>
                      <button onClick={saveEditing} className="px-4 py-1 bg-neon-cyan text-black font-bold rounded hover:bg-cyan-400 flex items-center gap-1">
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // ★通常表示の場合
                  <>
                    <div className="w-24 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-gray-800 relative">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      {/* 優先度バッジ */}
                      {item.priority > 0 && (
                        <div className="absolute top-0 left-0 bg-neon-cyan text-black text-[10px] font-bold px-1">
                          #{item.priority}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg truncate pr-4">{item.title}</h3>
                        <div className="flex gap-1">
                          {/* ★編集ボタン */}
                          <button onClick={() => startEditing(item)} className="text-gray-500 hover:text-neon-cyan p-2 transition-colors" title="Edit">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-500 p-2 transition-colors" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-neon-cyan font-mono font-bold text-xl mb-2">${item.price}</div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={async () => {
                             // 売却済み切り替え（変更なし）
                             const { error } = await supabase.from('showcase_items').update({ is_sold: !item.is_sold }).eq('id', item.id)
                             if (!error) setItems(items.map(i => i.id === item.id ? { ...i, is_sold: !item.is_sold } : i))
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold border transition-colors ${item.is_sold ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}
                        >
                          {item.is_sold ? <XCircle size={12} /> : <CheckCircle size={12} />}
                          {item.is_sold ? 'SOLD OUT' : 'ON SALE'}
                        </button>

                        {item.ebay_url && (
                          <a href={item.ebay_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1 text-xs">
                            <ExternalLink size={12} /> eBay
                          </a>
                        )}
                        {/* カテゴリ表示 */}
                        {item.category && <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded">{item.category}</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}