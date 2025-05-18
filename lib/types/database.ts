export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
          image_url?: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          user_id: string
          post_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          post_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          post_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          is_important: boolean
          created_at: string
          updated_at: string
          published_at: string
          expires_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          is_important?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string
          expires_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          is_important?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string
          expires_at?: string | null
          created_by?: string
        }
      }
    }
  }
}

export type Announcement = Database["public"]["Tables"]["announcements"]["Row"]
export type Post = Database["public"]["Tables"]["posts"]["Row"]
export type Comment = Database["public"]["Tables"]["comments"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
