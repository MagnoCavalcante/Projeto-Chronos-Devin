/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Screen = 'SPLASH' | 'WELCOME' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'TIME_TRAVEL' | 'HOME' | 'PROFILE' | 'SETTINGS' | 'ADMIN';

export type Tab = 'home' | 'search' | 'mitologia' | 'saved' | 'profile' | 'settings' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  joinedDate: string;
  role?: 'admin' | 'user' | 'historiador';
  status?: 'ativo' | 'suspenso' | 'pendente';
  password?: string;
  isGuest?: boolean;
  guestExpiresAt?: number;
}

export interface PasswordResetRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  status: 'pendente' | 'atendido' | 'rejeitado';
}

export type EvidenceLevel = 'high' | 'good' | 'debate' | 'hypothesis' | 'mythological';

export interface Source {
  id: string;
  title: string;
  author: string;
  year: number;
  type: 'book' | 'article' | 'document' | 'archaeological' | 'myth';
  url?: string;
  details?: string; // e.g., "Páginas 45-60, Cap. III"
}

// CHRONOS KNOWLEDGE GRAPH ONTOLOGY
export type EntityType =
  | 'PERSONAGEM'
  | 'EVENTO'
  | 'CIVILIZACAO'
  | 'IMPERIO'
  | 'GUERRA'
  | 'TRATADO'
  | 'PAIS'
  | 'CIDADE'
  | 'RELIGIAO'
  | 'FILOSOFIA'
  | 'MOVIMENTO'
  | 'TECNOLOGIA'
  | 'OBJETO_HISTORICO'
  | 'CONSTRUCAO'
  | 'LIVRO'
  | 'DOCUMENTO'
  | 'FONTE'
  | 'AUTOR'
  | 'DESCOBERTA'
  | 'DATA'
  | 'PERIODO_HISTORICO'
  | 'MITOLOGIA'
  | 'DEUS'
  | 'CRIATURA_MITOLOGICA'
  | 'ARTEFATO_MITOLOGICO';

export type RelationshipType =
  | 'PARTICIPATED_IN'       // Personagem participou de Evento
  | 'OCCURRED_IN'           // Evento ocorreu em Cidade / Local
  | 'BELONGS_TO'            // Cidade pertence a País
  | 'PART_OF_CIVILIZATION'  // País pertence a Civilização
  | 'HAS_BATTLE'            // Guerra possui Batalhas
  | 'CITES_DOCUMENT'        // Livro cita Documento
  | 'PROVES_EVENT'          // Documento comprova Evento
  | 'WROTE_BOOK'            // Autor escreveu Livro
  | 'REFERENCES_THEME'      // Tema / Tópico referencia Personagem
  | 'INFLUENCED'            // Personagem influenciou outro / Movimento influenciou outro Movimento
  | 'RULED_EMPIRE'          // Personagem governou Império / Civilização
  | 'CREATED_TECH'          // Personagem / Civilização criou Tecnologia / Descoberta
  | 'CONSTRUCTED_BY'        // Construção erguida por Civilização
  | 'LOCATED_AT'            // Construção localizada em Cidade
  | 'TEMPORAL_ANCHOR'       // Evento / Personagem ancorado a uma Data ou Período Histórico
  | 'BELONGS_TO_MYTHOLOGY'  // Deus, Criatura ou Artefato pertence a Mitologia
  | 'ASSOCIATED_WITH';      // Associação genérica ou conceitual

export interface KGNode {
  id: string;
  type: EntityType;
  name: string;
  summary: string;
  description: string;
  justification?: string;         // Historiographical consensus justification
  imageUrl?: string;
  era: string;                    // Era of relevance / temporal localization
  evidenceLevel: EvidenceLevel;   // Level of scientific proof or mythological tag
  tags: string[];
  keywords: string[];
  sources: Source[];              // Primary or secondary sources proving this entity
  metadata?: Record<string, any>; // Specific attributes (e.g. coordinates, dates, duration)
}

export interface KGRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  description: string;            // Descriptive label of the relation (e.g. "comprovado por", "líder de")
  evidenceLevel?: EvidenceLevel;  // Reliability level of the connection itself
}

// Semantic Query Interface for AI Historiador and Interactive Timelines
export interface KGQuery {
  types?: EntityType[];
  tags?: string[];
  keywords?: string[];
  evidenceLevel?: EvidenceLevel;
  temporalStart?: string;
  temporalEnd?: string;
}

// Unified Knowledge Graph Representation
export interface CHRONOSKnowledgeGraph {
  nodes: Map<string, KGNode>;
  relationships: KGRelationship[];
}

export interface MetricasRapidas {
  duracao?: string;
  fases?: string;
  impacto_territorial?: string;
  [key: string]: string | undefined;
}

export interface PilarFato {
  titulo: string;
  icone?: string;
  descricao: string;
}

export interface EventoTimeline {
  year: string;
  event: string;
  fase_historica?: string;
  detalhe_tatico?: string;
}

export interface Personagem {
  name: string;
  role: string;
  bio: string;
  citacao_historica?: string;
}

export interface CharacterBio {
  nome: string;
  titulo_completo: string;
  nascimento: string;
  morte: string;
  biografia_detalhada: string;
  principais_feitos: string[];
  contexto_historico: string;
  legado: string;
  curiosidades: string[];
  citacao_famosa: string;
  fontes_sugeridas: string[];
}

export interface MitoVsFato {
  mito: string;
  fato: string;
}

export interface DebateHistoriografico {
  corrente: string;
  argumento: string;
}

export interface FonteEnriquecida extends Source {
  trecho_fonte_primaria?: string;
}

export interface HistoryCard {
  id: string;
  category: string;
  period: string;
  title: string;
  era: string;
  summary: string;
  evidenceLevel: EvidenceLevel;
  timeline: EventoTimeline[];
  characters: Personagem[];
  fact: {
    title: string;
    description: string;
    causaImediata?: string;
    desenvolvimento?: string;
    consequencias?: string;
    pilares_fatos?: PilarFato[];
  };
  interpretation: {
    title: string;
    description: string;
    debates_historiograficos?: DebateHistoriografico[];
    mitos_vs_fatos?: MitoVsFato[];
  };
  hypothesis: {
    title: string;
    description: string;
  };
  sources: FonteEnriquecida[];
  // Enrichment fields for modo aprofundado
  metricas_rapidas?: MetricasRapidas;
  relevancia_atual?: string;
  modo_aprofundado?: boolean;
}

export interface MeanwhileEvent {
  region: string;
  event: string;
  inicio?: string;
  detalhes?: string;
  termino?: string;
  dossierId?: string;
}

export interface DossierRequest {
  id: string;
  event: string;
  region: string;
  eraLabel?: string;
  requestedAt: string;
  userEmail: string;
  userName: string;
  status: 'pendente' | 'em_analise' | 'atendido' | 'rejeitado';
}

