import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CatalogItem } from "@/lib/types"

type CreateCatalogItemBody = {
  title: string
  type: "repertoire" | "theory"
  composer?: string
}

type ErrorResponse = { error: string }

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createSupabaseServerClient()

  // Validate session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json<ErrorResponse>({ error: "Unauthorized" }, { status: 401 })
  }

  // Check teacher role
  if (user.app_metadata?.role !== "teacher") {
    return NextResponse.json<ErrorResponse>({ error: "Forbidden" }, { status: 403 })
  }

  // Block demo users from writing
  if (user.user_metadata?.is_demo === true) {
    return NextResponse.json<ErrorResponse>(
      { error: "Saving is disabled in demo mode." },
      { status: 403 }
    )
  }

  // Parse body
  let body: CreateCatalogItemBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ErrorResponse>({ error: "Invalid request body" }, { status: 400 })
  }

  // Validate fields
  const { title, type, composer } = body

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json<ErrorResponse>({ error: "title is required" }, { status: 400 })
  }

  if (type !== "repertoire" && type !== "theory") {
    return NextResponse.json<ErrorResponse>({ error: "Invalid type" }, { status: 400 })
  }

  // Insert into catalog_items
  const { data, error: dbError } = await supabase
    .from("catalog_items")
    .insert({
      title: title.trim(),
      type,
      composer: composer?.trim() || null,
    })
    .select("id, title, type, composer")
    .single()

  if (dbError) {
    if (dbError.code === "42501") {
      // RLS policy violation
      return NextResponse.json<ErrorResponse>({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to insert catalog item" },
      { status: 500 }
    )
  }

  return NextResponse.json<CatalogItem>(data, { status: 201 })
}
