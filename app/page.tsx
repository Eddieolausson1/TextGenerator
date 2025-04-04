"use client"

import type React from "react"

import { useState, useEffect } from "react"
import TextGenerator from "../modern-textarea"
import TitleGenerator from "../components/title-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, Sparkles, Repeat, History, Brain, ChevronRight, Zap, Type, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Framer Motion animationsvariant för fade-in
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

// Framer Motion animationsvariant för staggered children
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function GeneratorPage() {
  const [showGenerator, setShowGenerator] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [activeGeneratorTab, setActiveGeneratorTab] = useState("sentences")

  // Lyssna på scroll för parallax-effekter
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Bakgrundseffekter */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />

        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-96 h-96 bg-purple-500 rounded-full blur-[100px]"
            style={{ transform: `translate(${scrollY * 0.05}px, ${scrollY * -0.05}px)` }}
          />
          <div
            className="absolute top-1/2 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"
            style={{ transform: `translate(${scrollY * -0.05}px, ${scrollY * 0.05}px)` }}
          />
          <div
            className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500 rounded-full blur-[100px]"
            style={{ transform: `translate(${scrollY * 0.03}px, ${scrollY * -0.03}px)` }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-4">
              <span className="text-cyan-400 mr-2">✨</span>
              Slumpmässig textgenerering
            </div>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
          >
            Svenska Textgeneratorn
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-xl md:text-2xl text-slate-300 max-w-2xl mb-10"
          >
            Skapa sammanhängande text med slumpmässig generering för inspiration till dikter och kreativt skrivande
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0 text-white px-8 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              onClick={() => {
                setShowGenerator(true)
                setTimeout(() => {
                  document.getElementById("generator-section")?.scrollIntoView({ behavior: "smooth" })
                }, 100)
              }}
            >
              Prova generatorn
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white rounded-full transition-all duration-300"
              onClick={() => {
                document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Läs mer
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-20 flex justify-center"
          >
            <div className="animate-bounce p-2 bg-white/10 backdrop-blur-md rounded-full">
              <ArrowDown className="h-6 w-6 text-slate-300" />
            </div>
          </motion.div>
        </div>

        {/* Flytande element i bakgrunden */}
        <div
          className="absolute bottom-10 left-10 w-20 h-20 bg-white/5 backdrop-blur-md rounded-lg rotate-12 border border-white/10"
          style={{ transform: `rotate(${12 + scrollY * 0.02}deg) translateY(${scrollY * -0.1}px)` }}
        />
        <div
          className="absolute top-20 right-20 w-16 h-16 bg-white/5 backdrop-blur-md rounded-lg rotate-45 border border-white/10"
          style={{ transform: `rotate(${45 + scrollY * 0.02}deg) translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-12 h-12 bg-white/5 backdrop-blur-md rounded-full border border-white/10"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
      </section>

      {/* Generator Section */}
      <section id="generator-section" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-80" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 inline mr-2 text-cyan-400" />
              Kreativ inspiration
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Generera text
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Skapa slumpmässiga svenska texter med bara ett klick!</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <Tabs value={activeGeneratorTab} onValueChange={setActiveGeneratorTab} className="w-full mb-8">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-2 w-full max-w-md bg-white/5 backdrop-blur-md">
                  <TabsTrigger
                    value="sentences"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Textgeneratorn
                  </TabsTrigger>
                  <TabsTrigger
                    value="titles"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Titelgenerator
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="sentences" className="mt-6">
                <div className="p-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl">
                  <div className="bg-slate-900 rounded-xl p-1">
                    <TextGenerator />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="titles" className="mt-6">
                <div className="p-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl">
                  <div className="bg-slate-900 rounded-xl p-1">
                    <TitleGenerator />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* What It Is Section */}
      <section id="features-section" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-4">
              <Zap className="h-4 w-4 inline mr-2 text-cyan-400" />
              Funktioner
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Vad är Textgeneratorn?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              En kreativ textgenerator som skapar slumpmässiga svenska texter för att inspirera till dikter,
              berättelser och andra kreativa texter
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-cyan-400" />}
              title="Intelligent ordåteranvändning"
              description="Generatorn identifierar viktiga ord i texten och återanvänder dem i efterföljande texter för att skapa mer sammanhängande text."
            />

            <FeatureCard
              icon={<Repeat className="h-10 w-10 text-cyan-400" />}
              title="Subjektupprepning"
              description="50% chans att samma subjekt (t.ex. 'Kocken') återanvänds i början av nästa mening för bättre textflöde."
            />

            <FeatureCard
              icon={<Brain className="h-10 w-10 text-cyan-400" />}
              title="Varierade meningsstrukturer"
              description="Använder olika meningsstrukturer för att skapa omväxlande och intressanta texter som kan inspirera ditt kreativa skrivande."
            />

            <FeatureCard
              icon={<History className="h-10 w-10 text-cyan-400" />}
              title="Historikhantering"
              description="Spara dina genererade texter automatiskt och återvänd till dem när som helst."
            />

            <FeatureCard
              icon={<Type className="h-10 w-10 text-cyan-400" />}
              title="Kreativ titelgenerator"
              description="Genererar titlar för böcker, filmer eller blogginlägg baserat på ämnet och tonen du väljer. Skapar även catchiga slagord och kampanjnamn."
            />

            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-cyan-400" />}
              title="Anpassningsbar"
              description="Välj antal texter och se hur generatorn skapar sammanhängande text med återanvända ord."
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mt-20 text-center"
          >
            <Button
              size="lg"
              className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0 text-white px-8 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              onClick={() => {
                setShowGenerator(true)
                document.getElementById("generator-section")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Prova generatorn nu
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Svenska Textgeneratorn
              </h3>
              <p className="text-slate-400 mt-2">Slumpmässig textgenerering för kreativ inspiration</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Om oss
              </a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Kontakt
              </a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Integritet
              </a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Villkor
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} Svenska Textgeneratorn. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>

      {/* CSS för bakgrundsmönster */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}

// Komponent för funktionskort
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div variants={fadeIn}>
      <Card className="hover:shadow-lg transition-all duration-500 hover:scale-[1.03] border-0 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
          <div className="mb-6 p-4 bg-white/10 rounded-2xl">{icon}</div>
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
          <p className="text-slate-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

