"use client"

import { useEffect, useRef, useState } from "react"
import { MessageBubble } from "./MessageBubble"
import { useApp } from "../contexts/AppContext"
import { InputPanel } from "./InputPanel"

const LANDING_HEADERS = [
  "Jak się dziś masz?",
  "Witaj – miło Cię widzieć.",
  "Co chcesz dziś razem zrobić?",
  "Jestem tu dla Ciebie.",
  "Z czym mogę dziś pomóc?",
  "Co mogę dziś ułatwić?",
  "Masz coś na myśli?",
  "Co dziś razem ogarniamy?",
  "Czego dziś szukasz?",
  "Gotowy/a na nowy dzień?",
  "Opowiedz mi, co dziś ważne.",
  "Co Ci chodzi po głowie?",
  "Z czym dziś zaczynamy?",
  "Witaj z powrotem!",
  "Jak mogę być dziś pomocny?",
  "Co chcesz dziś stworzyć?",
  "Czego dziś razem się dowiemy?",
  "Masz ochotę porozmawiać?",
  "Co dziś wspólnie wymyślimy?",
  "Co dziś dla Ciebie najważniejsze?",
  "Zróbmy to razem.",
  "Jestem gotowy, kiedy Ty jesteś.",
  "Co Cię dziś interesuje?",
  "Co dzisiaj robimy?",
  "Dobrze Cię znów widzieć.",
  "Zacznij pisać, kiedy chcesz.",
  "Gotowy/a na nowy pomysł?",
  "Zaczynamy spokojnie – co dziś?",
  "Czekam na Twoją pierwszą myśl.",
  "Jak mogę Ci dziś towarzyszyć?",
  "Co dziś chcesz odkryć?",
  "Czuję, że to będzie dobra rozmowa.",
  "Zróbmy coś fajnego.",
  "Co Ci się dziś marzy?",
  "Co dziś analizujemy?",
  "Masz pytanie?",
  "Co mogę dziś dla Ciebie napisać?",
  "Jestem tu, żeby pomóc – pytaj śmiało.",
  "Z czym dziś pracujemy?",
  "Myśl spokojnie – jestem tu, kiedy będziesz gotów.",
  "Czego dziś się uczymy?",
  "Opowiedz mi coś ciekawego.",
  "Jak mogę Ci dziś ułatwić dzień?",
  "Wspólnie coś wymyślimy.",
  "Co chcesz dziś rozgryźć?",
  "Zadaj pytanie, a ruszymy.",
  "Jakie myśli dziś chodzą Ci po głowie?",
  "Chcesz się czegoś dowiedzieć?",
  "Daj mi znać, co dziś potrzebne.",
  "Zaczynamy, gdy Ty jesteś gotowy.",
  "Jak mogę Ci dziś pomóc w działaniu?",
  "O czym chciałabyś dziś porozmawiać?",
  "Co dziś chcesz przemyśleć razem ze mną?",
  "Masz coś, co warto dziś zgłębić?",
  "Co mogę dla Ciebie dziś zrobić?",
  "Jaki temat dziś eksplorujemy?",
  "Chcesz coś omówić?",
  "Gotowy/a na wspólne myślenie?",
  "W czym dziś mogę Ci towarzyszyć?",
  "Z czym dziś zaczynamy?",
  "Co Ci dziś chodzi po głowie?",
  "Jak mogę Ci ułatwić ten dzień?",
  "Co mam dziś dla Ciebie napisać?",
  "O czym chcesz się dziś dowiedzieć więcej?",
  "Z jakim pytaniem dziś przychodzisz?",
  "Witaj – zaczynamy kolejną rozmowę?",
  "Co chcesz dziś uporządkować?",
  "Gotowy/a na nowy wgląd?",
  "Z czym dziś mogę Ci pomóc myśleć?",
  "Masz coś, o czym chcesz pogadać?",
  "Jakie pytanie dzisiaj Cię nurtuje?",
  "Czego jesteś dziś ciekaw/a?",
  "Chcesz coś dziś lepiej zrozumieć?",
  "Co mogę dla Ciebie dziś przeanalizować?",
  "Czekam na Twoją myśl.",
  "Co dzisiaj chodzi Ci po głowie?",
  "O czym chcesz dziś porozmawiać?",
  "Jak mogę dziś pomóc?",
  "Masz pytanie?",
  "W czym dziś mogę Ci towarzyszyć?",
  "Zacznij pisać, kiedy będziesz gotowy/a.",
  "Gotów do działania?",
  "Co chcesz dziś stworzyć?",
  "Jak mogę Cię dziś wesprzeć?",
  "Szukasz pomysłu czy odpowiedzi?",
  "Powiedz mi, co Cię interesuje.",
  "Co mam dziś dla Ciebie zrobić?",
  "Witaj ponownie – zaczynamy?",
  "Masz coś na myśli?",
  "Czego chcesz się dziś dowiedzieć?",
  "W czym dziś pracujemy razem?",
  "Co chcesz dziś odkryć?",
  "Gotowy/a na nowy pomysł?",
  "Pomóc z czymś konkretnym?",
  "Co mogę dziś dla Ciebie napisać?",
  "Chcesz się czegoś nauczyć?",
  "Co dzisiaj Cię inspiruje?",
  "Witaj – co mogę dziś dla Ciebie zrobić?",
  "Zadaj pytanie, a zaczniemy.",
  "Co dziś wspólnie stworzymy?",
]

export function ChatContainer() {
  const { state } = useApp()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentHeader] = useState(() => {
    // Losuj nagłówek tylko raz przy pierwszym załadowaniu
    return LANDING_HEADERS[Math.floor(Math.random() * LANDING_HEADERS.length)]
  })

  const currentConversation = state.conversations.find((conv) => conv.id === state.currentConversationId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentConversation?.messages])

  // Landing page - brak rozmowy
  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 px-4 sm:px-8 pt-12 sm:pt-0">
        <div className="text-center max-w-4xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 dark:text-white mb-6 sm:mb-8 px-2">
            {currentHeader}
          </h1>
          <div className="w-full sm:max-w-3xl sm:mx-auto">
            <InputPanel />
          </div>
        </div>
      </div>
    )
  }

  // Pusta rozmowa - pokazuj InputPanel na środku
  if (currentConversation.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 px-4 sm:px-8 pt-12 sm:pt-0">
        <div className="text-center max-w-4xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 dark:text-white mb-6 sm:mb-8 px-2">
            {currentHeader}
          </h1>
          <div className="w-full sm:max-w-3xl sm:mx-auto">
            <InputPanel />
          </div>
        </div>
      </div>
    )
  }

  // Rozmowa z wiadomościami - normalny widok
  return (
    <div className="flex-1 overflow-y-auto pt-12 sm:pt-0">
      <div className="space-y-8 sm:space-y-12 px-2 sm:px-4 py-8 sm:py-12">
        {currentConversation.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLastMessage={index === currentConversation.messages.length - 1}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}
