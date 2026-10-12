import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

// Global overlays: AI drawer, command search, and "new task" sheet
// (opened from several screens, so they live above the router).
interface UiState {
  aiOpen: boolean;
  aiContext: string | null;
  openAI: (context?: string) => void;
  closeAI: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  newTaskFor: { clientId?: string; date?: Date } | null;
  openNewTask: (preset?: { clientId?: string; date?: Date }) => void;
  closeNewTask: () => void;
}

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newTaskFor, setNewTaskFor] = useState<UiState['newTaskFor']>(null);

  // Escape closes whatever overlay is open (RN-web Modal doesn't do this itself).
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setAiOpen(false);
      setSearchOpen(false);
      setNewTaskFor(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<UiState>(
    () => ({
      aiOpen,
      aiContext,
      openAI: (context) => {
        setAiContext(context ?? null);
        setAiOpen(true);
      },
      closeAI: () => setAiOpen(false),
      searchOpen,
      openSearch: () => {
        setAiOpen(false);
        setSearchOpen(true);
      },
      closeSearch: () => setSearchOpen(false),
      newTaskFor,
      openNewTask: (preset) => setNewTaskFor(preset ?? {}),
      closeNewTask: () => setNewTaskFor(null),
    }),
    [aiOpen, aiContext, searchOpen, newTaskFor],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
}
