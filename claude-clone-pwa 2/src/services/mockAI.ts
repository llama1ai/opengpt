import type { Artifact } from "../types"

const MOCK_RESPONSES = [
  "I'd be happy to help you with that! Let me break this down step by step.",
  "That's an interesting question. Here's what I think about it:",
  "I can help you understand this concept better. Let me explain:",
  "Great question! This is actually a common topic that many people ask about.",
  "I'll do my best to provide you with a comprehensive answer.",
]

const CODE_RESPONSES = [
  `Here's a simple example in JavaScript:

\`\`\`javascript
function greetUser(name) {
  return \`Hello, \${name}! Welcome to our application.\`;
}

console.log(greetUser("Claude"));
\`\`\`

This function takes a name parameter and returns a personalized greeting.`,

  `Here's a Python solution:

\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Example usage
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
\`\`\`

This implements the Fibonacci sequence using recursion.`,
]

export class MockAIService {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async sendMessage(content: string, files?: File[]): Promise<string> {
    await this.delay(1000 + Math.random() * 2000)

    if (content.toLowerCase().includes("code") || content.toLowerCase().includes("program")) {
      return CODE_RESPONSES[Math.floor(Math.random() * CODE_RESPONSES.length)]
    }

    const baseResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]

    if (files && files.length > 0) {
      return `${baseResponse}\n\nI can see you've uploaded ${files.length} file(s). I'll analyze them and provide relevant insights based on their content.`
    }

    return `${baseResponse}\n\n${this.generateContextualResponse(content)}`
  }

  private generateContextualResponse(input: string): string {
    const words = input.toLowerCase()

    if (words.includes("react") || words.includes("javascript")) {
      return "When working with React, it's important to understand component lifecycle and state management. Would you like me to explain any specific concepts?"
    }

    if (words.includes("python") || words.includes("data")) {
      return "Python is excellent for data analysis and machine learning. There are many powerful libraries like pandas, numpy, and scikit-learn that can help with your projects."
    }

    if (words.includes("help") || words.includes("how")) {
      return "I'm here to assist you with a wide range of topics including programming, writing, analysis, and creative tasks. Feel free to ask me anything!"
    }

    return "I understand your question and I'm ready to provide detailed assistance. Could you provide more specific details about what you'd like to know?"
  }

  async generateArtifact(type: string, content: string): Promise<Artifact> {
    await this.delay(500)

    return {
      id: Date.now().toString(),
      type: type as "code" | "document" | "chart",
      title: `Generated ${type}`,
      content,
      language: type === "code" ? "javascript" : undefined,
    }
  }
}

export const mockAI = new MockAIService()
