import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CatalogItem } from "@/lib/types"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? ""

  const supabase = createSupabaseServerClient()

  let query = supabase
    .from("catalog_items")
    .select("id, title, type, composer")
    .limit(20)

  if (q.length >= 3) {
    // Full-text search for queries of 3+ characters
    query = query.textSearch("search_vector", q, {
      type: "plain",
      config: "english",
    })
  } else if (q.length > 0) {
    // ILIKE fallback for short queries
    query = query.ilike("title", `%${q}%`)
  } else {
    // Empty query — return empty array immediately
    return NextResponse.json<CatalogItem[]>([])
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json<CatalogItem[]>(data ?? [])
}
