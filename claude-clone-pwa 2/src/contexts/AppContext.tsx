"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { AppState, Conversation, Message } from "../types"

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  addMessage: (message: Omit<Message, "timestamp"> & { id?: string }) => void
  updateLastMessage: (messageId: string, content: string) => void
  updateMessageThinking: (messageId: string, thinking: string) => void
  createConversation: () => void
  switchConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  editMessage: (messageId: string, content: string) => void
  setSelectedModel: (model: string) => void
  setLoading: (loading: boolean) => void
  toggleTheme: () => void
}

type AppAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_MESSAGE"; payload: { messageId: string; content: string } }
  | { type: "UPDATE_MESSAGE_THINKING"; payload: { messageId: string; thinking: string } }
  | { type: "CREATE_CONVERSATION" }
  | { type: "SWITCH_CONVERSATION"; payload: string }
  | { type: "DELETE_CONVERSATION"; payload: string }
  | { type: "RENAME_CONVERSATION"; payload: { id: string; title: string } }
  | { type: "EDIT_MESSAGE"; payload: { messageId: string; content: string } }
  | { type: "SET_SELECTED_MODEL"; payload: string }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_STATE"; payload: AppState }

const initialState: AppState = {
  conversations: [],
  currentConversationId: null,
  selectedModel: "openai/gpt-4.1",
  theme: "light",
  isLoading: false,
  settings: {
    fontSize: "medium",
    language: "pl",
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === state.currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, action.payload],
                updatedAt: new Date(),
                title:
                  conv.messages.length === 0 && action.payload.role === "user"
                    ? action.payload.content.slice(0, 50) + (action.payload.content.length > 50 ? "..." : "")
                    : conv.title,
              }
            : conv,
        ),
      }
    case "UPDATE_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === state.currentConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.payload.messageId ? { ...msg, content: action.payload.content } : msg,
                ),
                updatedAt: new Date(),
              }
            : conv,
        ),
      }
    case "UPDATE_MESSAGE_THINKING":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === state.currentConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.payload.messageId ? { ...msg, thinking: action.payload.thinking } : msg,
                ),
                updatedAt: new Date(),
              }
            : conv,
        ),
      }
    case "CREATE_CONVERSATION":
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: "Nowa rozmowa",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return {
        ...state,
        conversations: [newConv, ...state.conversations],
        currentConversationId: newConv.id,
      }
    case "SWITCH_CONVERSATION":
      return {
        ...state,
        currentConversationId: action.payload,
      }
    case "DELETE_CONVERSATION":
      const filteredConversations = state.conversations.filter((conv) => conv.id !== action.payload)
      return {
        ...state,
        conversations: filteredConversations,
        currentConversationId:
          state.currentConversationId === action.payload
            ? filteredConversations.length > 0
              ? filteredConversations[0].id
              : null
            : state.currentConversationId,
      }
    case "RENAME_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id ? { ...conv, title: action.payload.title, updatedAt: new Date() } : conv,
        ),
      }
    case "EDIT_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === state.currentConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.payload.messageId ? { ...msg, content: action.payload.content } : msg,
                ),
                updatedAt: new Date(),
              }
            : conv,
        ),
      }
    case "SET_SELECTED_MODEL":
      return {
        ...state,
        selectedModel: action.payload,
      }
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "LOAD_STATE":
      return action.payload
    default:
      return state
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const savedState = localStorage.getItem("claude-clone-state")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        // Convert date strings back to Date objects
        parsedState.conversations = parsedState.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        dispatch({ type: "LOAD_STATE", payload: parsedState })
      } catch (error) {
        console.error("Failed to load saved state:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    localStorage.setItem("claude-clone-state", JSON.stringify(state))
  }, [state])

  const addMessage = (message: Omit<Message, "timestamp"> & { id?: string }) => {
    const newMessage: Message = {
      ...message,
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    dispatch({ type: "ADD_MESSAGE", payload: newMessage })
  }

  const updateLastMessage = (messageId: string, content: string) => {
    dispatch({ type: "UPDATE_MESSAGE", payload: { messageId, content } })
  }

  const updateMessageThinking = (messageId: string, thinking: string) => {
    dispatch({ type: "UPDATE_MESSAGE_THINKING", payload: { messageId, thinking } })
  }

  const createConversation = () => {
    dispatch({ type: "CREATE_CONVERSATION" })
  }

  const switchConversation = (id: string) => {
    dispatch({ type: "SWITCH_CONVERSATION", payload: id })
  }

  const deleteConversation = (id: string) => {
    dispatch({ type: "DELETE_CONVERSATION", payload: id })
  }

  const renameConversation = (id: string, title: string) => {
    dispatch({ type: "RENAME_CONVERSATION", payload: { id, title } })
  }

  const editMessage = (messageId: string, content: string) => {
    dispatch({ type: "EDIT_MESSAGE", payload: { messageId, content } })
  }

  const setSelectedModel = (model: string) => {
    dispatch({ type: "SET_SELECTED_MODEL", payload: model })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" })
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addMessage,
        updateLastMessage,
        updateMessageThinking,
        createConversation,
        switchConversation,
        deleteConversation,
        renameConversation,
        editMessage,
        setSelectedModel,
        setLoading,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
