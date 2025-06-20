"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useApp } from "../contexts/AppContext"
import { AVAILABLE_MODELS, type AIModel } from "../services/openRouterAI"

export function ModelSelector() {
  const { state, setSelectedModel } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const selectedModel = AVAILABLE_MODELS.find((model) => model.id === state.selectedModel) || AVAILABLE_MODELS[0]

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model.id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-base sm:text-lg font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors touch-manipulation"
      >
        <span className="truncate max-w-[150px] sm:max-w-none">{selectedModel.name}</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 z-50 overflow-hidden min-w-[200px] max-w-[280px] sm:max-w-none backdrop-blur-sm">
            <div className="p-1 max-h-[60vh] overflow-y-auto">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-150 touch-manipulation ${
                    model.id === selectedModel.id
                      ? "bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{model.name}</span>
                    {model.id === selectedModel.id && (
                      <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
