import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL after successful sign in
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // likely set on Vercel/proxies
            const isLocalHost = request.headers.get('host')?.includes('localhost')
            const protocol = isLocalHost ? 'http' : 'https'
            const redirectUrl = isLocalHost
                ? origin
                : `${protocol}://${forwardedHost ?? request.headers.get('host')}`

            return NextResponse.redirect(`${redirectUrl}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
