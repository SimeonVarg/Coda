'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import type { JSONContent } from '@/lib/types'

interface TiptapEditorProps {
  initialContent?: JSONContent
  onChange: (content: JSONContent) => void
  /** id of a <label> element that labels this editor (sets aria-labelledby on the contenteditable) */
  labelId?: string
}

export default function TiptapEditor({ initialContent, onChange, labelId }: TiptapEditorProps) {
  const [contentError, setContentError] = useState(false)

  // Validate initialContent — must be an object with a "type" field
  let safeInitialContent: JSONContent | undefined
  try {
    if (
      initialContent !== null &&
      initialContent !== undefined &&
      typeof initialContent === 'object' &&
      typeof (initialContent as JSONContent).type === 'string'
    ) {
      safeInitialContent = initialContent
    } else if (initialContent !== undefined && initialContent !== null) {
      setContentError(true)
    }
  } catch {
    setContentError(true)
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bold: {},
        italic: {},
        bulletList: {},
        orderedList: {},
      }),
    ],
    content: safeInitialContent,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as JSONContent)
    },
  })

  if (!editor) return null

  const toolbarBtn = (
    active: boolean,
    onClick: () => void,
    label: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-studio-rim text-studio-cream'
          : 'text-studio-muted hover:bg-studio-rim hover:text-studio-cream'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="rounded-lg border border-studio-primary/30 bg-studio-surface focus-within:ring-2 focus-within:ring-studio-gold focus-within:border-studio-gold">
      {contentError && (
        <div className="px-3 py-2 text-sm text-studio-rose bg-studio-rose/10 border-b border-studio-rose/30 rounded-t-lg">
          Could not load saved content — starting with an empty editor.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-studio-rim">
        {toolbarBtn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold')}
        {toolbarBtn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic')}
        {toolbarBtn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1')}
        {toolbarBtn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
        {toolbarBtn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
        {toolbarBtn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet List')}
        {toolbarBtn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Ordered List')}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        aria-labelledby={labelId}
        className="prose prose-sm prose-invert max-w-none px-4 py-3 min-h-[160px] focus:outline-none text-studio-text"
      />
    </div>
  )
}
