/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Calendar,
  HelpCircle,
  GraduationCap,
  Quote,
  Compass,
  ExternalLink,
  Bookmark,
  Sparkles,
  Check,
  Clock,
  Users,
  FileText,
  Info,
  Globe,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Swords,
  Scale,
  Loader2,
  UserCircle,
  Volume2,
  Settings
} from 'lucide-react';
import { HistoryCard, EvidenceLevel, CharacterBio } from '../types';
import GeographicMapView from './GeographicMapView';
import { getGeoMapDataForTopic } from '../data/geographicCoordinates';
import { generateCharacterBio } from '../lib/geminiClient';
import { saveCharacterBioToSupabase, loadCharacterBioFromSupabase } from '../lib/supabaseSync';
import { speak, stopSpeaking, isSpeaking, getAvailableVoices, getStoredVoiceName, setStoredVoiceName } from '../lib/tts';

interface ConceptCardProps {
  card: HistoryCard;
  onMasterCard: (id: string, xpEarned: number) => void;
  isMastered: boolean;
  key?: string;
}

type CardTab = 'resumo' | 'fatos' | 'interpretacoes' | 'linha' | 'personagens' | 'fontes' | 'mapa';

type NarrationSection =
  | 'resumo'
  | 'fatos'
  | 'interpretacoes'
  | 'hipoteses'
  | 'linha'
  | 'personagens'
  | 'fontes';

const DEFAULT_NARRATION_SECTIONS: NarrationSection[] = [
  'resumo',
  'fatos',
  'interpretacoes',
  'hipoteses',
  'linha',
  'personagens',
  'fontes',
];

export default function ConceptCard({ card, onMasterCard, isMastered }: ConceptCardProps) {
  const [activeTab, setActiveTab] = useState<CardTab>('resumo');
  const [isSaved, setIsSaved] = useState(false);
  const [showHowWeKnowModal, setShowHowWeKnowModal] = useState(false);
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [depthMode, setDepthMode] = useState<'resumido' | 'aprofundado'>('resumido');
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  // Character bio modal state
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [characterBio, setCharacterBio] = useState<CharacterBio | null>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(false);
  const [characterError, setCharacterError] = useState('');
  const [currentCharacterName, setCurrentCharacterName] = useState('');
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(getStoredVoiceName());
  const [narrationSections, setNarrationSections] = useState<NarrationSection[]>(DEFAULT_NARRATION_SECTIONS);
  const [showNarrationModal, setShowNarrationModal] = useState(false);

  useEffect(() => {
    getAvailableVoices().then((voices) => {
      setAvailableVoices(voices);
    });
  }, []);

  const handleNarrate = async (text: string) => {
    if (isSpeakingText || isSpeaking()) {
      stopSpeaking();
      setIsSpeakingText(false);
      return;
    }
    setIsSpeakingText(true);
    try {
      await speak(text);
    } catch (err) {
      console.error('Erro ao narrar:', err);
    } finally {
      setIsSpeakingText(false);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoiceName(voiceName || null);
    setStoredVoiceName(voiceName || null);
  };

  function buildNarrationText(): string {
    const parts: string[] = [];

    // Título sempre no início e apenas uma vez
    parts.push(card.title);
    parts.push(`Era: ${card.era}.`);

    if (narrationSections.includes('resumo')) {
      parts.push(card.summary);
    }

    if (narrationSections.includes('fatos') && card.fact) {
      const f = card.fact;
      parts.push(`Fatos: ${f.title}. ${f.description}`);
      if (f.causaImediata) parts.push(`Causa imediata: ${f.causaImediata}`);
      if (f.desenvolvimento) parts.push(`Desenvolvimento: ${f.desenvolvimento}`);
      if (f.consequencias) parts.push(`Consequências: ${f.consequencias}`);
      if (f.pilares_fatos?.length) {
        parts.push('Pilares dos fatos:');
        f.pilares_fatos.forEach((p) => {
          parts.push(`${p.title}. ${p.description}`);
        });
      }
    }

    if (narrationSections.includes('interpretacoes') && card.interpretation) {
      const i = card.interpretation;
      parts.push(`Interpretações: ${i.title}. ${i.description}`);
      if (i.debates_historiograficos?.length) {
        parts.push('Debates historiográficos:');
        i.debates_historiograficos.forEach((d) => {
          parts.push(`${d.corrente}: ${d.argumento}`);
        });
      }
      if (i.mitos_vs_fatos?.length) {
        parts.push('Mitos versus fatos:');
        i.mitos_vs_fatos.forEach((m) => {
          parts.push(`Mito: ${m.mito}. Fato: ${m.fato}`);
        });
      }
    }

    if (narrationSections.includes('hipoteses') && card.hypothesis) {
      parts.push(`Hipóteses: ${card.hypothesis.title}. ${card.hypothesis.description}`);
    }

    if (narrationSections.includes('linha') && card.timeline?.length) {
      parts.push('Linha do tempo:');
      card.timeline.forEach((t) => {
        parts.push(`${t.year}: ${t.event}`);
      });
    }

    if (narrationSections.includes('personagens') && card.characters?.length) {
      parts.push('Personagens:');
      card.characters.forEach((c) => {
        parts.push(`${c.name}. ${c.role}. ${c.bio || ''}`);
        if (c.citacao_historica) {
          parts.push(`Citação: ${c.citacao_historica}`);
        }
      });
    }

    if (narrationSections.includes('fontes') && card.sources?.length) {
      parts.push('Fontes:');
      card.sources.forEach((s) => {
        parts.push(`${s.title}, por ${s.author}, ${s.year}. ${s.details || ''}`);
      });
    }

    return parts.join(' ');
  };

  const toggleNarrationSection = (section: NarrationSection) => {
    setNarrationSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  function buildCharacterBioNarration(bio: CharacterBio): string {
    const parts: string[] = [];
    parts.push(bio.nome);
    parts.push(bio.titulo_completo);
    parts.push(`${bio.nascimento} a ${bio.morte}.`);
    parts.push('Biografia detalhada.');
    parts.push(bio.biografia_detalhada);
    parts.push('Contexto histórico.');
    parts.push(bio.contexto_historico);

    if (bio.principais_feitos?.length) {
      parts.push('Principais feitos.');
      bio.principais_feitos.forEach((feito, i) => {
        parts.push(`${i + 1}. ${feito}`);
      });
    }

    parts.push('Legado.');
    parts.push(bio.legado);

    if (bio.curiosidades?.length) {
      parts.push('Curiosidades.');
      bio.curiosidades.forEach((cur, i) => {
        parts.push(`${i + 1}. ${cur}`);
      });
    }

    if (bio.citacao_famosa && !bio.citacao_famosa.toLowerCase().includes('não há')) {
      parts.push('Citação famosa.');
      parts.push(`"${bio.citacao_famosa}"`);
    }

    if (bio.fontes_sugeridas?.length) {
      parts.push('Fontes sugeridas.');
      bio.fontes_sugeridas.forEach((fonte, i) => {
        parts.push(`${i + 1}. ${fonte}`);
      });
    }

    return parts.join(' ');
  }

  const handleSaibaMais = async (charName: string, charRole: string) => {
    setShowCharacterModal(true);
    setLoadingCharacter(true);
    setCharacterError('');
    setCharacterBio(null);
    setCurrentCharacterName(charName);

    const cacheKey = `chronos_char_bio_${card.id}_${charName.toLowerCase().replace(/\s+/g, '_')}`;

    // 1. Check localStorage cache first (fastest)
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as CharacterBio;
        setCharacterBio(parsed);
        setLoadingCharacter(false);
        return;
      }
    } catch {}

    // 2. Check Supabase
    const supabaseBio = await loadCharacterBioFromSupabase(card.id, charName);
    if (supabaseBio) {
      setCharacterBio(supabaseBio);
      setLoadingCharacter(false);
      // Also save to localStorage for instant access next time
      try {
        localStorage.setItem(cacheKey, JSON.stringify(supabaseBio));
      } catch {}
      return;
    }

    // 3. Generate via IA and save to both Supabase and localStorage
    try {
      const bio = await generateCharacterBio(charName, charRole, card.title, card.era);
      setCharacterBio(bio);
      // Save to localStorage cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify(bio));
      } catch {}
      // Save to Supabase
      saveCharacterBioToSupabase(card.id, charName, bio);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('API_KEY_NOT_CONFIGURED')) {
        setCharacterError('Chave de API não configurada. Defina a chave do Gemini nas configurações.');
      } else {
        setCharacterError('Não foi possível gerar a biografia. Tente novamente.');
      }
    } finally {
      setLoadingCharacter(false);
    }
  };

  const hasEnrichment = !!(card.modo_aprofundado || card.metricas_rapidas || card.relevancia_atual || card.fact.pilares_fatos?.length || card.interpretation.debates_historiograficos?.length || card.interpretation.mitos_vs_fatos?.length || card.characters.some(c => c.citacao_historica) || card.sources.some(s => s.trecho_fonte_primaria));

  const toggleEvent = (idx: number) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getEvidenceDetails = (level: EvidenceLevel) => {
    switch (level) {
      case 'high':
        return {
          label: 'Alto consenso histórico',
          description: 'Sustentado por ampla documentação consensual e evidências empíricas.',
          badge: 'bg-emerald-50 text-emerald-900 border-emerald-200/60',
          dot: 'bg-emerald-500'
        };
      case 'good':
        return {
          label: 'Bom nível de evidência',
          description: 'Informação amplamente aceita, embora com nuances ou pequenas divergências acadêmicas.',
          badge: 'bg-yellow-50 text-yellow-900 border-yellow-200/60',
          dot: 'bg-yellow-500'
        };
      case 'debate':
        return {
          label: 'Tema em debate',
          description: 'Interpretações concorrentes válidas baseadas em diferentes leituras das fontes.',
          badge: 'bg-amber-50 text-amber-900 border-amber-200/60',
          dot: 'bg-amber-500'
        };
      case 'hypothesis':
        return {
          label: 'Hipótese histórica',
          description: 'Teoria plausível pendente de confirmação material ou documental conclusiva.',
          badge: 'bg-rose-50 text-rose-900 border-rose-200/60',
          dot: 'bg-rose-500'
        };
      case 'mythological':
        return {
          label: 'Registro mitológico',
          description: 'Narrativa mítica ou tradicional transmitida pela literatura ou folclore.',
          badge: 'bg-purple-50 text-purple-900 border-purple-200/60',
          dot: 'bg-purple-500'
        };
      default:
        return {
          label: 'Evidência documentada',
          description: 'Registro histórico catalogado.',
          badge: 'bg-slate-50 text-slate-900 border-slate-200/60',
          dot: 'bg-slate-500'
        };
    }
  };

  const evidence = getEvidenceDetails(card.evidenceLevel);

  return (
    <div
      id={`concept-card-${card.id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 bg-linear-to-b from-white to-slate-50/20"
    >
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Reliability Badge */}
            <button
              onClick={() => setShowLegendModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold border transition-all cursor-pointer hover:shadow-xs hover:scale-[1.02] ${evidence.badge}`}
              title="Clique para abrir a legenda explicativa dos níveis de evidência histórica"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${evidence.dot}`} />
              <span>{evidence.label}</span>
              <Info className="w-3 h-3 ml-0.5 opacity-60" />
            </button>

            <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {card.era}
            </span>
          </div>

          <button
            id={`save-btn-${card.id}`}
            onClick={() => setIsSaved(!isSaved)}
            className={`p-1.5 rounded-lg border transition-all ${
              isSaved
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remover dos favoritos' : 'Salvar nas referências de estudo'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => handleNarrate(buildNarrationText())}
              className={`p-1.5 transition-all ${
                isSpeakingText
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Narrar seções selecionadas"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeakingText ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setShowNarrationModal(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-l border-slate-100"
              title="Escolher o que narrar"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="text-xl font-serif font-bold text-slate-900 leading-snug">
          {card.title}
        </h3>

        {/* Depth Mode Toggle */}
        {hasEnrichment && (
          <div className="flex items-center gap-1 mt-3 bg-slate-100 rounded-lg p-0.5 w-fit">
            <button
              onClick={() => setDepthMode('resumido')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                depthMode === 'resumido'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className="w-3 h-3" />
              Resumido
            </button>
            <button
              onClick={() => setDepthMode('aprofundado')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                depthMode === 'aprofundado'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Aprofundado
            </button>
          </div>
        )}
      </div>

      {/* Internal Tabs Navigator - 6 premium tabs */}
      <div className="flex border-b border-slate-100 font-mono text-[10px] tracking-wider uppercase font-semibold text-slate-500 overflow-x-auto bg-slate-50/40 divide-x divide-slate-100 scrollbar-none">
        <button
          onClick={() => setActiveTab('resumo')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all ${
            activeTab === 'resumo' ? 'border-amber-500 text-amber-900 bg-white font-bold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Resumo
        </button>
        <button
          onClick={() => setActiveTab('fatos')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all ${
            activeTab === 'fatos' ? 'border-amber-500 text-amber-900 bg-white font-bold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Fatos
        </button>
        <button
          onClick={() => setActiveTab('interpretacoes')}
          className={`flex-1 min-w-[100px] py-3 text-center border-b-2 transition-all ${
            activeTab === 'interpretacoes' ? 'border-amber-500 text-amber-900 bg-white font-bold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Interpretações
        </button>
        <button
          onClick={() => setActiveTab('linha')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all ${
            activeTab === 'linha' ? 'border-amber-500 text-amber-900 bg-white font-bold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Linha do Tempo
        </button>
        <button
          onClick={() => setActiveTab('personagens')}
          className={`flex-1 min-w-[90px] py-3 text-center border-b-2 transition-all ${
            activeTab === 'personagens' ? 'border-amber-500 text-amber-900 bg-white font-bold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Personagens
        </button>
        <button
          onClick={() => setActiveTab('fontes')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all ${
            activeTab === 'fontes' ? 'border-amber-500 text-amber-900 bg-white font-bold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Fontes
        </button>
        <button
          onClick={() => setActiveTab('mapa')}
          className={`flex-1 min-w-[80px] py-3 text-center border-b-2 transition-all ${
            activeTab === 'mapa' ? 'border-amber-500 text-amber-900 bg-white font-bold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <Globe className="w-3 h-3" />
            Mapa Real
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 flex-1 min-h-[180px] bg-white flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="text-sm text-slate-700 leading-relaxed"
          >
            {activeTab === 'resumo' && (
              <div className="space-y-3">
                <p className="font-serif text-slate-800 text-base leading-relaxed">
                  {card.summary}
                </p>

                {/* Mini-Dashboard de Métricas (Modo Aprofundado) */}
                {depthMode === 'aprofundado' && card.metricas_rapidas && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {card.metricas_rapidas.duracao && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-center">
                        <Clock className="w-3.5 h-3.5 text-amber-600 mx-auto mb-1" />
                        <div className="text-[9px] font-mono text-amber-700 uppercase tracking-wider font-bold">Duração</div>
                        <div className="text-xs font-serif font-bold text-slate-900 mt-0.5">{card.metricas_rapidas.duracao}</div>
                      </div>
                    )}
                    {card.metricas_rapidas.fases && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                        <Layers className="w-3.5 h-3.5 text-slate-600 mx-auto mb-1" />
                        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider font-bold">Fases</div>
                        <div className="text-xs font-serif font-bold text-slate-900 mt-0.5">{card.metricas_rapidas.fases}</div>
                      </div>
                    )}
                    {card.metricas_rapidas.impacto_territorial && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-center">
                        <Globe className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                        <div className="text-[9px] font-mono text-emerald-700 uppercase tracking-wider font-bold">Impacto</div>
                        <div className="text-xs font-serif font-bold text-slate-900 mt-0.5">{card.metricas_rapidas.impacto_territorial}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Seção "Por que isso importa hoje?" (Modo Aprofundado) */}
                {depthMode === 'aprofundado' && card.relevancia_atual && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Por que isso importa hoje?</span>
                    </div>
                    <p className="font-serif text-slate-800 text-xs sm:text-sm leading-relaxed">
                      {card.relevancia_atual}
                    </p>
                  </div>
                )}

                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100/60">
                  <span className="font-semibold text-slate-700">Abordagem:</span> Esta investigação foca no cruzamento de dados arqueológicos e fontes textuais contemporâneas.
                </div>
              </div>
            )}

            {activeTab === 'fatos' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>Consenso Histórico e Arqueológico</span>
                </div>
                {card.fact.causaImediata || card.fact.desenvolvimento || card.fact.consequencias ? (
                  <div className="space-y-3 mt-2">
                    {card.fact.causaImediata && (
                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-amber-900 uppercase tracking-wider">
                          <span className="text-sm">💥</span>
                          <span>Causa Imediata (O Estopim)</span>
                        </div>
                        <p className="font-serif text-slate-800 text-xs sm:text-sm leading-relaxed">
                          {card.fact.causaImediata}
                        </p>
                      </div>
                    )}
                    {card.fact.desenvolvimento && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider">
                          <span className="text-sm">⚔️</span>
                          <span>Desenvolvimento e Fases do Conflito</span>
                        </div>
                        <p className="font-serif text-slate-800 text-xs sm:text-sm leading-relaxed">
                          {card.fact.desenvolvimento}
                        </p>
                      </div>
                    )}
                    {card.fact.consequencias && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-emerald-900 uppercase tracking-wider">
                          <span className="text-sm">🌍</span>
                          <span>Consequências e Novo Mapa Geopolítico</span>
                        </div>
                        <p className="font-serif text-slate-800 text-xs sm:text-sm leading-relaxed">
                          {card.fact.consequencias}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-serif text-slate-800 text-sm leading-relaxed">
                    {card.fact.description}
                  </p>
                )}

                {/* Pilares de Fatos (Modo Aprofundado) */}
                {depthMode === 'aprofundado' && card.fact.pilares_fatos && card.fact.pilares_fatos.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      <Swords className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pilares Históricos</span>
                    </div>
                    {card.fact.pilares_fatos.map((pilar, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider">
                          {pilar.icone && <span className="text-sm">{pilar.icone}</span>}
                          <span>{pilar.titulo}</span>
                        </div>
                        <p className="font-serif text-slate-800 text-xs sm:text-sm leading-relaxed">
                          {pilar.descricao}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'interpretacoes' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  <Quote className="w-4 h-4 text-amber-600" />
                  <span>Leituras Historiográficas e Análise</span>
                </div>
                <p className="font-serif text-slate-800 text-sm leading-relaxed">
                  {card.interpretation.description}
                </p>
                {card.hypothesis.description && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Hipóteses Acadêmicas Atuais</span>
                    <p className="font-serif text-xs text-slate-600 italic leading-relaxed">{card.hypothesis.description}</p>
                  </div>
                )}

                {/* Debates Historiográficos (Modo Aprofundado) */}
                {depthMode === 'aprofundado' && card.interpretation.debates_historiograficos && card.interpretation.debates_historiograficos.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      <span>Debates Historiográficos</span>
                    </div>
                    {card.interpretation.debates_historiograficos.map((debate, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                        <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider block">{debate.corrente}</span>
                        <p className="font-serif text-slate-800 text-xs leading-relaxed">{debate.argumento}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mitos vs Fatos (Modo Aprofundado) */}
                {depthMode === 'aprofundado' && card.interpretation.mitos_vs_fatos && card.interpretation.mitos_vs_fatos.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Mitos vs. Fatos</span>
                    </div>
                    {card.interpretation.mitos_vs_fatos.map((mvf, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/60">
                          <span className="text-[9px] font-mono font-bold text-rose-700 uppercase tracking-wider block mb-1">❌ Mito</span>
                          <p className="font-serif text-xs text-slate-700 leading-relaxed">{mvf.mito}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
                          <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-wider block mb-1">✓ Fato</span>
                          <p className="font-serif text-xs text-slate-700 leading-relaxed">{mvf.fato}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'linha' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Linha do Tempo de Evidências</span>
                </div>

                {/* Agrupamento por Fase Histórica (Modo Aprofundado) */}
                {depthMode === 'aprofundado' && card.timeline.some(e => e.fase_historica) ? (
                  <div className="space-y-4">
                    {Array.from(new Set(card.timeline.map(e => e.fase_historica || 'Outros'))).map((fase, faseIdx) => (
                      <div key={faseIdx} className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/60 rounded-lg">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider">{fase}</span>
                        </div>
                        <div className="space-y-2 border-l-2 border-amber-200/40 pl-3.5 ml-2">
                          {card.timeline.filter(e => (e.fase_historica || 'Outros') === fase).map((evt, idx) => {
                            const realIdx = card.timeline.indexOf(evt);
                            const isExpanded = expandedEvents.has(realIdx);
                            return (
                              <div key={realIdx} className="relative text-xs">
                                <div className="absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                                <button
                                  onClick={() => evt.detalhe_tatico && toggleEvent(realIdx)}
                                  className={`font-mono font-bold text-amber-700 ${evt.detalhe_tatico ? 'cursor-pointer hover:text-amber-900 flex items-center gap-1' : ''}`}
                                >
                                  {evt.year}
                                  {evt.detalhe_tatico && (
                                    isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                                <p className="font-serif text-slate-700 mt-0.5">{evt.event}</p>
                                {evt.detalhe_tatico && isExpanded && (
                                  <div className="mt-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Detalhe Tático</span>
                                    <p className="font-serif text-xs text-slate-600 leading-relaxed">{evt.detalhe_tatico}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 border-l border-slate-100 pl-3.5 ml-1.5 pt-1">
                    {card.timeline && card.timeline.length > 0 ? (
                      card.timeline.map((evt, idx) => {
                        const isExpanded = expandedEvents.has(idx);
                        return (
                          <div key={idx} className="relative text-xs">
                            <div className="absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                            <button
                              onClick={() => evt.detalhe_tatico && toggleEvent(idx)}
                              className={`font-mono font-bold text-amber-700 ${evt.detalhe_tatico ? 'cursor-pointer hover:text-amber-900 flex items-center gap-1' : ''}`}
                            >
                              {evt.year}
                              {evt.detalhe_tatico && (
                                isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                            <p className="font-serif text-slate-700 mt-0.5">{evt.event}</p>
                            {evt.detalhe_tatico && isExpanded && (
                              <div className="mt-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Detalhe Tático</span>
                                <p className="font-serif text-xs text-slate-600 leading-relaxed">{evt.detalhe_tatico}</p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">Cronograma de eventos em catalogação.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'personagens' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Agentes Históricos Clave</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {card.characters && card.characters.length > 0 ? (
                    card.characters.map((char, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-serif font-bold text-slate-900 text-xs block">{char.name}</span>
                            <span className="font-mono text-[9px] uppercase text-slate-400 font-semibold tracking-wide">{char.role}</span>
                          </div>
                          <button
                            onClick={() => handleSaibaMais(char.name, char.role)}
                            disabled={loadingCharacter && currentCharacterName === char.name}
                            className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 px-2 py-1 rounded-lg text-[9px] font-mono font-bold cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                            title="Saiba mais sobre este personagem via IA"
                          >
                            {loadingCharacter && currentCharacterName === char.name ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserCircle className="w-3 h-3" />
                            )}
                            Saiba Mais
                          </button>
                        </div>
                        <p className="font-serif text-xs text-slate-600 mt-1 leading-normal">{char.bio}</p>
                        {depthMode === 'aprofundado' && char.citacao_historica && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-start gap-1.5">
                            <Quote className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <p className="font-serif text-[11px] text-amber-800 italic leading-relaxed">"{char.citacao_historica}"</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Personagens proeminentes em catalogação documental.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'fontes' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Principais Fontes Catalogadas</span>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {card.sources.map((src) => (
                    <div key={src.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1 py-0.2 rounded shrink-0">
                            {src.type === 'book' ? 'Livro' : src.type === 'document' ? 'Manuscrito' : src.type === 'archaeological' ? 'Arqueologia' : 'Artigo'}
                          </span>
                          <span className="truncate">{src.title}</span>
                        </div>
                        <div className="text-slate-500 font-medium text-[10px] mt-0.5">
                          {src.author} ({src.year}) {src.details && `• ${src.details}`}
                        </div>
                        {depthMode === 'aprofundado' && src.trecho_fonte_primaria && (
                          <div className="mt-1.5 p-2 rounded-lg bg-amber-50/60 border border-amber-100 flex items-start gap-1.5">
                            <Quote className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <p className="font-serif text-[11px] text-amber-900 italic leading-relaxed">{src.trecho_fonte_primaria}</p>
                          </div>
                        )}
                      </div>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noreferrer"
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                          title="Consultar arquivo"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mapa' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>Mapa Geográfico Interativo</span>
                </div>
                <GeographicMapView
                  data={getGeoMapDataForTopic(card.id, card.title)}
                  height="300px"
                />
                <p className="text-[11px] font-serif text-slate-500 italic leading-relaxed">
                  {getGeoMapDataForTopic(card.id, card.title).description}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          {/* Main differentiator button "Como sabemos disso?" */}
          <button
            id={`how-we-know-btn-${card.id}`}
            onClick={() => setShowHowWeKnowModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-3 py-1.5 rounded-lg transition-all"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Como sabemos disso?</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>+30 XP</span>
            </div>

            <button
              id={`master-btn-${card.id}`}
              onClick={() => onMasterCard(card.id, 30)}
              disabled={isMastered}
              className={`text-xs font-medium py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                isMastered
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold cursor-default'
                  : 'bg-slate-900 text-white hover:bg-amber-600 hover:text-white hover:shadow-xs'
              }`}
            >
              {isMastered ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Estudado</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Concluir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* "Como sabemos disso?" Archival Modal Overlay */}
      <AnimatePresence>
        {showHowWeKnowModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 text-white rounded-lg">
                    <Compass className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-lg leading-tight">Como sabemos disso?</h4>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Transparência de evidência científica</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHowWeKnowModal(false)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed font-serif">
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed font-sans font-medium">
                    As informações neste tópico foram compostas rigorosamente a partir da leitura e síntese de registros primários e secundários reconhecidos pela comunidade científica, sem cópia literal.
                  </div>
                </div>

                <div className="space-y-3 font-sans">
                  <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Base de Evidências Usada</h5>
                  <p className="text-xs text-slate-500 font-serif mb-4">
                    Estes são os documentos originais, livros recomendados de acadêmicos e achados arqueológicos em que nos baseamos para sintetizar este tema:
                  </p>

                  <div className="space-y-3">
                    {card.sources.map((src) => (
                      <div key={src.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs text-amber-600 shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {src.type === 'book' ? 'Livro' : src.type === 'document' ? 'Manuscrito' : src.type === 'archaeological' ? 'Arqueologia' : 'Artigo'}
                            </span>
                            <span className="font-sans font-bold text-slate-900 text-xs truncate">{src.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-sans mt-1">
                            Autor: <strong className="text-slate-700 font-semibold">{src.author}</strong> ({src.year})
                          </p>
                          {src.details && (
                            <p className="text-[10px] text-amber-800 font-sans font-medium mt-1 bg-amber-50/60 inline-block px-2 py-0.5 rounded">
                              Especificação: {src.details}
                            </p>
                          )}
                        </div>
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 font-sans text-xs text-slate-400 text-center">
                  Consulte os links externos para acessar artigos originais ou traduções de manuscritos na íntegra.
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowHowWeKnowModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-5 rounded-xl transition-all"
                >
                  Entendi, fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* "Legenda de Níveis de Evidência Histórica" Modal Overlay */}
      <AnimatePresence>
        {showLegendModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-lg">
                    <GraduationCap className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-lg leading-tight">Legenda de Níveis de Evidência</h4>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Metodologia Historiográfica e Científica</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLegendModal(false)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Alto Consenso Histórico = Fato Histórico Estabelecido</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px] font-serif">
                    Equivale a <strong>fatos indiscutíveis</strong> na historiografia (ex: existência de Júlio César, o Império Romano, a Segunda Guerra Mundial). É sustentado por abundante convergência de documentos da época, fontes epigráficas, numismática e artefatos arqueológicos, sem divergência na comunidade científica acadêmica.
                  </p>
                </div>

                <div className="p-3.5 bg-yellow-50/80 border border-yellow-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-yellow-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Bom Nível de Evidência</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px] font-serif">
                    Informação amplamente aceita pela literatura especializada, respaldada por fontes sólidas, embora existam debates secundários sobre datas exatas, números de contingentes ou nuances de causalidade.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Tema em Debate</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px] font-serif">
                    Questões com dados empíricos reais, mas onde existem duas ou mais correntes historiográficas acadêmicas concorrentes com interpretações distintas.
                  </p>
                </div>

                <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Hipótese Histórica</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px] font-serif">
                    Teoria plausível formulada por especialistas com base em indícios indiretos, pendente de confirmação documental ou arqueológica definitiva.
                  </p>
                </div>

                <div className="p-3.5 bg-purple-50/80 border border-purple-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Registro Mitológico / Estudo Temático</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px] font-serif">
                    Narrativas culturais, mitos e tradições orais ou literárias preservadas. Não representam fatos empíricos literais, mas são estudadas pelo valor simbólico e antropológico.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowLegendModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Character Bio Modal (Saiba Mais) */}
      <AnimatePresence>
        {showCharacterModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-lg">
                    <UserCircle className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-lg leading-tight">
                      {currentCharacterName}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                      Biografia Gerada via IA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {characterBio && !loadingCharacter && (
                    <button
                      onClick={() => handleNarrate(buildCharacterBioNarration(characterBio))}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSpeakingText
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Narrar biografia completa"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeakingText ? 'fill-current' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowCharacterModal(false)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                {loadingCharacter && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <p className="text-xs font-mono text-slate-400">Sintetizando biografia historiográfica...</p>
                  </div>
                )}

                {characterError && !loadingCharacter && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <p className="text-xs font-mono text-rose-500 text-center">{characterError}</p>
                    <button
                      onClick={() => setShowCharacterModal(false)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                )}

                {characterBio && !loadingCharacter && (
                  <>
                    {/* Title and dates */}
                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-slate-900 text-base">{characterBio.titulo_completo}</h3>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{characterBio.nascimento} — {characterBio.morte}</span>
                      </div>
                    </div>

                    {/* Detailed biography */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">Biografia Detalhada</h4>
                        <button
                          onClick={() => handleNarrate(`Biografia detalhada de ${characterBio.nome}. ${characterBio.biografia_detalhada}`)}
                          className="text-slate-400 hover:text-amber-600 transition-colors"
                          title="Narrar biografia detalhada"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-serif text-xs text-slate-700 leading-relaxed">{characterBio.biografia_detalhada}</p>
                    </div>

                    {/* Context */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">Contexto Histórico</h4>
                        <button
                          onClick={() => handleNarrate(`Contexto histórico de ${characterBio.nome}. ${characterBio.contexto_historico}`)}
                          className="text-slate-400 hover:text-amber-600 transition-colors"
                          title="Narrar contexto histórico"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-serif text-xs text-slate-700 leading-relaxed">{characterBio.contexto_historico}</p>
                    </div>

                    {/* Main achievements */}
                    {characterBio.principais_feitos && characterBio.principais_feitos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">Principais Feitos</h4>
                          <button
                            onClick={() =>
                              handleNarrate(
                                `Principais feitos de ${characterBio.nome}. ${characterBio.principais_feitos?.join('. ') || ''}`
                              )
                            }
                            className="text-slate-400 hover:text-amber-600 transition-colors"
                            title="Narrar principais feitos"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <ul className="space-y-1.5">
                          {characterBio.principais_feitos.map((feito, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs font-serif text-slate-700 leading-relaxed">
                              <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feito}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Legacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">Legado</h4>
                        <button
                          onClick={() => handleNarrate(`Legado de ${characterBio.nome}. ${characterBio.legado}`)}
                          className="text-slate-400 hover:text-amber-600 transition-colors"
                          title="Narrar legado"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-serif text-xs text-slate-700 leading-relaxed">{characterBio.legado}</p>
                    </div>

                    {/* Curiosities */}
                    {characterBio.curiosidades && characterBio.curiosidades.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">Curiosidades</h4>
                          <button
                            onClick={() =>
                              handleNarrate(
                                `Curiosidades sobre ${characterBio.nome}. ${characterBio.curiosidades?.join('. ') || ''}`
                              )
                            }
                            className="text-slate-400 hover:text-amber-600 transition-colors"
                            title="Narrar curiosidades"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {characterBio.curiosidades.map((cur, i) => (
                            <div key={i} className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg">
                              <p className="font-serif text-[11px] text-amber-900 italic leading-relaxed">{cur}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Famous quote */}
                    {characterBio.citacao_famosa && !characterBio.citacao_famosa.includes('Não há') && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
                        <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="font-serif text-xs text-slate-800 italic leading-relaxed flex-1">"{characterBio.citacao_famosa}"</p>
                        <button
                          onClick={() => handleNarrate(`Citação famosa de ${characterBio.nome}. "${characterBio.citacao_famosa}"`)}
                          className="text-slate-400 hover:text-amber-600 transition-colors"
                          title="Narrar citação"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Suggested sources */}
                    {characterBio.fontes_sugeridas && characterBio.fontes_sugeridas.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">Fontes Sugeridas para Aprofundamento</h4>
                          <button
                            onClick={() =>
                              handleNarrate(
                                `Fontes sugeridas sobre ${characterBio.nome}. ${characterBio.fontes_sugeridas?.join('. ') || ''}`
                              )
                            }
                            className="text-slate-400 hover:text-amber-600 transition-colors"
                            title="Narrar fontes sugeridas"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {characterBio.fontes_sugeridas.map((fonte, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] font-serif text-slate-600">
                              <BookOpen className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                              <span>{fonte}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowCharacterModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Narration Options Modal */}
      <AnimatePresence>
        {showNarrationModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-lg">
                    <Volume2 className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-lg leading-tight">Opções de Narração</h4>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Escolha o que ouvir</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNarrationModal(false)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Seções</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'resumo', label: 'Resumo' },
                      { key: 'fatos', label: 'Fatos' },
                      { key: 'interpretacoes', label: 'Interpretações' },
                      { key: 'hipoteses', label: 'Hipóteses' },
                      { key: 'linha', label: 'Linha do Tempo' },
                      { key: 'personagens', label: 'Personagens' },
                      { key: 'fontes', label: 'Fontes' },
                    ].map((section) => (
                      <label
                        key={section.key}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={narrationSections.includes(section.key as NarrationSection)}
                          onChange={() => toggleNarrationSection(section.key as NarrationSection)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs text-slate-700">{section.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {availableVoices.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Voz</label>
                    <select
                      value={selectedVoiceName || ''}
                      onChange={(e) => handleVoiceChange(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="">Voz padrão do navegador</option>
                      {availableVoices
                        .filter((v) => v.lang.toLowerCase().startsWith('pt') || v.lang.toLowerCase().includes('brazil'))
                        .map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name.replace('Google ', '').replace('Microsoft ', '').slice(0, 45)}
                          </option>
                        ))}
                      <option disabled>──────────</option>
                      {availableVoices
                        .filter((v) => !v.lang.toLowerCase().startsWith('pt') && !v.lang.toLowerCase().includes('brazil'))
                        .map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name.replace('Google ', '').replace('Microsoft ', '').slice(0, 35)} ({voice.lang})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
                <button
                  onClick={() => setNarrationSections(DEFAULT_NARRATION_SECTIONS)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Selecionar tudo
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNarrationModal(false)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setShowNarrationModal(false);
                      handleNarrate(buildNarrationText());
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
                  >
                    Ouvir agora
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
