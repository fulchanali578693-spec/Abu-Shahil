import { createClient } from '@supabase/supabase-js';

// Supabase configuration credentials
export const SUPABASE_URL = "https://pmyaojjsewqbtszbglfr.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GZpwbYupmeJ3WZbEaseszg_ofzhe5kV";

// Initialize Supabase JS Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type OrderStatus = 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderRecord {
  id: string | number;
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  country?: string;
  product_name?: string;
  product_variant: string;
  quantity: number;
  total_price?: number;
  notes?: string | null;
  status: OrderStatus;
  delivery_agent_id?: string | null;
  payment_method?: string;
  created_at: string;
}

export interface OrderInsertPayload {
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  country: string;
  product_name: string;
  product_variant: string;
  quantity: number;
  notes: string | null;
  status: 'pending';
}

/**
 * Inserts a new Cash on Delivery order into the Supabase "orders" table.
 */
export async function insertCodOrder(orderPayload: OrderInsertPayload): Promise<{ success: boolean; error: string | null; data?: any }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: orderPayload.customer_name,
          phone: orderPayload.phone,
          email: orderPayload.email,
          city: orderPayload.city,
          address: orderPayload.address,
          country: orderPayload.country,
          product_name: orderPayload.product_name,
          product_variant: orderPayload.product_variant,
          quantity: orderPayload.quantity,
          notes: orderPayload.notes,
          status: 'pending',
        },
      ]);

    if (error) {
      console.warn('Supabase order insert warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null, data };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    console.warn('Unexpected order submission error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetch orders from Supabase "orders" table for the Admin Dashboard
 */
export async function fetchSupabaseOrders(): Promise<{ orders: OrderRecord[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch orders info:', error.message);
      return { orders: [], error: error.message };
    }

    const formatted: OrderRecord[] = (data || []).map((row: any) => ({
      id: row.id || `ord-${Date.now()}`,
      customer_name: row.customer_name || 'Anonymous Customer',
      phone: row.phone || '',
      email: row.email || '',
      city: row.city || '',
      address: row.address || '',
      country: row.country || 'United States',
      product_name: row.product_name || 'AuraPulse™ Ceramic Diffuser',
      product_variant: row.product_variant || 'Matte Alabaster',
      quantity: Number(row.quantity) || 1,
      total_price: Number(row.total_price) || (Number(row.quantity) || 1) * 79,
      notes: row.notes || null,
      status: (row.status as OrderStatus) || 'pending',
      delivery_agent_id: row.delivery_agent_id || null,
      payment_method: row.payment_method || 'Cash on Delivery (COD)',
      created_at: row.created_at || new Date().toISOString(),
    }));

    return { orders: formatted, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    return { orders: [], error: errorMsg };
  }
}

/**
 * Update an order status in Supabase
 */
export async function updateSupabaseOrderStatus(
  orderId: string | number,
  status: OrderStatus
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.warn('Supabase status update warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: errorMsg };
  }
}
