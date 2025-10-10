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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      planting_verifications: {
        Row: {
          constituency: string | null
          county: string | null
          created_at: string | null
          id: string
          image_url: string
          latitude: number | null
          longitude: number | null
          mpesa_transaction_id: string | null
          notes: string | null
          phone: string | null
          planting_date: string | null
          rejection_reason: string | null
          reward_amount: number | null
          reward_paid: boolean | null
          reward_paid_at: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          tree_match_id: string | null
          tree_name: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          constituency?: string | null
          county?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          latitude?: number | null
          longitude?: number | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          phone?: string | null
          planting_date?: string | null
          rejection_reason?: string | null
          reward_amount?: number | null
          reward_paid?: boolean | null
          reward_paid_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          tree_match_id?: string | null
          tree_name: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          constituency?: string | null
          county?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          latitude?: number | null
          longitude?: number | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          phone?: string | null
          planting_date?: string | null
          rejection_reason?: string | null
          reward_amount?: number | null
          reward_paid?: boolean | null
          reward_paid_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          tree_match_id?: string | null
          tree_name?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planting_verifications_tree_match_id_fkey"
            columns: ["tree_match_id"]
            isOneToOne: false
            referencedRelation: "tree_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agro_zone: string | null
          climate_zone: Database["public"]["Enums"]["climate_zone"] | null
          conservation_goals:
            | Database["public"]["Enums"]["conservation_goal"][]
            | null
          constituency: string | null
          county: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          land_size_hectares: number | null
          latitude: number | null
          longitude: number | null
          onboarding_completed: boolean | null
          phone: string | null
          preferred_language: string | null
          soil_type: Database["public"]["Enums"]["soil_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agro_zone?: string | null
          climate_zone?: Database["public"]["Enums"]["climate_zone"] | null
          conservation_goals?:
            | Database["public"]["Enums"]["conservation_goal"][]
            | null
          constituency?: string | null
          county?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          land_size_hectares?: number | null
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          soil_type?: Database["public"]["Enums"]["soil_type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agro_zone?: string | null
          climate_zone?: Database["public"]["Enums"]["climate_zone"] | null
          conservation_goals?:
            | Database["public"]["Enums"]["conservation_goal"][]
            | null
          constituency?: string | null
          county?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          land_size_hectares?: number | null
          latitude?: number | null
          longitude?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          soil_type?: Database["public"]["Enums"]["soil_type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tree_matches: {
        Row: {
          compatibility_score: number
          favorited: boolean | null
          id: string
          matched_at: string | null
          notes: string | null
          tree_id: number
          tree_name: string
          user_id: string
        }
        Insert: {
          compatibility_score: number
          favorited?: boolean | null
          id?: string
          matched_at?: string | null
          notes?: string | null
          tree_id: number
          tree_name: string
          user_id: string
        }
        Update: {
          compatibility_score?: number
          favorited?: boolean | null
          id?: string
          matched_at?: string | null
          notes?: string | null
          tree_id?: number
          tree_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          county: string | null
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          approval_rate: number
          pending_by_county: Json
          total_approved: number
          total_pending: number
          total_rejected: number
        }[]
      }
      get_community_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_carbon_sequestered: number
          total_matches: number
          total_users: number
          total_verified_plantings: number
        }[]
      }
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          carbon_sequestered: number
          full_name: string
          rank: number
          total_matches: number
          user_id: string
          verified_count: number
        }[]
      }
      get_verification_queue: {
        Args: Record<PropertyKey, never>
        Returns: {
          constituency: string
          county: string
          created_at: string
          full_name: string
          id: string
          image_url: string
          latitude: number
          longitude: number
          mpesa_transaction_id: string
          notes: string
          planting_date: string
          rejection_reason: string
          reward_amount: number
          reward_paid: boolean
          status: Database["public"]["Enums"]["verification_status"]
          submission_phone: string
          tree_name: string
          user_id: string
          user_phone: string
          verified_at: string
          verified_by: string
          verifier_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      climate_zone:
        | "tropical"
        | "subtropical"
        | "temperate"
        | "cold"
        | "arid"
        | "mediterranean"
      conservation_goal:
        | "carbon_sequestration"
        | "biodiversity"
        | "erosion_control"
        | "water_management"
        | "wildlife_habitat"
        | "food_production"
        | "aesthetic_beauty"
      soil_type: "clay" | "sandy" | "loamy" | "silty" | "peaty" | "chalky"
      verification_status: "pending" | "verified" | "rejected"
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
      climate_zone: [
        "tropical",
        "subtropical",
        "temperate",
        "cold",
        "arid",
        "mediterranean",
      ],
      conservation_goal: [
        "carbon_sequestration",
        "biodiversity",
        "erosion_control",
        "water_management",
        "wildlife_habitat",
        "food_production",
        "aesthetic_beauty",
      ],
      soil_type: ["clay", "sandy", "loamy", "silty", "peaty", "chalky"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
