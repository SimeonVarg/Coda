import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CatalogItem } from "@/lib/types"

type CreateCatalogItemBody = {
  title: string
  type: "repertoire" | "theory"
  composer?: string
  tradition?: string
  region?: string
  tuning_system?: string
  cultural_context?: string
  language?: string
}

type ErrorResponse = { error: string }

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json<ErrorResponse>({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.app_metadata?.role !== "teacher") {
    return NextResponse.json<ErrorResponse>({ error: "Forbidden" }, { status: 403 })
  }

  if (user.user_metadata?.is_demo === true) {
    return NextResponse.json<ErrorResponse>({ error: "Saving is disabled in demo mode." }, { status: 403 })
  }

  let body: CreateCatalogItemBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ErrorResponse>({ error: "Invalid request body" }, { status: 400 })
  }

  const { title, type, composer, tradition, region, tuning_system, cultural_context, language } = body

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json<ErrorResponse>({ error: "title is required" }, { status: 400 })
  }

  if (type !== "repertoire" && type !== "theory") {
    return NextResponse.json<ErrorResponse>({ error: "Invalid type" }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from("catalog_items")
    .insert({
      title: title.trim(),
      type,
      composer: composer?.trim() || null,
      tradition: tradition?.trim() || null,
      region: region?.trim() || null,
      tuning_system: tuning_system?.trim() || null,
      cultural_context: cultural_context?.trim() || null,
      language: language?.trim() || null,
    })
    .select("id, title, type, composer, tradition, region, tuning_system, cultural_context, language")
    .single()

  if (dbError) {
    if (dbError.code === "42501") {
      return NextResponse.json<ErrorResponse>({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json<ErrorResponse>({ error: "Failed to insert catalog item" }, { status: 500 })
  }

  return NextResponse.json<CatalogItem>(data, { status: 201 })
}
