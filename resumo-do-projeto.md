# Resumo do Projeto: Agregador de Notícias Esportivas Premium

## Visão Geral
Este é um agregador focado em **filtrar e notificar** atualizações estritamente vitais (táticas, lesões, escalações e jogadores poupados) para uma lista fechada de 9 clubes de elite, lendo exclusivamente os 5 principais portais esportivos da Europa e Brasil. Toda a extração passa por inteligência artificial (Gemini) para evitar qualquer rumor, transferência ou opiniões vazias.

---

## 🏗 Arquitetura e Tech Stack

1. **Frontend (Next.js - App Router):** 
   - Desenvolvido em React puro usando **Tailwind CSS v4** com tema "Dark Mode" e estética "Glassmorphism" para visual premium.
   - Ícones com `lucide-react` e animações de pop-up e *toasts* geridas com `framer-motion`.
   - Inclui som de "bip" (alerter) gerado nativamente via **Web Audio API** no navegador.

2. **Backend e Hospedagem (Vercel):**
   - Roteamento e APIs através de `src/app/api/...` para hospedar o motor de scraping e CRON Jobs.

3. **Banco de Dados & Realtime (Supabase):**
   - Um projeto *PostgreSQL* hospedado no plano gratuito do **Supabase**.
   - Criada a tabela principal `news` (com RLS configurado) onde o backend armazenará as notícias filtradas.
   - **Realtime**: O frontend ouvirá ativamente o Supabase (WebSocket) para ejetar as notícias na cara do usuário instantaneamente sem necessidade de refresh.

4. **Classe de Filtragem GenAI (Gemini 1.5):**
   - Motor de linguagem servindo como editor de triagem sobre os *textos crus* extraídos via RSS ou scraping, para definir, por exemplo, se *"Mbappé é desfalque"* ou *"Mbappé quer sair"*.

---

## 📋 Escopo Fechado

### Times Monitorados (9)
- **TBR**: Flamengo, Palmeiras
- **ING**: Manchester City, Arsenal, Liverpool
- **ESP**: Barcelona, Real Madrid
- **ITA**: Inter de Milão
- **ALE**: Bayern de Munique

### Fontes Autorizadas (5)
*Nenhum outro domínio deverá ditar as notícias*
1. **ge.globo.com** (Brasil)
2. **marca.com** (Espanha)
3. **bbc.com/sport** (Inglaterra)
4. **gazzetta.it** (Itália)
5. **kicker.de** (Alemanha)

### Critérios de Retenção das Notícias
**O que Passa ✅**:
- Escalações prováveis ou definitivas.
- Retornos e altas médicas.
- Lesões confirmadas e investigações clínicas e desfalques.
- Suspensões, cartões, e decisões disciplinares diretas.
- Decisões de jogadores pontualmente **poupados**.
- **Regra do Jogador Chave:** O jogador mencionado *deve ter impacto real*! Titulares absolutos e de grande peso. (I.A. responsável).

**O que Não Passa ❌**:
- Rumores de qualquer natureza e bastidores.
- Mercado de transferências.
- Opiniões de jornalistas e notas subjetivas.
- Notícias genéricas, sorteios, resultados (a não ser que influencie nos lesados), etc.
- Atletas juvenis sem minuto em campo ou reservas de terceiro plano.

---

## 🛠 Status e Progresso Atual

*   **Fase 1 (Pronta) ✅**: UI criada visualmente. Um painel luxuoso contendo Mockups para demonstrar o visual, com botão que simula entrada de dados ativando som e Pop-ups (Toasts).
*   **Fase 2 (Pronta) ✅**: Banco de Dados Supabase criado via MCP, rotas de extração de RSS concluídas usando Gemini para I.A., e arquivo de Cron ativado (`vercel.json`).
