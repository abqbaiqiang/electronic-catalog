import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://demo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjQ0OTcwMCwiZXhwIjoxOTMyMDI1NzAwfQ.1OmnqLSWyJ1oS1S5E7B3H4Y5X6Z9K2M8N4P1R3T7W0'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  CATALOGS: 'catalogs',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  LEADS: 'leads'
}

// Initialize database tables
export async function initializeDatabase() {
  // Create profiles table if not exists
  const { error: profileError } = await supabase.from(TABLES.PROFILES).select('id').limit(1).catch(() => ({ error: true }))
  
  // Create catalogs table
  const { error: catalogError } = await supabase.from(TABLES.CATALOGS).select('id').limit(1).catch(() => ({ error: true }))
  
  // Create categories table
  const { error: categoryError } = await supabase.from(TABLES.CATEGORIES).select('id').limit(1).catch(() => ({ error: true }))
  
  // Create products table
  const { error: productError } = await supabase.from(TABLES.PRODUCTS).select('id').limit(1).catch(() => ({ error: true }))
  
  // Create leads table
  const { error: leadError } = await supabase.from(TABLES.LEADS).select('id').limit(1).catch(() => ({ error: true }))
  
  return {
    profiles: !profileError,
    catalogs: !catalogError,
    categories: !categoryError,
    products: !productError,
    leads: !leadError
  }
}
