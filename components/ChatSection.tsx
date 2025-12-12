'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Loader2, ShieldCheck } from 'lucide-react'

type Message = {
  id: number
  content: string
  is_admin: boolean
  user_id: string
  created_at: string
}

export default function ChatSection({ requestId }: { requestId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        const isAdmin = user.email === 'shawn.sumiya@gmail.com'
        
        // ★既読処理: 画面を開いたので、自分宛ての通知フラグをオフにする
        if (isAdmin) {
          // 管理者が見ているなら、管理者用通知をオフ
          await supabase.from('requests').update({ unread_admin: false }).eq('id', requestId)
        } else {
          // ユーザーが見ているなら、ユーザー用通知をオフ
          await supabase.from('requests').update({ unread_user: false }).eq('id', requestId)
        }
      }

      // メッセージ取得
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)

      // リアルタイム受信
      const channel = supabase
        .channel(`chat-${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `request_id=eq.${requestId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message
            setMessages((prev) => {
              if (prev.some(msg => msg.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            
            // ★受信時も、この画面を開きっぱなしなら即座に既読にする
            // (自分が送ったメッセージでなければ)
            if (user && newMsg.user_id !== user.id) {
               const isAdmin = user.email === 'shawn.sumiya@gmail.com'
               if (isAdmin) supabase.from('requests').update({ unread_admin: false }).eq('id', requestId)
               else supabase.from('requests').update({ unread_user: false }).eq('id', requestId)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    init()
  }, [requestId, supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    setLoading(true)
    try {
      const isAdmin = currentUser.email === 'shawn.sumiya@gmail.com'

      const { data, error } = await supabase
        .from('messages')
        .insert({
          request_id: requestId,
          user_id: currentUser.id,
          content: newMessage,
          is_admin: isAdmin,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setMessages((prev) => [...prev, data as Message])
      }
      
      setNewMessage('')
    } catch (err) {
      console.error(err)
      alert('Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  const isMe = (msgUserId: string) => currentUser && msgUserId === currentUser.id

  return (
    <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-black/50 p-4 border-b border-gray-800 font-bold text-gray-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-neon-pink" />
        Messages / Consultation
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-10 text-sm">
            No messages yet.<br />
            Feel free to ask any questions here.
          </div>
        )}
        
        {messages.map((msg) => {
          const me = isMe(msg.user_id)
          return (
            <div key={msg.id} className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed ${
                  me
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}
              >
                {!me && msg.is_admin && (
                  <div className="text-[10px] text-neon-pink mb-1 font-bold flex items-center gap-1">
                    <ShieldCheck size={10} /> ADMIN
                  </div>
                )}
                {msg.content}
                <div className={`text-[10px] mt-1 opacity-50 ${me ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/50 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-dark-bg border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-pink"
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  )
}