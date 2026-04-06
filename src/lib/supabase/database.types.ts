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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
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
          user_id: string;
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
          user_id: string;
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
          user_id: string;
          address_id: string | null;
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          payment_method: 'cash_on_delivery' | 'card';
          subtotal: number;
          delivery_fee: number;
          total: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          payment_method: 'cash_on_delivery' | 'card';
          subtotal: number;
          delivery_fee?: number;
          total: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          address_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
          payment_method?: 'cash_on_delivery' | 'card';
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          notes?: string | null;
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
    };
  };
};
