"use client"

import { useCallback, useEffect } from "react"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Image } from "@tiptap/extension-image"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TableKit } from "@tiptap/extension-table"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Typography } from "@tiptap/extension-typography"
import { CharacterCount } from "@tiptap/extension-character-count"

import { EditorToolbar } from "@/components/tiptap/editor-toolbar"
import { cn } from "@/lib/utils"

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "min-h-40",
  toolbar = "full",
  characterLimit,
  className,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  toolbar?: "full" | "minimal"
  characterLimit?: number
  className?: string
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TableKit.configure({ table: { resizable: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      ...(characterLimit ? [CharacterCount.configure({ limit: characterLimit })] : []),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap-content prose prose-sm max-w-none focus:outline-none",
          minHeight,
          "px-3 py-2.5"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Keep editor content in sync if `value` is reset externally (e.g. form reset).
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  return (
    <div
      className={cn(
        "max-h-[26rem] overflow-y-auto rounded-lg border border-input bg-background",
        className
      )}
    >
      <EditorToolbar editor={editor} variant={toolbar} />
      <EditorContent editor={editor} />
      {editor && characterLimit && (
        <div className="sticky bottom-0 border-t border-border bg-background px-3 py-1.5 text-right text-xs text-muted-foreground">
          {editor.storage.characterCount.characters()}/{characterLimit}
        </div>
      )}
    </div>
  )
}

export type { Editor }
