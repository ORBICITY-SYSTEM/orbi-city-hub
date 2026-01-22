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
      ai_director_conversations: {
        Row: {
          created_at: string | null
          id: string
          message: string
          module: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          module?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          module?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_director_meetings: {
        Row: {
          created_at: string | null
          created_by_ai: boolean | null
          description: string | null
          duration_minutes: number | null
          id: string
          module: string | null
          participants: string[] | null
          scheduled_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by_ai?: boolean | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module?: string | null
          participants?: string[] | null
          scheduled_at: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by_ai?: boolean | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module?: string | null
          participants?: string[] | null
          scheduled_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_director_tasks: {
        Row: {
          assigned_to: string | null
          conversation_id: string | null
          created_at: string | null
          created_by_ai: boolean | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by_ai?: boolean | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by_ai?: boolean | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_director_tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "saved_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_integrations: {
        Row: {
          api_key: string
          api_key_encrypted: string | null
          created_at: string
          description: string | null
          expiration_date: string | null
          id: string
          integration_name: string
          is_active: boolean | null
          is_encrypted: boolean | null
          last_used_at: string | null
          notification_sent: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          api_key_encrypted?: string | null
          created_at?: string
          description?: string | null
          expiration_date?: string | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          is_encrypted?: boolean | null
          last_used_at?: string | null
          notification_sent?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          api_key_encrypted?: string | null
          created_at?: string
          description?: string | null
          expiration_date?: string | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          is_encrypted?: boolean | null
          last_used_at?: string | null
          notification_sent?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount: number | null
          cancelled: boolean | null
          channel: string
          checkin: string | null
          checkout: string | null
          confirmation_code: string | null
          created_at: string | null
          currency: string | null
          email_received_at: string
          guest_name: string | null
          id: string
          message_id: string | null
          nights: number | null
          parsed_by_gpt: boolean | null
          parsed_payload: Json | null
          raw_payload: Json | null
          room_number: string | null
          subject: string | null
          thread_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          cancelled?: boolean | null
          channel: string
          checkin?: string | null
          checkout?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          currency?: string | null
          email_received_at: string
          guest_name?: string | null
          id?: string
          message_id?: string | null
          nights?: number | null
          parsed_by_gpt?: boolean | null
          parsed_payload?: Json | null
          raw_payload?: Json | null
          room_number?: string | null
          subject?: string | null
          thread_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          cancelled?: boolean | null
          channel?: string
          checkin?: string | null
          checkout?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          currency?: string | null
          email_received_at?: string
          guest_name?: string | null
          id?: string
          message_id?: string | null
          nights?: number | null
          parsed_by_gpt?: boolean | null
          parsed_payload?: Json | null
          raw_payload?: Json | null
          room_number?: string | null
          subject?: string | null
          thread_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      excel_analysis_results: {
        Row: {
          avg_adr: number
          building_stats: Json | null
          channel_stats: Json | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          monthly_stats: Json
          occupancy_rate: number | null
          rev_par: number | null
          room_stats: Json
          total_bookings: number
          total_nights: number
          total_revenue: number
          unique_rooms: number
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          avg_adr: number
          building_stats?: Json | null
          channel_stats?: Json | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          monthly_stats: Json
          occupancy_rate?: number | null
          rev_par?: number | null
          room_stats: Json
          total_bookings: number
          total_nights: number
          total_revenue: number
          unique_rooms: number
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          avg_adr?: number
          building_stats?: Json | null
          channel_stats?: Json | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          monthly_stats?: Json
          occupancy_rate?: number | null
          rev_par?: number | null
          room_stats?: Json
          total_bookings?: number
          total_nights?: number
          total_revenue?: number
          unique_rooms?: number
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_records: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          note: string | null
          payment_method: string | null
          subcategory: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          id?: string
          note?: string | null
          payment_method?: string | null
          subcategory?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          payment_method?: string | null
          subcategory?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          processing_status: string
          records_processed: number | null
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          processing_status?: string
          records_processed?: number | null
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          processing_status?: string
          records_processed?: number | null
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_analysis_instructions: {
        Row: {
          category: string | null
          created_at: string
          id: string
          instruction_text: string
          is_active: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          instruction_text: string
          is_active?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          instruction_text?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_records: {
        Row: {
          adr: number | null
          building_block: string | null
          channel: string
          checkin_date: string | null
          checkout_date: string | null
          created_at: string
          currency: string | null
          date: string
          expenses: number | null
          id: string
          nights: number | null
          occupancy: number | null
          profit: number | null
          revenue: number | null
          room_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adr?: number | null
          building_block?: string | null
          channel: string
          checkin_date?: string | null
          checkout_date?: string | null
          created_at?: string
          currency?: string | null
          date: string
          expenses?: number | null
          id?: string
          nights?: number | null
          occupancy?: number | null
          profit?: number | null
          revenue?: number | null
          room_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adr?: number | null
          building_block?: string | null
          channel?: string
          checkin_date?: string | null
          checkout_date?: string | null
          created_at?: string
          currency?: string | null
          date?: string
          expenses?: number | null
          id?: string
          nights?: number | null
          occupancy?: number | null
          profit?: number | null
          revenue?: number | null
          room_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          event_id: string
          id: string
          location: string | null
          start_time: string | null
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_id: string
          id?: string
          location?: string | null
          start_time?: string | null
          summary: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_id?: string
          id?: string
          location?: string | null
          start_time?: string | null
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_drive_files: {
        Row: {
          created_at: string
          file_id: string
          id: string
          mime_type: string | null
          modified_time: string | null
          name: string
          size: number | null
          updated_at: string
          user_id: string
          web_view_link: string | null
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          mime_type?: string | null
          modified_time?: string | null
          name: string
          size?: number | null
          updated_at?: string
          user_id: string
          web_view_link?: string | null
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          mime_type?: string | null
          modified_time?: string | null
          name?: string
          size?: number | null
          updated_at?: string
          user_id?: string
          web_view_link?: string | null
        }
        Relationships: []
      }
      google_gmail_messages: {
        Row: {
          created_at: string
          from_email: string | null
          id: string
          message_id: string
          received_date: string | null
          snippet: string | null
          subject: string | null
          thread_id: string | null
          to_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_email?: string | null
          id?: string
          message_id: string
          received_date?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_email?: string | null
          id?: string
          message_id?: string
          received_date?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_tokens: {
        Row: {
          access_token: string
          access_token_encrypted: string | null
          created_at: string
          expires_at: string
          id: string
          refresh_token: string | null
          refresh_token_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          access_token_encrypted?: string | null
          created_at?: string
          expires_at: string
          id?: string
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gpt_memory_documents: {
        Row: {
          ai_analysis: Json | null
          category: string | null
          content: string
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          category?: string | null
          content: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          category?: string | null
          content?: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guest_reviews: {
        Row: {
          ai_generated_reply: string | null
          apartment_code: string | null
          created_at: string
          from_email: string | null
          guest_name: string | null
          id: string
          language: string
          reply_status: string
          review_body: string
          review_date: string
          review_title: string | null
          review_url: string | null
          sentiment: string
          source: string
          source_message_id: string | null
          stars: number | null
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated_reply?: string | null
          apartment_code?: string | null
          created_at?: string
          from_email?: string | null
          guest_name?: string | null
          id?: string
          language: string
          reply_status?: string
          review_body: string
          review_date: string
          review_title?: string | null
          review_url?: string | null
          sentiment?: string
          source: string
          source_message_id?: string | null
          stars?: number | null
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated_reply?: string | null
          apartment_code?: string | null
          created_at?: string
          from_email?: string | null
          guest_name?: string | null
          id?: string
          language?: string
          reply_status?: string
          review_body?: string
          review_date?: string
          review_title?: string | null
          review_url?: string | null
          sentiment?: string
          source?: string
          source_message_id?: string | null
          stars?: number | null
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      housekeeping_schedules: {
        Row: {
          additional_notes: string | null
          completed_at: string | null
          created_at: string
          id: string
          media_urls: string[] | null
          notes: string | null
          rooms: string[]
          scheduled_date: string
          status: string
          total_rooms: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          media_urls?: string[] | null
          notes?: string | null
          rooms: string[]
          scheduled_date: string
          status?: string
          total_rooms: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          media_urls?: string[] | null
          notes?: string | null
          rooms?: string[]
          scheduled_date?: string
          status?: string
          total_rooms?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      logistics_activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          additional_notes: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          id: string
          media_urls: string[] | null
          notes: string | null
          problem: string
          room_number: string
          scheduled_date: string
          solving_date: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          media_urls?: string[] | null
          notes?: string | null
          problem: string
          room_number: string
          scheduled_date: string
          solving_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          media_urls?: string[] | null
          notes?: string | null
          problem?: string
          room_number?: string
          scheduled_date?: string
          solving_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      module_customizations: {
        Row: {
          created_at: string
          custom_description: string | null
          custom_title: string | null
          id: string
          module_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_description?: string | null
          custom_title?: string | null
          id?: string
          module_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_description?: string | null
          custom_title?: string | null
          id?: string
          module_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_analysis_uploads: {
        Row: {
          adr: number | null
          ai_recommendations: string | null
          ai_summary_en: string | null
          ai_summary_ka: string | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          month: number
          net_profit: number | null
          occupancy_rate: number | null
          profit_margin: number | null
          revpar: number | null
          summary_generated_at: string | null
          total_bookings: number | null
          total_expenses: number | null
          total_nights: number | null
          total_revenue: number | null
          total_rooms: number | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          adr?: number | null
          ai_recommendations?: string | null
          ai_summary_en?: string | null
          ai_summary_ka?: string | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          month: number
          net_profit?: number | null
          occupancy_rate?: number | null
          profit_margin?: number | null
          revpar?: number | null
          summary_generated_at?: string | null
          total_bookings?: number | null
          total_expenses?: number | null
          total_nights?: number | null
          total_revenue?: number | null
          total_rooms?: number | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          adr?: number | null
          ai_recommendations?: string | null
          ai_summary_en?: string | null
          ai_summary_ka?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          month?: number
          net_profit?: number | null
          occupancy_rate?: number | null
          profit_margin?: number | null
          revpar?: number | null
          summary_generated_at?: string | null
          total_bookings?: number | null
          total_expenses?: number | null
          total_nights?: number | null
          total_revenue?: number | null
          total_rooms?: number | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      monthly_analysis_versions: {
        Row: {
          ai_recommendations: string | null
          ai_summary_ka: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          upload_id: string
          version_number: number
        }
        Insert: {
          ai_recommendations?: string | null
          ai_summary_ka?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          upload_id: string
          version_number: number
        }
        Update: {
          ai_recommendations?: string | null
          ai_summary_ka?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          upload_id?: string
          version_number?: number
        }
        Relationships: []
      }
      monthly_module_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          module_type: string
          upload_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          module_type: string
          upload_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          module_type?: string
          upload_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_module_uploads_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "monthly_analysis_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reports: {
        Row: {
          average_price: number | null
          cleaning_technical: number | null
          company_profit: number | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          days_available: number | null
          days_occupied: number | null
          id: string
          marketing: number | null
          month: string
          notes: string | null
          occupancy: number | null
          salaries: number | null
          studio_count: number | null
          studio_owners_profit: number | null
          total_expenses: number | null
          total_profit: number | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
          utilities: number | null
        }
        Insert: {
          average_price?: number | null
          cleaning_technical?: number | null
          company_profit?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          days_available?: number | null
          days_occupied?: number | null
          id?: string
          marketing?: number | null
          month: string
          notes?: string | null
          occupancy?: number | null
          salaries?: number | null
          studio_count?: number | null
          studio_owners_profit?: number | null
          total_expenses?: number | null
          total_profit?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
          utilities?: number | null
        }
        Update: {
          average_price?: number | null
          cleaning_technical?: number | null
          company_profit?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          days_available?: number | null
          days_occupied?: number | null
          id?: string
          marketing?: number | null
          month?: string
          notes?: string | null
          occupancy?: number | null
          salaries?: number | null
          studio_count?: number | null
          studio_owners_profit?: number | null
          total_expenses?: number | null
          total_profit?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
          utilities?: number | null
        }
        Relationships: []
      }
      monthly_summaries: {
        Row: {
          adr: number | null
          created_at: string
          forecast_3m: number | null
          id: string
          month: number
          net_profit: number | null
          occupancy: number | null
          summary_en: string | null
          summary_ka: string | null
          total_expenses: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          adr?: number | null
          created_at?: string
          forecast_3m?: number | null
          id?: string
          month: number
          net_profit?: number | null
          occupancy?: number | null
          summary_en?: string | null
          summary_ka?: string | null
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          adr?: number | null
          created_at?: string
          forecast_3m?: number | null
          id?: string
          month?: number
          net_profit?: number | null
          occupancy?: number | null
          summary_en?: string | null
          summary_ka?: string | null
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      pending_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          notes: string | null
          requested_role: Database["public"]["Enums"]["app_role"] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          notes?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_field_definitions: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_label: string
          field_name: string
          field_type: string
          formula: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_label: string
          field_name: string
          field_type?: string
          formula?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_label?: string
          field_name?: string
          field_type?: string
          formula?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      review_import_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          import_date: string
          reviews_imported: number
          reviews_skipped: number
          source: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          import_date?: string
          reviews_imported?: number
          reviews_skipped?: number
          source: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          import_date?: string
          reviews_imported?: number
          reviews_skipped?: number
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      room_inventory_descriptions: {
        Row: {
          change_type: string | null
          created_at: string
          description_date: string
          id: string
          items_added: string | null
          items_missing: string | null
          items_removed: string | null
          notes: string | null
          room_id: string
          transfer_from_room: string | null
          transfer_to_room: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          change_type?: string | null
          created_at?: string
          description_date?: string
          id?: string
          items_added?: string | null
          items_missing?: string | null
          items_removed?: string | null
          notes?: string | null
          room_id: string
          transfer_from_room?: string | null
          transfer_to_room?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          change_type?: string | null
          created_at?: string
          description_date?: string
          id?: string
          items_added?: string | null
          items_missing?: string | null
          items_removed?: string | null
          notes?: string | null
          room_id?: string
          transfer_from_room?: string | null
          transfer_to_room?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_inventory_descriptions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_inventory_items: {
        Row: {
          actual_quantity: number
          condition: string | null
          created_at: string
          id: string
          issue_detected_at: string | null
          issue_resolved_at: string | null
          last_checked: string
          notes: string | null
          room_id: string
          standard_item_id: string
          updated_at: string
        }
        Insert: {
          actual_quantity?: number
          condition?: string | null
          created_at?: string
          id?: string
          issue_detected_at?: string | null
          issue_resolved_at?: string | null
          last_checked?: string
          notes?: string | null
          room_id: string
          standard_item_id: string
          updated_at?: string
        }
        Update: {
          actual_quantity?: number
          condition?: string | null
          created_at?: string
          id?: string
          issue_detected_at?: string | null
          issue_resolved_at?: string | null
          last_checked?: string
          notes?: string | null
          room_id?: string
          standard_item_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_inventory_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_inventory_items_standard_item_id_fkey"
            columns: ["standard_item_id"]
            isOneToOne: false
            referencedRelation: "standard_inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          id: string
          room_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          room_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          room_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_conversations: {
        Row: {
          action_items: Json | null
          ai_summary: string | null
          category: string | null
          conversation_data: Json
          created_at: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          ai_summary?: string | null
          category?: string | null
          conversation_data: Json
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_items?: Json | null
          ai_summary?: string | null
          category?: string | null
          conversation_data?: Json
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      standard_inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          item_name: string
          standard_quantity: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          item_name: string
          standard_quantity: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          item_name?: string
          standard_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          errors: Json | null
          finished_at: string | null
          id: string
          new_bookings: number | null
          started_at: string | null
          status: string | null
          updated_bookings: number | null
          user_id: string
        }
        Insert: {
          errors?: Json | null
          finished_at?: string | null
          id?: string
          new_bookings?: number | null
          started_at?: string | null
          status?: string | null
          updated_bookings?: number | null
          user_id: string
        }
        Update: {
          errors?: Json | null
          finished_at?: string | null
          id?: string
          new_bookings?: number | null
          started_at?: string | null
          status?: string | null
          updated_bookings?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      finance_analytics: {
        Row: {
          avg_daily_rate: number | null
          avg_revenue: number | null
          booking_count: number | null
          building_block: string | null
          channel: string | null
          month: string | null
          total_nights: number | null
          total_revenue: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_google_tokens: {
        Args: { p_user_id: string }
        Returns: {
          access_token: string
          expires_at: string
          refresh_token: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      store_google_tokens: {
        Args: {
          p_access_token: string
          p_expires_at: string
          p_refresh_token: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "manager"
        | "logistics"
        | "finance"
        | "marketing"
        | "customer_service"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "manager",
        "logistics",
        "finance",
        "marketing",
        "customer_service",
      ],
    },
  },
} as const
