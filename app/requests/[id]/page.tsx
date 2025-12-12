import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DeleteRequestButton from '@/components/DeleteRequestButton'
import ChatSection from '@/components/ChatSection'

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
        <h1 className="text-xl mb-4">Login Required</h1>
        <Link href="/login" className="text-neon-pink hover:underline">Go to Login</Link>
      </div>
    )
  }

  const { data: request, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !request) {
    return <div className="p-10 text-white">Request not found.</div>
  }

  if (request.user_id !== user.id) {
    return <div className="p-10 text-white">Access Denied.</div>
  }

  let images: string[] = []
  if (Array.isArray(request.reference_image_url)) {
    images = request.reference_image_url
  } else if (typeof request.reference_image_url === 'string') {
    try {
      const parsed = JSON.parse(request.reference_image_url)
      if (Array.isArray(parsed)) images = parsed
      else images = [request.reference_image_url]
    } catch {
      images = [request.reference_image_url]
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/mypage" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          {request.status === 'pending' && (
            <DeleteRequestButton requestId={request.id} />
          )}
        </div>

        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden shadow-2xl mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="bg-black/50 border-b md:border-b-0 md:border-r border-gray-800 p-4">
              {images.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-600">
                  No Image
                </div>
              ) : (
                <div className={`grid gap-2 ${
                  images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}>
                  {images.map((url, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded border border-gray-800 ${
                      images.length === 1 ? 'h-[500px]' : 'aspect-square'
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={url} 
                        alt={`Req ${idx}`} 
                        className="w-full h-full object-contain bg-black"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 space-y-6">
              <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                request.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {request.status?.toUpperCase() || 'PENDING'}
              </span>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Character / Series</h2>
                <p className="text-2xl font-bold">{request.character_name}</p>
              </div>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Budget</h2>
                <p className="text-xl font-mono text-neon-pink">${request.budget}</p>
              </div>

              <div>
                <h2 className="text-gray-500 text-sm mb-1">Details</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {request.description || 'No details provided.'}
                </p>
              </div>

              {request.ebay_listing_url && (
                <div className="pt-4 border-t border-gray-800">
                  <a 
                    href={request.ebay_listing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Buy on eBay
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* チャット */}
        <ChatSection requestId={params.id} />
        
      </div>
    </div>
  )
}