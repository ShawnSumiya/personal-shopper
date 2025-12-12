'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Loader2, Send, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export default function NewRequestPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const [formData, setFormData] = useState({
    character_name: '',
    budget: '50',
    description: '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      
      if (selectedFiles.length + newFiles.length > 4) {
        setErrorMsg('Max 4 images allowed.')
        return
      }

      const validFiles: File[] = []
      const validPreviews: string[] = []

      newFiles.forEach(file => {
        if (!file.type.startsWith('image/')) return
        if (file.size > 20 * 1024 * 1024) return 
        
        validFiles.push(file)
        validPreviews.push(URL.createObjectURL(file))
      })

      setSelectedFiles([...selectedFiles, ...validFiles])
      setPreviewUrls([...previewUrls, ...validPreviews])
      setErrorMsg(null)
      
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles]
    const newPreviews = [...previewUrls]
    
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)

    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      setLoadingText('Checking user...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Login required.')

      let uploadedUrls: string[] = []

      if (selectedFiles.length > 0) {
        setLoadingText(`Compressing & Uploading ${selectedFiles.length} images...`)

        const uploadPromises = selectedFiles.map(async (file) => {
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          }
          const compressedFile = await imageCompression(file, options)
          
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('request-images')
            .upload(fileName, compressedFile)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('request-images')
            .getPublicUrl(fileName)
            
          return publicUrl
        })

        uploadedUrls = await Promise.all(uploadPromises)
      }

      setLoadingText('Saving request...')
      const { error: dbError } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          character_name: formData.character_name,
          budget: Number(formData.budget),
          description: formData.description || null,
          reference_image_url: uploadedUrls,
        })

      if (dbError) throw dbError

      router.push('/mypage')
      router.refresh()

    } catch (error: any) {
      console.error('Error:', error)
      setErrorMsg(error.message || 'An error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6 pb-20">
      <div className="max-w-2xl mx-auto">
        <Link href="/mypage" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8 bg-cyberpunk-gradient bg-clip-text text-transparent">
          New Request
        </h1>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Character / Series Name <span className="text-neon-pink">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.character_name}
              onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
              className="w-full bg-dark-card border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-neon-pink transition-colors"
              placeholder="e.g., Hatsune Miku / Project Sekai"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Budget (USD) <span className="text-neon-pink">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['30', '50', '100', '200'].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData({ ...formData, budget: amount })}
                  className={`p-3 rounded-lg border font-bold transition-all ${
                    formData.budget === amount
                      ? 'bg-neon-pink/20 border-neon-pink text-white'
                      : 'bg-dark-card border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Includes shipping and service fees.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Reference Images (Max 4)
            </label>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700 bg-black group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {previewUrls.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-neon-pink hover:text-neon-pink transition-colors bg-dark-card/30"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">Add Image</span>
                  <span className="text-xs opacity-70">({previewUrls.length}/4)</span>
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              multiple 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">
              Optional: Upload images to help us find the right item.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Details / Preferences
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-card border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-neon-pink transition-colors h-32"
              placeholder="Please describe any specific details (e.g., 'no scratches', 'only plushies')..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-pink hover:bg-neon-pinkLight text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-neon-pink/20 transition-all hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                {loadingText || 'Sending...'}
              </>
            ) : (
              <>
                <Send className="w-6 h-6 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}