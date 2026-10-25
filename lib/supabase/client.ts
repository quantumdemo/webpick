import { createBrowserClient } from '@supabase/ssr'

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-supabase-project.supabase.co' &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'
  return createBrowserClient(url, key)
}
