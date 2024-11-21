import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Supabase credentials missing', { supabaseUrl, supabaseKey })
  throw new Error('Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
}

// Validar que la URL sea válida
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('⚠️ Invalid Supabase URL:', supabaseUrl)
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL. Must be a valid URL.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey) 