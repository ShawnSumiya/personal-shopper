export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          user_id: string
          budget: number
          character_name: string
          description: string | null
          reference_image_url: string | null
          status: 'pending' | 'negotiation' | 'listed' | 'completed' | 'cancelled'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          budget: number
          character_name: string
          description?: string | null
          reference_image_url?: string | null
          status?: 'pending' | 'negotiation' | 'listed' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget?: number
          character_name?: string
          description?: string | null
          reference_image_url?: string | null
          status?: 'pending' | 'negotiation' | 'listed' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          request_id: string
          sender_id: string
          content: string
          image_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          sender_id: string
          content: string
          image_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          sender_id?: string
          content?: string
          image_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

