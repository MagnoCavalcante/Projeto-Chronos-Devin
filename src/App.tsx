/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Screen, User, HistoryCard } from './types';
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
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddCard = (card: HistoryCard) => {
    const updated = [card, ...customCards];
    setCustomCards(updated);
    localStorage.setItem('chronos_custom_cards', JSON.stringify(updated));
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = customCards.filter(c => c.id !== cardId);
    setCustomCards(updated);
    localStorage.setItem('chronos_custom_cards', JSON.stringify(updated));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('LOGIN');
  };

  const handleLoginRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    if (currentScreen !== 'ADMIN') {
      setTimeTravelTarget(-10000);
    }
  };

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
          currentUser={currentUser || {
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
          cards={customCards}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
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

