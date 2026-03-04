'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Mail, Loader2 } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function AuthSession() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('magicLinkSent'))
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Use predefined SITE_URL so Supabase resolves against the exact environment we want
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
        // Force prompt to ensure the account selection shows up properly and cookie updates
        queryParams: {
          prompt: 'consent',
        }
      },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md w-full border-border bg-card shadow-xl rounded-3xl md:rounded-[3rem] overflow-hidden group">
      <CardContent className="p-8 md:p-12 flex flex-col items-center gap-10 md:gap-12 relative">
        <div className="flex flex-col items-center gap-8 text-center relative z-10 w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-primary border border-border group-hover:scale-110 transition-transform duration-500">
            <Mail className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <Text variant="tiny" className="uppercase tracking-[0.4em] text-muted-foreground/50 mb-4">
              {t('brand')}
            </Text>
            <Heading level="h2" className="border-none tracking-tighter leading-none py-1">
              {t('signIn')}
            </Heading>
            <Text variant="muted" className="max-w-[280px] leading-relaxed mx-auto italic">
              {t('authDesc')}
            </Text>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-8 w-full relative z-10">
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="scholar@sivuong.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 md:h-14 rounded-2xl border-border focus-visible:ring-4 focus-visible:ring-primary/10 transition-all font-medium px-6 bg-muted/20"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 md:h-16 rounded-2xl md:rounded-[1.5rem] text-base md:text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all group active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-3" />
                {t('sendingLink')}
              </>
            ) : (
              <>
                <span>{t('acquireEntryLink')}</span>
              </>
            )}
          </Button>

          <div className="relative w-full z-10 py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs tracking-widest uppercase">
              <span className="bg-card px-4 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            variant="outline"
            className="w-full h-14 md:h-16 rounded-2xl md:rounded-[1.5rem] text-base md:text-lg font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all relative z-10 hover:bg-muted/30 active:scale-[0.98] border-border"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-3" />
            ) : (
              <svg
                className="mr-3 h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {t('continueWithGoogle')}
            </span>
          </Button>

          <div className="flex flex-col items-center gap-6">
             <div className="h-0.5 w-12 bg-border" />
             <Text variant="tiny" className="text-center uppercase tracking-[0.2em] leading-relaxed max-w-[240px]">
               {t('commitmentText')}
             </Text>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
