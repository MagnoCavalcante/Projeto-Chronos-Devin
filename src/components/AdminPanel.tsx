import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Database, 
  FileText, 
  Bot, 
  ArrowLeft,
  ChevronRight,
  Book,
  Send,
  Download,
  Upload,
  UserCheck,
  UserX,
  Key,
  Inbox
} from 'lucide-react';
import { User, HistoryCard, Source, DossierRequest } from '../types';

interface AdminPanelProps {
  currentUser: User;
  onClose: () => void;
  cards: HistoryCard[];
  onAddCard: (card: HistoryCard, timelineStep?: any, kgNodes?: any[]) => void;
  onDeleteCard: (cardId: string) => void;
  isStandalone?: boolean;
}

const DEFAULT_USERS: User[] = [
  { id: 'usr-1', name: 'Dr. Magno Botelho', email: 'magno.brt8@gmail.com', xp: 2450, level: 8, streak: 14, joinedDate: '12/01/2026', role: 'admin', status: 'ativo' },
  { id: 'usr-2', name: 'Prof.ª Helena Vasconcelos', email: 'helena.historia@usp.br', xp: 1890, level: 6, streak: 9, joinedDate: '03/02/2026', role: 'historiador', status: 'ativo' },
  { id: 'usr-3', name: 'Lucas Mendes', email: 'lucas.mendes@estudante.com', xp: 720, level: 3, streak: 4, joinedDate: '18/03/2026', role: 'user', status: 'ativo' },
  { id: 'usr-4', name: 'Mariana Duarte', email: 'mariana.d@gmail.com', xp: 340, level: 2, streak: 1, joinedDate: '24/04/2026', role: 'user', status: 'ativo' },
  { id: 'usr-5', name: 'Roberto Alencar', email: 'roberto.alencar@ufrj.br', xp: 1400, level: 5, streak: 7, joinedDate: '01/05/2026', role: 'historiador', status: 'ativo' },
];

const DEFAULT_REQUESTS: DossierRequest[] = [];

export default function AdminPanel({
  currentUser,
  onClose,
  cards,
  onAddCard,
  onDeleteCard,
  isStandalone = false
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'ai_assistant' | 'requests'>('requests');
  
  // Dossier Requests State
  const [dossierRequests, setDossierRequests] = useState<DossierRequest[]>(() => {
    const saved = localStorage.getItem('chronos_dossier_requests');
    if (saved) {
      try {
        const parsed: DossierRequest[] = JSON.parse(saved);
        // Remove solicitações demo antigas (req-1, req-2)
        const filtered = parsed.filter(r => !r.id.startsWith('req-') || r.id.length > 5);
        if (filtered.length !== parsed.length) {
          localStorage.setItem('chronos_dossier_requests', JSON.stringify(filtered));
        }
        return filtered;
      } catch (e) {
        return DEFAULT_REQUESTS;
      }
    }
    return DEFAULT_REQUESTS;
  });
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pendente' | 'em_analise' | 'atendido' | 'rejeitado'>('all');
  const [requestNotice, setRequestNotice] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('chronos_dossier_requests', JSON.stringify(dossierRequests));
  }, [dossierRequests]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('chronos_dossier_requests');
      if (saved) {
        try {
          setDossierRequests(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleUpdateRequestStatus = (id: string, status: 'pendente' | 'em_analise' | 'atendido' | 'rejeitado') => {
    const updated = dossierRequests.map(r => r.id === id ? { ...r, status } : r);
    setDossierRequests(updated);
    localStorage.setItem('chronos_dossier_requests', JSON.stringify(updated));
    const labels = { pendente: 'Pendente', em_analise: 'Em Análise', atendido: 'Atendido', rejeitado: 'Rejeitado' };
    setRequestNotice(`Status da solicitação atualizado para "${labels[status]}".`);
    setTimeout(() => setRequestNotice(null), 3000);
  };

  const handleDeleteRequest = (id: string) => {
    const updated = dossierRequests.filter(r => r.id !== id);
    setDossierRequests(updated);
    localStorage.setItem('chronos_dossier_requests', JSON.stringify(updated));
    setRequestNotice('Solicitação removida do painel.');
    setTimeout(() => setRequestNotice(null), 3000);
  };

  // User Management State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('chronos_admin_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'historiador' | 'user'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'user' as const, password: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userActionNotice, setUserActionNotice] = useState<string | null>(null);

  // AI Assistant Generator State
  const [aiPrompt, setAiPrompt] = useState('Adicione um módulo sobre o Império Bizantino e inclua 3 livros nas fontes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [publishingSuccess, setPublishingSuccess] = useState(false);

  // Manual Content Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCardForm, setManualCardForm] = useState<Partial<HistoryCard>>({
    title: '',
    period: 'Idade Média',
    era: '',
    summary: '',
    sources: []
  });

  // Save users to local storage
  useEffect(() => {
    localStorage.setItem('chronos_admin_users', JSON.stringify(users));
  }, [users]);

  // Handle AI Content Generation
  const handleGenerateAI = async (promptToUse?: string) => {
    const promptText = promptToUse || aiPrompt;
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setAiError(null);
    setAiResult(null);
    setPublishingSuccess(false);

    try {
      const existingCardsSummary = cards.map(c => ({
        id: c.id,
        title: c.title,
        period: c.period,
        era: c.era,
        summary: c.summary
      }));

      const response = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptText,
          existingCards: existingCardsSummary 
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Falha ao comunicar com o servidor de IA.');
      }

      setAiResult(resData.data);
    } catch (err: any) {
      setAiError(err.message || 'Erro ao gerar conteúdo com a IA. Verifique sua conexão.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Publish AI Generated Card into Application
  const handlePublishAICard = () => {
    if (!aiResult || !aiResult.card) return;

    onAddCard(aiResult.card, aiResult.timelineStep, aiResult.kgNodes);
    setPublishingSuccess(true);
    setTimeout(() => {
      setPublishingSuccess(false);
      setAiResult(null);
    }, 2500);
  };

  // User Actions
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) return;
    if (newUserForm.password.length < 6) {
      setUserActionNotice('A senha deve ter no mínimo 6 caracteres.');
      setTimeout(() => setUserActionNotice(null), 3000);
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      xp: 0,
      level: 1,
      streak: 0,
      joinedDate: new Date().toLocaleDateString('pt-BR'),
      role: newUserForm.role,
      status: 'ativo'
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    localStorage.setItem('chronos_admin_users', JSON.stringify(updatedUsers));

    // Salva também nas contas registradas para permitir login
    const storedAccountsRaw = localStorage.getItem('chronos_registered_accounts');
    const existingAccounts: { name: string; email: string; pass: string }[] = storedAccountsRaw ? JSON.parse(storedAccountsRaw) : [];
    const updatedAccounts = [...existingAccounts.filter(a => a.email.toLowerCase() !== newUserForm.email.toLowerCase()), { name: newUserForm.name, email: newUserForm.email, pass: newUserForm.password }];
    localStorage.setItem('chronos_registered_accounts', JSON.stringify(updatedAccounts));

    setNewUserForm({ name: '', email: '', role: 'user', password: '' });
    setShowAddUserModal(false);
    setUserActionNotice(`Usuário "${newUser.name}" cadastrado com sucesso! Senha definida.`);
    setTimeout(() => setUserActionNotice(null), 3000);
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUsers = users.map(u => {
      const isMatch = (editingUser.id && u.id && u.id === editingUser.id) || (u.email === editingUser.email);
      return isMatch ? editingUser : u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('chronos_admin_users', JSON.stringify(updatedUsers));
    setUserActionNotice(`Usuário "${editingUser.name}" atualizado com sucesso!`);
    setEditingUser(null);
    setTimeout(() => setUserActionNotice(null), 3000);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => {
      if (userToDelete.id && u.id) return u.id !== userToDelete.id;
      return u.email !== userToDelete.email;
    });

    setUsers(updatedUsers);
    localStorage.setItem('chronos_admin_users', JSON.stringify(updatedUsers));
    setUserActionNotice(`Usuário "${userToDelete.name}" excluído com sucesso.`);
    setUserToDelete(null);
    setTimeout(() => setUserActionNotice(null), 3000);
  };

  const handleToggleRole = (user: User) => {
    const nextRole = user.role === 'admin' ? 'user' : user.role === 'user' ? 'historiador' : 'admin';
    const updatedUsers = users.map(u => {
      const match = (user.id && u.id && u.id === user.id) || (u.email === user.email);
      return match ? { ...u, role: nextRole } : u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('chronos_admin_users', JSON.stringify(updatedUsers));
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'ativo' ? 'suspenso' : 'ativo';
    const updatedUsers = users.map(u => {
      const match = (user.id && u.id && u.id === user.id) || (u.email === user.email);
      return match ? { ...u, status: nextStatus as any } : u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('chronos_admin_users', JSON.stringify(updatedUsers));
  };

  const handleGenerateFromRequest = (req: DossierRequest) => {
    handleUpdateRequestStatus(req.id, 'em_analise');
    const promptText = `Adicione um dossiê histórico completo sobre "${req.event}" (${req.region} • ${req.eraLabel || 'Época Histórica'}) e inclua 3 livros acadêmicos de referência nas fontes.`;
    setAiPrompt(promptText);
    setActiveTab('ai_assistant');
    handleGenerateAI(promptText);
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const contentSection = (
    <>
      {/* Navigation Tabs */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 flex gap-2 overflow-x-auto scrollbar-none shrink-0 pt-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Inbox className="w-4 h-4 text-amber-400" />
          <span>Solicitações de Dossiês</span>
          {dossierRequests.filter(r => r.status === 'pendente').length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-sans text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
              {dossierRequests.filter(r => r.status === 'pendente').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ai_assistant'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          Assistente IA Híbrido
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4" />
          Gestão de Usuários ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Módulos & Fontes ({cards.length})
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Database className="w-4 h-4" />
          Métricas do Sistema
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">

        {/* ================= TAB: DOSSIER REQUESTS ================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Banner */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Inbox className="w-4 h-4 text-amber-400" />
                  Central de Solicitações dos Estudantes & Historiadores
                </div>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                  {dossierRequests.filter(r => r.status === 'pendente').length} Pendente{dossierRequests.filter(r => r.status === 'pendente').length !== 1 ? 's' : ''} de Atendimento
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-white">
                Dossiês Históricos Solicitados no "Enquanto isso no mundo..."
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Todas as vezes que um estudante solicita a adição de um dossiê que ainda não está catalogado no acervo individual do app, a sugestão cai automaticamente nesta aba. Você pode clicar em <strong className="text-amber-400">"Gerar Dossiê com IA"</strong> para criar o módulo completo instantaneamente!
              </p>
            </div>

            {/* Notification Notice */}
            {requestNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-xl font-mono text-xs flex items-center justify-between shadow-lg animate-fade-in">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {requestNotice}
                </span>
                <button onClick={() => setRequestNotice(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Controls Bar: Search & Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por tema, região ou nome do solicitante..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold shrink-0">Filtrar:</span>
                {(['all', 'pendente', 'em_analise', 'atendido', 'rejeitado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap capitalize ${
                      requestStatusFilter === st
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {st === 'all' ? 'Todas' :
                     st === 'pendente' ? 'Pendentes' :
                     st === 'em_analise' ? 'Em Análise' :
                     st === 'atendido' ? 'Atendidas' : 'Rejeitadas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Cards Grid */}
            {(() => {
              const filteredRequests = dossierRequests.filter(r => {
                const matchSearch = r.event.toLowerCase().includes(requestSearch.toLowerCase()) ||
                  r.region.toLowerCase().includes(requestSearch.toLowerCase()) ||
                  r.userName.toLowerCase().includes(requestSearch.toLowerCase()) ||
                  r.userEmail.toLowerCase().includes(requestSearch.toLowerCase());
                const matchStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
                return matchSearch && matchStatus;
              });

              if (filteredRequests.length === 0) {
                return (
                  <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-3">
                    <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-serif font-bold text-slate-300">Nenhuma solicitação encontrada</h4>
                    <p className="text-xs text-slate-500">
                      Não há nenhuma solicitação cadastrada correspondente aos filtros aplicados.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRequests.map((req) => {
                    const statusBadgeClass =
                      req.status === 'pendente' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      req.status === 'em_analise' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                      req.status === 'atendido' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      'bg-rose-500/15 text-rose-400 border-rose-500/30';

                    const statusLabel =
                      req.status === 'pendente' ? 'Pendente' :
                      req.status === 'em_analise' ? 'Em Análise' :
                      req.status === 'atendido' ? 'Atendido / Publicado' : 'Rejeitado';

                    return (
                      <div key={req.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all shadow-md">
                        {/* Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                              {req.region}
                            </span>
                            {req.eraLabel && (
                              <span className="text-[10px] font-mono text-slate-400">
                                • {req.eraLabel}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
                              {statusLabel}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {req.requestedAt}
                            </span>
                          </div>
                        </div>

                        {/* Card Main Content */}
                        <div className="space-y-2">
                          <h4 className="text-lg font-serif font-bold text-white leading-snug">
                            {req.event}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans pt-1">
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                            <span>Solicitado por: <strong className="text-slate-200">{req.userName}</strong> (<span className="font-mono text-amber-300">{req.userEmail}</span>)</span>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-850">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Mudar Status:</span>
                            <select
                              value={req.status}
                              onChange={(e: any) => handleUpdateRequestStatus(req.id, e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs py-1.5 px-2.5 rounded-lg font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="pendente">Pendente</option>
                              <option value="em_analise">Em Análise</option>
                              <option value="atendido">Atendido</option>
                              <option value="rejeitado">Rejeitado</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-2 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-xl border border-red-800/40 cursor-pointer text-xs font-mono transition-all"
                              title="Excluir Solicitação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleGenerateFromRequest(req)}
                              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer border border-amber-300/40"
                            >
                              <Sparkles className="w-4 h-4 text-slate-950" />
                              <span>Gerar Dossiê com IA</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB 1: AI ASSISTANT (HYBRID CREATION) ================= */}
        {activeTab === 'ai_assistant' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Banner Explanation */}
            <div className="p-5 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                Gerador Híbrido de Módulos e Obras de Referência
              </div>
              <h3 className="text-lg font-serif font-bold text-white">
                Instrua a IA a criar novos assuntos e anexar livros acadêmicos
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Digite em linguagem natural o assunto que deseja incluir no CHRONOS. A IA estruturará o dossiê histórico completo, eventos da linha do tempo e catalogará os livros de referência com autor, ano e capítulos.
              </p>
            </div>

            {/* Preset Prompts Examples */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Exemplos Rápidos de Prompt:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Adicione um módulo sobre o Império Bizantino e inclua 3 livros nas fontes',
                  'Crie um dossiê sobre o Iluminismo na França com 3 livros acadêmicos',
                  'Adicione um módulo sobre a Revolução Industrial e fontes bibliográficas',
                  'Inclua a Peste Negra na Europa Medieval com 3 fontes de referência'
                ].map((exPrompt, i) => (
                  <button
                    key={i}
                    onClick={() => setAiPrompt(exPrompt)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-all text-left cursor-pointer"
                  >
                    "{exPrompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Area */}
            <div className="space-y-3 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block">
                Comando para a IA:
              </label>
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  placeholder="Ex: Adicione um módulo sobre o Império Bizantino e inclua 3 livros nas fontes..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-sans resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  A IA gerará o Dossiê, Linha do Tempo, Fatos vs Hipóteses e Fontes Bibliográficas.
                </span>
                <button
                  onClick={() => handleGenerateAI()}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sintetizando Historiografia...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar & Anexar com IA
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {aiError && (
              <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl flex items-center gap-3 text-red-300 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Publishing Success Badge */}
            {publishingSuccess && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500 rounded-xl flex items-center gap-3 text-emerald-300 text-xs sm:text-sm animate-bounce">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="font-bold">Módulo e Livros publicados com sucesso! Já estão ativos no acervo do aplicativo.</span>
              </div>
            )}

            {/* AI Result Verification for Existing Content */}
            {aiResult && aiResult.existingCheck && (
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                aiResult.existingCheck.hasExactOrDirectMatch
                  ? 'bg-amber-950/60 border-amber-500/80 text-amber-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200'
              } space-y-3 shadow-xl animate-fade-in`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 text-amber-400">
                    <Database className="w-4 h-4 text-amber-400" />
                    Checagem de Conteúdo Relacionado no App
                  </span>
                  {aiResult.existingCheck.hasExactOrDirectMatch ? (
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full font-bold">
                      ⚠️ Assunto Já Catalogado no App ({aiResult.existingCheck.existingMatchTitle || 'Módulo Existente'})
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                      ✓ Análise de Acervo Concluída
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-serif leading-relaxed text-slate-200">
                  {aiResult.existingCheck.analysisNote}
                </p>

                {aiResult.existingCheck.relatedExistingTitles && aiResult.existingCheck.relatedExistingTitles.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                      🔗 Módulos Correlacionados Identificados no Aplicativo:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {aiResult.existingCheck.relatedExistingTitles.map((title: string, idx: number) => (
                        <span key={idx} className="text-xs bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg font-medium">
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Result Preview Card */}
            {aiResult && aiResult.card && (
              <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {aiResult.card.period}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-white">{aiResult.card.title}</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{aiResult.card.era}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed">
                  {aiResult.card.summary}
                </p>

                {/* Sources Preview (Highlighting Books) */}
                <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Book className="w-4 h-4" />
                      Fontes Bibliográficas Incluídas ({aiResult.card.sources?.length || 0} Livros/Documentos)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Catálogo Científico
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {aiResult.card.sources?.map((src: Source, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-serif font-bold text-white">{src.title}</span>
                            <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                              {src.type === 'book' ? 'Livro' :
                               src.type === 'article' ? 'Artigo' :
                               src.type === 'document' ? 'Manuscrito' :
                               src.type === 'archaeological' ? 'Arqueologia' :
                               src.type === 'myth' ? 'Mito' : src.type}
                            </span>
                          </div>
                          <p className="text-xs text-amber-200/80 font-serif">
                            Autor: <span className="text-white font-medium">{src.author}</span> ({src.year})
                          </p>
                          {src.details && (
                            <p className="text-[11px] text-slate-400 font-sans italic">
                              Detalhes: {src.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions to Publish */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setAiResult(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handlePublishAICard}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Salvar e Publicar no App
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: USER MANAGEMENT (OPÇÃO A) ================= */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            {/* Top Controls for Users */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar usuário por nome ou e-mail..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e: any) => setRoleFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-300 py-2 px-3 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="all">Todos os Papéis</option>
                  <option value="admin">Administrador</option>
                  <option value="historiador">Historiador</option>
                  <option value="user">Estudante</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Usuário
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Usuário / E-mail</th>
                      <th className="p-3.5">Papel / Função</th>
                      <th className="p-3.5">Nível / XP</th>
                      <th className="p-3.5">Ofensiva</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Ações de Controle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id || u.email} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            u.role === 'admin' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                              : u.role === 'historiador'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {u.role === 'admin' ? 'Administrador' : u.role === 'historiador' ? 'Historiador' : 'Estudante'}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono">
                          <div className="text-amber-400 font-bold">Nível {u.level}</div>
                          <div className="text-[10px] text-slate-400">{u.xp} XP acumulados</div>
                        </td>

                        <td className="p-3.5 font-mono text-slate-300">
                          🔥 {u.streak} dias
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            u.status === 'suspenso' 
                              ? 'bg-red-950 text-red-400 border border-red-800' 
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {u.status === 'suspenso' ? 'Suspenso' : 'Ativo'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded text-[10px] font-mono border border-amber-500/30 cursor-pointer inline-flex items-center gap-1"
                            title="Editar informações do usuário"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => handleToggleRole(u)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700 cursor-pointer"
                            title="Alterar papel entre Admin, Historiador e Estudante"
                          >
                            Alternar Papel
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono border cursor-pointer ${
                              u.status === 'suspenso'
                                ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {u.status === 'suspenso' ? 'Reativar' : 'Suspender'}
                          </button>

                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1 bg-red-950/80 hover:bg-red-900 text-red-400 rounded border border-red-800 cursor-pointer inline-block align-middle"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notification Toast */}
            {userActionNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-xl font-mono text-xs flex items-center justify-between shadow-lg animate-fade-in">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {userActionNotice}
                </span>
                <button onClick={() => setUserActionNotice(null)} className="text-emerald-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                <form onSubmit={handleAddUser} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-serif font-bold text-white text-base">Cadastrar Novo Usuário</h3>
                    <button type="button" onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs font-sans">
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Endereço de E-mail</label>
                      <input
                        type="email"
                        required
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Papel de Acesso</label>
                      <select
                        value={newUserForm.role}
                        onChange={(e: any) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value="user">Estudante (Acesso padrão)</option>
                        <option value="historiador">Historiador (Curador de fontes)</option>
                        <option value="admin">Administrador (Controle total)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Senha de Acesso (mín. 6 caracteres)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        placeholder="Define a senha do usuário..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-mono font-bold"
                    >
                      Salvar Usuário
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* EDIT USER MODAL */}
            {editingUser && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                <form onSubmit={handleSaveEditedUser} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-base">
                      <Edit3 className="w-4 h-4" />
                      <span>Editar Usuário</span>
                    </div>
                    <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-mono mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-mono mb-1">E-mail de Cadastro</label>
                      <input
                        type="email"
                        required
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Papel / Função</label>
                      <select
                        value={editingUser.role}
                        onChange={(e: any) => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value="user">Estudante</option>
                        <option value="historiador">Historiador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Status da Conta</label>
                      <select
                        value={editingUser.status || 'ativo'}
                        onChange={(e: any) => setEditingUser({ ...editingUser, status: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="suspenso">Suspenso</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Nível de Progresso</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={editingUser.level}
                        onChange={(e) => setEditingUser({ ...editingUser, level: Number(e.target.value) || 1 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">XP Acumulados</label>
                      <input
                        type="number"
                        min="0"
                        value={editingUser.xp}
                        onChange={(e) => setEditingUser({ ...editingUser, xp: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-mono mb-1">Ofensiva (Dias de Sequência)</label>
                      <input
                        type="number"
                        min="0"
                        value={editingUser.streak}
                        onChange={(e) => setEditingUser({ ...editingUser, streak: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-mono font-bold cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* DELETE USER CONFIRMATION MODAL */}
            {userToDelete && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-red-800/80 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3 text-red-400">
                    <div className="p-2.5 bg-red-950 rounded-xl border border-red-800">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Confirmar Exclusão de Usuário</h3>
                      <p className="text-[11px] font-mono text-slate-400">Ação irreversível no acervo</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Você está prestes a excluir permanentemente a conta de <strong className="text-white">{userToDelete.name}</strong> (<span className="font-mono text-amber-300">{userToDelete.email}</span>).
                  </p>

                  <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-[11px] text-red-300 font-mono">
                    ⚠️ O perfil, progresso de {userToDelete.xp} XP e estatísticas de uso serão removidos do sistema.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteUser}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer shadow-lg"
                    >
                      Sim, Excluir Usuário
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: MODULE & SOURCES MANAGEMENT (OPÇÃO A) ================= */}
        {activeTab === 'content' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="font-serif font-bold text-white text-base">Acervo Histórico e Módulos Cadastrados</h3>
                <p className="text-xs text-slate-400">Total de {cards.length} dossiês ativos na base do aplicativo.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('ai_assistant')}
                  className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar via IA
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((c) => (
                <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {c.period} • {c.era}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {c.sources?.length || 0} fontes
                      </span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-slate-300 font-serif line-clamp-2">{c.summary}</p>
                  </div>

                  {/* Sources preview list */}
                  {c.sources && c.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 space-y-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Fontes Anexadas:</span>
                      <div className="space-y-0.5">
                        {c.sources.slice(0, 3).map((s, i) => (
                          <div key={i} className="text-[11px] font-serif text-amber-200/90 truncate flex items-center gap-1">
                            <Book className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{s.title} ({s.author}, {s.year})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Nível de Evidência: <strong className="text-amber-400 font-bold uppercase">{
                        c.evidenceLevel === 'high' ? 'Alto Consenso' :
                        c.evidenceLevel === 'good' ? 'Bom Nível' :
                        c.evidenceLevel === 'debate' ? 'Em Debate' :
                        c.evidenceLevel === 'hypothesis' ? 'Hipótese' :
                        c.evidenceLevel === 'mythological' ? 'Mitológico' :
                        c.evidenceLevel
                      }</strong>
                    </span>

                    <button
                      onClick={() => onDeleteCard(c.id)}
                      className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded border border-red-800/40 cursor-pointer flex items-center gap-1 text-[10px] font-mono"
                      title="Remover Módulo"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SYSTEM METRICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Total de Usuários</span>
                <div className="text-2xl font-serif font-bold text-white">{users.length}</div>
                <span className="text-[11px] text-emerald-400 font-mono">100% Ativos e Verificados</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Módulos Dossiê</span>
                <div className="text-2xl font-serif font-bold text-amber-400">{cards.length}</div>
                <span className="text-[11px] text-slate-400 font-mono">Com Fontes e Linha do Tempo</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Obras Bibliográficas</span>
                <div className="text-2xl font-serif font-bold text-purple-400">
                  {cards.reduce((acc, c) => acc + (c.sources?.length || 0), 0)}
                </div>
                <span className="text-[11px] text-purple-300 font-mono">Livros e Documentos Reais</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Motor IA Gemini</span>
                <div className="text-2xl font-serif font-bold text-emerald-400">Ativo</div>
                <span className="text-[11px] text-slate-400 font-mono">gemini-3.6-flash (Server-Side)</span>
              </div>
            </div>

            {/* Status Banner */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Arquitetura Híbrida de Dados
              </h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                O painel de controle sincroniza alterações diretamente em memória e armazenamento persistente local (`localStorage`), permitindo que administradores criem conteúdos manualmente ou com auxílio do gerador inteligente da IA.
              </p>
            </div>
          </div>
        )}

      </div>
    </>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Top Dedicated Full-Page Admin Header */}
        <header className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm shrink-0 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Title & User Status */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide truncate">
                    CHRONOS <span className="text-amber-400 font-sans font-medium text-sm">| Painel de Administração</span>
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Sessão Ativa
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 font-sans truncate">
                  Conectado como <span className="text-slate-200 font-semibold">{currentUser?.name || 'Administrador'}</span> • <span className="text-slate-400 font-mono text-[11px]">{currentUser?.email}</span>
                </p>
              </div>
            </div>

            {/* Exit Action Button */}
            <div className="flex items-center justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 active:bg-slate-850 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-700/80 text-xs font-mono font-medium shadow-xs whitespace-nowrap"
                title="Sair do Painel Admin e Voltar à Tela de Login"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Voltar ao Login</span>
              </button>
            </div>

          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full p-2 sm:p-4 md:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            {contentSection}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Top Header Modal Mode */}
        <header className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white truncate">
                  CHRONOS <span className="text-amber-400 font-sans font-normal text-xs sm:text-sm">| Painel de Gestão</span>
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans truncate">
                Gestão de usuários, conteúdos históricos e assistente IA.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer border border-slate-700 shrink-0"
            title="Fechar Painel Admin"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {contentSection}

      </div>
    </div>
  );
}
