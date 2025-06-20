"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Brain } from "lucide-react"
import { Button } from "./ui/button"

interface ThinkingBubbleProps {
  thinking: string
  isActive?: boolean
}

export function ThinkingBubble({ thinking, isActive = false }: ThinkingBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!thinking.trim()) return null

  const previewLength = 150
  const shouldTruncate = thinking.length > previewLength
  const displayText = isExpanded ? thinking : thinking.slice(0, previewLength) + (shouldTruncate ? "..." : "")

  return (
    <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {isActive ? "Myślę..." : "Proces myślenia"}
            </span>
          </div>
          {isActive && (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          )}
        </div>

        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Zwiń
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Rozwiń
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap font-mono bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50">
        {displayText}
      </div>

      {/* Footer info */}
      <div className="mt-2 text-xs text-blue-600/70 dark:text-blue-400/70">
        {thinking.split("\n").length} linii • {thinking.length} znaków
      </div>
    </div>
  )
}
