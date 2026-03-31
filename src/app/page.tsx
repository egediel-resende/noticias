import { supabase } from '@/lib/supabase';
import { Newspaper, Trophy, Activity, AlertCircle, Calendar } from 'lucide-react';

export const revalidate = 0; // Disable static rendering for this page

export default async function Home() {
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-emerald-400" />
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Agregador Esportivo
              </h1>
            </div>
            <p className="text-gray-400 text-lg">Inteligência Tática e Escalações em Tempo Real</p>
          </div>
          
          <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">Sistema Online</span>
            </div>
          </div>
        </header>

        <section>
          <div className="flex items-center gap-2 mb-8">
            <Newspaper className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-200">Últimas Atualizações</h2>
          </div>

          {error && (
            <div className="glass-panel p-6 rounded-2xl border-red-500/20 text-red-400 font-medium">
              Erro ao buscar notícias: {error.message}
            </div>
          )}

          {!news || news.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border-dashed border-white/20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">Monitorando o Mercado...</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Ainda não há novas atualizações táticas nas fontes monitoradas (GE, Marca, BBC, Gazzetta, Kicker).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <article key={item.id} className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.03] group cursor-pointer flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.team}
                    </span>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-sm text-gray-400 mb-6 flex-grow line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-medium text-gray-300">{item.impact_type}</span>
                    </div>
                    {item.key_player && (
                      <div className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-gray-300 border border-white/5">
                        {item.key_player}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
