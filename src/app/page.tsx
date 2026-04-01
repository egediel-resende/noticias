"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

type Team = "Flamengo" | "Manchester City" | "Barcelona" | "Real Madrid" | "Inter de Milão" | "Bayern de Munique" | "Arsenal" | "Palmeiras" | "Liverpool";
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
  "Flamengo", "Palmeiras",
  "Manchester City", "Arsenal", "Liverpool",
  "Barcelona", "Real Madrid",
  "Inter de Milão",
  "Bayern de Munique"
];

const IMPACT_LABELS: Record<ImpactType, string> = {
  lesao: "LESÃO",
  escalacao: "ESCALAÇÃO",
  retorno: "RETORNO",
  poupados: "POUPADOS",
};

function WinTitleBar({ icon, title, onClose }: { icon?: string; title: string; onClose?: () => void }) {
  return (
    <div className="win-titlebar select-none" style={{ borderBottom: "1px solid #000040" }}>
      {icon && <img src={icon} alt="" width={14} height={14} style={{ imageRendering: "pixelated" }} />}
      <span className="flex-1 font-bold" style={{ fontFamily: "Arial", fontSize: 11 }}>{title}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="win-btn"
          style={{ padding: "0 4px", fontSize: 10, fontWeight: "bold", minWidth: 16, height: 16, lineHeight: "12px" }}
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function WinButton({
  children,
  onClick,
  active,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`win-btn ${active ? "win-btn-active" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

function ImpactTag({ type }: { type: ImpactType }) {
  const cls =
    type === "lesao" ? "win-tag-injury" :
    type === "retorno" ? "win-tag-return" :
    type === "escalacao" ? "win-tag-lineup" :
    "win-tag-rested";
  return <span className={cls}>{IMPACT_LABELS[type]}</span>;
}

function NewsCard({ item }: { item: NewsItem }) {
  const borderColor =
    item.impact_type === "lesao" ? "#cc0000" :
    item.impact_type === "retorno" ? "#006600" :
    item.impact_type === "escalacao" ? "#000080" : "#996600";

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      layout
      className="glass-panel"
      style={{ borderLeft: `3px solid ${borderColor}`, marginBottom: 6 }}
    >
      {/* Card top bar */}
      <div
        style={{
          background: "#ece9d8",
          borderBottom: "1px solid #aca899",
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ImpactTag type={item.impact_type} />
          <span style={{ fontSize: 10, color: "#444", background: "#d4d0c8", border: "1px solid #aca899", padding: "0 4px" }}>
            {item.team}
          </span>
        </div>
        <time style={{ fontSize: 10, color: "#666" }}>
          {format(new Date(item.created_at), "HH:mm • dd/MM/yyyy", { locale: ptBR })}
        </time>
      </div>

      {/* Card body */}
      <div style={{ padding: "6px 8px" }}>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="win-link"
          style={{ fontSize: 12, fontWeight: "bold", display: "block", marginBottom: 4 }}
        >
          {item.title}
        </a>
        <p style={{ fontSize: 11, color: "#333", lineHeight: 1.4, marginBottom: 6 }}>
          {item.description}
        </p>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #aca899",
            paddingTop: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 10, color: "#555" }}>
            📰 Fonte:{" "}
            <strong style={{ color: "#000080" }}>{item.source}</strong>
          </span>
          {item.key_player && item.key_player !== "N/A" && (
            <span
              style={{
                fontSize: 10,
                background: "#ffffe1",
                border: "1px solid #aca899",
                padding: "1px 5px",
                color: "#000",
              }}
            >
              ⚽ Atleta-Chave: <strong>{item.key_player}</strong>
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ToastNotification({ toast, onClose }: { toast: NewsItem; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      style={{
        width: 320,
        background: "#d4d0c8",
        borderTop: "2px solid #fff",
        borderLeft: "2px solid #fff",
        borderBottom: "2px solid #808080",
        borderRight: "2px solid #808080",
        boxShadow: "3px 3px 6px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      <WinTitleBar title="⚡ Nova Notícia - TacticalInsight" onClose={onClose} />
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>
          <ImpactTag type={toast.impact_type} />
          <span style={{ marginLeft: 4 }}>{toast.team}</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: "bold", color: "#000", lineHeight: 1.4 }}>
          {toast.title}
        </p>
      </div>
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 6, ease: "linear" }}
        style={{
          height: 3,
          background:
            toast.impact_type === "lesao" ? "#cc0000" :
            toast.impact_type === "retorno" ? "#006600" :
            toast.impact_type === "escalacao" ? "#000080" : "#996600",
        }}
      />
    </motion.div>
  );
}

export default function Home() {
  const [activeTeam, setActiveTeam] = useState<Team | "Todos">("Todos");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [toasts, setToasts] = useState<NewsItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Sound
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
      oscillator.frequency.exponentialRampToValueAtTime(880.0, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data && !error) setNews(data);
    };
    fetchNews();

    const channel = supabase.channel("realtime_news")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "news" }, (payload) => {
        const nova = payload.new as NewsItem;
        setNews((prev) => [nova, ...prev]);
        setToasts((prev) => [...prev, nova]);
        playAlertSound();
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== nova.id)), 6000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [soundEnabled]);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const filteredNews = activeTeam === "Todos" ? news : news.filter((n) => n.team === activeTeam);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#008080",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 11,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Taskbar ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#d4d0c8",
          borderTop: "2px solid #ffffff",
          height: 30,
          display: "flex",
          alignItems: "center",
          paddingLeft: 4,
          paddingRight: 8,
          gap: 4,
        }}
      >
        {/* Start button */}
        <button
          className="win-btn"
          style={{
            fontWeight: "bold",
            fontSize: 11,
            padding: "2px 8px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 14 }}>⊞</span> Iniciar
        </button>

        {/* Separator */}
        <div style={{ width: 2, height: 20, background: "#808080", borderRight: "1px solid #fff", margin: "0 2px" }} />

        {/* Taskbar app button */}
        <button className="win-btn win-btn-active" style={{ fontSize: 11, padding: "2px 10px" }}>
          📊 TacticalInsight
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* System tray */}
        <div
          className="win-sunken"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 8px",
            fontSize: 11,
          }}
        >
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? "Som ativado" : "Som desativado"}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0 }}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <span style={{ fontFamily: "Arial", fontSize: 11, color: "#000" }}>
            {format(currentTime, "HH:mm")}
          </span>
        </div>
      </div>

      {/* ── Main Window ── */}
      <div
        style={{
          margin: "12px 12px 42px 12px",
          background: "#d4d0c8",
          borderTop: "2px solid #ffffff",
          borderLeft: "2px solid #ffffff",
          borderBottom: "2px solid #808080",
          borderRight: "2px solid #808080",
          boxShadow: "3px 3px 8px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {/* Window Title Bar */}
        <div className="win-titlebar">
          <span style={{ fontSize: 14 }}>📊</span>
          <span>TacticalInsight - Radar Realtime I.A. - [Monitor de Notícias]</span>
          <div style={{ flex: 1 }} />
          {/* Window control buttons */}
          <button className="win-btn" style={{ padding: "0 5px", fontSize: 10, fontWeight: "bold", minWidth: 18, height: 18, lineHeight: "14px" }} title="Minimizar">_</button>
          <button className="win-btn" style={{ padding: "0 5px", fontSize: 10, fontWeight: "bold", minWidth: 18, height: 18, lineHeight: "14px" }} title="Maximizar">□</button>
          <button className="win-btn" style={{ padding: "0 5px", fontSize: 10, fontWeight: "bold", minWidth: 18, height: 18, lineHeight: "14px", color: "#cc0000" }} title="Fechar">✕</button>
        </div>

        {/* Menu Bar */}
        <div
          style={{
            background: "#d4d0c8",
            borderBottom: "1px solid #aca899",
            padding: "2px 4px",
            display: "flex",
            gap: 2,
            fontSize: 11,
          }}
        >
          {["Arquivo", "Editar", "Exibir", "Favoritos", "Ferramentas", "Ajuda"].map((m) => (
            <button
              key={m}
              style={{
                background: "none",
                border: "1px solid transparent",
                padding: "2px 6px",
                fontSize: 11,
                cursor: "pointer",
                color: "#000",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#0a246a";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
                (e.currentTarget as HTMLButtonElement).style.color = "#000";
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div
          style={{
            background: "#d4d0c8",
            borderBottom: "1px solid #aca899",
            padding: "3px 6px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* Toolbar buttons */}
          {[
            { icon: "⬅", label: "Voltar" },
            { icon: "➡", label: "Avançar" },
            { icon: "🔄", label: "Atualizar" },
            { icon: "🏠", label: "Início" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="win-btn"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 10, padding: "2px 6px", gap: 1, minWidth: 38 }}
              title={label}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
          <div style={{ width: 1, height: 32, background: "#808080", borderRight: "1px solid #fff" }} />
          {/* Address bar */}
          <span style={{ fontSize: 11, marginLeft: 4 }}>Endereço</span>
          <div className="win-sunken" style={{ flex: 1, display: "flex", alignItems: "center", padding: "1px 4px", background: "#fff" }}>
            <span style={{ fontSize: 11, color: "#000080" }}>
              🌐 http://tacticalinsight.app/monitor
            </span>
          </div>
          <WinButton>Ir</WinButton>
        </div>

        {/* Scrolling marquee */}
        <div style={{ background: "#000080", borderBottom: "1px solid #000040" }}>
          <marquee style={{ color: "#ffff00", fontSize: 11, padding: "2px 0" }} scrollamount={3}>
            🔴 ATENÇÃO: Monitoramento ativo em tempo real • ⚡ Notícias de futebol filtradas por I.A. •
            🔄 Atualizações automáticas via Supabase Realtime • ✅ Todos os clubes sendo monitorados 24/7 •
            &nbsp;&nbsp;&nbsp;
            🔴 ATENÇÃO: Monitoramento ativo em tempo real • ⚡ Notícias de futebol filtradas por I.A.
          </marquee>
        </div>

        {/* Main Content Area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── Sidebar ── */}
          <aside
            style={{
              width: 200,
              background: "#d4d0c8",
              borderRight: "2px solid #808080",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              flexShrink: 0,
            }}
          >
            {/* Sidebar Title */}
            <div
              style={{
                background: "#ece9d8",
                borderBottom: "1px solid #aca899",
                padding: "4px 6px",
                fontSize: 11,
                fontWeight: "bold",
                color: "#000080",
              }}
            >
              🏆 Filtros de Clube
            </div>

            {/* Team list */}
            <div style={{ padding: 4 }}>
              <button
                onClick={() => setActiveTeam("Todos")}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "3px 6px",
                  fontSize: 11,
                  cursor: "pointer",
                  border: activeTeam === "Todos" ? "1px dotted #000080" : "1px solid transparent",
                  background: activeTeam === "Todos" ? "#0a246a" : "transparent",
                  color: activeTeam === "Todos" ? "#fff" : "#000",
                  marginBottom: 2,
                }}
              >
                📋 Visão Geral (Todos)
              </button>

              <div style={{ height: 1, background: "#808080", borderBottom: "1px solid #fff", margin: "4px 0" }} />

              <div style={{ fontSize: 10, color: "#666", padding: "2px 4px", fontWeight: "bold" }}>CLUBES</div>
              {TEAMS.map((team) => (
                <button
                  key={team}
                  onClick={() => setActiveTeam(team)}
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "left",
                    padding: "3px 6px",
                    fontSize: 11,
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: activeTeam === team ? "1px dotted #000080" : "1px solid transparent",
                    background: activeTeam === team ? "#0a246a" : "transparent",
                    color: activeTeam === team ? "#fff" : "#000",
                    marginBottom: 1,
                  }}
                >
                  <span>⚽ {team}</span>
                  {activeTeam === team && <span style={{ fontSize: 8, color: "#a6caf0" }}>◀</span>}
                </button>
              ))}
            </div>

            {/* Info panel */}
            <div style={{ margin: 6 }}>
              <div
                className="win-sunken"
                style={{
                  padding: 6,
                  background: "#ece9d8",
                  fontSize: 10,
                  color: "#333",
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: "bold", color: "#000080", marginBottom: 2 }}>ℹ️ Status do Sistema</div>
                <div>
                  <span className="win-blink" style={{ color: "#006600" }}>●</span>
                  {" "}Supabase: Online
                </div>
                <div>📡 Realtime: Ativo</div>
                <div>🤖 I.A.: Monitorando</div>
              </div>
            </div>
          </aside>

          {/* ── News Feed ── */}
          <main style={{ flex: 1, overflow: "auto", padding: 8 }}>

            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                padding: "4px 0",
                borderBottom: "1px solid #aca899",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: "bold" }}>📊 Feed Monitorado</span>
                <span
                  style={{
                    background: "#ece9d8",
                    border: "1px solid #aca899",
                    padding: "1px 6px",
                    fontSize: 10,
                    color: "#555",
                  }}
                >
                  {filteredNews.length} {filteredNews.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    background: "#ece9d8",
                    border: "1px solid #aca899",
                    padding: "1px 6px",
                    fontSize: 10,
                    color: "#006600",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span className="win-blink">●</span> Supabase Realtime Conectado
                </span>
              </div>
            </div>

            {/* News list */}
            <AnimatePresence>
              {filteredNews.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="win-sunken"
                  style={{
                    padding: 24,
                    textAlign: "center",
                    background: "#ece9d8",
                    color: "#666",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  <p style={{ fontSize: 11 }}>
                    Nenhuma informação crítica filtrada pela I.A. ainda.
                  </p>
                  <p style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                    Aguardando atualizações em tempo real...
                  </p>
                </motion.div>
              ) : (
                filteredNews.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* ── Status Bar ── */}
        <div className="win-statusbar" style={{ borderTop: "2px solid #808080" }}>
          <div
            className="win-sunken"
            style={{ flex: 1, padding: "1px 4px", display: "flex", alignItems: "center", gap: 4 }}
          >
            <span className="win-blink" style={{ color: "#006600", fontSize: 10 }}>●</span>
            <span>Pronto</span>
          </div>
          <div className="win-sunken" style={{ padding: "1px 8px", minWidth: 120 }}>
            🔄 Monitorando: {TEAMS.length} clubes
          </div>
          <div className="win-sunken" style={{ padding: "1px 8px", minWidth: 80 }}>
            📰 {news.length} notícias
          </div>
          <div className="win-sunken" style={{ padding: "1px 8px" }}>
            🌐 Internet
          </div>
        </div>
      </div>

      {/* ── Toast Notifications ── */}
      <div
        style={{
          position: "fixed",
          bottom: 40,
          right: 8,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} style={{ pointerEvents: "all" }}>
              <ToastNotification toast={toast} onClose={() => removeToast(toast.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
