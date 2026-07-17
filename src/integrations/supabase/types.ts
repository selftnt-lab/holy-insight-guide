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
      bible_chapter_cache: {
        Row: {
          book_slug: string
          chapter: number
          expires_at: string | null
          fetched_at: string
          id: string
          license_class: string
          payload: Json
          translation: string
        }
        Insert: {
          book_slug: string
          chapter: number
          expires_at?: string | null
          fetched_at?: string
          id?: string
          license_class?: string
          payload: Json
          translation: string
        }
        Update: {
          book_slug?: string
          chapter?: number
          expires_at?: string | null
          fetched_at?: string
          id?: string
          license_class?: string
          payload?: Json
          translation?: string
        }
        Relationships: []
      }
      chapter_studies: {
        Row: {
          book_slug: string
          chapter: number
          content: Json
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_slug: string
          chapter: number
          content: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_slug?: string
          chapter?: number
          content?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      client_error_logs: {
        Row: {
          build: string | null
          created_at: string
          id: string
          message: string
          route: string | null
          stack: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          build?: string | null
          created_at?: string
          id?: string
          message: string
          route?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          build?: string | null
          created_at?: string
          id?: string
          message?: string
          route?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_devotionals: {
        Row: {
          completed_at: string | null
          content: Json
          created_at: string
          date: string
          id: string
          user_id: string
          verse_ref: string
        }
        Insert: {
          completed_at?: string | null
          content: Json
          created_at?: string
          date: string
          id?: string
          user_id: string
          verse_ref: string
        }
        Update: {
          completed_at?: string | null
          content?: Json
          created_at?: string
          date?: string
          id?: string
          user_id?: string
          verse_ref?: string
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
      kb_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string
          id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding: string
          id?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_documents: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kb_ingest_jobs: {
        Row: {
          created_at: string
          document_id: string | null
          error: string | null
          id: string
          processed_chunks: number
          progress: number
          status: string
          title: string
          total_chunks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          error?: string | null
          id?: string
          processed_chunks?: number
          progress?: number
          status?: string
          title: string
          total_chunks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          error?: string | null
          id?: string
          processed_chunks?: number
          progress?: number
          status?: string
          title?: string
          total_chunks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_ingest_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_settings: {
        Row: {
          id: boolean
          match_count: number
          similarity_threshold: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          match_count?: number
          similarity_threshold?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          match_count?: number
          similarity_threshold?: number
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
          preferred_translation: string | null
          preferred_translations: string[]
          preferred_voice_uri: string | null
          reading_immersive_mode: boolean
          theme_preference: string | null
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
          preferred_translation?: string | null
          preferred_translations?: string[]
          preferred_voice_uri?: string | null
          reading_immersive_mode?: boolean
          theme_preference?: string | null
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
          preferred_translation?: string | null
          preferred_translations?: string[]
          preferred_voice_uri?: string | null
          reading_immersive_mode?: boolean
          theme_preference?: string | null
          tradition?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_plans: {
        Row: {
          ai_generated: boolean
          books_filter: string
          category: string
          created_at: string
          created_by: string | null
          custom_days: Json | null
          description: string
          duration_days: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          ai_generated?: boolean
          books_filter?: string
          category?: string
          created_at?: string
          created_by?: string | null
          custom_days?: Json | null
          description: string
          duration_days: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          ai_generated?: boolean
          books_filter?: string
          category?: string
          created_at?: string
          created_by?: string | null
          custom_days?: Json | null
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
      reflection_answers: {
        Row: {
          answer: string
          book_slug: string
          chapter: number
          created_at: string
          id: string
          question: string
          question_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string
          book_slug: string
          chapter: number
          created_at?: string
          id?: string
          question: string
          question_index: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          book_slug?: string
          chapter?: number
          created_at?: string
          id?: string
          question?: string
          question_index?: number
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
      user_document_refs: {
        Row: {
          book_slug: string
          chapter: number
          created_at: string
          document_id: string
          id: string
          ref_raw: string
          user_id: string
          verse_end: number | null
          verse_start: number | null
        }
        Insert: {
          book_slug: string
          chapter: number
          created_at?: string
          document_id: string
          id?: string
          ref_raw: string
          user_id: string
          verse_end?: number | null
          verse_start?: number | null
        }
        Update: {
          book_slug?: string
          chapter?: number
          created_at?: string
          document_id?: string
          id?: string
          ref_raw?: string
          user_id?: string
          verse_end?: number | null
          verse_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_document_refs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "user_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          content_md: string
          created_at: string
          id: string
          is_archived: boolean
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_md?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          tags?: string[]
          title?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_md?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_kb_chunks: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          document_id: string
          id: string
          similarity: number
          source: string
          title: string
        }[]
      }
      purge_expired_bible_cache: { Args: never; Returns: number }
      search_user_documents: {
        Args: {
          p_archived?: boolean
          p_book_slug?: string
          p_chapter?: number
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_tag?: string
          p_verse?: number
        }
        Returns: {
          content_md: string
          created_at: string
          id: string
          is_archived: boolean
          tags: string[]
          title: string
          total_count: number
          type: string
          updated_at: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
