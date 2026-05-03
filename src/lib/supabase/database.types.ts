export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'member' | 'delivery' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'member' | 'delivery' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'member' | 'delivery' | 'admin';
          updated_at?: string;
        };
      };
      categories: {
        Row: { id: string; name: string; image_url: string | null; created_at: string };
        Insert: { id?: string; name: string; image_url?: string | null; created_at?: string };
        Update: { name?: string; image_url?: string | null };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          stock: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          stock?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          stock?: number;
          is_active?: boolean;
        };
      };
      favorites: {
        Row: { id: string; user_id: string; product_id: string; created_at: string };
        Insert: { id?: string; user_id: string; product_id: string; created_at?: string };
        Update: never;
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: { quantity?: number; updated_at?: string };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string | null;
          label: string;
          full_name: string;
          phone: string;
          city: string;
          street: string;
          building: string | null;
          notes: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          label: string;
          full_name: string;
          phone: string;
          city: string;
          street: string;
          building?: string | null;
          notes?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          full_name?: string;
          phone?: string;
          city?: string;
          street?: string;
          building?: string | null;
          notes?: string | null;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          address_id: string | null;
          assigned_delivery_user_id: string | null;
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          payment_method: 'cash_on_delivery' | 'card';
          subtotal: number;
          delivery_fee: number;
          total: number;
          notes: string | null;
          is_guest: boolean;
          guest_name: string | null;
          guest_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          address_id?: string | null;
          assigned_delivery_user_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          payment_method: 'cash_on_delivery' | 'card';
          subtotal: number;
          delivery_fee?: number;
          total: number;
          notes?: string | null;
          is_guest?: boolean;
          guest_name?: string | null;
          guest_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          address_id?: string | null;
          assigned_delivery_user_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          payment_method?: 'cash_on_delivery' | 'card';
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          notes?: string | null;
          is_guest?: boolean;
          guest_name?: string | null;
          guest_phone?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          product_price_snapshot: number;
          quantity: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          product_price_snapshot: number;
          quantity: number;
          line_total: number;
          created_at?: string;
        };
        Update: never;
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          note?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      user_role_audit: {
        Row: {
          id: string;
          changed_by: string;
          target_user_id: string;
          old_role: 'member' | 'delivery' | 'admin';
          new_role: 'member' | 'delivery' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          changed_by: string;
          target_user_id: string;
          old_role: 'member' | 'delivery' | 'admin';
          new_role: 'member' | 'delivery' | 'admin';
          created_at?: string;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          title: string;
          body: string;
          image_url: string | null;
          order_id: string | null;
          discount_code: string | null;
          discount_value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          title: string;
          body: string;
          image_url?: string | null;
          order_id?: string | null;
          discount_code?: string | null;
          discount_value?: string | null;
          created_at?: string;
        };
        Update: {
          type?: string;
          title?: string;
          body?: string;
          image_url?: string | null;
          order_id?: string | null;
          discount_code?: string | null;
          discount_value?: string | null;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          is_active?: boolean;
        };
      };
      push_tokens: {
        Row: {
          user_id: string;
          token: string;
          platform: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          token: string;
          platform: string;
          created_at?: string;
        };
        Update: {
          token?: string;
          platform?: string;
        };
      };
      user_contact_phones: {
        Row: {
          id: string;
          user_id: string;
          phone: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          phone?: string;
          is_default?: boolean;
        };
      };
      loyalty_points: {
        Row: {
          user_id: string;
          points: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          points?: number;
          updated_at?: string;
        };
        Update: {
          points?: number;
          updated_at?: string;
        };
      };
      loyalty_points_history: {
        Row: {
          id: string;
          user_id: string;
          points: number | null;
          amount: number | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points?: number | null;
          amount?: number | null;
          description?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Functions: {
      redeem_loyalty_points: {
        Args: {
          _user_id: string;
          _points_to_redeem: number;
        };
        Returns: number;
      };
      place_order_guest: {
        Args: {
          items: Json;
          address_label: string;
          address_details: string;
          contact_name_input: string;
          contact_phone_input: string;
          payment_method_input: 'cash_on_delivery' | 'card';
          delivery_fee_input: number;
          note_input: string | null;
        };
        Returns: string;
      };
    };
  };
};
