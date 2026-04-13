/**
 * Matrix Advanced Solutions — Supabase Database Types
 *
 * This file defines the TypeScript types for the Supabase database.
 * In production, regenerate with: npx supabase gen types typescript --project-id <id>
 *
 * These types match the schema_v1.sql + migrations 001-013.
 */

// ─── JSON Type (matches Supabase convention) ────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enum Types ─────────────────────────────────────────────────

export type ClinicTier = "new" | "returning";
export type UserRole = "clinic_admin" | "clinic_staff" | "matrix_admin" | "matrix_staff";
export type OrderStatus = "draft" | "submitted" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "awaiting_wire" | "paid" | "confirmed" | "failed" | "refunded";
export type PaymentMethod = "wire" | "card" | "ach";
export type MfgStatus = "pending" | "batched" | "in_production" | "shipped" | "received";
export type InvoiceType = "consulting" | "product";
export type InvoiceStatus = "draft" | "sent" | "paid" | "unpaid" | "overdue" | "void";
export type BatchStatus = "draft" | "submitted" | "acknowledged" | "in_production" | "shipped" | "received";
export type OnboardingStatus = "pending" | "submitted" | "approved" | "rejected";
export type ChallengeStatus = "active" | "completed" | "paused" | "archived";
export type ParticipantStatus = "registered" | "active" | "completed" | "withdrawn";
export type ChallengePhase = "baseline" | "protocol" | "results";

// ─── Convenience Row Types (exported for app code) ──────────────

export type Clinic = Database["public"]["Tables"]["clinics"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type BatchPO = Database["public"]["Tables"]["batch_pos"]["Row"];
export type BatchPOItem = Database["public"]["Tables"]["batch_po_items"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type SalesRep = Database["public"]["Tables"]["sales_reps"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];
export type ChallengeParticipant = Database["public"]["Tables"]["challenge_participants"]["Row"];
export type ChallengeEntry = Database["public"]["Tables"]["challenge_entries"]["Row"];
export type ProductBundle = Database["public"]["Tables"]["product_bundles"]["Row"];
export type ProductBundleItem = Database["public"]["Tables"]["product_bundle_items"]["Row"];

// Bundle with components joined for display/editing
export interface BundleWithItems extends ProductBundle {
  items: Array<ProductBundleItem & { product: Product }>;
}

// Frozen snapshot of bundle contents stored in order_items.bundle_snapshot
export interface BundleSnapshot {
  bundle_sku: string;
  bundle_name: string;
  components: Array<{
    product_id: string;
    sku: string;
    name: string;
    quantity: number;
  }>;
}

// ─── Supabase Database Type (for client generics) ───────────────

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          primary_contact_name: string;
          primary_email: string;
          primary_phone: string | null;
          business_address: string | null;
          shipping_address: string | null;
          tax_id: string | null;
          tier: ClinicTier;
          wire_verified: boolean;
          card_enabled: boolean;
          ach_enabled: boolean;
          ach_verified: boolean;
          ach_verified_at: string | null;
          stripe_customer_id: string | null;
          stripe_bank_account_pm_id: string | null;
          completed_order_count: number;
          onboarding_status: OnboardingStatus;
          practice_type: string | null;
          medical_license: string | null;
          npi_number: string | null;
          onboarding_submitted_at: string | null;
          onboarding_reviewed_at: string | null;
          onboarding_reviewed_by: string | null;
          onboarding_rejection_reason: string | null;
          assigned_rep_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          primary_contact_name: string;
          primary_email: string;
          primary_phone?: string | null;
          business_address?: string | null;
          shipping_address?: string | null;
          tax_id?: string | null;
          tier?: ClinicTier;
          wire_verified?: boolean;
          card_enabled?: boolean;
          ach_enabled?: boolean;
          ach_verified?: boolean;
          ach_verified_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_bank_account_pm_id?: string | null;
          completed_order_count?: number;
          onboarding_status?: OnboardingStatus;
          practice_type?: string | null;
          medical_license?: string | null;
          npi_number?: string | null;
          onboarding_submitted_at?: string | null;
          onboarding_reviewed_at?: string | null;
          onboarding_reviewed_by?: string | null;
          onboarding_rejection_reason?: string | null;
          assigned_rep_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          primary_contact_name?: string;
          primary_email?: string;
          primary_phone?: string | null;
          business_address?: string | null;
          shipping_address?: string | null;
          tax_id?: string | null;
          tier?: ClinicTier;
          wire_verified?: boolean;
          card_enabled?: boolean;
          ach_enabled?: boolean;
          ach_verified?: boolean;
          ach_verified_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_bank_account_pm_id?: string | null;
          completed_order_count?: number;
          onboarding_status?: OnboardingStatus;
          practice_type?: string | null;
          medical_license?: string | null;
          npi_number?: string | null;
          onboarding_submitted_at?: string | null;
          onboarding_reviewed_at?: string | null;
          onboarding_reviewed_by?: string | null;
          onboarding_rejection_reason?: string | null;
          assigned_rep_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinics_assigned_rep_id_fkey";
            columns: ["assigned_rep_id"];
            isOneToOne: false;
            referencedRelation: "sales_reps";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          clinic_id: string | null;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          clinic_id?: string | null;
          role: UserRole;
          full_name: string;
          email: string;
          phone?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string | null;
          role?: UserRole;
          full_name?: string;
          email?: string;
          phone?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          category: string;
          description: string | null;
          unit: string;
          prices: number[];
          costs: number[];
          is_active: boolean;
          is_featured: boolean;
          supplier_id: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku: string;
          category: string;
          description?: string | null;
          unit: string;
          prices: number[];
          costs: number[];
          is_active?: boolean;
          is_featured?: boolean;
          supplier_id?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string;
          category?: string;
          description?: string | null;
          unit?: string;
          prices?: number[];
          costs?: number[];
          is_active?: boolean;
          is_featured?: boolean;
          supplier_id?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          clinic_id: string;
          order_number: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          payment_method: PaymentMethod | null;
          mfg_status: MfgStatus;
          subtotal: number;
          shipping_cost: number;
          total: number;
          total_cost: number;
          shipping_method: string | null;
          shipping_address: string | null;
          notes: string | null;
          wire_reference: string | null;
          wire_confirmed_by: string | null;
          wire_confirmed_at: string | null;
          stripe_payment_intent_id: string | null;
          batch_po_id: string | null;
          tracking_number: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          order_number?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod | null;
          mfg_status?: MfgStatus;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          total_cost?: number;
          shipping_method?: string | null;
          shipping_address?: string | null;
          notes?: string | null;
          wire_reference?: string | null;
          wire_confirmed_by?: string | null;
          wire_confirmed_at?: string | null;
          stripe_payment_intent_id?: string | null;
          batch_po_id?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          order_number?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod | null;
          mfg_status?: MfgStatus;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          total_cost?: number;
          shipping_method?: string | null;
          shipping_address?: string | null;
          notes?: string | null;
          wire_reference?: string | null;
          wire_confirmed_by?: string | null;
          wire_confirmed_at?: string | null;
          stripe_payment_intent_id?: string | null;
          batch_po_id?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          bundle_id: string | null;
          bundle_snapshot: Json | null;
          sku: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          unit_cost: number;
          tier_applied: string;
          line_total: number;
          line_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          bundle_id?: string | null;
          bundle_snapshot?: Json | null;
          sku: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          unit_cost: number;
          tier_applied: string;
          line_total: number;
          line_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          bundle_id?: string | null;
          bundle_snapshot?: Json | null;
          sku?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          unit_cost?: number;
          tier_applied?: string;
          line_total?: number;
          line_cost?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          id: string;
          order_id: string;
          clinic_id: string;
          invoice_number: string;
          invoice_type: InvoiceType;
          status: InvoiceStatus;
          line_items: Json;
          subtotal: number;
          tax: number;
          total: number;
          due_date: string | null;
          paid_at: string | null;
          locked: boolean;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          clinic_id: string;
          invoice_number?: string;
          invoice_type: InvoiceType;
          status?: InvoiceStatus;
          line_items?: Json;
          subtotal?: number;
          tax?: number;
          total?: number;
          due_date?: string | null;
          paid_at?: string | null;
          locked?: boolean;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          clinic_id?: string;
          invoice_number?: string;
          invoice_type?: InvoiceType;
          status?: InvoiceStatus;
          line_items?: Json;
          subtotal?: number;
          tax?: number;
          total?: number;
          due_date?: string | null;
          paid_at?: string | null;
          locked?: boolean;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          invoice_id: string | null;
          clinic_id: string;
          amount: number;
          method: PaymentMethod;
          status: string;
          stripe_payment_intent_id: string | null;
          wire_reference: string | null;
          confirmed_by: string | null;
          confirmed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          invoice_id?: string | null;
          clinic_id: string;
          amount: number;
          method: PaymentMethod;
          status?: string;
          stripe_payment_intent_id?: string | null;
          wire_reference?: string | null;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          invoice_id?: string | null;
          clinic_id?: string;
          amount?: number;
          method?: PaymentMethod;
          status?: string;
          stripe_payment_intent_id?: string | null;
          wire_reference?: string | null;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      batch_pos: {
        Row: {
          id: string;
          batch_number: string;
          batch_date: string;
          status: BatchStatus;
          total_items: number;
          total_cost: number;
          line_items: Json;
          locked: boolean;
          notes: string | null;
          generated_by: string | null;
          submitted_at: string | null;
          supplier_notes: string | null;
          submitted_to_supplier_at: string | null;
          supplier_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          batch_number?: string;
          batch_date?: string;
          status?: BatchStatus;
          total_items?: number;
          total_cost?: number;
          line_items?: Json;
          locked?: boolean;
          notes?: string | null;
          generated_by?: string | null;
          submitted_at?: string | null;
          supplier_notes?: string | null;
          submitted_to_supplier_at?: string | null;
          supplier_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          batch_number?: string;
          batch_date?: string;
          status?: BatchStatus;
          total_items?: number;
          total_cost?: number;
          line_items?: Json;
          locked?: boolean;
          notes?: string | null;
          generated_by?: string | null;
          submitted_at?: string | null;
          supplier_notes?: string | null;
          submitted_to_supplier_at?: string | null;
          supplier_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batch_pos_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      batch_po_items: {
        Row: {
          id: string;
          batch_po_id: string;
          product_id: string;
          sku: string;
          product_name: string;
          total_quantity: number;
          unit_cost: number;
          line_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_po_id: string;
          product_id: string;
          sku: string;
          product_name: string;
          total_quantity: number;
          unit_cost: number;
          line_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_po_id?: string;
          product_id?: string;
          sku?: string;
          product_name?: string;
          total_quantity?: number;
          unit_cost?: number;
          line_cost?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batch_po_items_batch_po_id_fkey";
            columns: ["batch_po_id"];
            isOneToOne: false;
            referencedRelation: "batch_pos";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sales_reps: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          ghl_user_id: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          ghl_user_id?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          ghl_user_id?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before_state: Json;
          after_state: Json;
          reason: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before_state?: Json;
          after_state?: Json;
          reason?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_state?: Json;
          after_state?: Json;
          reason?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          duration_weeks: number;
          phases: Json;
          status: ChallengeStatus;
          starts_at: string | null;
          ends_at: string | null;
          max_participants: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          duration_weeks?: number;
          phases?: Json;
          status?: ChallengeStatus;
          starts_at?: string | null;
          ends_at?: string | null;
          max_participants?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          duration_weeks?: number;
          phases?: Json;
          status?: ChallengeStatus;
          starts_at?: string | null;
          ends_at?: string | null;
          max_participants?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      challenge_participants: {
        Row: {
          id: string;
          auth_user_id: string;
          challenge_id: string;
          status: ParticipantStatus;
          current_phase: ChallengePhase;
          full_name: string;
          email: string;
          age: number | null;
          gender: string | null;
          height_inches: number | null;
          starting_weight: number | null;
          goals: string | null;
          profile_photo_url: string | null;
          current_medications: string | null;
          current_protocols: string | null;
          baseline_weight: number | null;
          baseline_body_fat: number | null;
          baseline_waist: number | null;
          baseline_hips: number | null;
          baseline_chest: number | null;
          baseline_arms: number | null;
          baseline_thighs: number | null;
          enrolled_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          challenge_id: string;
          status?: ParticipantStatus;
          current_phase?: ChallengePhase;
          full_name: string;
          email: string;
          age?: number | null;
          gender?: string | null;
          height_inches?: number | null;
          starting_weight?: number | null;
          goals?: string | null;
          profile_photo_url?: string | null;
          current_medications?: string | null;
          current_protocols?: string | null;
          baseline_weight?: number | null;
          baseline_body_fat?: number | null;
          baseline_waist?: number | null;
          baseline_hips?: number | null;
          baseline_chest?: number | null;
          baseline_arms?: number | null;
          baseline_thighs?: number | null;
          enrolled_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          challenge_id?: string;
          status?: ParticipantStatus;
          current_phase?: ChallengePhase;
          full_name?: string;
          email?: string;
          age?: number | null;
          gender?: string | null;
          height_inches?: number | null;
          starting_weight?: number | null;
          goals?: string | null;
          profile_photo_url?: string | null;
          current_medications?: string | null;
          current_protocols?: string | null;
          baseline_weight?: number | null;
          baseline_body_fat?: number | null;
          baseline_waist?: number | null;
          baseline_hips?: number | null;
          baseline_chest?: number | null;
          baseline_arms?: number | null;
          baseline_thighs?: number | null;
          enrolled_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      challenge_entries: {
        Row: {
          id: string;
          participant_id: string;
          challenge_id: string;
          week_number: number;
          phase: ChallengePhase;
          entry_date: string;
          weight: number | null;
          body_fat_pct: number | null;
          waist: number | null;
          hips: number | null;
          chest: number | null;
          arms: number | null;
          thighs: number | null;
          resting_hr: number | null;
          blood_pressure_sys: number | null;
          blood_pressure_dia: number | null;
          energy_level: number | null;
          sleep_quality: number | null;
          photo_front_url: string | null;
          photo_side_url: string | null;
          photo_back_url: string | null;
          notes: string | null;
          diet_notes: string | null;
          exercise_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          challenge_id: string;
          week_number: number;
          phase: ChallengePhase;
          entry_date?: string;
          weight?: number | null;
          body_fat_pct?: number | null;
          waist?: number | null;
          hips?: number | null;
          chest?: number | null;
          arms?: number | null;
          thighs?: number | null;
          resting_hr?: number | null;
          blood_pressure_sys?: number | null;
          blood_pressure_dia?: number | null;
          energy_level?: number | null;
          sleep_quality?: number | null;
          photo_front_url?: string | null;
          photo_side_url?: string | null;
          photo_back_url?: string | null;
          notes?: string | null;
          diet_notes?: string | null;
          exercise_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          challenge_id?: string;
          week_number?: number;
          phase?: ChallengePhase;
          entry_date?: string;
          weight?: number | null;
          body_fat_pct?: number | null;
          waist?: number | null;
          hips?: number | null;
          chest?: number | null;
          arms?: number | null;
          thighs?: number | null;
          resting_hr?: number | null;
          blood_pressure_sys?: number | null;
          blood_pressure_dia?: number | null;
          energy_level?: number | null;
          sleep_quality?: number | null;
          photo_front_url?: string | null;
          photo_side_url?: string | null;
          photo_back_url?: string | null;
          notes?: string | null;
          diet_notes?: string | null;
          exercise_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "challenge_entries_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: false;
            referencedRelation: "challenge_participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      product_bundles: {
        Row: {
          id: string;
          name: string;
          sku: string;
          category: string;
          description: string | null;
          prices: number[];
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku: string;
          category?: string;
          description?: string | null;
          prices: number[];
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string;
          category?: string;
          description?: string | null;
          prices?: number[];
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_bundle_items: {
        Row: {
          id: string;
          bundle_id: string;
          product_id: string;
          quantity: number;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          bundle_id: string;
          product_id: string;
          quantity: number;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          bundle_id?: string;
          product_id?: string;
          quantity?: number;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_bundle_items_bundle_id_fkey";
            columns: ["bundle_id"];
            isOneToOne: false;
            referencedRelation: "product_bundles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_bundle_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_pending_batch: {
        Row: {
          product_id: string;
          sku: string;
          product_name: string;
          total_quantity: number;
          unit_cost: number;
          total_cost: number;
          order_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      generate_daily_batch_po: {
        Args: { admin_user_id: string };
        Returns: string;
      };
    };
    Enums: {
      clinic_tier: ClinicTier;
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      mfg_status: MfgStatus;
      invoice_type: InvoiceType;
      invoice_status: InvoiceStatus;
      batch_status: BatchStatus;
      onboarding_status: OnboardingStatus;
      challenge_status: ChallengeStatus;
      participant_status: ParticipantStatus;
      challenge_phase: ChallengePhase;
    };
  };
}

// ─── Helper types for JSONB fields ──────────────────────────────

export interface InvoiceLineItem {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface BatchPOLineItem {
  sku: string;
  product_name: string;
  total_quantity: number;
  unit_cost: number;
  line_cost: number;
}
