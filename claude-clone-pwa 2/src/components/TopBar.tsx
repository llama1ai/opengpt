"use client"
import { ModelSelector } from "./ModelSelector"
import { PanelLeft } from "lucide-react"
import { Button } from "./ui/button"

interface TopBarProps {
  onTogglePanel: () => void
  isPanelExpanded: boolean
}

export function TopBar({ onTogglePanel, isPanelExpanded }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 sm:relative sm:z-auto flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePanel}
          className="h-8 w-8 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors sm:hidden"
          title={isPanelExpanded ? "Zwiń panel" : "Rozwiń panel"}
        >
          <PanelLeft className={`w-4 h-4 transition-transform duration-200 ${isPanelExpanded ? "rotate-180" : ""}`} />
        </Button>
        <ModelSelector />
      </div>
    </div>
  )
}
