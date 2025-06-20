"use client"

import { PromptInput, PromptInputActions, PromptInputTextarea } from "./prompt-kit/prompt-input"
import { Button } from "./ui/button"
import { Plus, Shuffle, Mic, MoreHorizontal, ArrowUp, Square } from "lucide-react"
import { useState } from "react"
import { useApp } from "../contexts/AppContext"
import { openRouterAI } from "../services/openRouterAI"

export function InputPanel() {
  const { state, addMessage, createConversation, updateLastMessage, updateMessageThinking, setLoading } = useApp()
  const [input, setInput] = useState("")

  const handleSubmit = async () => {
    if (!input.trim() || state.isLoading) return

    if (!state.currentConversationId) {
      createConversation()
      // Wait a bit for the conversation to be created
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Store current input
    const currentInput = input.trim()

    // Clear input immediately
    setInput("")
    setLoading(true)

    // Add user message with unique ID
    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userMessage = {
      id: userMessageId,
      role: "user" as const,
      content: currentInput,
    }

    addMessage(userMessage)

    // Get conversation history for context
    const currentConversation = state.conversations.find((conv) => conv.id === state.currentConversationId)
    const conversationHistory =
      currentConversation?.messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || []

    try {
      // Create unique ID for assistant message
      const assistantMessageId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Check if current model supports thinking
      const { AVAILABLE_MODELS } = await import("../services/openRouterAI")
      const currentModel = AVAILABLE_MODELS.find((model) => model.id === state.selectedModel)
      const supportsThinking = currentModel?.supportsThinking || false

      // Add placeholder assistant message for streaming
      addMessage({
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isThinking: supportsThinking,
      })

      let fullResponse = ""

      // Use streaming for better UX
      await openRouterAI.sendMessageStream(
        currentInput,
        state.selectedModel,
        conversationHistory,
        undefined,
        (chunk: string) => {
          fullResponse += chunk
          updateLastMessage(assistantMessageId, fullResponse)
        },
        supportsThinking
          ? (thinking: string) => {
              updateMessageThinking(assistantMessageId, thinking)
            }
          : undefined,
      )

      if (!fullResponse.trim()) {
        throw new Error("Pusta odpowiedź od AI")
      }
    } catch (error) {
      console.error("Failed to get AI response:", error)
      const errorMessage = error instanceof Error ? error.message : "Wystąpił nieznany błąd"

      // Add error message instead of updating placeholder
      addMessage({
        role: "assistant",
        content: `Przepraszam, wystąpił błąd: ${errorMessage}\n\nSpróbuj ponownie lub sprawdź połączenie internetowe.`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (value: string) => {
    setInput(value)
  }

  const hasInput = input.trim().length > 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 sm:relative sm:z-auto w-full px-0 sm:max-w-3xl sm:mx-auto sm:px-4 pb-0 sm:pb-0 bg-white dark:bg-gray-900 shadow-lg sm:shadow-none">
      <div className="w-full px-0 sm:px-0">
        <PromptInput
          value={input}
          onValueChange={handleValueChange}
          isLoading={state.isLoading}
          onSubmit={handleSubmit}
          className="w-full"
        >
          <PromptInputTextarea placeholder="Zapytaj o cokolwiek" />
          <PromptInputActions>
            {/* Left side actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                title="Dodaj załącznik"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation hidden sm:flex"
                title="Losowe pytanie"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-2 sm:px-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium touch-manipulation hidden sm:flex"
                title="Zbadaj"
              >
                Zbadaj
              </Button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mikrofon - tylko gdy brak tekstu */}
              {!hasInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                  title="Nagrywanie głosowe"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}

              {/* Więcej opcji - tylko gdy brak tekstu i na desktop */}
              {!hasInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation hidden sm:flex"
                  title="Więcej opcji"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              )}

              {/* Przycisk wysyłania - zawsze widoczny */}
              <Button
                variant="default"
                size="icon"
                className={`h-8 w-8 rounded-full transition-all duration-200 touch-manipulation ${
                  hasInput && !state.isLoading
                    ? "bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
                onClick={handleSubmit}
                disabled={!hasInput || state.isLoading}
                title={
                  state.isLoading
                    ? "Zatrzymaj generowanie"
                    : hasInput
                      ? "Wyślij wiadomość"
                      : "Wpisz wiadomość aby wysłać"
                }
              >
                {state.isLoading ? <Square className="w-4 h-4 fill-current" /> : <ArrowUp className="w-4 h-4" />}
              </Button>
            </div>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  )
}
