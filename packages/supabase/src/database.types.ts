export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          id: string;
          is_personal_account: boolean;
          name: string;
          picture_url: string | null;
          primary_owner_user_id: string;
          public_data: Json;
          slug: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          is_personal_account?: boolean;
          name: string;
          picture_url?: string | null;
          primary_owner_user_id?: string;
          public_data?: Json;
          slug?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          is_personal_account?: boolean;
          name?: string;
          picture_url?: string | null;
          primary_owner_user_id?: string;
          public_data?: Json;
          slug?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      accounts_memberships: {
        Row: {
          account_id: string;
          account_role: string;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
        };
        Insert: {
          account_id: string;
          account_role: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string;
          account_role?: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_memberships_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_memberships_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_memberships_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_memberships_account_role_fkey';
            columns: ['account_role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
      asset_history: {
        Row: {
          account_id: string;
          asset_id: string;
          created_at: string | null;
          created_by: string | null;
          event_data: Json;
          event_type: Database['public']['Enums']['asset_event_type'];
          id: string;
        };
        Insert: {
          account_id: string;
          asset_id: string;
          created_at?: string | null;
          created_by?: string | null;
          event_data?: Json;
          event_type: Database['public']['Enums']['asset_event_type'];
          id?: string;
        };
        Update: {
          account_id?: string;
          asset_id?: string;
          created_at?: string | null;
          created_by?: string | null;
          event_data?: Json;
          event_type?: Database['public']['Enums']['asset_event_type'];
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'asset_history_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_history_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_history_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_history_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
        ];
      };
      assets: {
        Row: {
          account_id: string;
          assigned_at: string | null;
          assigned_to: string | null;
          category: Database['public']['Enums']['asset_category'];
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          purchase_date: string | null;
          serial_number: string | null;
          status: Database['public']['Enums']['asset_status'];
          updated_at: string | null;
          updated_by: string | null;
          warranty_expiry_date: string | null;
        };
        Insert: {
          account_id: string;
          assigned_at?: string | null;
          assigned_to?: string | null;
          category: Database['public']['Enums']['asset_category'];
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          purchase_date?: string | null;
          serial_number?: string | null;
          status?: Database['public']['Enums']['asset_status'];
          updated_at?: string | null;
          updated_by?: string | null;
          warranty_expiry_date?: string | null;
        };
        Update: {
          account_id?: string;
          assigned_at?: string | null;
          assigned_to?: string | null;
          category?: Database['public']['Enums']['asset_category'];
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          purchase_date?: string | null;
          serial_number?: string | null;
          status?: Database['public']['Enums']['asset_status'];
          updated_at?: string | null;
          updated_by?: string | null;
          warranty_expiry_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assets_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      billing_customers: {
        Row: {
          account_id: string;
          customer_id: string;
          email: string | null;
          id: number;
          provider: Database['public']['Enums']['billing_provider'];
        };
        Insert: {
          account_id: string;
          customer_id: string;
          email?: string | null;
          id?: number;
          provider: Database['public']['Enums']['billing_provider'];
        };
        Update: {
          account_id?: string;
          customer_id?: string;
          email?: string | null;
          id?: number;
          provider?: Database['public']['Enums']['billing_provider'];
        };
        Relationships: [
          {
            foreignKeyName: 'billing_customers_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'billing_customers_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'billing_customers_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          account_id: string;
          chat_id: number;
          content: string;
          created_at: string | null;
          id: string;
          role: Database['public']['Enums']['chat_role'];
        };
        Insert: {
          account_id: string;
          chat_id?: number;
          content: string;
          created_at?: string | null;
          id?: string;
          role: Database['public']['Enums']['chat_role'];
        };
        Update: {
          account_id?: string;
          chat_id?: number;
          content?: string;
          created_at?: string | null;
          id?: string;
          role?: Database['public']['Enums']['chat_role'];
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
        ];
      };
      chats: {
        Row: {
          account_id: string;
          created_at: string | null;
          id: number;
          name: string;
          reference_id: string;
          settings: Json;
        };
        Insert: {
          account_id: string;
          created_at?: string | null;
          id?: number;
          name: string;
          reference_id: string;
          settings?: Json;
        };
        Update: {
          account_id?: string;
          created_at?: string | null;
          id?: number;
          name?: string;
          reference_id?: string;
          settings?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'chats_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chats_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chats_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      config: {
        Row: {
          billing_provider: Database['public']['Enums']['billing_provider'];
          enable_account_billing: boolean;
          enable_team_account_billing: boolean;
          enable_team_accounts: boolean;
        };
        Insert: {
          billing_provider?: Database['public']['Enums']['billing_provider'];
          enable_account_billing?: boolean;
          enable_team_account_billing?: boolean;
          enable_team_accounts?: boolean;
        };
        Update: {
          billing_provider?: Database['public']['Enums']['billing_provider'];
          enable_account_billing?: boolean;
          enable_team_account_billing?: boolean;
          enable_team_accounts?: boolean;
        };
        Relationships: [];
      };
      credits_usage: {
        Row: {
          account_id: string;
          id: number;
          remaining_credits: number;
        };
        Insert: {
          account_id: string;
          id?: number;
          remaining_credits?: number;
        };
        Update: {
          account_id?: string;
          id?: number;
          remaining_credits?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'credits_usage_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'credits_usage_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'credits_usage_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      dashboard_alerts: {
        Row: {
          account_id: string;
          action_label: string | null;
          action_url: string | null;
          alert_type: Database['public']['Enums']['dashboard_alert_type'];
          created_at: string | null;
          description: string;
          dismissed_at: string | null;
          dismissed_by: string | null;
          expires_at: string | null;
          id: string;
          is_dismissed: boolean;
          metadata: Json | null;
          severity: Database['public']['Enums']['alert_severity'];
          title: string;
        };
        Insert: {
          account_id: string;
          action_label?: string | null;
          action_url?: string | null;
          alert_type: Database['public']['Enums']['dashboard_alert_type'];
          created_at?: string | null;
          description: string;
          dismissed_at?: string | null;
          dismissed_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_dismissed?: boolean;
          metadata?: Json | null;
          severity: Database['public']['Enums']['alert_severity'];
          title: string;
        };
        Update: {
          account_id?: string;
          action_label?: string | null;
          action_url?: string | null;
          alert_type?: Database['public']['Enums']['dashboard_alert_type'];
          created_at?: string | null;
          description?: string;
          dismissed_at?: string | null;
          dismissed_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_dismissed?: boolean;
          metadata?: Json | null;
          severity?: Database['public']['Enums']['alert_severity'];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dashboard_alerts_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'dashboard_alerts_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'dashboard_alerts_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      dashboard_widgets: {
        Row: {
          account_id: string;
          created_at: string | null;
          id: string;
          is_visible: boolean;
          position_order: number;
          updated_at: string | null;
          user_id: string | null;
          widget_config: Json;
          widget_type: string;
        };
        Insert: {
          account_id: string;
          created_at?: string | null;
          id?: string;
          is_visible?: boolean;
          position_order?: number;
          updated_at?: string | null;
          user_id?: string | null;
          widget_config?: Json;
          widget_type: string;
        };
        Update: {
          account_id?: string;
          created_at?: string | null;
          id?: string;
          is_visible?: boolean;
          position_order?: number;
          updated_at?: string | null;
          user_id?: string | null;
          widget_config?: Json;
          widget_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dashboard_widgets_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'dashboard_widgets_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'dashboard_widgets_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      invitations: {
        Row: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: number;
          invite_token?: string;
          invited_by?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invitations_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
      license_assignments: {
        Row: {
          account_id: string;
          assigned_at: string | null;
          assigned_by: string | null;
          assigned_to_asset: string | null;
          assigned_to_user: string | null;
          id: string;
          license_id: string;
          notes: string | null;
        };
        Insert: {
          account_id: string;
          assigned_at?: string | null;
          assigned_by?: string | null;
          assigned_to_asset?: string | null;
          assigned_to_user?: string | null;
          id?: string;
          license_id: string;
          notes?: string | null;
        };
        Update: {
          account_id?: string;
          assigned_at?: string | null;
          assigned_by?: string | null;
          assigned_to_asset?: string | null;
          assigned_to_user?: string | null;
          id?: string;
          license_id?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'license_assignments_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'license_assignments_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'license_assignments_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'license_assignments_assigned_to_asset_fkey';
            columns: ['assigned_to_asset'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'license_assignments_license_id_fkey';
            columns: ['license_id'];
            isOneToOne: false;
            referencedRelation: 'software_licenses';
            referencedColumns: ['id'];
          },
        ];
      };
      license_expiration_check_logs: {
        Row: {
          alerts_created: number;
          completed_at: string;
          created_at: string | null;
          duration_ms: number;
          error_message: string | null;
          id: string;
          started_at: string;
          status: string;
        };
        Insert: {
          alerts_created?: number;
          completed_at: string;
          created_at?: string | null;
          duration_ms: number;
          error_message?: string | null;
          id?: string;
          started_at: string;
          status: string;
        };
        Update: {
          alerts_created?: number;
          completed_at?: string;
          created_at?: string | null;
          duration_ms?: number;
          error_message?: string | null;
          id?: string;
          started_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      license_renewal_alerts: {
        Row: {
          account_id: string;
          alert_type: Database['public']['Enums']['alert_type'];
          id: string;
          license_id: string;
          sent_at: string | null;
        };
        Insert: {
          account_id: string;
          alert_type: Database['public']['Enums']['alert_type'];
          id?: string;
          license_id: string;
          sent_at?: string | null;
        };
        Update: {
          account_id?: string;
          alert_type?: Database['public']['Enums']['alert_type'];
          id?: string;
          license_id?: string;
          sent_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'license_renewal_alerts_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'license_renewal_alerts_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'license_renewal_alerts_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'license_renewal_alerts_license_id_fkey';
            columns: ['license_id'];
            isOneToOne: false;
            referencedRelation: 'software_licenses';
            referencedColumns: ['id'];
          },
        ];
      };
      metrics_refresh_log: {
        Row: {
          completed_at: string;
          created_at: string | null;
          duration_ms: number;
          error_message: string | null;
          id: string;
          refresh_type: string;
          started_at: string;
          status: string;
        };
        Insert: {
          completed_at: string;
          created_at?: string | null;
          duration_ms: number;
          error_message?: string | null;
          id?: string;
          refresh_type: string;
          started_at: string;
          status: string;
        };
        Update: {
          completed_at?: string;
          created_at?: string | null;
          duration_ms?: number;
          error_message?: string | null;
          id?: string;
          refresh_type?: string;
          started_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      nonces: {
        Row: {
          client_token: string;
          created_at: string;
          expires_at: string;
          id: string;
          last_verification_at: string | null;
          last_verification_ip: unknown;
          last_verification_user_agent: string | null;
          metadata: Json | null;
          nonce: string;
          purpose: string;
          revoked: boolean;
          revoked_reason: string | null;
          scopes: string[] | null;
          used_at: string | null;
          user_id: string | null;
          verification_attempts: number;
        };
        Insert: {
          client_token: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          last_verification_at?: string | null;
          last_verification_ip?: unknown;
          last_verification_user_agent?: string | null;
          metadata?: Json | null;
          nonce: string;
          purpose: string;
          revoked?: boolean;
          revoked_reason?: string | null;
          scopes?: string[] | null;
          used_at?: string | null;
          user_id?: string | null;
          verification_attempts?: number;
        };
        Update: {
          client_token?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          last_verification_at?: string | null;
          last_verification_ip?: unknown;
          last_verification_user_agent?: string | null;
          metadata?: Json | null;
          nonce?: string;
          purpose?: string;
          revoked?: boolean;
          revoked_reason?: string | null;
          scopes?: string[] | null;
          used_at?: string | null;
          user_id?: string | null;
          verification_attempts?: number;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          account_id: string;
          body: string;
          channel: Database['public']['Enums']['notification_channel'];
          created_at: string;
          dismissed: boolean;
          expires_at: string | null;
          id: number;
          link: string | null;
          type: Database['public']['Enums']['notification_type'];
        };
        Insert: {
          account_id: string;
          body: string;
          channel?: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          dismissed?: boolean;
          expires_at?: string | null;
          id?: never;
          link?: string | null;
          type?: Database['public']['Enums']['notification_type'];
        };
        Update: {
          account_id?: string;
          body?: string;
          channel?: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          dismissed?: boolean;
          expires_at?: string | null;
          id?: never;
          link?: string | null;
          type?: Database['public']['Enums']['notification_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          price_amount: number | null;
          product_id: string;
          quantity: number;
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          order_id: string;
          price_amount?: number | null;
          product_id: string;
          quantity?: number;
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          price_amount?: number | null;
          product_id?: string;
          quantity?: number;
          updated_at?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          account_id: string;
          billing_customer_id: number;
          billing_provider: Database['public']['Enums']['billing_provider'];
          created_at: string;
          currency: string;
          id: string;
          status: Database['public']['Enums']['payment_status'];
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          billing_customer_id: number;
          billing_provider: Database['public']['Enums']['billing_provider'];
          created_at?: string;
          currency: string;
          id: string;
          status: Database['public']['Enums']['payment_status'];
          total_amount: number;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          billing_customer_id?: number;
          billing_provider?: Database['public']['Enums']['billing_provider'];
          created_at?: string;
          currency?: string;
          id?: string;
          status?: Database['public']['Enums']['payment_status'];
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_billing_customer_id_fkey';
            columns: ['billing_customer_id'];
            isOneToOne: false;
            referencedRelation: 'billing_customers';
            referencedColumns: ['id'];
          },
        ];
      };
      plans: {
        Row: {
          name: string;
          tokens_quota: number;
          variant_id: string;
        };
        Insert: {
          name: string;
          tokens_quota: number;
          variant_id: string;
        };
        Update: {
          name?: string;
          tokens_quota?: number;
          variant_id?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: number;
          permission: Database['public']['Enums']['app_permissions'];
          role: string;
        };
        Insert: {
          id?: number;
          permission: Database['public']['Enums']['app_permissions'];
          role: string;
        };
        Update: {
          id?: number;
          permission?: Database['public']['Enums']['app_permissions'];
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'role_permissions_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
      roles: {
        Row: {
          hierarchy_level: number;
          name: string;
        };
        Insert: {
          hierarchy_level: number;
          name: string;
        };
        Update: {
          hierarchy_level?: number;
          name?: string;
        };
        Relationships: [];
      };
      software_licenses: {
        Row: {
          account_id: string;
          cost: number | null;
          created_at: string | null;
          created_by: string | null;
          expiration_date: string;
          id: string;
          license_key: string;
          license_type: Database['public']['Enums']['license_type'];
          name: string;
          notes: string | null;
          purchase_date: string;
          updated_at: string | null;
          updated_by: string | null;
          vendor: string;
        };
        Insert: {
          account_id: string;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          expiration_date: string;
          id?: string;
          license_key: string;
          license_type: Database['public']['Enums']['license_type'];
          name: string;
          notes?: string | null;
          purchase_date: string;
          updated_at?: string | null;
          updated_by?: string | null;
          vendor: string;
        };
        Update: {
          account_id?: string;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          expiration_date?: string;
          id?: string;
          license_key?: string;
          license_type?: Database['public']['Enums']['license_type'];
          name?: string;
          notes?: string | null;
          purchase_date?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          vendor?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'software_licenses_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'software_licenses_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'software_licenses_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      subscription_items: {
        Row: {
          created_at: string;
          id: string;
          interval: string;
          interval_count: number;
          price_amount: number | null;
          product_id: string;
          quantity: number;
          subscription_id: string;
          type: Database['public']['Enums']['subscription_item_type'];
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          interval: string;
          interval_count: number;
          price_amount?: number | null;
          product_id: string;
          quantity?: number;
          subscription_id: string;
          type: Database['public']['Enums']['subscription_item_type'];
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          interval?: string;
          interval_count?: number;
          price_amount?: number | null;
          product_id?: string;
          quantity?: number;
          subscription_id?: string;
          type?: Database['public']['Enums']['subscription_item_type'];
          updated_at?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscription_items_subscription_id_fkey';
            columns: ['subscription_id'];
            isOneToOne: false;
            referencedRelation: 'subscriptions';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          account_id: string;
          active: boolean;
          billing_customer_id: number;
          billing_provider: Database['public']['Enums']['billing_provider'];
          cancel_at_period_end: boolean;
          created_at: string;
          currency: string;
          id: string;
          period_ends_at: string;
          period_starts_at: string;
          status: Database['public']['Enums']['subscription_status'];
          trial_ends_at: string | null;
          trial_starts_at: string | null;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          active: boolean;
          billing_customer_id: number;
          billing_provider: Database['public']['Enums']['billing_provider'];
          cancel_at_period_end: boolean;
          created_at?: string;
          currency: string;
          id: string;
          period_ends_at: string;
          period_starts_at: string;
          status: Database['public']['Enums']['subscription_status'];
          trial_ends_at?: string | null;
          trial_starts_at?: string | null;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          active?: boolean;
          billing_customer_id?: number;
          billing_provider?: Database['public']['Enums']['billing_provider'];
          cancel_at_period_end?: boolean;
          created_at?: string;
          currency?: string;
          id?: string;
          period_ends_at?: string;
          period_starts_at?: string;
          status?: Database['public']['Enums']['subscription_status'];
          trial_ends_at?: string | null;
          trial_starts_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_billing_customer_id_fkey';
            columns: ['billing_customer_id'];
            isOneToOne: false;
            referencedRelation: 'billing_customers';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          account_id: string;
          created_at: string;
          description: string | null;
          done: boolean;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          description?: string | null;
          done?: boolean;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          description?: string | null;
          done?: boolean;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      user_account_status: {
        Row: {
          account_id: string;
          created_at: string | null;
          status: Database['public']['Enums']['user_status'];
          status_changed_at: string | null;
          status_changed_by: string | null;
          status_reason: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          account_id: string;
          created_at?: string | null;
          status?: Database['public']['Enums']['user_status'];
          status_changed_at?: string | null;
          status_changed_by?: string | null;
          status_reason?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string;
          created_at?: string | null;
          status?: Database['public']['Enums']['user_status'];
          status_changed_at?: string | null;
          status_changed_by?: string | null;
          status_reason?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_account_status_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_account_status_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_account_status_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      user_activity_log: {
        Row: {
          account_id: string;
          action_details: Json | null;
          action_type: Database['public']['Enums']['user_action_type'];
          created_at: string | null;
          id: string;
          ip_address: unknown;
          resource_id: string | null;
          resource_type: string | null;
          result_status: Database['public']['Enums']['action_result_status'];
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          account_id: string;
          action_details?: Json | null;
          action_type: Database['public']['Enums']['user_action_type'];
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          resource_id?: string | null;
          resource_type?: string | null;
          result_status: Database['public']['Enums']['action_result_status'];
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string;
          action_details?: Json | null;
          action_type?: Database['public']['Enums']['user_action_type'];
          created_at?: string | null;
          id?: string;
          ip_address?: unknown;
          resource_id?: string | null;
          resource_type?: string | null;
          result_status?: Database['public']['Enums']['action_result_status'];
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_activity_log_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_activity_log_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_activity_log_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          created_by: string | null;
          department: string | null;
          display_name: string | null;
          id: string;
          job_title: string | null;
          location: string | null;
          metadata: Json | null;
          phone_number: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          department?: string | null;
          display_name?: string | null;
          id: string;
          job_title?: string | null;
          location?: string | null;
          metadata?: Json | null;
          phone_number?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          department?: string | null;
          display_name?: string | null;
          id?: string;
          job_title?: string | null;
          location?: string | null;
          metadata?: Json | null;
          phone_number?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      platform_metrics: {
        Row: {
          last_updated: string | null;
          new_accounts_30d: number | null;
          new_assets_30d: number | null;
          new_users_30d: number | null;
          total_accounts: number | null;
          total_assets: number | null;
          total_licenses: number | null;
          total_users: number | null;
        };
        Relationships: [];
      };
      user_account_workspace: {
        Row: {
          id: string | null;
          name: string | null;
          picture_url: string | null;
          subscription_status:
            | Database['public']['Enums']['subscription_status']
            | null;
        };
        Relationships: [];
      };
      user_accounts: {
        Row: {
          id: string | null;
          name: string | null;
          picture_url: string | null;
          role: string | null;
          slug: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_memberships_account_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
    };
    Functions: {
      accept_invitation: {
        Args: { token: string; user_id: string };
        Returns: string;
      };
      add_invitations_to_account: {
        Args: {
          account_slug: string;
          invitations: Database['public']['CompositeTypes']['invitation'][];
        };
        Returns: Database['public']['Tables']['invitations']['Row'][];
      };
      can_action_account_member: {
        Args: { target_team_account_id: string; target_user_id: string };
        Returns: boolean;
      };
      check_license_expirations: { Args: never; Returns: undefined };
      check_license_expirations_with_logging: {
        Args: never;
        Returns: undefined;
      };
      cleanup_old_metrics_logs: { Args: never; Returns: undefined };
      create_dashboard_alert: {
        Args: {
          p_account_id: string;
          p_action_label?: string;
          p_action_url?: string;
          p_alert_type: Database['public']['Enums']['dashboard_alert_type'];
          p_description: string;
          p_expires_at?: string;
          p_metadata?: Json;
          p_severity: Database['public']['Enums']['alert_severity'];
          p_title: string;
        };
        Returns: string;
      };
      create_invitation: {
        Args: { account_id: string; email: string; role: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'invitations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_nonce: {
        Args: {
          p_expires_in_seconds?: number;
          p_metadata?: Json;
          p_purpose?: string;
          p_revoke_previous?: boolean;
          p_scopes?: string[];
          p_user_id?: string;
        };
        Returns: Json;
      };
      create_team_account: {
        Args: { account_name: string };
        Returns: {
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          id: string;
          is_personal_account: boolean;
          name: string;
          picture_url: string | null;
          primary_owner_user_id: string;
          public_data: Json;
          slug: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'accounts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deduct_credits: {
        Args: { account_id: string; amount: number };
        Returns: undefined;
      };
      get_account_activity_list: {
        Args: { p_limit?: number; p_offset?: number };
        Returns: {
          account_id: string;
          account_name: string;
          account_slug: string;
          asset_count: number;
          created_at: string;
          last_activity_at: string;
          user_count: number;
        }[];
      };
      get_account_invitations: {
        Args: { account_slug: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invited_by: string;
          inviter_email: string;
          inviter_name: string;
          role: string;
          updated_at: string;
        }[];
      };
      get_account_members: {
        Args: { account_slug: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          name: string;
          picture_url: string;
          primary_owner_user_id: string;
          role: string;
          role_hierarchy_level: number;
          user_id: string;
        }[];
      };
      get_admin_platform_metrics: { Args: never; Returns: Json };
      get_asset_status_distribution: {
        Args: { p_account_slug: string };
        Returns: {
          count: number;
          percentage: number;
          status: string;
        }[];
      };
      get_config: { Args: never; Returns: Json };
      get_dashboard_trends: {
        Args: {
          p_account_slug: string;
          p_days?: number;
          p_metric_type: string;
        };
        Returns: {
          date: string;
          value: number;
        }[];
      };
      get_license_expiration_check_stats: {
        Args: never;
        Returns: {
          average_duration_ms: number;
          failed_checks: number;
          last_check_at: string;
          successful_checks: number;
          total_alerts_created: number;
          total_checks: number;
        }[];
      };
      get_license_stats: {
        Args: { p_account_id: string };
        Returns: {
          expired: number;
          expiring_soon: number;
          total_assignments: number;
          total_licenses: number;
        }[];
      };
      get_licenses_with_assignments: {
        Args: { p_account_id: string };
        Returns: {
          assignment_count: number;
          days_until_expiry: number;
          expiration_date: string;
          id: string;
          is_expired: boolean;
          license_key: string;
          license_type: Database['public']['Enums']['license_type'];
          name: string;
          vendor: string;
        }[];
      };
      get_metrics_refresh_stats: {
        Args: { p_hours?: number };
        Returns: {
          avg_duration_ms: number;
          failed_refreshes: number;
          last_error: string;
          last_refresh_at: string;
          max_duration_ms: number;
          min_duration_ms: number;
          success_rate: number;
          successful_refreshes: number;
          total_refreshes: number;
        }[];
      };
      get_most_active_accounts: {
        Args: { p_days?: number; p_limit?: number };
        Returns: {
          account_id: string;
          account_name: string;
          account_slug: string;
          assets_created: number;
          licenses_registered: number;
          maintenance_scheduled: number;
          total_activity_score: number;
          users_added: number;
        }[];
      };
      get_nonce_status: { Args: { p_id: string }; Returns: Json };
      get_platform_usage_statistics: {
        Args: { p_days?: number };
        Returns: {
          active_accounts_count: number;
          adoption_rate: number;
          feature_name: string;
          previous_period_usage: number;
          total_usage_count: number;
          trend_direction: string;
        }[];
      };
      get_subscription_overview: {
        Args: never;
        Returns: {
          account_count: number;
          expiring_soon_count: number;
          over_limit_count: number;
          tier: string;
          total_revenue: number;
        }[];
      };
      get_team_dashboard_metrics: {
        Args: { p_account_slug: string };
        Returns: Json;
      };
      get_team_members: {
        Args: {
          p_account_slug: string;
          p_limit?: number;
          p_offset?: number;
          p_role?: string;
          p_search?: string;
          p_status?: string;
        };
        Returns: {
          avatar_url: string;
          created_at: string;
          display_name: string;
          email: string;
          last_sign_in_at: string;
          role_name: string;
          status: string;
          user_id: string;
        }[];
      };
      get_team_members_count: {
        Args: {
          p_account_slug: string;
          p_role?: string;
          p_search?: string;
          p_status?: string;
        };
        Returns: number;
      };
      get_upper_system_role: { Args: never; Returns: string };
      has_active_subscription: {
        Args: { target_account_id: string };
        Returns: boolean;
      };
      has_credits: { Args: { account_id: string }; Returns: boolean };
      has_more_elevated_role: {
        Args: {
          role_name: string;
          target_account_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      has_permission: {
        Args: {
          account_id: string;
          permission_name: Database['public']['Enums']['app_permissions'];
          user_id: string;
        };
        Returns: boolean;
      };
      has_role_on_account: {
        Args: { account_id: string; account_role?: string };
        Returns: boolean;
      };
      has_same_role_hierarchy_level: {
        Args: {
          role_name: string;
          target_account_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      is_aal2: { Args: never; Returns: boolean };
      is_account_owner: { Args: { account_id: string }; Returns: boolean };
      is_account_team_member: {
        Args: { target_account_id: string };
        Returns: boolean;
      };
      is_mfa_compliant: { Args: never; Returns: boolean };
      is_set: { Args: { field_name: string }; Returns: boolean };
      is_super_admin: { Args: never; Returns: boolean };
      is_team_member: {
        Args: { account_id: string; user_id: string };
        Returns: boolean;
      };
      log_user_activity: {
        Args: {
          p_account_id: string;
          p_action_details?: Json;
          p_action_type: Database['public']['Enums']['user_action_type'];
          p_resource_id?: string;
          p_resource_type?: string;
          p_result_status?: Database['public']['Enums']['action_result_status'];
          p_user_id: string;
        };
        Returns: undefined;
      };
      refresh_platform_metrics: { Args: never; Returns: undefined };
      refresh_platform_metrics_with_logging: {
        Args: never;
        Returns: undefined;
      };
      revoke_nonce: {
        Args: { p_id: string; p_reason?: string };
        Returns: boolean;
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
      team_account_workspace: {
        Args: { account_slug: string };
        Returns: {
          id: string;
          name: string;
          permissions: Database['public']['Enums']['app_permissions'][];
          picture_url: string;
          primary_owner_user_id: string;
          role: string;
          role_hierarchy_level: number;
          slug: string;
          subscription_status: Database['public']['Enums']['subscription_status'];
        }[];
      };
      transfer_team_account_ownership: {
        Args: { new_owner_id: string; target_account_id: string };
        Returns: undefined;
      };
      trigger_platform_metrics_refresh: { Args: never; Returns: Json };
      update_user_status: {
        Args: {
          p_account_id: string;
          p_reason?: string;
          p_status: Database['public']['Enums']['user_status'];
          p_user_id: string;
        };
        Returns: undefined;
      };
      upsert_order: {
        Args: {
          billing_provider: Database['public']['Enums']['billing_provider'];
          currency: string;
          line_items: Json;
          status: Database['public']['Enums']['payment_status'];
          target_account_id: string;
          target_customer_id: string;
          target_order_id: string;
          total_amount: number;
        };
        Returns: {
          account_id: string;
          billing_customer_id: number;
          billing_provider: Database['public']['Enums']['billing_provider'];
          created_at: string;
          currency: string;
          id: string;
          status: Database['public']['Enums']['payment_status'];
          total_amount: number;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'orders';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      upsert_subscription: {
        Args: {
          active: boolean;
          billing_provider: Database['public']['Enums']['billing_provider'];
          cancel_at_period_end: boolean;
          currency: string;
          line_items: Json;
          period_ends_at: string;
          period_starts_at: string;
          status: Database['public']['Enums']['subscription_status'];
          target_account_id: string;
          target_customer_id: string;
          target_subscription_id: string;
          trial_ends_at?: string;
          trial_starts_at?: string;
        };
        Returns: {
          account_id: string;
          active: boolean;
          billing_customer_id: number;
          billing_provider: Database['public']['Enums']['billing_provider'];
          cancel_at_period_end: boolean;
          created_at: string;
          currency: string;
          id: string;
          period_ends_at: string;
          period_starts_at: string;
          status: Database['public']['Enums']['subscription_status'];
          trial_ends_at: string | null;
          trial_starts_at: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'subscriptions';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      verify_nonce: {
        Args: {
          p_ip?: unknown;
          p_max_verification_attempts?: number;
          p_purpose: string;
          p_required_scopes?: string[];
          p_token: string;
          p_user_agent?: string;
          p_user_id?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      action_result_status: 'success' | 'failure' | 'partial';
      alert_severity: 'info' | 'warning' | 'critical';
      alert_type: '30_day' | '7_day';
      app_permissions:
        | 'roles.manage'
        | 'billing.manage'
        | 'settings.manage'
        | 'members.manage'
        | 'invites.manage'
        | 'tasks.write'
        | 'tasks.delete'
        | 'licenses.view'
        | 'licenses.create'
        | 'licenses.update'
        | 'licenses.delete'
        | 'licenses.manage'
        | 'assets.view'
        | 'assets.create'
        | 'assets.update'
        | 'assets.delete'
        | 'assets.manage'
        | 'dashboard.view'
        | 'dashboard.manage';
      asset_category:
        | 'laptop'
        | 'desktop'
        | 'mobile_phone'
        | 'tablet'
        | 'monitor'
        | 'printer'
        | 'other_equipment';
      asset_event_type:
        | 'created'
        | 'updated'
        | 'status_changed'
        | 'assigned'
        | 'unassigned'
        | 'deleted';
      asset_status:
        | 'available'
        | 'assigned'
        | 'in_maintenance'
        | 'retired'
        | 'lost';
      billing_provider: 'stripe' | 'lemon-squeezy' | 'paddle';
      chat_role: 'user' | 'assistant';
      dashboard_alert_type:
        | 'low_asset_availability'
        | 'expiring_licenses'
        | 'pending_maintenance'
        | 'unusual_activity'
        | 'system_health'
        | 'subscription_expiring'
        | 'usage_limit_approaching';
      license_type:
        | 'perpetual'
        | 'subscription'
        | 'volume'
        | 'oem'
        | 'trial'
        | 'educational'
        | 'enterprise';
      notification_channel: 'in_app' | 'email';
      notification_type: 'info' | 'warning' | 'error';
      payment_status: 'pending' | 'succeeded' | 'failed';
      subscription_item_type: 'flat' | 'per_seat' | 'metered';
      subscription_status:
        | 'active'
        | 'trialing'
        | 'past_due'
        | 'canceled'
        | 'unpaid'
        | 'incomplete'
        | 'incomplete_expired'
        | 'paused';
      user_action_type:
        | 'user_created'
        | 'user_updated'
        | 'user_deleted'
        | 'role_changed'
        | 'status_changed'
        | 'asset_assigned'
        | 'asset_unassigned'
        | 'login'
        | 'logout'
        | 'password_changed'
        | 'profile_updated';
      user_status: 'active' | 'inactive' | 'suspended' | 'pending_invitation';
    };
    CompositeTypes: {
      invitation: {
        email: string | null;
        role: string | null;
      };
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      buckets_analytics: {
        Row: {
          created_at: string;
          format: string;
          id: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          format?: string;
          id: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          format?: string;
          id?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      iceberg_namespaces: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_namespaces_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
        ];
      };
      iceberg_tables: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          location: string;
          name: string;
          namespace_id: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id?: string;
          location: string;
          name: string;
          namespace_id: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          location?: string;
          name?: string;
          namespace_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_tables_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'iceberg_tables_namespace_id_fkey';
            columns: ['namespace_id'];
            isOneToOne: false;
            referencedRelation: 'iceberg_namespaces';
            referencedColumns: ['id'];
          },
        ];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          level: number | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      prefixes: {
        Row: {
          bucket_id: string;
          created_at: string | null;
          level: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          bucket_id: string;
          created_at?: string | null;
          level?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string;
          created_at?: string | null;
          level?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prefixes_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string };
        Returns: undefined;
      };
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string };
        Returns: undefined;
      };
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      delete_prefix: {
        Args: { _bucket_id: string; _name: string };
        Returns: boolean;
      };
      extension: { Args: { name: string }; Returns: string };
      filename: { Args: { name: string }; Returns: string };
      foldername: { Args: { name: string }; Returns: string[] };
      get_level: { Args: { name: string }; Returns: number };
      get_prefix: { Args: { name: string }; Returns: string };
      get_prefixes: { Args: { name: string }; Returns: string[] };
      get_size_by_bucket: {
        Args: never;
        Returns: {
          bucket_id: string;
          size: number;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
          prefix_param: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_token?: string;
          prefix_param: string;
          start_after?: string;
        };
        Returns: {
          id: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      operation: { Args: never; Returns: string };
      search: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_legacy_v1: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v1_optimised: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v2: {
        Args: {
          bucket_name: string;
          levels?: number;
          limits?: number;
          prefix: string;
          sort_column?: string;
          sort_column_after?: string;
          sort_order?: string;
          start_after?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      buckettype: 'STANDARD' | 'ANALYTICS';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_result_status: ['success', 'failure', 'partial'],
      alert_severity: ['info', 'warning', 'critical'],
      alert_type: ['30_day', '7_day'],
      app_permissions: [
        'roles.manage',
        'billing.manage',
        'settings.manage',
        'members.manage',
        'invites.manage',
        'tasks.write',
        'tasks.delete',
        'licenses.view',
        'licenses.create',
        'licenses.update',
        'licenses.delete',
        'licenses.manage',
        'assets.view',
        'assets.create',
        'assets.update',
        'assets.delete',
        'assets.manage',
        'dashboard.view',
        'dashboard.manage',
      ],
      asset_category: [
        'laptop',
        'desktop',
        'mobile_phone',
        'tablet',
        'monitor',
        'printer',
        'other_equipment',
      ],
      asset_event_type: [
        'created',
        'updated',
        'status_changed',
        'assigned',
        'unassigned',
        'deleted',
      ],
      asset_status: [
        'available',
        'assigned',
        'in_maintenance',
        'retired',
        'lost',
      ],
      billing_provider: ['stripe', 'lemon-squeezy', 'paddle'],
      chat_role: ['user', 'assistant'],
      dashboard_alert_type: [
        'low_asset_availability',
        'expiring_licenses',
        'pending_maintenance',
        'unusual_activity',
        'system_health',
        'subscription_expiring',
        'usage_limit_approaching',
      ],
      license_type: [
        'perpetual',
        'subscription',
        'volume',
        'oem',
        'trial',
        'educational',
        'enterprise',
      ],
      notification_channel: ['in_app', 'email'],
      notification_type: ['info', 'warning', 'error'],
      payment_status: ['pending', 'succeeded', 'failed'],
      subscription_item_type: ['flat', 'per_seat', 'metered'],
      subscription_status: [
        'active',
        'trialing',
        'past_due',
        'canceled',
        'unpaid',
        'incomplete',
        'incomplete_expired',
        'paused',
      ],
      user_action_type: [
        'user_created',
        'user_updated',
        'user_deleted',
        'role_changed',
        'status_changed',
        'asset_assigned',
        'asset_unassigned',
        'login',
        'logout',
        'password_changed',
        'profile_updated',
      ],
      user_status: ['active', 'inactive', 'suspended', 'pending_invitation'],
    },
  },
  storage: {
    Enums: {
      buckettype: ['STANDARD', 'ANALYTICS'],
    },
  },
} as const;
