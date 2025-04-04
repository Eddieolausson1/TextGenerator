"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Save,
  History,
  Clock,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Cookie-hanteringsfunktioner
const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (let i = 0; cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1))
    }
  }
  return null
}

// Historik-objekt med tidsstämpel
interface HistoryItem {
  text: string
  timestamp: number
  id: string // Unikt ID för animationsnycklar
}

// Maxantal historikposter
const MAX_HISTORY_ITEMS = 30

export default function TextGenerator() {
  const [generatedText, setGeneratedText] = useState("Klicka på knappen för att generera en mening")
  const [sentenceCount, setSentenceCount] = useState(2)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("generator")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [animateHistoryItem, setAnimateHistoryItem] = useState<string | null>(null)
  const [animateFavorite, setAnimateFavorite] = useState<string | null>(null)
  const [customWords, setCustomWords] = useState({
    subjects: "",
    verbs: "",
    objects: "",
    places: "",
    times: "",
    adjectives: "",
    adverbs: "",
    conjunctions: "",
    expressions: "",
  })

  // Svenska ordlistor för meningsgenerering
  const defaultWords = {
    subjects: [
      "Jag",
      "Du",
      "Han",
      "Hon",
      "Vi",
      "Ni",
      "De",
      "Barnet",
      "Läraren",
      "Hunden",
      "Katten",
      "Fågeln",
      "Mannen",
      "Kvinnan",
      "Eleven",
      "Programmeraren",
      "Konstnären",
      "Musikern",
      "Läkaren",
      "Kocken",
      "Min granne",
      "Deras vän",
      "Hennes syster",
      "Hans bror",
      "Vår chef",
    ],
    verbs: [
      "gillar",
      "älskar",
      "hatar",
      "ser",
      "hör",
      "känner",
      "äter",
      "dricker",
      "springer",
      "går",
      "sover",
      "arbetar",
      "studerar",
      "läser",
      "skriver",
      "sjunger",
      "dansar",
      "lagar",
      "köper",
      "säljer",
      "tänker på",
      "pratar om",
      "längtar efter",
      "drömmer om",
      "funderar på",
      "skrattar åt",
      "gråter över",
    ],
    objects: [
      "mat",
      "musik",
      "böcker",
      "filmer",
      "datorer",
      "telefoner",
      "bilar",
      "blommor",
      "djur",
      "kläder",
      "skor",
      "konst",
      "sport",
      "spel",
      "kaffe",
      "te",
      "vatten",
      "choklad",
      "glass",
      "frukt",
      "nyheter",
      "politik",
      "vetenskap",
      "historia",
      "framtiden",
      "minnen",
      "drömmar",
    ],
    places: [
      "i parken",
      "i skolan",
      "på jobbet",
      "hemma",
      "i affären",
      "på restaurangen",
      "på biblioteket",
      "på stranden",
      "i skogen",
      "på gatan",
      "på torget",
      "i trädgården",
      "på sjukhuset",
      "på museet",
      "på bio",
      "i köket",
      "i Stockholm",
      "i Göteborg",
      "på landet",
      "vid sjön",
      "i bergen",
      "utomlands",
    ],
    times: [
      "på morgonen",
      "på eftermiddagen",
      "på kvällen",
      "på natten",
      "på helgen",
      "på vardagar",
      "på sommaren",
      "på vintern",
      "på hösten",
      "på våren",
      "varje dag",
      "ibland",
      "ofta",
      "sällan",
      "alltid",
      "aldrig",
      "förra veckan",
      "nästa månad",
      "för länge sedan",
      "i framtiden",
      "just nu",
      "för ett ögonblick sedan",
    ],
    adjectives: [
      "glad",
      "ledsen",
      "arg",
      "trött",
      "pigg",
      "hungrig",
      "törstig",
      "vacker",
      "ful",
      "stor",
      "liten",
      "snabb",
      "långsam",
      "stark",
      "svag",
      "varm",
      "kall",
      "ny",
      "gammal",
      "intressant",
      "tråkig",
      "spännande",
      "lugn",
      "stressad",
      "lycklig",
      "orolig",
      "förvånad",
    ],
    adverbs: [
      "snabbt",
      "långsamt",
      "försiktigt",
      "högljutt",
      "tyst",
      "glatt",
      "sorgset",
      "argt",
      "ivrigt",
      "lugnt",
      "plötsligt",
      "gradvis",
      "verkligen",
      "knappt",
      "nästan",
      "helt",
      "delvis",
      "särskilt",
    ],
    conjunctions: [
      "och",
      "men",
      "eller",
      "för",
      "så",
      "eftersom",
      "därför att",
      "om",
      "när",
      "medan",
      "fastän",
      "trots att",
      "innan",
      "efter att",
    ],
    expressions: [
      "Det spelar ingen roll",
      "Tänk om",
      "Oj, vad tiden går",
      "Det var en gång",
      "Tro det eller ej",
      "Som tur är",
      "Det är aldrig för sent",
      "Bättre sent än aldrig",
      "Lagom är bäst",
      "Det ordnar sig alltid",
    ],
  }

  const combinedWords = {
    subjects: [...defaultWords.subjects, ...customWords.subjects.split(",")],
    verbs: [...defaultWords.verbs, ...customWords.verbs.split(",")],
    objects: [...defaultWords.objects, ...customWords.objects.split(",")],
    places: [...defaultWords.places, ...customWords.places.split(",")],
    times: [...defaultWords.times, ...customWords.times.split(",")],
    adjectives: [...defaultWords.adjectives, ...customWords.adjectives.split(",")],
    adverbs: [...defaultWords.adverbs, ...customWords.adverbs.split(",")],
    conjunctions: [...defaultWords.conjunctions, ...customWords.conjunctions.split(",")],
    expressions: [...defaultWords.expressions, ...customWords.expressions.split(",")],
  }

  // Funktion för att generera unikt ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // Funktion för att visa success-meddelande
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 2000)
  }

  // Funktion för att slumpa fram ett element från en array
  const getRandomElement = (array: string[]) => {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Funktion för att extrahera viktiga substantiv från en mening
  const extractKeywords = (sentence: string): string[] => {
    // Konvertera till lowercase för enklare jämförelse
    const lowerSentence = sentence.toLowerCase()

    // Lista över alla substantiv att leta efter (kombinera subjects och objects och konvertera till lowercase)
    const allNouns = [...combinedWords.subjects, ...combinedWords.objects].map((word) => word.toLowerCase())

    // Hitta alla substantiv som finns i meningen
    return allNouns.filter((noun) => lowerSentence.includes(noun))
  }

  // Funktion för att generera flera meningar med återanvändning av ord
  const generateText = () => {
    setIsGenerating(true)

    // Simulera en kort laddningstid för bättre UX
    setTimeout(() => {
      const sentences: string[] = []
      let usedKeywords: string[] = []
      let lastUsedSubject: string | null = null

      for (let i = 0; i < sentenceCount; i++) {
        // För första meningen, generera helt slumpmässigt
        if (i === 0) {
          const firstSentence = generateRandomSentence([], null)
          sentences.push(firstSentence)

          // Extrahera nyckelord från första meningen
          usedKeywords = extractKeywords(firstSentence)

          // Spara det använda subjektet
          const match = firstSentence.match(/^([A-ZÅÄÖ][a-zåäö]+(?:\s[a-zåäö]+)?)\s/)
          if (match) {
            lastUsedSubject = match[1]
          }
        } else {
          // För efterföljande meningar, använd nyckelord från tidigare meningar
          // och ha 50% chans att återanvända samma subjekt
          sentences.push(generateRandomSentence(usedKeywords, lastUsedSubject))

          // Uppdatera nyckelord med nya från den senaste meningen
          const newKeywords = extractKeywords(sentences[i])
          usedKeywords = [...new Set([...usedKeywords, ...newKeywords])]

          // Uppdatera det senast använda subjektet
          const match = sentences[i].match(/^([A-ZÅÄÖ][a-zåäö]+(?:\s[a-zåäö]+)?)\s/)
          if (match) {
            lastUsedSubject = match[1]
          }
        }
      }

      const newText = sentences.join(" ")
      const newTotal = totalGenerated + 1
      const newItemId = generateId()

      // Skapa ny historikpost
      const newHistoryItem: HistoryItem = {
        text: newText,
        timestamp: Date.now(),
        id: newItemId,
      }

      // Uppdatera historik (begränsa till MAX_HISTORY_ITEMS)
      const newHistory = [newHistoryItem, ...history].slice(0, MAX_HISTORY_ITEMS)

      setGeneratedText(newText)
      setTotalGenerated(newTotal)
      setHistory(newHistory)
      setIsFavorite(favorites.includes(newText))
      setIsGenerating(false)

      // Animera den nya historikposten
      setAnimateHistoryItem(newItemId)
      setTimeout(() => setAnimateHistoryItem(null), 1000)

      // Spara i cookies
      setCookie("totalGenerated", newTotal.toString())
      setCookie("history", JSON.stringify(newHistory))

      // Visa success-meddelande
      showSuccessMessage("Text genererad!")
    }, 500)
  }

  // Funktion för att generera en slumpmässig svensk mening med möjlighet att återanvända ord
  const generateRandomSentence = (keywords: string[], lastSubject: string | null) => {
    // Bestäm om vi ska återanvända ett nyckelord (om det finns några)
    const shouldReuseKeyword = keywords.length > 0 && Math.random() > 0.3

    // Bestäm om vi ska återanvända samma subjekt (50% chans)
    const shouldReuseSubject = lastSubject !== null && Math.random() < 0.5

    // Välj subjekt - antingen återanvänd samma subjekt, eller ett nyckelord, eller slumpa fram nytt
    let currentSubject = ""
    if (shouldReuseSubject) {
      currentSubject = lastSubject
    } else if (shouldReuseKeyword) {
      // Försök hitta ett nyckelord som finns i subjects-listan
      const subjectKeywords = keywords.filter((keyword) =>
        combinedWords.subjects.some((subject) => subject.toLowerCase() === keyword),
      )

      if (subjectKeywords.length > 0) {
        // Använd ett slumpmässigt nyckelord som subjekt
        const keyword = getRandomElement(subjectKeywords)
        // Hitta originalformen (med rätt kapitalisering)
        currentSubject = combinedWords.subjects.find((subject) => subject.toLowerCase() === keyword) || keyword
      } else {
        currentSubject = getRandomElement(combinedWords.subjects)
      }
    } else {
      currentSubject = getRandomElement(combinedWords.subjects)
    }

    // Välj objekt - antingen återanvänd eller slumpa fram nytt
    let currentObject = ""
    if (shouldReuseKeyword) {
      // Försök hitta ett nyckelord som finns i objects-listan
      const objectKeywords = keywords.filter((keyword) =>
        combinedWords.objects.some((object) => object.toLowerCase() === keyword),
      )

      if (objectKeywords.length > 0) {
        // Använd ett slumpmässigt nyckelord som objekt
        const keyword = getRandomElement(objectKeywords)
        // Hitta originalformen
        currentObject = combinedWords.objects.find((object) => object.toLowerCase() === keyword) || keyword
      } else {
        currentObject = getRandomElement(combinedWords.objects)
      }
    } else {
      currentObject = getRandomElement(combinedWords.objects)
    }

    // Olika meningsstrukturer för variation
    const sentenceTypes = [
      // Grundläggande: Subjekt + Verb + Objekt
      () => `${currentSubject} ${getRandomElement(verbs)} ${currentObject}.`,

      // Med plats: Subjekt + Verb + Objekt + Plats
      () => `${currentSubject} ${getRandomElement(verbs)} ${currentObject} ${getRandomElement(places)}.`,

      // Med tid: Subjekt + Verb + Objekt + Tid
      () => `${currentSubject} ${getRandomElement(verbs)} ${currentObject} ${getRandomElement(times)}.`,

      // Med adjektiv: Subjekt + är + Adjektiv
      () => `${currentSubject} är ${getRandomElement(adjectives)}.`,

      // Komplex: Subjekt + Verb + Objekt + Plats + Tid
      () =>
        `${currentSubject} ${getRandomElement(verbs)} ${currentObject} ${getRandomElement(places)} ${getRandomElement(times)}.`,

      // Fråga: Verb + Subjekt + Objekt?
      () =>
        `${getRandomElement(verbs).charAt(0).toUpperCase() + getRandomElement(verbs).slice(1)} ${currentSubject.toLowerCase()} ${currentObject}?`,

      // Negation: Subjekt + Verb + inte + Objekt
      () => `${currentSubject} ${getRandomElement(verbs)} inte ${currentObject}.`,

      // Med adverb: Subjekt + Verb + Adverb + Objekt
      () => `${currentSubject} ${getRandomElement(verbs)} ${getRandomElement(adverbs)} ${currentObject}.`,

      // Sammansatt mening med konjunktion
      () =>
        `${currentSubject} ${getRandomElement(verbs)} ${currentObject}, ${getRandomElement(conjunctions)} ${getRandomElement(subjects).toLowerCase()} ${getRandomElement(verbs)} ${getRandomElement(objects)}.`,

      // Uttryck + enkel mening
      () => `${getRandomElement(expressions)}! ${currentSubject} ${getRandomElement(verbs)} ${currentObject}.`,

      // Adjektiv + subjekt + verb + objekt
      () =>
        `${getRandomElement(adjectives).charAt(0).toUpperCase() + getRandomElement(adjectives).slice(1)} ${currentSubject.toLowerCase()} ${getRandomElement(verbs)} ${currentObject}.`,

      // Tid + verb + subjekt + objekt
      () =>
        `${getRandomElement(times).charAt(0).toUpperCase() + getRandomElement(times).slice(1)} ${getRandomElement(verbs)} ${currentSubject.toLowerCase()} ${currentObject}.`,
    ]

    // Välj en slumpmässig meningsstruktur och generera en mening
    return sentenceTypes[Math.floor(Math.random() * sentenceTypes.length)]()
  }

  // Funktion för att formatera datum
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleString("sv-SE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Funktion för att kopiera texten
  const copyText = () => {
    navigator.clipboard.writeText(generatedText)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)

    // Visa success-meddelande
    showSuccessMessage("Kopierad till urklipp!")
  }

  // Funktion för att spara/ta bort favorit
  const toggleFavorite = () => {
    let newFavorites: string[]

    if (isFavorite) {
      newFavorites = favorites.filter((fav) => fav !== generatedText)
      setFavorites(newFavorites)
      setIsFavorite(false)
      showSuccessMessage("Borttagen från favoriter")
    } else {
      newFavorites = [...favorites, generatedText]
      setFavorites(newFavorites)
      setIsFavorite(true)

      // Animera den nya favoriten
      setAnimateFavorite(generatedText)
      setTimeout(() => setAnimateFavorite(null), 1000)

      showSuccessMessage("Sparad som favorit!")
    }

    // Spara favoriter i cookie
    setCookie("favorites", JSON.stringify(newFavorites))
  }

  // Funktion för att rensa historik
  const clearHistory = () => {
    if (confirm("Är du säker på att du vill rensa hela historiken?")) {
      setHistory([])
      setCookie("history", JSON.stringify([]))
      showSuccessMessage("Historiken har rensats")
    }
  }

  // Ladda data från cookies när komponenten monteras
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      // Ladda favoriter
      const savedFavorites = getCookie("favorites")
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites)
          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites)
            setIsFavorite(parsedFavorites.includes(generatedText))
          }
        } catch (e) {
          console.error("Kunde inte tolka sparade favoriter:", e)
        }
      }

      // Ladda historik
      const savedHistory = getCookie("history")
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory)
          if (Array.isArray(parsedHistory)) {
            // Lägg till ID om det saknas (för äldre data)
            const historyWithIds = parsedHistory.map((item) => ({
              ...item,
              id: item.id || generateId(),
            }))
            setHistory(historyWithIds)
          }
        } catch (e) {
          console.error("Kunde inte tolka sparad historik:", e)
        }
      }

      // Ladda antal genererade
      const savedTotal = getCookie("totalGenerated")
      if (savedTotal && !isNaN(Number(savedTotal))) {
        setTotalGenerated(Number(savedTotal))
      }

      setIsLoaded(true)
    }
  }, [generatedText, isLoaded])

  // Kontrollera om den aktuella texten är en favorit när texten ändras
  useEffect(() => {
    setIsFavorite(favorites.includes(generatedText))
  }, [generatedText, favorites])

  return (
    <div className="flex items-center justify-center w-full p-4">
      <Card className="max-w-md w-full overflow-hidden shadow-lg transition-all duration-500 hover:shadow-xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">Meningsgenerator</CardTitle>
              <CardDescription>Genererar slumpmässiga svenska meningar</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="ml-2 flex items-center gap-1 transition-all duration-300 hover:scale-105"
            >
              <Save className="h-3 w-3" />
              <span className="counter">{totalGenerated}</span> genererade
            </Badge>
          </div>

          {/* Success-meddelande */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 bg-green-500/90 text-white text-center py-1 text-sm font-medium transition-transform duration-300 ease-in-out",
              showSuccess ? "translate-y-0" : "-translate-y-full",
            )}
          >
            {successMessage}
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger
                value="generator"
                className="flex items-center gap-1 transition-all duration-200 data-[state=active]:scale-105"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generator
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center gap-1 transition-all duration-200 data-[state=active]:scale-105"
              >
                <History className="h-3.5 w-3.5" />
                Historik
                {history.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1 transition-all duration-300 animate-pulse">
                    {history.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="generator"
            className="mt-0 transition-all duration-300 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-50 data-[state=active]:fade-in-50"
          >
            <CardContent className="space-y-6 pt-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="generatedText">Genererad text</Label>
                <div className="relative">
                  <Textarea
                    id="generatedText"
                    readOnly
                    value={generatedText}
                    placeholder="Genererad text visas här"
                    className={cn(
                      "min-h-32 resize-none border-2 rounded-md focus:ring-2 focus:ring-offset-1 pr-10 transition-all duration-300",
                      isGenerating && "opacity-50",
                      !isGenerating && "animate-in fade-in-50 duration-300",
                    )}
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md animate-in fade-in-50 duration-200">
                      <div className="relative">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-75"></div>
                      </div>
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyText}
                      className={cn(
                        "h-8 w-8 transition-all duration-200 hover:scale-110",
                        isCopied && "bg-green-500/20 text-green-600",
                      )}
                      disabled={isGenerating}
                      title={isCopied ? "Kopierad!" : "Kopiera text"}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 animate-in zoom-in-50 duration-300" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleFavorite}
                      className={cn(
                        "h-8 w-8 transition-all duration-200 hover:scale-110",
                        isFavorite && "text-amber-500",
                      )}
                      disabled={isGenerating}
                      title={isFavorite ? "Ta bort från favoriter" : "Spara som favorit"}
                    >
                      {isFavorite ? (
                        <BookmarkCheck className="h-4 w-4 animate-in zoom-in-50 duration-300" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Detta fält är skrivskyddat. Den automatiskt genererade texten visas här.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sentence-count">Antal meningar: {sentenceCount}</Label>
                </div>
                <Slider
                  id="sentence-count"
                  min={1}
                  max={5}
                  step={1}
                  value={[sentenceCount]}
                  onValueChange={(value) => setSentenceCount(value[0])}
                  className="w-full"
                />

                {favorites.length > 0 && (
                  <div className="pt-2 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-center gap-1 text-sm font-medium mb-2">
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Favoriter ({favorites.length})</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Sparade
                      </Badge>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                      {favorites.map((fav, index) => (
                        <div
                          key={index}
                          className={cn(
                            "text-xs p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-all duration-200 hover:translate-x-1 hover:shadow-sm",
                            animateFavorite === fav && "animate-pulse bg-amber-100 dark:bg-amber-900/30",
                          )}
                          onClick={() => setGeneratedText(fav)}
                        >
                          {fav}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={generateText}
                className={cn(
                  "w-full flex items-center gap-2 transition-all duration-300",
                  !isGenerating && "hover:scale-[1.02] hover:shadow-md",
                )}
                disabled={isGenerating}
                variant="default"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generera {sentenceCount > 1 ? `${sentenceCount} meningar` : "en mening"}
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent
            value="history"
            className="mt-0 transition-all duration-300 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-50 data-[state=active]:fade-in-50"
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Genererade meningar</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Sparade
                  </Badge>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-8 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Rensa
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground animate-in fade-in-50 duration-500">
                  <History className="h-12 w-12 mb-2 opacity-20" />
                  <p>Ingen historik än</p>
                  <p className="text-xs mt-1">Genererade meningar kommer att visas här</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "text-sm p-3 bg-muted rounded-md transition-all duration-300",
                        "hover:bg-muted/80 hover:translate-x-1 hover:shadow-sm",
                        animateHistoryItem === item.id && "animate-in slide-in-from-left-5 duration-500 bg-primary/10",
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {formatDate(item.timestamp)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setGeneratedText(item.text)}
                            className="h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                            title="Använd igen"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setGeneratedText(item.text)
                              setActiveTab("generator")
                            }}
                            className="h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                            title="Visa i generator"
                          >
                            <Sparkles className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs">{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => {
                  setActiveTab("generator")
                  generateText()
                }}
                className="w-full flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                disabled={isGenerating}
                variant="default"
              >
                <Sparkles className="h-4 w-4" />
                Generera ny text
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>

        {/* CSS för animationer */}
        <style jsx global>{`
          @keyframes pulse-border {
            0%, 100% { border-color: hsl(var(--primary)); }
            50% { border-color: hsl(var(--primary) / 0.3); }
          }
          
          .counter {
            display: inline-block;
            transition: transform 0.3s ease;
          }
          
          .counter:hover {
            transform: scale(1.2);
          }
          
          /* Animera textarean när ny text genereras */
          textarea:not(:disabled) {
            transition: all 0.3s ease;
          }
          
          /* Animera knappar */
          button {
            transition: all 0.2s ease;
          }
          
          /* Animera flikar */
          [data-state="active"] {
            transition: all 0.3s ease;
          }
        `}</style>
      </Card>
    </div>
  )
}

