"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  Activity,
  AlertTriangle,
  PlayCircle,
  Trophy,
  Filter,
  CheckCircle2,
  X,
  Volume2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

type Team = 
  // Brasil
  "Palmeiras" | "Flamengo" | "Fluminense" | "Bahia" | "São Paulo" | "Athletico-PR" | "Coritiba" | "Vasco" | "Grêmio" | "Vitória" | 
  "Corinthians" | "Botafogo" | "Internacional" | "Atlético-MG" | "RB Bragantino" | "Chapecoense" | "Santos" | "Cruzeiro" | "Mirassol" | "Remo" |
  // Europa
  "Real Madrid" | "Barcelona" | "Manchester City" | "Manchester United" | "Chelsea" | "Arsenal" | "Liverpool" | "Aston Villa" | "Newcastle" | "Tottenham" | "Atlético de Madrid" | "Inter de Milão" | "Bayern de Munique";
type ImpactType = "lesao" | "escalacao" | "retorno" | "poupados";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  team: Team;
  impact_type: ImpactType;
  created_at: string;
  source: string;
  key_player?: string;
  url: string;
}

const TEAMS: Team[] = [
  // Brasil
  "Palmeiras", "Flamengo", "Fluminense", "Bahia", "São Paulo", "Athletico-PR", "Coritiba", "Vasco", "Grêmio", "Vitória", 
  "Corinthians", "Botafogo", "Internacional", "Atlético-MG", "RB Bragantino", "Chapecoense", "Santos", "Cruzeiro", "Mirassol", "Remo",
  // Europa
  "Real Madrid", "Barcelona", "Manchester City", "Manchester United", "Chelsea", "Arsenal", "Liverpool", "Aston Villa", "Newcastle", "Tottenham", "Atlético de Madrid", "Inter de Milão", "Bayern de Munique"
];

export default function Home() {
  const [activeTeam, setActiveTeam] = useState<Team | "Todos">("Todos");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [toasts, setToasts] = useState<NewsItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sistema de Som
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine"; 
      
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  };

  useEffect(() => {
    // 1. Carregar as notícias iniciais do banco
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && !error) {
        setNews(data);
      }
    };
    fetchNews();

    // 2. Inscrever-se para atualizações Realtime do Supabase (A grande mágica)
    const channel = supabase.channel('realtime_news')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, (payload) => {
        const nova_noticia = payload.new as NewsItem;
        
        // Atualizar os estados para mostrar na UI
        setNews(prev => [nova_noticia, ...prev]);
        setToasts(prev => [...prev, nova_noticia]);
        
        // Tocar o alarme
        playAlertSound();

        // Ocultar notificação após 6s
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== nova_noticia.id));
        }, 6000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const filteredNews = activeTeam === "Todos" ? news : news.filter(n => n.team === activeTeam);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      
      <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/30">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Tactical<span className="text-blue-500 font-light">Insight</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Radar Realtime I.A.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition-colors ${soundEnabled ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-slate-800/50 border-slate-800 text-slate-500'}`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-5 sticky top-28">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold">Filtros de Clube</h2>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setActiveTeam("Todos")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex justify-between items-center ${activeTeam === "Todos" ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300 font-medium' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                Visão Geral (Todos)
                {activeTeam === "Todos" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </button>
              
              <div className="h-px bg-white/5 my-2"></div>

              {TEAMS.map(team => (
                <button
                  key={team}
                  onClick={() => setActiveTeam(team)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${activeTeam === team ? 'bg-slate-800 border border-slate-700 text-white font-medium' : 'hover:bg-slate-800/50 text-slate-400'}`}
                >
                  <span className="truncate">{team}</span>
                  {activeTeam === team && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Feed de Notícias Reais */}
        <section className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              Feed Monitorado
            </h2>
            <div className="text-xs flex gap-2">
               <span className="text-emerald-400 bg-emerald-900/30 border border-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Supabase Realtime
               </span>
            </div>
          </div>

          <AnimatePresence>
            {filteredNews.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-center border-dashed border-slate-700"
              >
                <Search className="w-12 h-12 mb-3 text-slate-600" />
                <p>Nenhuma nova informação crítica foi filtrada pela I.A. ainda.</p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {filteredNews.map((item, idx) => (
                  <motion.article 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    layout
                    className="glass-panel rounded-2xl p-5 hover:border-slate-600 transition-colors relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      item.impact_type === 'lesao' ? 'bg-red-500' :
                      item.impact_type === 'retorno' ? 'bg-emerald-500' :
                      item.impact_type === 'escalacao' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />

                    <div className="flex justify-between items-start mb-2 pl-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                        <span className={`px-2 py-1 rounded bg-slate-800 border ${
                           item.impact_type === 'lesao' ? 'text-red-400 border-red-500/20' :
                           item.impact_type === 'retorno' ? 'text-emerald-400 border-emerald-500/20' :
                           item.impact_type === 'escalacao' ? 'text-blue-400 border-blue-500/20' : 'text-amber-400 border-amber-500/20'
                        }`}>
                          {item.impact_type}
                        </span>
                        <span className="text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-800">
                          {item.team}
                        </span>
                      </div>
                      <time className="text-xs text-slate-500" dateTime={item.created_at}>
                        {format(new Date(item.created_at), "HH:mm • dd MMM", { locale: ptBR })}
                      </time>
                    </div>

                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                      <h3 className="text-lg font-bold text-slate-200 mt-3 mb-2 pl-3 leading-snug">
                        {item.title}
                      </h3>
                    </a>
                    
                    <p className="text-sm text-slate-400 pl-3 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <div className="pl-3 flex items-center justify-between border-t border-slate-800/60 pt-3 mt-2">
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-slate-300">Fonte: {item.source}</span>
                       </div>
                       
                       {item.key_player && item.key_player !== "N/A" && (
                         <div className="flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                           <CheckCircle2 className="w-3.5 h-3.5" />
                           Atleta-Chave: <strong>{item.key_player}</strong>
                         </div>
                       )}
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* TOAST SYSTEM COPIA */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto w-80 sm:w-96 glass-panel bg-slate-900 border border-slate-700/80 shadow-2xl rounded-xl overflow-hidden relative"
            >
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 6, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 ${
                  toast.impact_type === 'lesao' ? 'bg-red-500' :
                  toast.impact_type === 'retorno' ? 'bg-emerald-500' :
                  toast.impact_type === 'escalacao' ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              />
              <div className="p-4 flex gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                   toast.impact_type === 'lesao' ? 'bg-red-500/20 text-red-500' :
                   toast.impact_type === 'retorno' ? 'bg-emerald-500/20 text-emerald-500' :
                   toast.impact_type === 'escalacao' ? 'bg-blue-500/20 text-blue-500' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Urgente • {toast.team}
                    </span>
                    <button 
                      onClick={() => removeToast(toast.id)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-sm text-balance leading-tight text-white">
                    {toast.title}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
