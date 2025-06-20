# Claude Clone PWA

Progresywna aplikacja webowa replikująca interfejs Claude AI z nowoczesnym React, TypeScript i Tailwind CSS.

## Funkcje

- 🎨 **Nowoczesny interfejs**: Czysty, responsywny interfejs dopasowany do designu Claude
- 🌙 **Tryb ciemny/jasny**: Przełączanie między motywami
- 💬 **Czat w czasie rzeczywistym**: Płynny przepływ rozmowy z animacjami pisania
- 📱 **Wsparcie PWA**: Instalacja jako natywna aplikacja na desktop i mobile
- 🔄 **Wsparcie offline**: Działa bez połączenia internetowego
- 📁 **Przesyłanie plików**: Wsparcie dla przeciągnij i upuść
- 💾 **Lokalne przechowywanie**: Rozmowy zachowywane między sesjami
- 🎯 **Dostępność**: Zgodność z WCAG 2.1 AA
- ⌨️ **Skróty klawiszowe**: Ctrl+Enter do wysłania, Esc do zamknięcia modali

## Stos technologiczny

- **React 18** z TypeScript
- **Tailwind CSS** do stylowania
- **React Context** do zarządzania stanem
- **React Markdown** do renderowania wiadomości
- **React Syntax Highlighter** do bloków kodu
- **Lucide React** do ikon
- **Service Worker** do funkcjonalności PWA

## Rozpoczęcie pracy

### Wymagania

- Node.js 16+ 
- npm lub yarn

### Instalacja

1. Sklonuj repozytorium:
\`\`\`bash
git clone <repository-url>
cd claude-clone-pwa
\`\`\`

2. Zainstaluj zależności:
\`\`\`bash
npm install
\`\`\`

3. Uruchom serwer deweloperski:
\`\`\`bash
npm start
\`\`\`

4. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce

### Budowanie dla produkcji

\`\`\`bash
npm run build
\`\`\`

Folder build będzie zawierał zoptymalizowaną wersję produkcyjną gotową do wdrożenia.

## Instalacja PWA

### Desktop
1. Otwórz aplikację w Chrome/Edge
2. Kliknij ikonę instalacji na pasku adresu
3. Postępuj zgodnie z instrukcjami instalacji

### Mobile
1. Otwórz aplikację w przeglądarce mobilnej
2. Dotknij "Dodaj do ekranu głównego" z menu przeglądarki
3. Aplikacja zostanie zainstalowana jako natywna aplikacja

## Użytkowanie

### Podstawowy czat
1. Wpisz wiadomość w polu tekstowym
2. Naciśnij Enter lub kliknij przycisk Wyślij
3. Zobacz odpowiedzi AI w obszarze czatu

### Przesyłanie plików
1. Kliknij ikonę spinacza lub przeciągnij pliki do obszaru wprowadzania
2. Obsługiwane formaty: obrazy, PDF, pliki tekstowe, dokumenty
3. Pliki są przetwarzane i analizowane przez AI

### Skróty klawiszowe
- \`Ctrl/Cmd + Enter\`: Wyślij wiadomość
- \`Ctrl/Cmd + N\`: Nowa rozmowa
- \`Ctrl/Cmd + K\`: Fokus na wyszukiwanie (gdy zaimplementowane)
- \`Esc\`: Zamknij modale/panele

### Rozmowy
- Twórz nowe rozmowy przyciskiem "Nowy czat"
- Przełączaj między rozmowami na pasku bocznym
- Rozmowy są automatycznie zapisywane lokalnie

## Personalizacja

### Motywy
Aplikacja obsługuje jasne i ciemne motywy. Przełączaj używając przycisku motywu na górnym pasku.

### Kolory
Modyfikuj schemat kolorów w \`tailwind.config.js\`:

\`\`\`js
colors: {
  orange: {
    // Niestandardowa paleta pomarańczowa
    500: '#ff6b35', // Główny kolor akcentu
  }
}
\`\`\`

### Odpowiedzi Mock AI
Dostosuj odpowiedzi AI w \`src/services/mockAI.ts\`:

\`\`\`typescript
const MOCK_RESPONSES = [
  "Twoja niestandardowa odpowiedź tutaj...",
  // Dodaj więcej odpowiedzi
];
\`\`\`

## Architektura

### Struktura komponentów
\`\`\`
src/
├── components/
│   ├── TopBar.tsx          # Nagłówek z nawigacją
│   ├── SidePanel.tsx       # Historia rozmów
│   ├── ChatContainer.tsx   # Główny obszar czatu
│   ├── MessageBubble.tsx   # Pojedyncze wiadomości
│   └── InputPanel.tsx      # Wprowadzanie wiadomości
├── contexts/
│   └── AppContext.tsx      # Globalne zarządzanie stanem
├── services/
│   └── mockAI.ts          # Usługa Mock AI
├── types/
│   └── index.ts           # Definicje TypeScript
└── App.tsx                # Główna aplikacja
\`\`\`

### Zarządzanie stanem
Aplikacja używa React Context z useReducer do zarządzania stanem:

- **Rozmowy**: Tablica obiektów rozmów
- **Bieżąca rozmowa**: ID aktywnej rozmowy
- **Motyw**: Preferencja trybu jasnego/ciemnego
- **Stan UI**: Widoczność paska bocznego, ustawienia

### Trwałość danych
- Rozmowy przechowywane w localStorage
- Ustawienia i preferencje zachowywane między sesjami
- Service Worker cache'uje zasoby aplikacji do użytku offline

## Współpraca

1. Forkuj repozytorium
2. Utwórz branch funkcji: \`git checkout -b nazwa-funkcji\`
3. Wprowadź zmiany i commituj: \`git commit -m 'Dodaj funkcję'\`
4. Wypchnij do brancha: \`git push origin nazwa-funkcji\`
5. Prześlij pull request

## Licencja

Ten projekt jest licencjonowany na licencji MIT - zobacz plik LICENSE dla szczegółów.

## Podziękowania

- Inspirowane interfejsem Claude AI
- Zbudowane z nowoczesnymi najlepszymi praktykami React
- Zaprojektowane z myślą o dostępności i wydajności
