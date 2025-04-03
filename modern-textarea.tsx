"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Historik-objekt med tidsstämpel
interface HistoryItem {
  text: string;
  timestamp: number;
  id: string; // Unikt ID för animationsnycklar
}

// Maxantal historikposter
const MAX_HISTORY_ITEMS = 30;

export default function TextGenerator() {
  const [generatedText, setGeneratedText] = useState("Klicka på knappen för att generera en mening");
  const [sentenceCount, setSentenceCount] = useState(2);
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

  // Svenska ordlistor för meningsgenerering
  const subjects = [
    "Jag", "Du", "Han", "Hon", "Vi", "Ni", "De", "Barnet", "Läraren", "Hunden", "Katten", "Fågeln", "Mannen", "Kvinnan", "Eleven",
    "Programmeraren", "Konstnären", "Musikern", "Läkaren", "Kocken", "Min granne", "Deras vän", "Hennes syster", "Hans bror", "Vår chef", "Varför", "När",
  ];

  const verbs = [
    "gillar", "älskar", "hatar", "ser", "hör", "känner", "äter", "dricker", "springer", "går", "sover", "arbetar", "studerar", "läser", "skriver",
    "sjunger", "dansar", "lagar", "köper", "säljer", "tänker på", "pratar om", "längtar efter", "drömmer om", "funderar på", "skrattar åt", "gråter över",
  ];

  const objects = [
    "mat", "musik", "böcker", "filmer", "datorer", "telefoner", "bilar", "blommor", "djur", "kläder", "skor", "konst", "sport", "spel", "kaffe", "te",
    "vatten", "choklad", "glass", "frukt", "nyheter", "politik", "vetenskap", "historia", "framtiden", "minnen", "drömmar",
  ];

  const places = [
    "i parken", "i skolan", "på jobbet", "hemma", "i affären", "på restaurangen", "på biblioteket", "på stranden", "i skogen", "på gatan", "på torget",
    "i trädgården", "på sjukhuset", "på museet", "på bio", "i köket", "i Stockholm", "i Göteborg", "på landet", "vid sjön", "i bergen", "utomlands",
  ];

  const times = [
    "på morgonen", "på eftermiddagen", "på kvällen", "på natten", "på helgen", "på vardagar", "på sommaren", "på vintern", "på hösten", "på våren",
    "varje dag", "ibland", "ofta", "sällan", "alltid", "aldrig", "förra veckan", "nästa månad", "för länge sedan", "i framtiden", "just nu", "för ett ögonblick sedan",
  ];

  const adjectives = [
    "glad", "ledsen", "arg", "trött", "pigg", "hungrig", "törstig", "vacker", "ful", "stor", "liten", "snabb", "långsam", "stark", "svag", "varm", "kall",
    "ny", "gammal", "intressant", "tråkig", "spännande", "lugn", "stressad", "lycklig", "orolig", "förvånad",
  ];

  const adverbs = [
    "snabbt", "långsamt", "försiktigt", "högljutt", "tyst", "glatt", "sorgset", "argt", "ivrigt", "lugnt", "plötsligt", "gradvis", "verkligen", "knappt",
    "nästan", "helt", "delvis", "särskilt",
  ];

  const conjunctions = [
    "och", "men", "eller", "för", "så", "eftersom", "därför att", "om", "när", "medan", "fastän", "trots att", "innan", "efter att",
  ];

  const expressions = [
    "Det spelar ingen roll", "Tänk om", "Oj, vad tiden går", "Det var en gång", "Tro det eller ej", "Som tur är", "Det är aldrig för sent", "Bättre sent än aldrig",
    "Lagom är bäst", "Det ordnar sig alltid",
  ];

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

  // Funktion för att generera en slumpmässig svensk mening
  const generateRandomSentence = () => {
    // Olika meningsstrukturer för variation
    const sentenceTypes = [
      // Grundläggande: Subjekt + Verb + Objekt
      () => `${getRandomElement(subjects)} ${getRandomElement(verbs)} ${getRandomElement(objects)}.`,

      // Med plats: Subjekt + Verb + Objekt + Plats
      () => `${getRandomElement(subjects)} ${getRandomElement(verbs)} ${getRandomElement(objects)} ${getRandomElement(places)}.`,

      // Med tid: Subjekt + Verb + Objekt + Tid
      () => `${getRandomElement(subjects)} ${getRandomElement(verbs)} ${getRandomElement(objects)} ${getRandomElement(times)}.`,

      // Med adjektiv: Subjekt + är + Adjektiv
      () => `${getRandomElement(subjects)} är ${getRandomElement(adjectives)}.`,

      // Komplex: Subjekt + Verb + Objekt + Plats + Tid
      () => `${getRandomElement(subjects)} ${getRandomElement(verbs)} ${getRandomElement(objects)} ${getRandomElement(places)} ${getRandomElement(times)}.`,

      // Fråga: Verb + Subjekt + Objekt?
      () => `${getRandomElement(verbs).charAt(0).toUpperCase() + getRandomElement(verbs).slice(1)} ${getRandomElement(subjects).toLowerCase()} ${getRandomElement(objects)}?`,

      // Negation: Subjekt + Verb + inte + Objekt
      () => `${getRandomElement(subjects)} ${getRandomElement(verbs)} inte ${getRandomElement(objects)}.`,

      // Med adverb: Subjekt + Verb + Adverb + Objekt
      () => `${getRandomElement(subjects)} ${getRandomElement(verbs)} ${getRandomElement(adverbs)} ${getRandomElement(objects)}.`,

      // Sammansatt mening med konjunktion
      () => `${getRandomElement(subjects)} ${getRandomElement(verbs)} ${getRandomElement(objects)}, ${getRandomElement(conjunctions)} ${getRandomElement(subjects).toLowerCase()} ${getRandomElement(verbs)} ${getRandomElement(objects)}.`,

      // Uttryck + enkel mening
      () => `${getRandomElement(expressions)}! ${getRandomElement(subjects)} ${getRandomElement(verbs)} ${getRandomElement(objects)}.`,

      // Adjektiv + subjekt + verb + objekt
      () => `${getRandomElement(adjectives).charAt(0).toUpperCase() + getRandomElement(adjectives).slice(1)} ${getRandomElement(subjects).toLowerCase()} ${getRandomElement(verbs)} ${getRandomElement(objects)}.`,

      // Tid + verb + subjekt + objekt
      () => `${getRandomElement(times).charAt(0).toUpperCase() + getRandomElement(times).slice(1)} ${getRandomElement(verbs)} ${getRandomElement(subjects).toLowerCase()} ${getRandomElement(objects)}.`,
    ];

    // Välj en slumpmässig meningsstruktur och generera en mening
    return sentenceTypes[Math.floor(Math.random() * sentenceTypes.length)]();
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

  // Funktion för att spara data till localStorage
  const saveData = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Fel vid sparande av data:", error);
    }
  };

  // Funktion för att hämta data från localStorage
  const loadData = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Fel vid laddning av data:", error);
      return null;
    }
  };

  // Funktion för att generera flera meningar
  const generateText = () => {
    setIsGenerating(true);

    // Simulera en kort laddningstid för bättre UX
    setTimeout(() => {
      let text = "";

      for (let i = 0; i < sentenceCount; i++) {
        text += generateRandomSentence() + " ";
      }

      const newText = text.trim();
      const newTotal = totalGenerated + 1;
      const newItemId = generateId();

      // Skapa ny historikpost
      const newHistoryItem: HistoryItem = {
        text: newText,
        timestamp: Date.now(),
        id: newItemId,
      };

      // Uppdatera historik (begränsa till MAX_HISTORY_ITEMS)
      const newHistory = [newHistoryItem, ...history].slice(0, MAX_HISTORY_ITEMS);

      setGeneratedText(newText);
      setTotalGenerated(newTotal);
      setHistory(newHistory);
      setIsFavorite(favorites.includes(newText));
      setIsGenerating(false);

      // Animera den nya historikposten
      setAnimateHistoryItem(newItemId);
      setTimeout(() => setAnimateHistoryItem(null), 1000);

      // Spara i localStorage
      saveData("totalGenerated", newTotal);
      saveData("history", newHistory);
      saveData("favorites", favorites);

      // Visa success-meddelande
      showSuccessMessage("Text genererad!");
    }, 500);
  };

  // Funktion för att kopiera texten
  const copyText = () => {
    navigator.clipboard.writeText(generatedText);
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
      newFavorites = favorites.filter((fav) => fav !== generatedText);
      setFavorites(newFavorites);
      setIsFavorite(false);
      showSuccessMessage("Borttagen från favoriter");
    } else {
      newFavorites = [...favorites, generatedText];
      setFavorites(newFavorites);
      setIsFavorite(true);

      // Animera den nya favoriten
      setAnimateFavorite(generatedText);
      setTimeout(() => setAnimateFavorite(null), 1000);

      showSuccessMessage("Sparad som favorit!");
    }

    // Spara favoriter i localStorage
    saveData("favorites", newFavorites);
  };

  // Funktion för att rensa historik
  const clearHistory = () => {
    if (confirm("Är du säker på att du vill rensa hela historiken?")) {
      setHistory([]);
      saveData("history", []);
      showSuccessMessage("Historiken har rensats");
    }
  };

  // Ladda data från localStorage när komponenten monteras
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      // Ladda favoriter
      const savedFavorites = loadData("favorites");
      if (savedFavorites && Array.isArray(savedFavorites)) {
        setFavorites(savedFavorites);
        setIsFavorite(savedFavorites.includes(generatedText));
      }

      // Ladda historik
      const savedHistory = loadData("history");
      if (savedHistory && Array.isArray(savedHistory)) {
        // Lägg till ID om det saknas (för äldre data)
        const historyWithIds = savedHistory.map((item) => ({
          ...item,
          id: item.id || generateId(),
        }));
        setHistory(historyWithIds);
      }

      // Ladda antal genererade
      const savedTotal = loadData("totalGenerated");
      if (savedTotal && !isNaN(Number(savedTotal))) {
        setTotalGenerated(Number(savedTotal));
      }

      setIsLoaded(true);
    }
  }, [generatedText, isLoaded]);

  // Kontrollera om den aktuella texten är en favorit när texten ändras
  useEffect(() => {
    setIsFavorite(favorites.includes(generatedText));
  }, [generatedText, favorites]);

  //Enskild radera funktion för historik
  const deleteHistoryItem = (id:string) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory);
    saveData("history", newHistory);
    showSuccessMessage("Historik post raderad.");
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="max-w-md w-full overflow-hidden shadow-lg transition-all duration-500 hover:shadow-xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">Meningsgenerator</CardTitle>
              <CardDescription>Genererar slumpmässiga svenska meningar</CardDescription>
            </div>
            <Badge variant="outline" className="ml-2 flex items-center gap-1 transition-all duration-300 hover:scale-105">
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
              <TabsTrigger value="generator" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:scale-105">
                <Sparkles className="h-3.5 w-3.5" />
                Generator
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:scale-105">
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

          <TabsContent value="generator" className="mt-0 transition-all duration-300 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-50 data-[state=active]:fade-in-50">
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
                      {isCopied ? <Check className="h-4 w-4 animate-in zoom-in-50 duration-300" /> : <Copy className="h-4 w-4" />}
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
                      {isFavorite ? <BookmarkCheck className="h-4 w-4 animate-in zoom-in-50 duration-300" /> : <Bookmark className="h-4 w-4" />}
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
                            animateFavorite === fav && "animate-pulse bg-amber-100 dark:bg-amber-900/30"
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
                  !isGenerating && "hover:scale-[1.02] hover:shadow-md"
                )}
                disabled={isGenerating}
                variant="default"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generera {sentenceCount > 1 ? `${sentenceCount} meningar` : "en mening"}
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="history" className="mt-0 transition-all duration-300 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-50 data-[state=active]:fade-in-50">
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
                              setGeneratedText(item.text);
                              setActiveTab("generator");
                            }}
                            className="h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                            title="Visa i generator"
                          >
                            <Sparkles className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={()=> deleteHistoryItem(item.id)}
                            className = "h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-destructive/10"
                            title="Radera"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
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
                  setActiveTab("generator");
                  generateText();
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
            0%,
            100% {
              border-color: hsl(var(--primary));
            }
            50% {
              border-color: hsl(var(--primary) / 0.3);
            }
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
