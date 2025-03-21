import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { type SerializeOptions } from 'cookie'

type CookieOptions = Partial<SerializeOptions>

export function createClient(request: NextRequest) {
  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            response.cookies.set({ name , value, ...options as CookieOptions })
          )
        },
      },
    }
  )

  return { supabase, response }
}

