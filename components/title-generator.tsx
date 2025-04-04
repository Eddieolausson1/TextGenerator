"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Cookie-hanteringsfunktioner
const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
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
  id: string
  type: string
  topic?: string
  tone?: string
}

// Maxantal historikposter
const MAX_HISTORY_ITEMS = 30

export default function TitleGenerator() {
  const [generatedTitle, setGeneratedTitle] = useState("Klicka på knappen för att generera en titel")
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("neutral")
  const [titleType, setTitleType] = useState("book")
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

  // Ordlistor för titelgenerering
  const bookPrefixes = [
    "Skuggan av",
    "Hemligheten bakom",
    "Vägen till",
    "Den sista",
    "Den förlorade",
    "Drömmen om",
    "Mysteriet med",
    "Legenden om",
    "Flickan som",
    "Mannen utan",
    "Kvinnan med",
    "Barnet i",
    "Huset på",
    "Natten när",
    "Dagen då",
    "Resan genom",
    "Kriget om",
    "Kärleken till",
    "Minnet av",
    "Rösten från",
    "Ljuset i",
    "Mörkret över",
  ]

  const bookSuffixes = [
    "hjärtat",
    "skogen",
    "havet",
    "bergen",
    "stjärnorna",
    "tiden",
    "framtiden",
    "det förflutna",
    "drömmen",
    "skuggan",
    "ljuset",
    "mörkret",
    "tystnaden",
    "sorgen",
    "glädjen",
    "kärleken",
    "hoppet",
    "minnet",
    "sanningen",
    "lögnen",
    "hemligheten",
    "mysteriet",
  ]

  const moviePrefixes = [
    "Mission:",
    "Operation:",
    "Projekt:",
    "Kod:",
    "Uppdrag:",
    "Jakten på",
    "Kampen om",
    "Flykten från",
    "Återkomsten till",
    "Hämnden efter",
    "Uppgörelsen i",
    "Hotet från",
    "Attacken mot",
    "Mysteriet i",
    "Legenden om",
    "Sista striden:",
    "Första mötet:",
    "Uppvaknandet:",
    "Förbannelsen:",
    "Profetian om",
  ]

  const movieSuffixes = [
    "Ödet",
    "Framtiden",
    "Undergången",
    "Räddningen",
    "Uppdraget",
    "Hemligheten",
    "Sanningen",
    "Hämnden",
    "Återkomsten",
    "Uppgörelsen",
    "Flykten",
    "Jakten",
    "Kampen",
    "Hotet",
    "Attacken",
    "Mysteriet",
    "Legenden",
    "Striden",
    "Mötet",
    "Uppvaknandet",
  ]

  const blogPrefixes = [
    "10 sätt att",
    "Hur du kan",
    "Varför du bör",
    "5 tips för att",
    "Den ultimata guiden till",
    "Allt du behöver veta om",
    "Hemligheten bakom",
    "Så här börjar du med",
    "Enkla steg för att",
    "Expertens råd om",
    "Min resa med",
    "Sanningen om",
    "Det du inte visste om",
    "Fördelarna med",
    "Nackdelarna med",
    "Framtiden för",
    "Historien bakom",
    "En nybörjarguide till",
    "Så förbättrar du din",
    "Vanliga misstag inom",
  ]

  const blogSuffixes = [
    "som förändrar allt",
    "du aldrig trodde var möjligt",
    "på bara 5 minuter om dagen",
    "utan att spendera en krona",
    "som experterna inte berättar",
    "för nybörjare",
    "för avancerade",
    "som alla borde känna till",
    "i 2023",
    "för bättre resultat",
    "för ökad produktivitet",
    "för bättre hälsa",
    "för mer framgång",
    "för en bättre framtid",
    "som faktiskt fungerar",
    "baserat på vetenskap",
    "från min egen erfarenhet",
    "som förändrade mitt liv",
    "steg för steg",
    "med bevisade resultat",
  ]

  const sloganPrefixes = [
    "Tänk",
    "Upplev",
    "Upptäck",
    "Föreställ dig",
    "Känn",
    "Skapa",
    "Förändra",
    "Förbättra",
    "Förnya",
    "Inspirera",
    "Utforska",
    "Omfamna",
    "Lev",
    "Älska",
    "Njut av",
    "Välj",
    "Våga",
    "Börja",
    "Fortsätt",
    "Avsluta",
  ]

  const sloganSuffixes = [
    "framtiden idag",
    "skillnaden",
    "möjligheterna",
    "potentialen",
    "kvaliteten",
    "upplevelsen",
    "känslan",
    "resultaten",
    "fördelarna",
    "förändringen",
    "förbättringen",
    "förnyelsen",
    "inspirationen",
    "utforskningen",
    "omfamningen",
    "livet",
    "kärleken",
    "njutningen",
    "valet",
    "modet",
  ]

  const toneAdjectives = {
    professional: [
      "effektiv",
      "pålitlig",
      "innovativ",
      "strategisk",
      "expertbaserad",
      "resultatinriktad",
      "professionell",
      "kompetent",
      "kvalitetssäkrad",
      "framgångsrik",
    ],
    casual: [
      "enkel",
      "avslappnad",
      "vardaglig",
      "informell",
      "lättsam",
      "bekväm",
      "okomplicerad",
      "naturlig",
      "spontan",
      "jordnära",
    ],
    funny: [
      "rolig",
      "humoristisk",
      "skämtsam",
      "underhållande",
      "komisk",
      "lustig",
      "absurd",
      "ironisk",
      "lekfull",
      "skrattretande",
    ],
    serious: [
      "allvarlig",
      "djupgående",
      "kritisk",
      "analytisk",
      "genomtänkt",
      "reflekterande",
      "seriös",
      "betydelsefull",
      "väsentlig",
      "grundlig",
    ],
    dramatic: [
      "dramatisk",
      "intensiv",
      "spännande",
      "kraftfull",
      "omvälvande",
      "känsloladdad",
      "passionerad",
      "storslagen",
      "episk",
      "överväldigande",
    ],
    neutral: [
      "balanserad",
      "objektiv",
      "opartisk",
      "neutral",
      "saklig",
      "faktabaserad",
      "rättvis",
      "nyanserad",
      "ovinklad",
      "transparent",
    ],
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

  // Funktion för att generera en titel baserat på typ och ton
  const generateTitle = () => {
    setIsGenerating(true)

    // Simulera en kort laddningstid för bättre UX
    setTimeout(() => {
      let newTitle = ""
      const userTopic =
        topic.trim() || getRandomElement(["livet", "kärlek", "äventyr", "framgång", "natur", "teknologi"])

      // Välj adjektiv baserat på ton
      const toneAdj = getRandomElement(toneAdjectives[tone as keyof typeof toneAdjectives] || toneAdjectives.neutral)

      switch (titleType) {
        case "book":
          if (Math.random() > 0.5) {
            newTitle = `${getRandomElement(bookPrefixes)} ${userTopic}`
          } else {
            newTitle = `${userTopic.charAt(0).toUpperCase() + userTopic.slice(1)}s ${getRandomElement(bookSuffixes)}`
          }
          // Ibland lägg till ett adjektiv
          if (Math.random() > 0.7) {
            newTitle = `Den ${toneAdj}a ${newTitle.toLowerCase()}`
          }
          break

        case "movie":
          if (Math.random() > 0.5) {
            newTitle = `${getRandomElement(moviePrefixes)} ${userTopic}`
          } else {
            newTitle = `${userTopic.charAt(0).toUpperCase() + userTopic.slice(1)}: ${getRandomElement(movieSuffixes)}`
          }
          break

        case "blog":
          newTitle = `${getRandomElement(blogPrefixes)} ${userTopic} ${getRandomElement(blogSuffixes)}`
          break

        case "slogan":
          newTitle = `${getRandomElement(sloganPrefixes)} ${userTopic}. ${getRandomElement(sloganSuffixes)}.`
          // Gör första bokstaven stor
          newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1)
          break
      }

      const newTotal = totalGenerated + 1
      const newItemId = generateId()

      // Skapa ny historikpost
      const newHistoryItem: HistoryItem = {
        text: newTitle,
        timestamp: Date.now(),
        id: newItemId,
        type: titleType,
        topic: userTopic,
        tone: tone,
      }

      // Uppdatera historik (begränsa till MAX_HISTORY_ITEMS)
      const newHistory = [newHistoryItem, ...history].slice(0, MAX_HISTORY_ITEMS)

      setGeneratedTitle(newTitle)
      setTotalGenerated(newTotal)
      setHistory(newHistory)
      setIsFavorite(favorites.includes(newTitle))
      setIsGenerating(false)

      // Animera den nya historikposten
      setAnimateHistoryItem(newItemId)
      setTimeout(() => setAnimateHistoryItem(null), 1000)

      // Spara i cookies
      setCookie("titleTotalGenerated", newTotal.toString())
      setCookie("titleHistory", JSON.stringify(newHistory))

      // Visa success-meddelande
      showSuccessMessage("Titel genererad!")
    }, 500)
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
    navigator.clipboard.writeText(generatedTitle)
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
      newFavorites = favorites.filter((fav) => fav !== generatedTitle)
      setFavorites(newFavorites)
      setIsFavorite(false)
      showSuccessMessage("Borttagen från favoriter")
    } else {
      newFavorites = [...favorites, generatedTitle]
      setFavorites(newFavorites)
      setIsFavorite(true)

      // Animera den nya favoriten
      setAnimateFavorite(generatedTitle)
      setTimeout(() => setAnimateFavorite(null), 1000)

      showSuccessMessage("Sparad som favorit!")
    }

    // Spara favoriter i cookie
    setCookie("titleFavorites", JSON.stringify(newFavorites))
  }

  // Funktion för att rensa historik
  const clearHistory = () => {
    if (confirm("Är du säker på att du vill rensa hela historiken?")) {
      setHistory([])
      setCookie("titleHistory", JSON.stringify([]))
      showSuccessMessage("Historiken har rensats")
    }
  }

  // Ladda data från cookies när komponenten monteras
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      // Ladda favoriter
      const savedFavorites = getCookie("titleFavorites")
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites)
          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites)
            setIsFavorite(parsedFavorites.includes(generatedTitle))
          }
        } catch (e) {
          console.error("Kunde inte tolka sparade favoriter:", e)
        }
      }

      // Ladda historik
      const savedHistory = getCookie("titleHistory")
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
      const savedTotal = getCookie("titleTotalGenerated")
      if (savedTotal && !isNaN(Number(savedTotal))) {
        setTotalGenerated(Number(savedTotal))
      }

      setIsLoaded(true)
    }
  }, [generatedTitle, isLoaded])

  // Kontrollera om den aktuella texten är en favorit när texten ändras
  useEffect(() => {
    setIsFavorite(favorites.includes(generatedTitle))
  }, [generatedTitle, favorites])

  return (
    <div className="flex items-center justify-center w-full p-4">
      <Card className="max-w-md w-full overflow-hidden shadow-lg transition-all duration-500 hover:shadow-xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">Titelgenerator</CardTitle>
              <CardDescription>Genererar kreativa titlar och slagord</CardDescription>
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
                <Label htmlFor="generatedTitle">Genererad titel</Label>
                <div className="relative">
                  <Textarea
                    id="generatedTitle"
                    readOnly
                    value={generatedTitle}
                    placeholder="Genererad titel visas här"
                    className={cn(
                      "min-h-20 resize-none border-2 rounded-md focus:ring-2 focus:ring-offset-1 pr-10 transition-all duration-300",
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
                  Detta fält är skrivskyddat. Den automatiskt genererade titeln visas här.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="topic">Ämne (valfritt)</Label>
                    <Input
                      id="topic"
                      placeholder="T.ex. kärlek, äventyr, teknologi..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title-type">Typ av titel</Label>
                      <Select value={titleType} onValueChange={setTitleType}>
                        <SelectTrigger id="title-type" className="mt-1">
                          <SelectValue placeholder="Välj typ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="book">Bok</SelectItem>
                          <SelectItem value="movie">Film</SelectItem>
                          <SelectItem value="blog">Blogginlägg</SelectItem>
                          <SelectItem value="slogan">Slogan/Kampanj</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tone">Ton</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger id="tone" className="mt-1">
                          <SelectValue placeholder="Välj ton" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professionell</SelectItem>
                          <SelectItem value="casual">Avslappnad</SelectItem>
                          <SelectItem value="funny">Humoristisk</SelectItem>
                          <SelectItem value="serious">Seriös</SelectItem>
                          <SelectItem value="dramatic">Dramatisk</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

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
                          onClick={() => setGeneratedTitle(fav)}
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
                onClick={generateTitle}
                className={cn(
                  "w-full flex items-center gap-2 transition-all duration-300",
                  !isGenerating && "hover:scale-[1.02] hover:shadow-md",
                )}
                disabled={isGenerating}
                variant="default"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generera titel
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
                  <span>Genererade titlar</span>
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
                  <p className="text-xs mt-1">Genererade titlar kommer att visas här</p>
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
                            onClick={() => setGeneratedTitle(item.text)}
                            className="h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                            title="Använd igen"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setGeneratedTitle(item.text)
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
                      {item.topic && (
                        <div className="mt-1 flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{item.topic}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => {
                  setActiveTab("generator")
                  generateTitle()
                }}
                className="w-full flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                disabled={isGenerating}
                variant="default"
              >
                <Sparkles className="h-4 w-4" />
                Generera ny titel
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

