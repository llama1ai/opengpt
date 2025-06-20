"use client"

import { useState, useEffect } from "react"
import {
  PanelLeft,
  MessageSquare,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  Archive,
  Settings,
  Library,
  User,
  Moon,
  Sun,
  Globe,
  Download,
  Upload,
  Palette,
  BarChart3,
  Sparkles,
  Edit,
} from "lucide-react"
import { Button } from "./ui/button"
import { Modal, ModalContent, ModalFooter } from "./ui/modal"
import { useApp } from "../contexts/AppContext"
import { cn } from "@/lib/utils"

interface SidePanelProps {
  isExpanded: boolean
  onToggle: () => void
}

export function SidePanel({ isExpanded, onToggle }: SidePanelProps) {
  const { state, createConversation, switchConversation, deleteConversation, renameConversation, toggleTheme } =
    useApp()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Grupowanie rozmów chronologicznie
  const groupConversationsByDate = (conversations: typeof state.conversations) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups = {
      today: [] as typeof conversations,
      yesterday: [] as typeof conversations,
      thisWeek: [] as typeof conversations,
      older: [] as typeof conversations,
    }

    conversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt)
      const convDateOnly = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate())

      if (convDateOnly.getTime() === today.getTime()) {
        groups.today.push(conv)
      } else if (convDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(conv)
      } else if (convDate >= weekAgo) {
        groups.thisWeek.push(conv)
      } else {
        groups.older.push(conv)
      }
    })

    return groups
  }

  const conversationGroups = groupConversationsByDate(state.conversations)

  const handleNewChat = () => {
    createConversation()
    // Zamknij panel na mobile po utworzeniu nowej rozmowy
    const isMobile = window.innerWidth < 1024
    if (isMobile) {
      onToggle()
    }
  }

  const handleConversationClick = (id: string) => {
    switchConversation(id)
    // Zamknij panel na mobile po wybraniu rozmowy
    const isMobile = window.innerWidth < 1024
    if (isMobile) {
      onToggle()
    }
  }

  const handleEditStart = (id: string, title: string) => {
    setEditingId(id)
    setEditingTitle(title)
  }

  const handleEditSave = () => {
    if (editingId && editingTitle.trim()) {
      renameConversation(editingId, editingTitle.trim())
    }
    setEditingId(null)
    setEditingTitle("")
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę rozmowę?")) {
      deleteConversation(id)
    }
  }

  // Zamykanie na ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        onToggle()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isExpanded, onToggle])

  const ConversationGroup = ({
    title,
    conversations,
    icon: Icon,
  }: {
    title: string
    conversations: typeof state.conversations
    icon: any
  }) => {
    if (conversations.length === 0) return null

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <Icon className="w-3 h-3" />
          {title}
        </div>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-gray-200/60 dark:hover:bg-gray-700/60",
                state.currentConversationId === conv.id && "bg-gray-200/80 dark:bg-gray-700/80",
              )}
              onClick={() => handleConversationClick(conv.id)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

              {editingId === conv.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleEditSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave()
                    if (e.key === "Escape") handleEditCancel()
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">{conv.title}</span>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md hover:bg-gray-300/60 dark:hover:bg-gray-600/60"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditStart(conv.id, conv.title)
                  }}
                  title="Edytuj nazwę"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(conv.id)
                  }}
                  title="Usuń rozmowę"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
    isActive = false,
    showLabel = true,
  }: {
    icon: any
    label: string
    onClick?: () => void
    isActive?: boolean
    showLabel?: boolean
  }) => (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 h-10 px-3 transition-all duration-200",
        isExpanded ? "px-3" : "px-2 justify-center",
        isActive
          ? "bg-gray-200/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white",
      )}
      title={!isExpanded ? label : undefined}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {isExpanded && showLabel && <span className="text-sm truncate">{label}</span>}
    </Button>
  )

  return (
    <>
      <div
        className={cn(
          "flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 ease-out",
          // Desktop - normalny panel
          "lg:relative lg:translate-x-0",
          // Mobile - overlay panel z lepszym pozycjonowaniem
          "fixed inset-y-0 left-0 z-50 lg:z-auto",
          isExpanded ? "w-72 sm:w-80 lg:w-64 translate-x-0" : "w-0 -translate-x-full lg:w-12 lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center h-12 sm:h-14", isExpanded ? "px-3 sm:px-4" : "px-2 justify-center")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors touch-manipulation hidden sm:flex"
            title={isExpanded ? "Zwiń panel" : "Rozwiń panel"}
          >
            <PanelLeft className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
          </Button>
          {isExpanded && (
            <div className="ml-3 sm:ml-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ChatGPT</h2>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!isExpanded ? (
            // Collapsed view - tylko ikony
            <>
              <div className="p-2 space-y-2 flex-1">
                <SidebarButton icon={Edit} label="Nowy czat" onClick={handleNewChat} showLabel={false} />
                <SidebarButton icon={Library} label="Biblioteka" showLabel={false} />
              </div>
              {/* Bottom buttons */}
              <div className="p-2 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2">
                <SidebarButton
                  icon={Settings}
                  label="Ustawienia"
                  onClick={() => setShowSettingsModal(true)}
                  showLabel={false}
                />
                <SidebarButton icon={User} label="Profil" onClick={() => setShowProfileModal(true)} showLabel={false} />
              </div>
            </>
          ) : (
            // Expanded view - pełny panel
            <>
              <div className="p-3 flex-1">
                {/* Nowy czat */}
                <div className="mb-6">
                  <SidebarButton icon={Edit} label="Nowy czat" onClick={handleNewChat} />
                </div>

                {/* Historia rozmów */}
                {state.conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Brak rozmów</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      Rozpocznij nową rozmowę, aby zobaczyć ją tutaj
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <ConversationGroup title="Dzisiaj" conversations={conversationGroups.today} icon={Clock} />
                    <ConversationGroup title="Wczoraj" conversations={conversationGroups.yesterday} icon={Calendar} />
                    <ConversationGroup
                      title="Ten tydzień"
                      conversations={conversationGroups.thisWeek}
                      icon={Calendar}
                    />
                    <ConversationGroup title="Starsze" conversations={conversationGroups.older} icon={Archive} />
                  </div>
                )}

                {/* Biblioteka */}
                <div className="mb-6">
                  <SidebarButton icon={Library} label="Biblioteka" />
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="p-3">
                <div className="space-y-1">
                  <SidebarButton icon={Settings} label="Ustawienia" onClick={() => setShowSettingsModal(true)} />
                  <SidebarButton icon={User} label="Profil" onClick={() => setShowProfileModal(true)} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {isExpanded && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Settings Modal */}
      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Ustawienia">
        <ModalContent>
          <div className="space-y-6">
            {/* Wygląd */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Wygląd
              </h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="w-full justify-start h-10 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {state.theme === "dark" ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                  {state.theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
                </Button>
              </div>
            </div>

            {/* Ogólne */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Ogólne
              </h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Globe className="w-4 h-4 mr-3" />
                  Język: Polski
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  Model: {state.selectedModel.split("/")[1] || state.selectedModel}
                </Button>
              </div>
            </div>

            {/* Dane */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dane
              </h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-3" />
                  Eksportuj dane
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Upload className="w-4 h-4 mr-3" />
                  Importuj dane
                </Button>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>Rozmowy: {state.conversations.length}</div>
                    <div>Wiadomości: {state.conversations.reduce((acc, conv) => acc + conv.messages.length, 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
            Zamknij
          </Button>
        </ModalFooter>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Profil">
        <ModalContent>
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">Użytkownik</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Konto lokalne</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rozmowy</span>
                  <span className="text-gray-900 dark:text-white font-medium">{state.conversations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Wiadomości</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {state.conversations.reduce((acc, conv) => acc + conv.messages.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Aktywny model</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {state.selectedModel.split("/")[1] || state.selectedModel}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 mr-3" />
                Preferencje konta
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-3" />
                Pobierz moje dane
              </Button>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowProfileModal(false)}>
            Zamknij
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
