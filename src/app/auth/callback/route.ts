import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as string | null

  // Determine the true host. When running locally (192.168.x.x, 0.0.0.0, etc.),
  // `request.url` might resolve to the internal host depending on reverse proxy configurations.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ? `${searchParams.get('protocol') ?? 'https'}://${forwardedHost}` : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${host}${next}`)
    }
    console.error('Exchange Code Error:', error)
  }

  if (token_hash && type) {
    const supabase = await createClient()
    // Type casting because simple verifyOtp typings can be strict
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${host}${next}`)
    }
    console.error('Verify OTP Error:', error)
  }

  // If there's an error or no credentials, redirect to homepage but trigger a hard reload
  // Or append an auth_error to URL so we can debug on frontend
  return NextResponse.redirect(`${host}/?auth_error=verification_failed`)
}
