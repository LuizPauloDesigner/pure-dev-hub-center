import { useApp } from '@/contexts/AppContext';
import { ExtensionNavbar } from '@/components/ExtensionNavbar';
import { MusicPlayerBar } from '@/components/MusicPlayerBar';
import { CommandPalette } from '@/components/CommandPalette';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import React, { memo, useEffect, useState } from 'react';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { GitHub } from '@/components/GitHub';

// Direct imports for instant loading
import { Dashboard } from '@/components/Dashboard';
import { Notes } from '@/components/Notes';
import { Prompts } from '@/components/Prompts';
import { Snippets } from '@/components/Snippets';
import { Cheatsheet } from '@/components/Cheatsheet';
import { Kanban } from '@/components/Kanban';
import { Passwords } from '@/components/Passwords';
import { Contacts } from '@/components/Contacts';
import { Checklists } from '@/components/Checklists';
import { Finance } from '@/components/Finance';
import { Diary } from '@/components/Diary';
import { Draft } from '@/components/Draft';
import { Favorites } from '@/components/Favorites';
import { Wellness } from '@/components/Wellness';
import { Settings } from '@/components/Settings';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Budgets } from '@/components/Budgets';
import { Pricing } from '@/components/Pricing';
import { Stock } from '@/components/Stock';
import { TechSheet } from '@/components/TechSheet';
import Tutorial from '@/components/Tutorial';

// Component map for cleaner rendering
const COMPONENT_MAP: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  tutorial: Tutorial,
  favorites: Favorites,
  notes: Notes,
  prompts: Prompts,
  snippets: Snippets,
  cheatsheet: Cheatsheet,
  kanban: Kanban,
  checklists: Checklists,
  passwords: Passwords,
  contacts: Contacts,
  orcamentos: Budgets,
  precificador: Pricing,
  estoque: Stock,
  fichatecnica: TechSheet,
  finance: Finance,
  diary: Diary,
  wellness: Wellness,
  musica: MusicPlayer,
  draft: Draft,
  settings: Settings,
  github: GitHub,
};

const MainContent = memo(() => {
  const { currentTab, state, setCurrentTab } = useApp();

  // Redirect to dashboard if module is disabled
  useEffect(() => {
    if (!state.enabledModules.includes(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [currentTab, state.enabledModules, setCurrentTab]);

  const Component = COMPONENT_MAP[currentTab] || Dashboard;

  return (
    <ScrollArea className="flex-1">
      <main className="py-3 pl-3 pr-5 extension-content">
        <Component />
      </main>
    </ScrollArea>
  );
});
MainContent.displayName = 'MainContent';

const Index = () => {
  const [isPlayerVisible, setIsPlayerVisible] = useState(() => {
    const saved = localStorage.getItem('mini-player-visible');
    return saved !== 'false';
  });

  useEffect(() => {
    const checkVisibility = () => {
      const saved = localStorage.getItem('mini-player-visible');
      setIsPlayerVisible(saved !== 'false');
    };

    window.addEventListener('storage', checkVisibility);

    return () => {
      window.removeEventListener('storage', checkVisibility);
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden extension-container">
      {/* Mini Player */}
      {isPlayerVisible && <MusicPlayerBar />}

      {/* Pomodoro Timer */}
      <div className="px-3 py-2 bg-background/95 backdrop-blur border-b z-40">
        <PomodoroTimer />
      </div>

      {/* Extension Navbar */}
      <ExtensionNavbar />

      {/* Main Content */}
      <MainContent />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
};

export default Index;
