"use client"

import { useEffect, useRef, useState } from "react"

const COLLAPSED_HEIGHT = 240

export function ExpandableDescription({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    setCanExpand(el.scrollHeight > COLLAPSED_HEIGHT)
  }, [html])

  return (
    <div>
      <div
        ref={contentRef}
        className="prose prose-sm max-w-none overflow-hidden text-foreground"
        style={{ maxHeight: expanded || !canExpand ? undefined : COLLAPSED_HEIGHT }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-sm font-semibold text-primary hover:underline"
        >
          {expanded ? "Show less" : "See more"}
        </button>
      )}
    </div>
  )
}
