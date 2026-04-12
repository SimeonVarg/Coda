"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { CatalogItem } from "@/lib/types"
import Spinner from "@/components/Spinner"

interface RepertoireCatalogSearchProps {
  onSelect: (item: CatalogItem) => void
  /** Optional id for the search input, used to associate an external <label> */
  inputId?: string
}

export default function RepertoireCatalogSearch({
  onSelect,
  inputId,
}: RepertoireCatalogSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastQueryRef = useRef<string>("")

  const fetchResults = useCallback(async (q: string) => {
    if (!q) {
      setResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/catalog/search?q=${encodeURIComponent(q)}`
      )
      if (!res.ok) throw new Error("Search request failed")
      const data: CatalogItem[] = await res.json()
      setResults(data)
    } catch {
      setError("Search failed. Try again.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      lastQueryRef.current = query
      fetchResults(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchResults])

  const handleRetry = () => {
    fetchResults(lastQueryRef.current)
  }

  return (
    <div className="w-full">
      <input
        id={inputId}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search catalog..."
        className="bg-studio-surface border border-studio-primary/30 text-studio-cream rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-studio-gold focus:border-studio-gold transition-all duration-[150ms] placeholder:text-studio-muted"
        aria-label={inputId ? undefined : "Search repertoire catalog"}
      />

      {loading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-studio-muted">
          <Spinner />
          Searching...
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="mt-2 flex items-center gap-2 text-sm text-studio-rose">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="underline hover:text-studio-rose focus:outline-none"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && query && results.length === 0 && (
        <p className="mt-2 text-sm text-studio-muted">No results found for &quot;{query}&quot;</p>
      )}

      {!loading && !error && results.length > 0 && (
        <ul className="mt-1 max-h-60 overflow-y-auto rounded-md border border-studio-rim bg-studio-surface shadow-studio-glow">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-studio-rim focus:bg-studio-rim focus:outline-none"
              >
                <span className="flex-1">
                  <span className="font-medium text-studio-cream">
                    {item.title}
                  </span>
                  {item.composer && (
                    <span className="ml-1 text-studio-muted">
                      — {item.composer}
                    </span>
                  )}
                </span>
                <span className="shrink-0 rounded bg-studio-rim px-1.5 py-0.5 text-xs capitalize text-studio-gold">
                  {item.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
