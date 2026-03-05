import type { Product, ProductInsert, ProductUpdate } from '@/types/domain'
import { getSupabaseClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/supabase/errors'

export const ProductsRepository = {
  async list(): Promise<Array<Product>> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return data as Array<Product>
  },

  async create(payload: ProductInsert): Promise<Product> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase.from('products').insert(payload).select('*').single()

    if (error) {
      handleSupabaseError(error)
    }

    return data as Product
  },

  async update(id: string, payload: ProductUpdate): Promise<Product> {
    const supabase = getSupabaseClient() as any
    const { data, error } = await supabase
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return data as Product
  },

  async archive(id: string): Promise<void> {
    const supabase = getSupabaseClient() as any
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString(), lifecycle_status: 'archived' })
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      handleSupabaseError(error)
    }
  },
}
