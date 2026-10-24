import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function getFingerprint() {
  const cookieStore = await cookies()
  let fp = cookieStore.get('webpick_fingerprint')?.value
  if (!fp) {
    fp = crypto.randomUUID()
    cookieStore.set('webpick_fingerprint', fp, { maxAge: 60 * 60 * 24 * 365, httpOnly: false })
  }
  return fp
}

export async function getIpHash() {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || '0.0.0.0'
  return crypto.createHash('sha256').update(ip).digest('hex')
}

export async function checkCanSnap(): Promise<{ allowed: boolean; remaining: number; needsAuth: boolean }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits, is_pro')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.is_pro || (profile?.credits || 0) > 0) {
        return { allowed: true, remaining: profile?.is_pro ? 999 : (profile?.credits || 10), needsAuth: false }
      }
      return { allowed: false, remaining: 0, needsAuth: false }
    } else {
      const fp = await getFingerprint()
      const ipHash = await getIpHash()

      const { data } = await supabase
        .from('anonymous_usage')
        .select('*')
        .or(`fingerprint.eq.${fp},ip_hash.eq.${ipHash}`)
        .order('snaps_used', { ascending: false })
        .limit(1)

      const usage = data && data.length > 0 ? data[0] : null

      if (!usage) return { allowed: true, remaining: 3, needsAuth: false }
      if (usage.snaps_used < 3) return { allowed: true, remaining: 3 - usage.snaps_used, needsAuth: false }
      return { allowed: false, remaining: 0, needsAuth: true }
    }
  } catch (err) {
    return { allowed: true, remaining: 3, needsAuth: false }
  }
}

export async function incrementSnap() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits, is_pro')
        .eq('id', user.id)
        .maybeSingle()

      if (profile && !profile.is_pro && (profile.credits || 0) > 0) {
        await supabase
          .from('profiles')
          .update({ credits: profile.credits - 1 })
          .eq('id', user.id)
      }
    } else {
      const fp = await getFingerprint()
      const ipHash = await getIpHash()

      const { data } = await supabase
        .from('anonymous_usage')
        .select('*')
        .or(`fingerprint.eq.${fp},ip_hash.eq.${ipHash}`)
        .order('snaps_used', { ascending: false })
        .limit(1)

      const usage = data && data.length > 0 ? data[0] : null

      if (usage) {
        await supabase
          .from('anonymous_usage')
          .update({ snaps_used: usage.snaps_used + 1, last_used_at: new Date().toISOString() })
          .eq('id', usage.id)
      } else {
        await supabase
          .from('anonymous_usage')
          .insert({ fingerprint: fp, ip_hash: ipHash, snaps_used: 1 })
      }
    }
  } catch (err) {
    console.warn('Snap increment fallback', err)
  }
}
