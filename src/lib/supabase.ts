import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// DEMO_MODE is true whenever real Supabase credentials have not been provided.
// This lets the app run and be fully clickable/testable before a backend is wired up.
export const DEMO_MODE = !supabaseUrl || !supabaseAnonKey

export const supabase = DEMO_MODE
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey as string)
