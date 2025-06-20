"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Copy, Check, ThumbsUp, ThumbsDown, Edit3, Trash2, RotateCcw } from "lucide-react"
import type { Message } from "../types"
import { useApp } from "../contexts/AppContext"
import { Button } from "./ui/button"
import { ThinkingBubble } from "./ThinkingBubble"

interface MessageBubbleProps {
  message: Message
  isLastMessage?: boolean
}

export function MessageBubble({ message, isLastMessage = false }: MessageBubbleProps) {
  const { state, addMessage } = useApp()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [reaction, setReaction] = useState<"up" | "down" | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)

  const copyToClipboard = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (id) {
        setCopiedCode(id)
        setTimeout(() => setCopiedCode(null), 2000)
      } else {
        setCopiedMessage(true)
        setTimeout(() => setCopiedMessage(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleReaction = (type: "up" | "down") => {
    setReaction(reaction === type ? null : type)
  }

  const handleRegenerate = async () => {
    if (message.role === "assistant") {
      const currentConversation = state.conversations.find((conv) => conv.id === state.currentConversationId)
      if (currentConversation) {
        const messageIndex = currentConversation.messages.findIndex((msg) => msg.id === message.id)
        const previousUserMessage = currentConversation.messages
          .slice(0, messageIndex)
          .reverse()
          .find((msg) => msg.role === "user")

        if (previousUserMessage) {
          try {
            const { openRouterAI } = await import("../services/openRouterAI")
            const conversationHistory = currentConversation.messages
              .slice(0, messageIndex)
              .slice(-10)
              .map((msg) => ({
                role: msg.role,
                content: msg.content,
              }))

            const response = await openRouterAI.sendMessage(
              previousUserMessage.content,
              state.selectedModel,
              conversationHistory,
            )
            addMessage({
              role: "assistant",
              content: response,
            })
          } catch (error) {
            console.error("Failed to regenerate response:", error)
            addMessage({
              role: "assistant",
              content: "Przepraszam, wystąpił błąd podczas regenerowania odpowiedzi. Spróbuj ponownie.",
            })
          }
        }
      }
    }
  }

  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 sm:px-4 md:px-6">
      {isAssistant ? (
        <div className="group flex w-full flex-col gap-0">
          <div className="flex flex-col mb-2">
            <div className="w-full">
              {/* Thinking bubble - tylko dla modeli obsługujących thinking */}
              {message.thinking && (
                <ThinkingBubble
                  thinking={message.thinking}
                  isActive={isLastMessage && state.isLoading && message.isThinking}
                />
              )}

              {/* Wskaźnik myślenia AI - tylko gdy wiadomość jest pusta i AI ładuje */}
              {isLastMessage && state.isLoading && !message.content.trim() && !message.thinking && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              )}

              {/* File attachments preview */}
              {message.files && message.files.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {message.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700"
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.url || "/placeholder.svg"}
                          alt={file.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {file.name.split(".").pop()?.toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                    rows={Math.max(3, editedContent.split("\n").length)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setIsEditing(false)} className="rounded-full">
                      Zapisz
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditedContent(message.content)
                        setIsEditing(false)
                      }}
                      className="rounded-full"
                    >
                      Anuluj
                    </Button>
                  </div>
                </div>
              ) : (
                message.content.trim() && (
                  <div className="prose prose-gray dark:prose-invert max-w-none text-foreground w-full flex-1 rounded-lg bg-transparent p-0">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "")
                          const codeId = `code-${Math.random().toString(36).substr(2, 9)}`
                          const codeContent = String(children).replace(/\n$/, "")

                          if (!inline && match) {
                            return (
                              <div className="relative my-4 group">
                                <div className="flex items-center justify-between bg-gray-900 dark:bg-gray-800 px-4 py-2 rounded-t-lg">
                                  <span className="text-xs text-gray-300 font-medium">{match[1]}</span>
                                  <button
                                    onClick={() => copyToClipboard(codeContent, codeId)}
                                    className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-xs opacity-0 group-hover:opacity-100"
                                  >
                                    {copiedCode === codeId ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Skopiowano</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Kopiuj</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm m-0">
                                  <code className={`language-${match[1]}`}>{codeContent}</code>
                                </pre>
                              </div>
                            )
                          }

                          return (
                            <code
                              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Message Actions - tylko gdy wiadomość ma treść */}
          {message.content.trim() && (
            <div
              className={`flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${isLastMessage ? "opacity-100" : ""}`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => copyToClipboard(message.content)}
                title="Kopiuj"
              >
                {copiedMessage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-8 w-8 ${
                  reaction === "up" ? "text-green-600 bg-green-50 dark:bg-green-900/20" : ""
                }`}
                onClick={() => handleReaction("up")}
                title="Dobra odpowiedź"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-8 w-8 ${
                  reaction === "down" ? "text-red-600 bg-red-50 dark:bg-red-900/20" : ""
                }`}
                onClick={() => handleReaction("down")}
                title="Słaba odpowiedź"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={handleRegenerate}
                title="Regeneruj"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="group flex flex-col items-end gap-1">
          <div className="bg-muted text-primary max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-3xl px-4 sm:px-5 py-2.5 text-sm sm:text-base">
            {message.content}
          </div>
          <div className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => setIsEditing(true)}
              title="Edytuj"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" title="Usuń">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => copyToClipboard(message.content)}
              title="Kopiuj"
            >
              {copiedMessage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
