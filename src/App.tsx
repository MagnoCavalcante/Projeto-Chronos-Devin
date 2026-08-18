/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Screen, User, HistoryCard } from './types';
import { mockCards, TIMELINE_STEPS } from './data/mockData';
import { saveCardToSupabase, deleteCardFromSupabase, loadCardsFromSupabase, migrateLocalStorageToSupabase, migrateMockDataToSupabase } from './lib/supabaseSync';
import SplashView from './components/SplashView';
import WelcomeView from './components/WelcomeView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ForgotPasswordView from './components/ForgotPasswordView';
import MainView from './components/MainView';
import TimeTravelView from './components/TimeTravelView';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [timeTravelTarget, setTimeTravelTarget] = useState<number>(-10000);

  // Cards State for Admin Panel sync
  const [customCards, setCustomCards] = useState<HistoryCard[]>(() => {
    const saved = localStorage.getItem('chronos_custom_cards');
    if (saved) {
      try {
        const parsed: HistoryCard[] = JSON.parse(saved);
        const normalizeTitle = (t: string) => t.toLowerCase().trim().replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, ' ').trim();
        const mockTitles = new Set(mockCards.map(c => normalizeTitle(c.title || '')));
        const cleaned = parsed.filter((c: any) => {
          const text = (c.summary || '') + (c.title || '') + (c.fact?.description || '');
          const isPromptJunk = text.includes('Atue como') || text.includes('especialista em Historiografia');
          const isDuplicateOfMock = mockTitles.has(normalizeTitle(c.title || ''));
          return !isPromptJunk && !isDuplicateOfMock;
        });
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('chronos_custom_cards', JSON.stringify(cleaned));
        }
        return cleaned;
      } catch {
        return [];
      }
    }
    return [];
  });

  // Sync with Supabase on mount: migrate mock + localStorage first, then merge remote cards
  useEffect(() => {
    (async () => {
      await migrateMockDataToSupabase(mockCards, TIMELINE_STEPS);
      await migrateLocalStorageToSupabase();
      const remoteCards = await loadCardsFromSupabase();
      if (remoteCards.length > 0) {
        const localIds = new Set(customCards.map(c => c.id));
        const newFromRemote = remoteCards.filter(c => !localIds.has(c.id));
        if (newFromRemote.length > 0) {
          const merged = [...customCards, ...newFromRemote];
          setCustomCards(merged);
          localStorage.setItem('chronos_custom_cards', JSON.stringify(merged));
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCard = (card: HistoryCard, timelineStep?: any, kgNodes?: any[]) => {
    const updated = [card, ...customCards];
    setCustomCards(updated);
    localStorage.setItem('chronos_custom_cards', JSON.stringify(updated));
    saveCardToSupabase(card);

    if (timelineStep) {
      const savedTimeline = localStorage.getItem('chronos_custom_timeline');
      const existingTimeline = savedTimeline ? JSON.parse(savedTimeline) : [];
      const updatedTimeline = [...existingTimeline, timelineStep];
      localStorage.setItem('chronos_custom_timeline', JSON.stringify(updatedTimeline));
    }

    if (kgNodes && kgNodes.length > 0) {
      const savedKg = localStorage.getItem('chronos_custom_kg_nodes');
      const existingKg = savedKg ? JSON.parse(savedKg) : [];
      const updatedKg = [...existingKg, ...kgNodes];
      localStorage.setItem('chronos_custom_kg_nodes', JSON.stringify(updatedKg));
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = customCards.filter(c => c.id !== cardId);
    setCustomCards(updated);
    localStorage.setItem('chronos_custom_cards', JSON.stringify(updated));
    deleteCardFromSupabase(cardId);

    // Also remove corresponding timeline step
    const savedTimeline = localStorage.getItem('chronos_custom_timeline');
    if (savedTimeline) {
      try {
        const timelineSteps = JSON.parse(savedTimeline);
        const updatedSteps = timelineSteps.filter((s: any) => s.id !== cardId);
        localStorage.setItem('chronos_custom_timeline', JSON.stringify(updatedSteps));
      } catch {}
    }
  };

  const handleUpdateCard = (updatedCard: HistoryCard) => {
    const isInCustom = customCards.some(c => c.id === updatedCard.id);
    if (isInCustom) {
      const updated = customCards.map(c => c.id === updatedCard.id ? updatedCard : c);
      setCustomCards(updated);
      localStorage.setItem('chronos_custom_cards', JSON.stringify(updated));
    } else {
      const updated = [updatedCard, ...customCards.filter(c => c.id !== updatedCard.id)];
      setCustomCards(updated);
      localStorage.setItem('chronos_custom_cards', JSON.stringify(updated));
    }
    saveCardToSupabase(updatedCard);
  };

  const allCards = useMemo(() => {
    const customIds = new Set(customCards.map(c => c.id));
    const mockCardsFiltered = mockCards.filter(c => !customIds.has(c.id));
    const normalizeTitle = (t: string) => t.toLowerCase().trim().replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, ' ').trim();
    const mockTitles = new Set(mockCards.map(c => normalizeTitle(c.title || '')));
    const customCardsFiltered = customCards.filter(c => !mockTitles.has(normalizeTitle(c.title || '')));
    return [...mockCardsFiltered, ...customCardsFiltered];
  }, [customCards]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('chronos_current_user');
    setCurrentScreen('LOGIN');
  };

  const handleLoginRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('chronos_current_user', JSON.stringify(user));
    if (currentScreen !== 'ADMIN') {
      setTimeTravelTarget(-10000);
    }
  };

  // Restore session on mount and enforce guest expiration
  useEffect(() => {
    const saved = localStorage.getItem('chronos_current_user');
    if (saved) {
      try {
        const user = JSON.parse(saved) as User;
        if (user.isGuest && user.guestExpiresAt && user.guestExpiresAt < Date.now()) {
          localStorage.removeItem('chronos_current_user');
          return;
        }
        setCurrentUser(user);
      } catch {
        localStorage.removeItem('chronos_current_user');
      }
    }
  }, []);

  // Log out guest users when their session expires
  useEffect(() => {
    if (!currentUser?.isGuest || !currentUser.guestExpiresAt) return;
    const timeLeft = currentUser.guestExpiresAt - Date.now();
    if (timeLeft <= 0) {
      handleLogout();
      return;
    }
    const timer = setTimeout(() => {
      handleLogout();
      alert('Seu acesso de convidado expirou. Faça login para continuar.');
    }, timeLeft);
    return () => clearTimeout(timer);
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {currentScreen === 'SPLASH' && (
        <SplashView onComplete={() => setCurrentScreen('WELCOME')} />
      )}

      {currentScreen === 'WELCOME' && (
        <WelcomeView onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'LOGIN' && (
        <LoginView
          onNavigate={setCurrentScreen}
          onLoginSuccess={handleLoginRegisterSuccess}
        />
      )}

      {currentScreen === 'ADMIN' && (
        <AdminPanel
          currentUser={(currentUser && currentUser.role === 'admin') ? currentUser : {
            name: 'Magno Cavalcante (Admin)',
            email: 'magno.brt8@gmail.com',
            xp: 9990,
            level: 99,
            streak: 30,
            joinedDate: 'Janeiro de 2026',
            role: 'admin'
          }}
          isStandalone={true}
          onClose={() => setCurrentScreen('LOGIN')}
          cards={allCards}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          onUpdateCard={handleUpdateCard}
          timelineSteps={TIMELINE_STEPS}
        />
      )}

      {currentScreen === 'REGISTER' && (
        <RegisterView
          onNavigate={setCurrentScreen}
          onRegisterSuccess={handleLoginRegisterSuccess}
        />
      )}

      {currentScreen === 'FORGOT_PASSWORD' && (
        <ForgotPasswordView onNavigate={setCurrentScreen} />
      )}

      {currentScreen === 'TIME_TRAVEL' && (
        <TimeTravelView 
          targetYear={timeTravelTarget}
          onComplete={() => setCurrentScreen('HOME')} 
        />
      )}

      {(currentScreen === 'HOME' || currentScreen === 'PROFILE' || currentScreen === 'SETTINGS') && currentUser && (
        <MainView
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={setCurrentScreen}
          initialYear={timeTravelTarget}
          onEnterEpoch={(year: number) => {
            setTimeTravelTarget(year);
            setCurrentScreen('TIME_TRAVEL');
          }}
        />
      )}
    </div>
  );
}

