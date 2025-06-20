"use client"

import { useEffect, useState } from "react"
import { AppProvider, useApp } from "./contexts/AppContext"
import { TopBar } from "./components/TopBar"
import { ChatContainer } from "./components/ChatContainer"
import { InputPanel } from "./components/InputPanel"
import { SidePanel } from "./components/SidePanel"
import { IOSInstallHint } from "./components/IOSInstallHint"

function AppContent() {
  const { state } = useApp()
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [viewportHeight, setViewportHeight] = useState("100vh")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark")
  }, [state.theme])

  useEffect(() => {
    // Check if running as PWA
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      document.referrer.includes("android-app://")

    setIsStandalone(standalone)

    // iOS Safari viewport height fix
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
      setViewportHeight(`${window.innerHeight}px`)
    }

    setVH()

    // Update on resize and orientation change
    window.addEventListener("resize", setVH)
    window.addEventListener("orientationchange", () => {
      setTimeout(setVH, 500)
    })

    if (standalone) {
      document.body.classList.add("pwa-standalone")
      console.log("Running as PWA")

      // Prevent browser-like behaviors in PWA mode
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault()
      })

      document.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length > 1) {
            e.preventDefault()
          }
        },
        { passive: false },
      )
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }

    return () => {
      window.removeEventListener("resize", setVH)
      window.removeEventListener("orientationchange", setVH)
    }
  }, [])

  const currentConversation = state.conversations.find((conv) => conv.id === state.currentConversationId)
  const hasMessages = currentConversation && currentConversation.messages.length > 0

  return (
    <div
      className={`flex bg-white dark:bg-gray-900 relative overflow-hidden pb-16 sm:pb-0 ${isStandalone ? "pwa-standalone" : ""}`}
      style={{
        height: viewportHeight,
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <SidePanel isExpanded={isSidePanelExpanded} onToggle={() => setIsSidePanelExpanded(!isSidePanelExpanded)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onTogglePanel={() => setIsSidePanelExpanded(!isSidePanelExpanded)}
          isPanelExpanded={isSidePanelExpanded}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatContainer />
          {hasMessages && <InputPanel />}
        </div>
      </div>

      {/* Show install hint for iOS users */}
      <IOSInstallHint />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
