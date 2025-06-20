export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  artifacts?: Artifact[]
  files?: FileAttachment[]
  thinking?: string
  isThinking?: boolean
}

export interface Artifact {
  id: string
  type: "code" | "document" | "chart"
  title: string
  content: string
  language?: string
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface AppState {
  conversations: Conversation[]
  currentConversationId: string | null
  selectedModel: string
  theme: "light" | "dark"
  isLoading: boolean
  settings: {
    fontSize: "small" | "medium" | "large"
    language: string
  }
}
