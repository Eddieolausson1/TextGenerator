"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Copy, Check, Sparkles, Save, History, Clock, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Cookie-hanteringsfunktioner
const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

// Historik-objekt med tidsstämpel
interface HistoryItem {
  text: string;
  timestamp: number;
  id: string;
  type: string;
  topic?: string;
  tone?: string;
}

// Maxantal historikposter
const MAX_HISTORY_ITEMS = 30;

export default function ClosingPhraseGenerator() {
  const [generatedPhrase, setGeneratedPhrase] = useState("Klicka på knappen för att generera en avslutningsfras");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("neutral");
  const [phraseType, setPhraseType] = useState("email");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("generator");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [animateHistoryItem, setAnimateHistoryItem] = useState<string | null>(null);
  const [animateFavorite, setAnimateFavorite] = useState<string | null>(null);

  // Ordlistor för avslutningsfrasgenerering
  const emailPhrases = [
    "Med vänliga hälsningar,",
    "Bästa hälsningar,",
    "Tack på förhand,",
    "Ser fram emot att höra från dig,",
    "Vänligen,",
    "Med vänlig hälsning,",
    "Hoppas detta hjälper,",
    "Tveka inte att kontakta mig om du har några frågor,",
    "Tack för din tid,",
    "Ha en bra dag,",
  ];

  const letterPhrases = [
    "Med djupaste respekt,",
    "I evig tacksamhet,",
    "Med kärlek och värme,",
    "I minnet av goda tider,",
    "Med innerlig uppskattning,",
    "Tack för allt,",
    "Dina i tankarna,",
    "Med vänskaplig hälsning,",
    "Alltid i mitt hjärta,",
    "Med ödmjukhet,",
  ];

  const speechPhrases = [
    "Tack för er uppmärksamhet,",
    "Låt oss tillsammans skapa en bättre framtid,",
    "Med hopp om en ljusare morgondag,",
    "Tack för att ni lyssnade,",
    "Låt oss ta detta till hjärtat,",
    "Tack för att ni delade denna stund med mig,",
    "Tack för att ni är här,",
    "Tillsammans är vi starka,",
    "Låt oss inspirera varandra,",
    "Tack för att ni gav mig er tid,",
  ];

  const socialMediaPhrases = [
    "Tack för att ni följer mig,",
    "Glöm inte att gilla och dela,",
    "Vi ses i kommentarsfältet,",
    "Ha en fantastisk dag!",
    "Tack för ert stöd,",
    "Sprid kärlek och positivitet,",
    "Låt oss hålla kontakten!",
    "Tack för att ni är en del av min resa,",
    "Tack för att ni är ni,",
    "Tillsammans gör vi skillnad,",
  ];

  const toneAdjectives = {
    professional: [
      "effektivt",
      "pålitligt",
      "innovativt",
      "strategiskt",
      "expertbaserat",
      "resultatinriktat",
      "professionellt",
      "kompetent",
      "kvalitetssäkert",
      "framgångsrikt",
    ],
    casual: [
      "enkelt",
      "avslappnat",
      "vardagligt",
      "informellt",
      "lättsamt",
      "bekvämt",
      "okomplicerat",
      "naturligt",
      "spontant",
      "jordnära",
    ],
    funny: [
      "roligt",
      "humoristiskt",
      "skämtsamt",
      "underhållande",
      "komiskt",
      "lustigt",
      "absurt",
      "ironiskt",
      "lekfullt",
      "skrattretande",
    ],
    serious: [
      "allvarligt",
      "djupgående",
      "kritiskt",
      "analytiskt",
      "genomtänkt",
      "reflekterande",
      "seriöst",
      "betydelsefullt",
      "väsentligt",
      "grundligt",
    ],
    dramatic: [
      "dramatiskt",
      "intensivt",
      "spännande",
      "kraftfullt",
      "omvälvande",
      "känsloladdat",
      "passionerat",
      "storslaget",
      "episkt",
      "överväldigande",
    ],
    neutral: [
      "balanserat",
      "objektivt",
      "opartiskt",
      "neutralt",
      "sakligt",
      "faktabaserat",
      "rättvist",
      "nyanserat",
      "ovinklat",
      "transparent",
    ],
  };

  // Funktion för att generera unikt ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Funktion för att visa success-meddelande
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  // Funktion för att slumpa fram ett element från en array
  const getRandomElement = (array: string[]) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // Funktion för att generera en avslutningsfras baserat på typ och ton
  const generatePhrase = () => {
    setIsGenerating(true);

    // Simulera en kort laddningstid för bättre UX
    setTimeout(() => {
      let newPhrase = "";
      const userTopic =
        topic.trim() || getRandomElement(["dagen", "kvällen", "mötet", "tillfället", "samarbetet", "diskussionen"]);

      // Välj adjektiv baserat på ton
      const toneAdj = getRandomElement(toneAdjectives[tone as keyof typeof toneAdjectives] || toneAdjectives.neutral);

      switch (phraseType) {
        case "email":
          newPhrase = `${getRandomElement(emailPhrases)}`;
          break;

        case "letter":
          newPhrase = `${getRandomElement(letterPhrases)}`;
          break;

        case "speech":
          newPhrase = `${getRandomElement(speechPhrases)}`;
          break;

        case "socialMedia":
          newPhrase = `${getRandomElement(socialMediaPhrases)}`;
          break;
      }

      const newTotal = totalGenerated + 1;
      const newItemId = generateId();

      // Skapa ny historikpost
      const newHistoryItem: HistoryItem = {
        text: newPhrase,
        timestamp: Date.now(),
        id: newItemId,
        type: phraseType,
        topic: userTopic,
        tone: tone,
      };

      // Uppdatera historik (begränsa till MAX_HISTORY_ITEMS)
      const newHistory = [newHistoryItem, ...history].slice(0, MAX_HISTORY_ITEMS);

      setGeneratedPhrase(newPhrase);
      setTotalGenerated(newTotal);
      setHistory(newHistory);
      setIsFavorite(favorites.includes(newPhrase));
      setIsGenerating(false);

      // Animera den nya historikposten
      setAnimateHistoryItem(newItemId);
      setTimeout(() => setAnimateHistoryItem(null), 1000);

      // Spara i cookies
      setCookie("phraseTotalGenerated", newTotal.toString());
      setCookie("phraseHistory", JSON.stringify(newHistory));

      // Visa success-meddelande
      showSuccessMessage("Avslutningsfras genererad!");
    }, 500);
  };

  // Funktion för att formatera datum
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("sv-SE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Funktion för att kopiera texten
  const copyText = () => {
    navigator.clipboard.writeText(generatedPhrase);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    // Visa success-meddelande
    showSuccessMessage("Kopierad till urklipp!");
  };

  // Funktion för att spara/ta bort favorit
  const toggleFavorite = () => {
    let newFavorites: string[];

    if (isFavorite) {
      newFavorites = favorites.filter((fav) => fav !== generatedPhrase);
      setFavorites(newFavorites);
      setIsFavorite(false);
      showSuccessMessage("Borttagen från favoriter");
    } else {
      newFavorites = [...favorites, generatedPhrase];
      setFavorites(newFavorites);
      setIsFavorite(true);

      // Animera den nya favoriten
      setAnimateFavorite(generatedPhrase);
      setTimeout(() => setAnimateFavorite(null), 1000);

      showSuccessMessage("Sparad som favorit!");
    }

    // Spara favoriter i cookie
    setCookie("phraseFavorites", JSON.stringify(newFavorites));
  };

  // Funktion för att rensa historik
  const clearHistory = () => {
    if (confirm("Är du säker på att du vill rensa hela historiken?")) {
      setHistory([]);
      setCookie("phraseHistory", JSON.stringify([]));
      showSuccessMessage("Historiken har rensats");
    }
  };

  // Ladda data från cookies när komponenten monteras
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      // Ladda favoriter
      const savedFavorites = getCookie("phraseFavorites");
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites);
            setIsFavorite(parsedFavorites.includes(generatedPhrase));
          }
        } catch (e) {
          console.error("Kunde inte tolka sparade favoriter:", e);
        }
      }

      // Ladda historik
      const savedHistory = getCookie("phraseHistory");
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            // Lägg till ID om det saknas (för äldre data)
            const historyWithIds = parsedHistory.map((item) => ({
              ...item,
              id: item.id || generateId(),
            }));
            setHistory(historyWithIds);
          }
        } catch (e) {
          console.error("Kunde inte tolka sparad historik:", e);
        }
      }

      // Ladda antal genererade
      const savedTotal = getCookie("phraseTotalGenerated");
      if (savedTotal && !isNaN(Number(savedTotal))) {
        setTotalGenerated(Number(savedTotal));
      }

      setIsLoaded(true);
    }
  }, [generatedPhrase, isLoaded]);

  // Kontrollera om den aktuella texten är en favorit när texten ändras
  useEffect(() => {
    setIsFavorite(favorites.includes(generatedPhrase));
  }, [generatedPhrase, favorites]);

  return (
    <div className="flex items-center justify-center w-full p-4">
      <Card className="max-w-md w-full overflow-hidden shadow-lg transition-all duration-500 hover:shadow-xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">Avslutningsfrasgenerator</CardTitle>
              <CardDescription>Genererar kreativa avslutningsfraser</CardDescription>
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
              showSuccess ? "translate-y-0" : "-translate-y-full"
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
                <Label htmlFor="generatedPhrase">Genererad avslutningsfras</Label>
                <div className="relative">
                  <Textarea
                    id="generatedPhrase"
                    readOnly
                    value={generatedPhrase}
                    placeholder="Genererad avslutningsfras visas här"
                    className={cn(
                      "min-h-20 resize-none border-2 rounded-md focus:ring-2 focus:ring-offset-1 pr-10 transition-all duration-300",
                      isGenerating && "opacity-50",
                      !isGenerating && "animate-in fade-in-50 duration-300"
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
                        isCopied && "bg-green-500/20 text-green-600"
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
                        isFavorite && "text-amber-500"
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
                  Detta fält är skrivskyddat. Den automatiskt genererade avslutningsfrasen visas här.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="topic">Ämne (valfritt)</Label>
                    <Input
                      id="topic"
                      placeholder="T.ex. dagen, kvällen, mötet..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phrase-type">Typ av avslutningsfras</Label>
                      <Select value={phraseType} onValueChange={setPhraseType}>
                        <SelectTrigger id="phrase-type" className="mt-1">
                          <SelectValue placeholder="Välj typ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">E-post</SelectItem>
                          <SelectItem value="letter">Brev</SelectItem>
                          <SelectItem value="speech">Tal</SelectItem>
                          <SelectItem value="socialMedia">Sociala medier</SelectItem>
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
                            animateFavorite === fav && "animate-pulse bg-amber-100 dark:bg-amber-900/30"
                          )}
                          onClick={() => setGeneratedPhrase(fav)}
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
                onClick={generatePhrase}
                className={cn(
                  "w-full flex items-center gap-2 transition-all duration-300",
                  !isGenerating && "hover:scale-[1.02] hover:shadow-md"
                )}
                disabled={isGenerating}
                variant="default"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generera avslutningsfras
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
                  <span>Genererade avslutningsfraser</span>
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
                  <p className="text-xs mt-1">Genererade avslutningsfraser kommer att visas här</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "text-sm p-3 bg-muted rounded-md transition-all duration-300",
                        "hover:bg-muted/80 hover:translate-x-1 hover:shadow-sm",
                        animateHistoryItem === item.id && "animate-in slide-in-from-left-5 duration-500 bg-primary/10"
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
                            onClick={() => setGeneratedPhrase(item.text)}
                            className="h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                            title="Använd igen"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setGeneratedPhrase(item.text);
                              setActiveTab("generator");
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
                  setActiveTab("generator");
                  generatePhrase();
                }}
                className="w-full flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                disabled={isGenerating}
                variant="default"
              >
                <Sparkles className="h-4 w-4" />
                Generera ny avslutningsfras
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
  );
}
