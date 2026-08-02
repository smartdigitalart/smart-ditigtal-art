"use client"

import { forwardRef, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import { toast } from "sonner"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  QuoteIcon,
  MinusIcon,
  LinkIcon,
  ImageIcon,
  TableIcon,
  UndoIcon,
  RedoIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  SubscriptIcon,
  SuperscriptIcon,
  HighlighterIcon,
  PaletteIcon,
  RemoveFormattingIcon,
  CodeSquareIcon,
  Loader2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type EditorImageUploadAction = (
  formData: FormData
) => Promise<{ url: string } | { error: string }>

const TEXT_COLORS = [
  "#0b0b0b",
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#008300",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
]

const ToolbarButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    label: string
    children: React.ReactNode
  } & React.ComponentProps<"button">
>(function ToolbarButton(
  { onClick, active, disabled, label, children, className, ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(active && "bg-muted text-foreground", className)}
      {...props}
    >
      {children}
    </Button>
  )
})

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setUrl(editor.getAttributes("link").href ?? "")
      }}
    >
      <PopoverTrigger asChild>
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {}}
        >
          <LinkIcon />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (url) {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
            } else {
              editor.chain().focus().unsetLink().run()
            }
            setOpen(false)
          }}
        >
          <Input
            autoFocus
            placeholder="https://example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="h-8"
          />
          <Button type="submit" size="sm">
            Set
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function ImageButton({
  editor,
  uploadAction,
}: {
  editor: Editor
  uploadAction?: EditorImageUploadAction
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertImage = (src: string) => {
    editor.chain().focus().setImage({ src }).run()
    setUrl("")
    setOpen(false)
  }

  const handleFile = async (file: File | undefined) => {
    if (!file || !uploadAction) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadAction(formData)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      insertImage(result.url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const urlForm = (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (url) insertImage(url)
      }}
    >
      <Input
        autoFocus
        placeholder="Image URL"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        className="h-8"
      />
      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolbarButton label="Insert image" onClick={() => {}}>
          <ImageIcon />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        {uploadAction ? (
          <Tabs defaultValue="upload">
            <TabsList className="w-full">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading && <Loader2Icon className="animate-spin" />}
                {uploading ? "Uploading..." : "Choose image"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void handleFile(event.target.files?.[0])
                  event.target.value = ""
                }}
              />
            </TabsContent>
            <TabsContent value="url" className="mt-2">
              {urlForm}
            </TabsContent>
          </Tabs>
        ) : (
          urlForm
        )}
      </PopoverContent>
    </Popover>
  )
}

function ColorButton({ editor }: { editor: Editor }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ToolbarButton label="Text color" onClick={() => {}}>
          <PaletteIcon />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex items-center gap-1.5">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="size-6 rounded-full ring-1 ring-border ring-offset-2 ring-offset-popover hover:scale-110"
              style={{ backgroundColor: color }}
              aria-label={`Set text color ${color}`}
              onClick={() => editor.chain().focus().setColor(color).run()}
            />
          ))}
          <button
            type="button"
            className="ml-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Reset
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function EditorToolbar({
  editor,
  variant = "full",
  imageUploadAction,
}: {
  editor: Editor | null
  variant?: "full" | "minimal"
  imageUploadAction?: EditorImageUploadAction
}) {
  if (!editor) return null

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5 backdrop-blur-sm">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <LinkButton editor={editor} />

      {variant === "full" && (
        <>
          <ToolbarButton
            label="Code"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <CodeIcon />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            label="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1Icon />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2Icon />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3Icon />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            label="Task list"
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <ListTodoIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <QuoteIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <CodeSquareIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <MinusIcon />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            label="Align left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeftIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Align center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenterIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRightIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Justify"
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustifyIcon />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            label="Subscript"
            active={editor.isActive("subscript")}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            <SubscriptIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Superscript"
            active={editor.isActive("superscript")}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            <SuperscriptIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Highlight"
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <HighlighterIcon />
          </ToolbarButton>
          <ColorButton editor={editor} />

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ImageButton editor={editor} uploadAction={imageUploadAction} />
          <ToolbarButton
            label="Insert table"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarButton
            label="Clear formatting"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <RemoveFormattingIcon />
          </ToolbarButton>
        </>
      )}

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <RedoIcon />
        </ToolbarButton>
      </div>
    </div>
  )
}
