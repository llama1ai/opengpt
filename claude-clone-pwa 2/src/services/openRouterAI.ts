import { SYSTEM_PROMPT } from "../config/systemPrompt"

export interface AIModel {
  id: string
  name: string
  description: string
  contextLength: number
  pricing: {
    prompt: number
    completion: number
  }
  supportsThinking?: boolean // Dodaj tę linię
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "openai/gpt-4.1",
    name: "ChatGPT 4.1",
    description: "Latest OpenAI model with enhanced capabilities",
    contextLength: 128000,
    pricing: {
      prompt: 2.5,
      completion: 10.0,
    },
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "ChatGPT 4.1 Mini",
    description: "Faster and more cost-effective version of GPT-4.1",
    contextLength: 128000,
    pricing: {
      prompt: 0.15,
      completion: 0.6,
    },
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    description: "Anthropic's most intelligent model with extended thinking capabilities",
    contextLength: 200000,
    pricing: {
      prompt: 3.0,
      completion: 15.0,
    },
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic's flagship model with excellent reasoning and coding abilities",
    contextLength: 200000,
    pricing: {
      prompt: 3.0,
      completion: 15.0,
    },
  },
  {
    id: "microsoft/phi-4-reasoning-plus",
    name: "Phi 4 Reasoning Plus",
    description: "Microsoft's advanced reasoning model optimized for complex problem solving",
    contextLength: 16384,
    pricing: {
      prompt: 0.5,
      completion: 1.5,
    },
  },
  {
    id: "qwen/qwq-32b",
    name: "QwQ 32B",
    description: "Alibaba's reasoning-focused model with strong analytical capabilities",
    contextLength: 32768,
    pricing: {
      prompt: 0.9,
      completion: 0.9,
    },
    supportsThinking: true, // Dodaj tę linię
  },
  {
    id: "google/gemini-2.5-pro-preview",
    name: "Gemini 2.5 Pro",
    description: "Google's latest multimodal AI model with advanced reasoning",
    contextLength: 1000000,
    pricing: {
      prompt: 1.25,
      completion: 5.0,
    },
    supportsThinking: true, // Dodaj tę linię
  },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout 17B",
    description: "Meta's efficient Llama 4 model optimized for instruction following",
    contextLength: 32768,
    pricing: {
      prompt: 0.2,
      completion: 0.2,
    },
  },
  {
    id: "deepseek/deepseek-r1-0528:free",
    name: "DeepSeek R1",
    description: "DeepSeek's reasoning model with advanced problem-solving capabilities - free tier",
    contextLength: 65536,
    pricing: {
      prompt: 0.0,
      completion: 0.0,
    },
    supportsThinking: true, // Dodaj tę linię
  },
]

interface OpenRouterMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenRouterAIService {
  private apiKey: string
  private baseUrl = "https://openrouter.ai/api/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendMessage(
    content: string,
    model = "anthropic/claude-3.7-sonnet",
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
    files?: File[],
  ): Promise<string> {
    try {
      // Prepare messages with system prompt
      const messages: OpenRouterMessage[] = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        // Add conversation history
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        // Add current message
        {
          role: "user",
          content: this.formatMessageWithFiles(content, files),
        },
      ]

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Claude Clone PWA",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText}${
            errorData.error?.message ? ` - ${errorData.error.message}` : ""
          }`,
        )
      }

      const data: OpenRouterResponse = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from AI model")
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error("OpenRouter API error:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to get AI response")
    }
  }

  async sendMessageStream(
    content: string,
    model = "anthropic/claude-3.7-sonnet",
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
    files?: File[],
    onChunk?: (chunk: string) => void,
    onThinking?: (thinking: string) => void, // Dodaj ten parametr
  ): Promise<string> {
    try {
      const messages: OpenRouterMessage[] = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: this.formatMessageWithFiles(content, files),
        },
      ]

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Claude Clone PWA",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText}${
            errorData.error?.message ? ` - ${errorData.error.message}` : ""
          }`,
        )
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response stream available")
      }

      let fullResponse = ""
      let fullThinking = ""
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta

                // Handle thinking content
                if (delta?.thinking && onThinking) {
                  fullThinking += delta.thinking
                  onThinking(fullThinking)
                }

                // Handle regular content
                const content = delta?.content
                if (content) {
                  fullResponse += content
                  onChunk?.(content)
                }
              } catch (e) {
                // Ignore parsing errors for individual chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      return fullResponse
    } catch (error) {
      console.error("OpenRouter streaming error:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to get AI response")
    }
  }

  private formatMessageWithFiles(content: string, files?: File[]): string {
    if (!files || files.length === 0) {
      return content
    }

    let formattedContent = content

    if (files.length > 0) {
      formattedContent += "\n\nAttached files:\n"
      files.forEach((file) => {
        formattedContent += `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)\n`
      })
      formattedContent +=
        "\nNote: File contents cannot be processed in this demo, but the AI can see the file names and metadata."
    }

    return formattedContent
  }

  async getAvailableModels(): Promise<AIModel[]> {
    return AVAILABLE_MODELS
  }
}

// Create singleton instance
export const openRouterAI = new OpenRouterAIService(
  "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",
)
