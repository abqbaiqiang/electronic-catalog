import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  CATALOGS: 'catalogs',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  LEADS: 'leads'
}