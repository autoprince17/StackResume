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
      students: {
        Row: {
          id: string
          name: string
          email: string
          tier: 'starter' | 'professional' | 'flagship'
          status: 'submitted' | 'approved' | 'deployed' | 'rejected' | 'edits_requested' | 'error'
          subdomain: string | null
          custom_domain: string | null
          cohort_id: string | null
          stripe_payment_intent_id: string | null
          stripe_customer_id: string | null
          error_message: string | null
          rejection_reason: string | null
          refund_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          tier: 'starter' | 'professional' | 'flagship'
          status?: 'submitted' | 'approved' | 'deployed' | 'rejected' | 'edits_requested' | 'error'
          subdomain?: string | null
          custom_domain?: string | null
          cohort_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          error_message?: string | null
          rejection_reason?: string | null
          refund_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          tier?: 'starter' | 'professional' | 'flagship'
          status?: 'submitted' | 'approved' | 'deployed' | 'rejected' | 'edits_requested' | 'error'
          subdomain?: string | null
          custom_domain?: string | null
          cohort_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          error_message?: string | null
          rejection_reason?: string | null
          refund_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          student_id: string
          role: 'Developer' | 'Data Scientist' | 'DevOps'
          bio: string
          tech_stack: string[]
          skills: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          role: 'Developer' | 'Data Scientist' | 'DevOps'
          bio: string
          tech_stack?: string[]
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          role?: 'Developer' | 'Data Scientist' | 'DevOps'
          bio?: string
          tech_stack?: string[]
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string
          tech_stack: string[]
          github_url: string
          live_url: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description: string
          tech_stack?: string[]
          github_url: string
          live_url?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string
          tech_stack?: string[]
          github_url?: string
          live_url?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      experience: {
        Row: {
          id: string
          student_id: string
          organization: string
          role: string
          start_date: string
          end_date: string | null
          description: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          organization: string
          role: string
          start_date: string
          end_date?: string | null
          description: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          organization?: string
          role?: string
          start_date?: string
          end_date?: string | null
          description?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      social_links: {
        Row: {
          id: string
          student_id: string
          github: string | null
          linkedin: string | null
          existing_portfolio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          github?: string | null
          linkedin?: string | null
          existing_portfolio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          github?: string | null
          linkedin?: string | null
          existing_portfolio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          student_id: string
          profile_photo_url: string | null
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          profile_photo_url?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          profile_photo_url?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tier_limits_snapshot: {
        Row: {
          id: string
          student_id: string
          tier: string
          max_projects: number
          custom_domain_allowed: boolean
          analytics_allowed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          tier: string
          max_projects: number
          custom_domain_allowed: boolean
          analytics_allowed: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          tier?: string
          max_projects?: number
          custom_domain_allowed?: boolean
          analytics_allowed?: boolean
          created_at?: string
        }
      }
      change_requests: {
        Row: {
          id: string
          student_id: string
          type: 'content_edit' | 'template_swap' | 'redesign' | 'link_update'
          description: string
          status: 'pending' | 'approved' | 'completed' | 'rejected'
          is_paid: boolean
          amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          type: 'content_edit' | 'template_swap' | 'redesign' | 'link_update'
          description: string
          status?: 'pending' | 'approved' | 'completed' | 'rejected'
          is_paid?: boolean
          amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          type?: 'content_edit' | 'template_swap' | 'redesign' | 'link_update'
          description?: string
          status?: 'pending' | 'approved' | 'completed' | 'rejected'
          is_paid?: boolean
          amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      deployment_queue: {
        Row: {
          id: string
          student_id: string
          status: 'queued' | 'processing' | 'completed' | 'failed'
          vercel_project_id: string | null
          deployment_url: string | null
          error_message: string | null
          retry_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          status?: 'queued' | 'processing' | 'completed' | 'failed'
          vercel_project_id?: string | null
          deployment_url?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          status?: 'queued' | 'processing' | 'completed' | 'failed'
          vercel_project_id?: string | null
          deployment_url?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      cohorts: {
        Row: {
          id: string
          name: string
          institution: string | null
          is_white_label: boolean
          custom_domain: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          institution?: string | null
          is_white_label?: boolean
          custom_domain?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          institution?: string | null
          is_white_label?: boolean
          custom_domain?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'super_admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'super_admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'super_admin'
          created_at?: string
        }
      }
    }
  }
}
