export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          messages: Json
          title: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      explore_suggestions: {
        Row: {
          book_slug: string
          cards: Json
          chapter: number
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          book_slug: string
          cards: Json
          chapter: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          book_slug?: string
          cards?: Json
          chapter?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bible_level: string | null
          bio: string | null
          birth_date: string | null
          church_city: string | null
          church_denomination: string | null
          church_name: string | null
          church_role: string | null
          church_years: number | null
          city: string | null
          created_at: string
          display_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          preferred_translations: string[]
          preferred_voice_uri: string | null
          reading_immersive_mode: boolean
          tradition: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bible_level?: string | null
          bio?: string | null
          birth_date?: string | null
          church_city?: string | null
          church_denomination?: string | null
          church_name?: string | null
          church_role?: string | null
          church_years?: number | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          preferred_translations?: string[]
          preferred_voice_uri?: string | null
          reading_immersive_mode?: boolean
          tradition?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bible_level?: string | null
          bio?: string | null
          birth_date?: string | null
          church_city?: string | null
          church_denomination?: string | null
          church_name?: string | null
          church_role?: string | null
          church_years?: number | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          preferred_translations?: string[]
          preferred_voice_uri?: string | null
          reading_immersive_mode?: boolean
          tradition?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_plans: {
        Row: {
          books_filter: string
          category: string
          created_at: string
          description: string
          duration_days: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          books_filter?: string
          category?: string
          created_at?: string
          description: string
          duration_days: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          books_filter?: string
          category?: string
          created_at?: string
          description?: string
          duration_days?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_slug: string
          chapter: number
          chapters_read: string[]
          created_at: string
          id: string
          last_read_date: string | null
          longest_streak: number
          streak_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_slug?: string
          chapter?: number
          chapters_read?: string[]
          created_at?: string
          id?: string
          last_read_date?: string | null
          longest_streak?: number
          streak_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_slug?: string
          chapter?: number
          chapters_read?: string[]
          created_at?: string
          id?: string
          last_read_date?: string | null
          longest_streak?: number
          streak_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strong_entries: {
        Row: {
          created_at: string
          full_definition: string | null
          language: string
          original: string
          part_of_speech: string | null
          pronunciation: string | null
          short_definition: string | null
          strong_code: string
          transliteration: string | null
        }
        Insert: {
          created_at?: string
          full_definition?: string | null
          language: string
          original: string
          part_of_speech?: string | null
          pronunciation?: string | null
          short_definition?: string | null
          strong_code: string
          transliteration?: string | null
        }
        Update: {
          created_at?: string
          full_definition?: string | null
          language?: string
          original?: string
          part_of_speech?: string | null
          pronunciation?: string | null
          short_definition?: string | null
          strong_code?: string
          transliteration?: string | null
        }
        Relationships: []
      }
      user_plan_progress: {
        Row: {
          completed_at: string | null
          completed_days: number[]
          current_day: number
          id: string
          is_active: boolean
          plan_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_days?: number[]
          current_day?: number
          id?: string
          is_active?: boolean
          plan_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_days?: number[]
          current_day?: number
          id?: string
          is_active?: boolean
          plan_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_progress_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "reading_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      verse_highlights: {
        Row: {
          book_slug: string
          chapter: number
          color: string
          created_at: string
          id: string
          note: string | null
          tags: string[]
          updated_at: string
          user_id: string
          verse: number
        }
        Insert: {
          book_slug: string
          chapter: number
          color?: string
          created_at?: string
          id?: string
          note?: string | null
          tags?: string[]
          updated_at?: string
          user_id: string
          verse: number
        }
        Update: {
          book_slug?: string
          chapter?: number
          color?: string
          created_at?: string
          id?: string
          note?: string | null
          tags?: string[]
          updated_at?: string
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      verse_word_map: {
        Row: {
          book_slug: string
          chapter: number
          context_meaning: string | null
          created_at: string
          id: string
          strong_code: string | null
          verse: number
          word_index: number
          word_pt: string
        }
        Insert: {
          book_slug: string
          chapter: number
          context_meaning?: string | null
          created_at?: string
          id?: string
          strong_code?: string | null
          verse: number
          word_index: number
          word_pt: string
        }
        Update: {
          book_slug?: string
          chapter?: number
          context_meaning?: string | null
          created_at?: string
          id?: string
          strong_code?: string | null
          verse?: number
          word_index?: number
          word_pt?: string
        }
        Relationships: [
          {
            foreignKeyName: "verse_word_map_strong_code_fkey"
            columns: ["strong_code"]
            isOneToOne: false
            referencedRelation: "strong_entries"
            referencedColumns: ["strong_code"]
          },
        ]
      }
      word_study_cache: {
        Row: {
          book_slug: string
          chapter: number
          id: string
          payload: Json
          updated_at: string
          verse: number
          word_pt: string
        }
        Insert: {
          book_slug: string
          chapter: number
          id?: string
          payload: Json
          updated_at?: string
          verse: number
          word_pt: string
        }
        Update: {
          book_slug?: string
          chapter?: number
          id?: string
          payload?: Json
          updated_at?: string
          verse?: number
          word_pt?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
