import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/students")
  )
}

function isTeacherOnlyRoute(pathname: string): boolean {
  if (pathname === "/lessons/new") return true
  if (/^\/lessons\/[^/]+\/edit$/.test(pathname)) return true
  if (pathname === "/catalog/new") return true
  if (/^\/students\/[^/]+\/profile$/.test(pathname)) return true
  return false
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser() not getSession() — getSession() reads from cache
  // and can return stale data. getUser() validates with Supabase every time.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (isProtectedRoute(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/login"
      return NextResponse.redirect(loginUrl)
    }

    if (isTeacherOnlyRoute(pathname)) {
      const role = user.app_metadata?.role
      if (role !== "teacher") {
        const progressUrl = request.nextUrl.clone()
        progressUrl.pathname = `/progress/${user.id}`
        return NextResponse.redirect(progressUrl, { status: 303 })
      }
    }
  }

  // If logged in and hitting /login, redirect to appropriate home
  if (pathname === "/login" && user) {
    const role = user.app_metadata?.role
    const dest = request.nextUrl.clone()
    dest.pathname = role === "student" ? `/progress/${user.id}` : "/dashboard"
    return NextResponse.redirect(dest)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
