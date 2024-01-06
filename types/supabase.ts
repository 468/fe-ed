export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Node: {
        Row: {
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["NodeProcessingStatus"]
          title: string | null
          url: string | null
          worldId: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["NodeProcessingStatus"]
          title?: string | null
          url?: string | null
          worldId?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["NodeProcessingStatus"]
          title?: string | null
          url?: string | null
          worldId?: string | null
        }
      }
      Tag: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          nodeId: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          nodeId?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          nodeId?: string | null
        }
      }
      World: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
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
      NodeProcessingStatus: "NOT_STARTED" | "STARTED" | "PROCESSED" | "FAILED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
