import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, Loader2, User, Bot, AlertTriangle, BarChart3, TrendingUp, Users, FileText, Trash2, Search, ChevronDown, FileDown, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';
import { RiskAnalysisModal } from '../components/RiskAnalysisModal';
import { authFetch } from '../../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useExecutiveSummary } from '../../hooks/useExecutiveSummary';
import { useRiskAnalysis } from '../../hooks/useRiskAnalysis';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project { id: string; name: string; status: string; riskLevel?: string; }

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2);
}

function storageKey(projectId: string) {
  return `ai-chat-${projectId || 'general'}`;
}

function loadHistory(projectId: string): Message[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(projectId: string, messages: Message[]) {
  try {
    const toSave = messages.filter((m) => !m.streaming).slice(-20);
    localStorage.setItem(storageKey(projectId), JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable
  }
}

// ─── Dynamic suggestions ──────────────────────────────────────────────────────

function getSuggestions(hasProject: boolean, hasActiveSprint: boolean) {
  if (!hasProject) {
    return [
      { icon: FileText,    color: '#AF52DE', text: '¿Qué es la gestión ágil de proyectos?' },
      { icon: BarChart3,   color: '#FF9F0A', text: '¿Cómo se calcula el SPI de un proyecto?' },
      { icon: TrendingUp,  color: '#34C759', text: '¿Qué es un sprint retrospective?' },
    ];
  }
  const base = [
    { icon: TrendingUp,   color: '#34C759', text: '¿Cuál es el riesgo actual del proyecto?' },
    { icon: Users,        color: '#007AFF', text: '¿Quién tiene más tickets asignados?' },
    { icon: FileText,     color: '#AF52DE', text: 'Dame un resumen ejecutivo del proyecto.' },
  ];
  if (hasActiveSprint) {
    base.unshift({ icon: BarChart3, color: '#FF9F0A', text: '¿Cómo va el progreso del sprint activo?' });
    base.unshift({ icon: AlertTriangle, color: '#FF3B30', text: '¿Cuáles son los tickets bloqueados actualmente?' });
  }
  return base.slice(0, 5);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIAssistant() {
  const { theme } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [hasActiveSprint, setHasActiveSprint] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  const summary = useExecutiveSummary(selectedId);
  const risk = useRiskAnalysis(selectedId);

  // Open risk modal automatically when analysis data arrives
  useEffect(() => {
    if (risk.data && !risk.isAnalyzing) setRiskModalOpen(true);
  }, [risk.data, risk.isAnalyzing]);

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#F6F2EA]',
    card: theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white',
    cardDark: theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-[#E5DFD3]',
    border: theme === 'dark' ? 'border-white/10' : 'border-[#4A453D]/10',
    textPrimary: theme === 'dark' ? 'text-white' : 'text-[#29251D]',
    textMuted: theme === 'dark' ? 'text-[#8E8E93]' : 'text-[#4A453D]',
    input: theme === 'dark' ? 'bg-[#0F0F0F] text-white placeholder-[#8E8E93]' : 'bg-[#E5DFD3] text-[#29251D] placeholder-[#4A453D]',
    userBubble: 'bg-[#FF3B30] text-white',
    aiBubble: theme === 'dark'
      ? 'bg-[#0F0F0F] border border-white/10 text-white'
      : 'bg-[#E5DFD3] border border-[#4A453D]/10 text-[#29251D]',
    dropdownBg: theme === 'dark' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#4A453D]/10',
    dropdownItem: theme === 'dark' ? 'hover:bg-white/5 text-white' : 'hover:bg-[#E5DFD3] text-[#29251D]',
  };

  // Load projects
  useEffect(() => {
    authFetch<{ projects: Project[] }>('/projects')
      .then((res) => {
        const active = res.projects.filter((p) => p.status !== 'ARCHIVED');
        setProjects(active);
        if (active.length > 0 && !initializedRef.current) {
          initializedRef.current = true;
          const firstId = active[0].id;
          setSelectedId(firstId);
          setMessages(loadHistory(firstId));
        }
      })
      .catch(() => {});
  }, []);

  // Persist history on change
  useEffect(() => {
    if (messages.some((m) => !m.streaming)) {
      saveHistory(selectedId, messages);
    }
  }, [messages, selectedId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedProject = projects.find((p) => p.id === selectedId);

  const suggestions = useMemo(
    () => getSuggestions(!!selectedProject, hasActiveSprint),
    [selectedProject, hasActiveSprint]
  );

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim().slice(0, 2000);
    if (!trimmed || streaming) return;

    const userMsg: Message = { id: makeId(), role: 'user', content: trimmed };
    const assistantId = makeId();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setStreaming(true);

    const history = messages
      .filter((m) => !m.streaming)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const abort = new AbortController();
      abortRef.current = abort;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, projectId: selectedId || null, history }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) throw new Error('Error de conexión');

      // Detect sprint info from first response to update suggestions
      let sprintDetected = false;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') break;

          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: `⚠️ ${parsed.error}`, streaming: false }
                    : m
                )
              );
              return;
            }
            if (parsed.token) {
              if (!sprintDetected && parsed.token.toLowerCase().includes('sprint')) {
                sprintDetected = true;
                setHasActiveSprint(true);
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.token }
                    : m
                )
              );
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + ' *(cancelado)*', streaming: false } : m
          )
        );
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: '⚠️ No se pudo conectar. El servicio de IA no está disponible.', streaming: false }
            : m
        )
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      );
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [messages, selectedId, streaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = useCallback(() => {
    if (streaming) abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
    localStorage.removeItem(storageKey(selectedId));
  }, [streaming, selectedId]);

  const handleProjectChange = (id: string) => {
    if (id === selectedId) return;
    if (streaming) abortRef.current?.abort();
    setStreaming(false);
    setSelectedId(id);
    setMessages(loadHistory(id));
    setHasActiveSprint(false);
    setRiskModalOpen(false);
    risk.clear();
  };

  const allOptions = [
    { id: '', name: 'Sin proyecto (general)' },
    ...projects.map((p) => ({ id: p.id, name: p.name })),
  ];
  const filteredOptions = allOptions.filter((o) =>
    o.name.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const selectedLabel = selectedId ? (selectedProject?.name ?? '') : 'Sin proyecto (general)';

  return (
    <div className={`min-h-screen ${colors.bg} flex flex-col`}>
      <Header title="AI Assistant" subtitle="Chat inteligente con contexto de tu proyecto" />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-6 gap-4">

        {/* Project selector + clear */}
        <div className={`${colors.card} border ${colors.border} rounded-xl p-3 flex items-center gap-3 flex-wrap`}>
          <Sparkles className="w-4 h-4 text-[#FF3B30] flex-shrink-0" />
          <span className={`text-xs ${colors.textMuted} flex-shrink-0`}>Contexto:</span>

          <div className="relative flex-1 min-w-[180px]">
            <div className={`flex items-center gap-2 ${colors.cardDark} border ${colors.border} rounded-lg px-3 py-1.5 focus-within:border-[#FF3B30] transition-colors`}>
              <Search className={`w-4 h-4 ${colors.textMuted} flex-shrink-0`} />
              <input
                type="text"
                value={projectDropdownOpen ? projectSearch : selectedLabel}
                onChange={(e) => setProjectSearch(e.target.value)}
                onFocus={() => { setProjectSearch(''); setProjectDropdownOpen(true); }}
                onBlur={() => setTimeout(() => setProjectDropdownOpen(false), 150)}
                placeholder="Buscar proyecto..."
                className={`flex-1 bg-transparent text-sm ${colors.textPrimary} placeholder-${colors.textMuted} focus:outline-none min-w-0`}
              />
              <ChevronDown className={`w-4 h-4 ${colors.textMuted} flex-shrink-0 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {projectDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 ${colors.dropdownBg} border rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto`}>
                {filteredOptions.length === 0 ? (
                  <div className={`px-3 py-3 text-sm ${colors.textMuted} text-center`}>Sin resultados</div>
                ) : filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onMouseDown={() => {
                      handleProjectChange(opt.id);
                      setProjectSearch('');
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${colors.dropdownItem} ${
                      opt.id === selectedId ? 'text-[#FF3B30] font-medium' : opt.id === '' ? colors.textMuted : ''
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── AI action buttons ─────────────────────────────────────── */}
          {selectedId && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              {/* Executive Summary */}
              <button
                disabled={summary.isGenerating}
                onClick={summary.generate}
                title="Descargar resumen ejecutivo en PDF"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  summary.isGenerating
                    ? `${colors.cardDark} ${colors.border} ${colors.textMuted}`
                    : `${colors.cardDark} ${colors.border} ${colors.textMuted} hover:border-[#FF3B30]/40 hover:text-[#FF3B30]`
                }`}
              >
                {summary.isGenerating ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />{summary.progressMessage || 'Generando PDF...'}</>
                ) : (
                  <><FileText className="w-3.5 h-3.5" />Resumen ejecutivo<FileDown className="w-3 h-3" /></>
                )}
              </button>

              {/* Risk Analysis */}
              <button
                disabled={risk.isAnalyzing}
                onClick={risk.data ? () => setRiskModalOpen(true) : risk.analyze}
                title="Analizar riesgos del proyecto"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  risk.isAnalyzing
                    ? `${colors.cardDark} ${colors.border} ${colors.textMuted}`
                    : `${colors.cardDark} ${colors.border} ${colors.textMuted} hover:border-[#FF9F0A]/40 hover:text-[#FF9F0A]`
                }`}
              >
                {risk.isAnalyzing ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analizando...</>
                ) : (
                  <><ShieldAlert className="w-3.5 h-3.5" />Análisis de riesgo</>
                )}
              </button>
            </div>
          )}

          {/* Error toasts */}
          {summary.error && (
            <div className="w-full mt-1 px-3 py-2 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-lg flex items-center justify-between gap-2">
              <p className="text-xs text-[#FF3B30]">{summary.error}</p>
              <button onClick={summary.clearError} className="text-[#FF3B30] hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {risk.error && (
            <div className="w-full mt-1 px-3 py-2 bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-lg flex items-center justify-between gap-2">
              <p className="text-xs text-[#FF9F0A]">{risk.error}</p>
              <button onClick={risk.clearError} className="text-[#FF9F0A] hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className={`${colors.textMuted} hover:text-[#FF3B30] transition-colors flex items-center gap-1.5 text-xs flex-shrink-0`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Chat area */}
        <div className={`flex-1 ${colors.card} border ${colors.border} rounded-xl overflow-hidden flex flex-col`} style={{ minHeight: '420px' }}>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full py-12 text-center"
              >
                <div className="w-16 h-16 bg-[#FF3B30]/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-[#FF3B30]" />
                </div>
                <h3 className={`${colors.textPrimary} font-semibold mb-1`}>
                  {selectedProject ? `Analizando ${selectedProject.name}` : 'Asistente de proyectos'}
                </h3>
                <p className={`text-sm ${colors.textMuted} max-w-sm`}>
                  {selectedProject
                    ? 'Tengo acceso a los datos reales de este proyecto. Pregúntame lo que necesites.'
                    : 'Selecciona un proyecto para obtener respuestas basadas en datos reales.'}
                </p>

                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  {suggestions.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => sendMessage(s.text)}
                      className={`flex items-center gap-2 px-3 py-2 ${colors.cardDark} border ${colors.border} rounded-lg text-xs ${colors.textMuted} hover:border-[#FF3B30]/40 hover:text-[#FF3B30] transition-all text-left`}
                    >
                      <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                      {s.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#FF3B30] to-[#FF9F0A]'
                      : 'bg-[#FF3B30]/10 border border-[#FF3B30]/20'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-[#FF3B30]" />}
                  </div>

                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? `${colors.userBubble} rounded-tr-sm`
                      : `${colors.aiBubble} rounded-tl-sm`
                  }`}>
                    {msg.role === 'assistant' && msg.content ? (
                      <div className="prose prose-sm max-w-none prose-invert">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-4 bg-[#FF3B30] rounded-sm ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className={`border-t ${colors.border} p-3`}>
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={streaming ? 'Respondiendo...' : 'Escribe tu pregunta... (Enter para enviar, Shift+Enter nueva línea)'}
                disabled={streaming}
                maxLength={2000}
                rows={1}
                className={`flex-1 ${colors.cardDark} border ${colors.border} rounded-xl px-4 py-2.5 text-sm ${colors.textPrimary} focus:outline-none focus:border-[#FF3B30] resize-none transition-colors disabled:opacity-50`}
                style={{ maxHeight: '120px', overflowY: 'auto' }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="w-10 h-10 bg-[#FF3B30] rounded-xl flex items-center justify-center hover:bg-[#E31837] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {streaming
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />}
              </button>
            </form>
            <p className={`text-[10px] ${colors.textMuted} mt-1.5 text-center`}>
              Powered by Groq · llama-3.1-8b-instant · Las respuestas se basan en datos reales del proyecto
            </p>
          </div>
        </div>
      </div>

      {/* Risk Analysis Modal */}
      {riskModalOpen && risk.data && (
        <RiskAnalysisModal
          projectName={selectedProject?.name ?? ''}
          data={risk.data}
          generatedAt={risk.generatedAt}
          isDownloadingPdf={risk.isDownloadingPdf}
          onDownloadPdf={risk.downloadPdf}
          onClose={() => setRiskModalOpen(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
