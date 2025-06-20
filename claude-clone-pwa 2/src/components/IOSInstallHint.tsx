"use client"

import { useState, useEffect } from "react"
import { Share, X } from "lucide-react"
import { Button } from "./ui/button"

export function IOSInstallHint() {
  const [showHint, setShowHint] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const standalone = (window.navigator as any).standalone === true

    setIsIOS(iOS)
    setIsStandalone(standalone)

    // Show hint only for iOS users not in standalone mode
    if (iOS && !standalone) {
      const hasSeenHint = localStorage.getItem("ios-install-hint-seen")
      if (!hasSeenHint) {
        setTimeout(() => {
          setShowHint(true)
        }, 5000)
      }
    }
  }, [])

  const handleDismiss = () => {
    setShowHint(false)
    localStorage.setItem("ios-install-hint-seen", "true")
  }

  if (!isIOS || isStandalone || !showHint) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-blue-600 text-white rounded-2xl shadow-xl p-4 animate-slide-in-left">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Share className="w-6 h-6 text-blue-200" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">Pełny ekran</h3>
            <p className="text-xs text-blue-100 mb-2">
              Aby ukryć pasek Safari, dotknij <Share className="w-3 h-3 inline mx-1" /> i wybierz "Dodaj do ekranu
              głównego"
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 rounded-full flex-shrink-0 text-blue-200 hover:text-white hover:bg-blue-700"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
