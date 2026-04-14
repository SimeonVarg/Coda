import { Metadata } from "next"
import CatalogItemForm from "@/components/CatalogItemForm"
import MusicBackground from "@/components/motifs/MusicBackground"
import Breadcrumb from "@/components/Breadcrumb"

export const metadata: Metadata = {
  title: "Add to Catalog \u2014 Coda",
}

export default function CatalogNewPage() {
  return (
    <main className="relative overflow-hidden bg-studio-bg min-h-screen mx-auto max-w-3xl px-6 py-10" style={{ position: 'relative', zIndex: 1 }}>
      <MusicBackground />
      <div className="mb-6">
        <Breadcrumb href="/dashboard" label="Back to dashboard" />
      </div>
      <h1 className="text-2xl font-semibold text-studio-cream font-display mb-8">Add to Catalog</h1>
      <CatalogItemForm />
    </main>
  )
}
