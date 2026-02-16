import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { storageService } from '@/services/storageService';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  projectId: string;
  title: string;
  content: string;
  notes: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export interface Snippet {
  id: string;
  projectId: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export interface CheatsheetItem {
  id: string;
  projectId: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
}

export interface KanbanTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  column: 'todo' | 'inProgress' | 'done';
  recurrence?: 'daily' | 'weekly' | 'none';
  completedAt?: string;
  createdAt: string;
}

export interface Password {
  id: string;
  projectId: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface Contact {
  id: string;
  projectId: string;
  nomeCompleto: string;
  telefones: string[];
  emails: string[];
  empresa: string;
  cargo: string;
  tags: string[];
  notas: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
}

export interface Checklist {
  id: string;
  projectId: string;
  titulo: string;
  itens: ChecklistItem[];
  createdAt: string;
}

export interface Bookmark {
  id: string;
  projectId: string;
  title: string;
  url: string;
  description: string;
  favicon?: string;
  category: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  moodScore?: number | null;
  projetoId?: string;
  origem?: string;
  dataHoraRegistro?: string;
}

export interface FinancialAccount {
  id: string;
  projectId: string;
  name: string;
  initialBalance: number;
  createdAt: string;
}

export interface FinancialCategory {
  id: string;
  projectId: string;
  name: string;
  type: 'income' | 'expense';
  createdAt: string;
}

export interface FinancialBudget {
  id: string;
  projectId: string;
  categoryId: string;
  limit: number;
  month: string;
}

export interface FinancialTransaction {
  id: string;
  projectId: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  accountId: string;
  recurrence: 'never' | 'monthly' | 'yearly';
  lastRecurrence?: string;
  createdAt: string;
}

export interface PomodoroStats {
  focusSessions: number;
  totalMinutes: number;
}

export interface WellnessBreakRecord {
  id: string;
  dataHora: string;
  tipoCiclo: 'short' | 'long';
  adesaoStatus: 'Concluida' | 'Pulada';
  duracaoPausa: number;
}

export interface WellnessStats {
  breaks: WellnessBreakRecord[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface GamificationStats {
  pontos: number;
  nivel: number;
  historico: Array<{
    id: string;
    tipo: string;
    pontos: number;
    descricao: string;
    timestamp: string;
  }>;
  badges: Badge[];
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

export interface BillingInfo {
  companyName: string;
  address: string;
  taxId: string;
  logoUrl: string;
  email: string;
  phone: string;
}

export interface ServiceCatalogItem {
  id: string;
  description: string;
  unitPrice: number;
  useIdealHourlyRate?: boolean;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  projectId: string;
  clientId: string;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  total: number;
  terms: string;
  status: 'draft' | 'sent' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface PricingData {
  fixedCosts: number;
  desiredSalary: number;
  taxesPercent: number;
  hoursPerDay: number;
  daysPerMonth: number;
  idealHourlyRate: number;
}

export interface StockMaterial {
  id: string;
  nomeMaterial: string;
  qtdEmbalagem: number;
  unidadeEmbalagem: string;
  precoPago: number;
  custoUnitario: number;
  createdAt: string;
}

export interface TechSheetItem {
  id: string;
  materialId: string;
  materialName: string;
  quantidadeUsada: number;
  unidade: string;
  custoUnitario: number;
  custoTotalItem: number;
}

export interface TechSheet {
  id: string;
  projectId: string;
  nomeProduto: string;
  rendimento: string;
  itens: TechSheetItem[];
  custoTotalProduto: number;
  custoPorUnidade: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  projects: Project[];
  notes: Note[];
  prompts: Prompt[];
  snippets: Snippet[];
  cheatsheet: CheatsheetItem[];
  kanban: KanbanTask[];
  passwords: Password[];
  bookmarks: Bookmark[];
  diary: DiaryEntry[];
  draft: string;
  pomodoroStats: PomodoroStats;
  wellnessStats: WellnessStats;
  gamificationStats: GamificationStats;
  noteTemplates: string[];
  taskTemplates: Omit<KanbanTask, 'id' | 'projectId' | 'createdAt'>[];
  encryptedPasswords?: string;
  financialAccounts: FinancialAccount[];
  financialCategories: FinancialCategory[];
  financialBudgets: FinancialBudget[];
  financialTransactions: FinancialTransaction[];
  encryptedFinancial?: string;
  contacts: Contact[];
  contactTags: string[];
  encryptedContacts?: string;
  checklists: Checklist[];
  encryptedChecklists?: string;
  musicPlayerVolume: number;
  musicPlayerShuffle: boolean;
  musicPlayerRepeat: boolean;
  billingInfo: BillingInfo;
  serviceCatalog: ServiceCatalogItem[];
  budgets: Budget[];
  encryptedBudgets?: string;
  pricingData: PricingData;
  encryptedPricingData?: string;
  stockMaterials: StockMaterial[];
  encryptedStock?: string;
  techSheets: TechSheet[];
  encryptedTechSheets?: string;
  enabledModules: string[];
}

interface AppContextType {
  state: AppState;
  currentProject: string;
  setCurrentProject: (id: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt'>) => void;
  updateSnippet: (id: string, updates: Partial<Snippet>) => void;
  deleteSnippet: (id: string) => void;
  addCheatsheetItem: (item: Omit<CheatsheetItem, 'id'>) => void;
  updateCheatsheetItem: (id: string, updates: Partial<CheatsheetItem>) => void;
  deleteCheatsheetItem: (id: string) => void;
  addKanbanTask: (task: Omit<KanbanTask, 'id' | 'createdAt'>) => void;
  updateKanbanTask: (id: string, updates: Partial<KanbanTask>) => void;
  deleteKanbanTask: (id: string) => void;
  addPassword: (password: Omit<Password, 'id'>) => void;
  updatePassword: (id: string, updates: Partial<Password>) => void;
  deletePassword: (id: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  updateDiaryEntry: (date: string, content: string, moodScore?: number | null, projetoId?: string) => void;
  updateDraft: (content: string) => void;
  updatePomodoroStats: (stats: Partial<PomodoroStats>) => void;
  addWellnessBreak: (breakRecord: Omit<WellnessBreakRecord, 'id'>) => void;
  addGamificationPoints: (pontos: number, tipo: string, descricao: string) => void;
  unlockBadge: (badgeId: string) => void;
  updateFocusDurations: (focus: number, shortBreak: number, longBreak: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addFinancialAccount: (account: Omit<FinancialAccount, 'id' | 'createdAt'>) => void;
  updateFinancialAccount: (id: string, updates: Partial<FinancialAccount>) => void;
  deleteFinancialAccount: (id: string) => void;
  addFinancialCategory: (category: Omit<FinancialCategory, 'id' | 'createdAt'>) => void;
  updateFinancialCategory: (id: string, updates: Partial<FinancialCategory>) => void;
  deleteFinancialCategory: (id: string) => void;
  addFinancialBudget: (budget: Omit<FinancialBudget, 'id'>) => void;
  updateFinancialBudget: (id: string, updates: Partial<FinancialBudget>) => void;
  deleteFinancialBudget: (id: string) => void;
  addFinancialTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  updateFinancialTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  deleteFinancialTransaction: (id: string) => void;
  setMusicPlayerVolume: (volume: number) => void;
  setMusicPlayerShuffle: (shuffle: boolean) => void;
  setMusicPlayerRepeat: (repeat: boolean) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addContactTag: (tag: string) => void;
  deleteContactTag: (tag: string) => void;
  addChecklist: (checklist: Omit<Checklist, 'id' | 'createdAt'>) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  deleteChecklist: (id: string) => void;
  addChecklistItem: (checklistId: string, item: Omit<ChecklistItem, 'id'>) => void;
  updateChecklistItem: (checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (checklistId: string, itemId: string) => void;
  updateBillingInfo: (info: Partial<BillingInfo>) => void;
  addServiceCatalogItem: (item: Omit<ServiceCatalogItem, 'id' | 'createdAt'>) => void;
  updateServiceCatalogItem: (id: string, updates: Partial<ServiceCatalogItem>) => void;
  deleteServiceCatalogItem: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  updatePricingData: (data: PricingData) => void;
  addStockMaterial: (material: Omit<StockMaterial, 'id' | 'createdAt' | 'custoUnitario'>) => void;
  updateStockMaterial: (id: string, updates: Partial<StockMaterial>) => void;
  deleteStockMaterial: (id: string) => void;
  addTechSheet: (sheet: Omit<TechSheet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTechSheet: (id: string, updates: Partial<TechSheet>) => void;
  deleteTechSheet: (id: string) => void;
  toggleModule: (moduleId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AVAILABLE_BADGES: Badge[] = [
  { id: 'foco10', name: 'Focado', description: 'Completou 10 ciclos de foco', icon: '🎯' },
  { id: 'foco25', name: 'Concentrado', description: 'Completou 25 ciclos de foco', icon: '🧠' },
  { id: 'foco50', name: 'Mestre do Foco', description: 'Completou 50 ciclos de foco', icon: '🏆' },
  { id: 'pausa10', name: 'Cuidadoso', description: 'Completou 10 pausas ativas', icon: '💚' },
  { id: 'pausa25', name: 'Bem-Estar', description: 'Completou 25 pausas ativas', icon: '🌟' },
  { id: 'streak7', name: 'Consistente', description: '7 dias consecutivos com ciclos', icon: '🔥' },
  { id: 'meditacao5', name: 'Zen', description: 'Completou 5 meditações', icon: '🧘' },
  { id: 'nivel5', name: 'Evoluído', description: 'Alcançou nível 5', icon: '⭐' },
];

const initialState: AppState = {
  projects: [{ id: 'default', name: 'Projeto Padrão', color: '#dc3545' }],
  notes: [],
  prompts: [],
  snippets: [],
  cheatsheet: [],
  kanban: [],
  passwords: [],
  bookmarks: [],
  diary: [],
  draft: '',
  pomodoroStats: { focusSessions: 0, totalMinutes: 0 },
  wellnessStats: { breaks: [] },
  gamificationStats: {
    pontos: 0,
    nivel: 1,
    historico: [],
    badges: [],
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  },
  noteTemplates: [],
  taskTemplates: [],
  financialAccounts: [],
  financialCategories: [],
  financialBudgets: [],
  financialTransactions: [],
  contacts: [],
  contactTags: [],
  checklists: [],
  musicPlayerVolume: 0.7,
  musicPlayerShuffle: false,
  musicPlayerRepeat: false,
  billingInfo: {
    companyName: '',
    address: '',
    taxId: '',
    logoUrl: '',
    email: '',
    phone: '',
  },
  serviceCatalog: [],
  budgets: [],
  pricingData: {
    fixedCosts: 0,
    desiredSalary: 0,
    taxesPercent: 0,
    hoursPerDay: 8,
    daysPerMonth: 22,
    idealHourlyRate: 0,
  },
  stockMaterials: [],
  techSheets: [],
  enabledModules: ['dashboard', 'tutorial', 'wellness', 'musica', 'favorites', 'notes', 'prompts', 'snippets', 'cheatsheet', 'kanban', 'checklists', 'passwords', 'contacts', 'orcamentos', 'precificador', 'estoque', 'fichatecnica', 'finance', 'diary', 'draft', 'settings'],
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [currentProject, setCurrentProjectState] = useState('default');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Ref to track previous state for incremental diff
  const prevStateRef = useRef<AppState | null>(null);

  // ── Async Load from IndexedDB + Settings Store ──────────────────────────
  useEffect(() => {
    storageService.loadAll()
      .then((loaded) => {
        setState(loaded.state);
        setCurrentProjectState(loaded.currentProject);
        const loadedTheme = (loaded.theme === 'light' ? 'light' : 'dark') as 'light' | 'dark';
        setTheme(loadedTheme);
        document.documentElement.classList.toggle('dark', loadedTheme === 'dark');
        prevStateRef.current = loaded.state;
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[AppContext] Failed to load state:', err);
        setIsLoading(false);
      });
  }, []);

  // ── Smart Incremental Save (diff by reference) ─────────────────────────
  useEffect(() => {
    if (isLoading) return;
    const prev = prevStateRef.current;
    if (!prev) {
      prevStateRef.current = state;
      return;
    }

    // Delegate diffing + debounced writes to storageService
    storageService.diffAndPersist(prev, state);
    prevStateRef.current = state;
  }, [state, isLoading]);

  // ── Persist currentProject changes ──────────────────────────────────────
  const setCurrentProject = useCallback((id: string) => {
    setCurrentProjectState(id);
    storageService.queueSettingsWrite({ currentProject: id });
  }, []);

  // ── Check for recurring tasks ───────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    const checkRecurringTasks = async () => {
      const today = new Date().toDateString();
      const settings = await storageService.getSettings(['lastRecurringCheck']);

      if (settings.lastRecurringCheck === today) return;

      const updatedTasks = [...state.kanban];
      let hasChanges = false;

      state.kanban.forEach(task => {
        if (task.column === 'done' && task.recurrence && task.recurrence !== 'none' && task.completedAt) {
          const completedDate = new Date(task.completedAt);
          const now = new Date();

          let shouldRecreate = false;
          if (task.recurrence === 'daily') {
            shouldRecreate = now.getDate() !== completedDate.getDate();
          } else if (task.recurrence === 'weekly') {
            const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
            shouldRecreate = daysDiff >= 7;
          }

          if (shouldRecreate) {
            updatedTasks.push({
              ...task,
              id: `${task.id}-${Date.now()}`,
              column: 'todo',
              completedAt: undefined,
              createdAt: new Date().toISOString(),
            });
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setState(prev => ({ ...prev, kanban: updatedTasks }));
      }

      storageService.queueSettingsWrite({ lastRecurringCheck: today });
    };

    checkRecurringTasks();
  }, [isLoading]);

  // ── Check for recurring financial transactions ──────────────────────────
  useEffect(() => {
    if (isLoading) return;

    const checkRecurringTransactions = async () => {
      const today = new Date().toDateString();
      const settings = await storageService.getSettings(['lastFinancialRecurringCheck']);

      if (settings.lastFinancialRecurringCheck === today) return;

      const updatedTransactions = [...(state.financialTransactions || [])];
      let hasChanges = false;

      (state.financialTransactions || []).forEach(transaction => {
        if (transaction.recurrence !== 'never' && transaction.lastRecurrence) {
          const lastDate = new Date(transaction.lastRecurrence);
          const now = new Date();

          let shouldRecreate = false;
          if (transaction.recurrence === 'monthly') {
            const monthsDiff = (now.getFullYear() - lastDate.getFullYear()) * 12 +
                             (now.getMonth() - lastDate.getMonth());
            shouldRecreate = monthsDiff >= 1;
          } else if (transaction.recurrence === 'yearly') {
            const yearsDiff = now.getFullYear() - lastDate.getFullYear();
            shouldRecreate = yearsDiff >= 1;
          }

          if (shouldRecreate) {
            updatedTransactions.push({
              ...transaction,
              id: `${transaction.id}-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              lastRecurrence: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            });
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setState(prev => ({ ...prev, financialTransactions: updatedTransactions }));
      }

      storageService.queueSettingsWrite({ lastFinancialRecurringCheck: today });
    };

    checkRecurringTransactions();
  }, [isLoading]);

  // ── Theme toggle ────────────────────────────────────────────────────────
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    storageService.queueSettingsWrite({ theme: newTheme });
  };

  // ── CRUD Operations (all unchanged, same API) ──────────────────────────

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now().toString() };
    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const deleteProject = (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
    }));
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, notes: [...prev.notes, newNote] }));
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }));
  };

  const deleteNote = (id: string) => {
    setState(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
  };

  const addPrompt = (prompt: Omit<Prompt, 'id' | 'createdAt'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, prompts: [...prev.prompts, newPrompt] }));
  };

  const updatePrompt = (id: string, updates: Partial<Prompt>) => {
    setState(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const deletePrompt = (id: string) => {
    setState(prev => ({ ...prev, prompts: prev.prompts.filter(p => p.id !== id) }));
  };

  const addSnippet = (snippet: Omit<Snippet, 'id' | 'createdAt'>) => {
    const newSnippet: Snippet = {
      ...snippet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, snippets: [...prev.snippets, newSnippet] }));
  };

  const updateSnippet = (id: string, updates: Partial<Snippet>) => {
    setState(prev => ({
      ...prev,
      snippets: prev.snippets.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteSnippet = (id: string) => {
    setState(prev => ({ ...prev, snippets: prev.snippets.filter(s => s.id !== id) }));
  };

  const addCheatsheetItem = (item: Omit<CheatsheetItem, 'id'>) => {
    const newItem: CheatsheetItem = { ...item, id: Date.now().toString() };
    setState(prev => ({ ...prev, cheatsheet: [...prev.cheatsheet, newItem] }));
  };

  const updateCheatsheetItem = (id: string, updates: Partial<CheatsheetItem>) => {
    setState(prev => ({
      ...prev,
      cheatsheet: prev.cheatsheet.map(item => item.id === id ? { ...item, ...updates } : item),
    }));
  };

  const deleteCheatsheetItem = (id: string) => {
    setState(prev => ({ ...prev, cheatsheet: prev.cheatsheet.filter(item => item.id !== id) }));
  };

  const addKanbanTask = (task: Omit<KanbanTask, 'id' | 'createdAt'>) => {
    const newTask: KanbanTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, kanban: [...prev.kanban, newTask] }));
  };

  const updateKanbanTask = (id: string, updates: Partial<KanbanTask>) => {
    setState(prev => ({
      ...prev,
      kanban: prev.kanban.map(task => task.id === id ? { ...task, ...updates } : task),
    }));
  };

  const deleteKanbanTask = (id: string) => {
    setState(prev => ({ ...prev, kanban: prev.kanban.filter(task => task.id !== id) }));
  };

  const addPassword = (password: Omit<Password, 'id'>) => {
    const newPassword: Password = { ...password, id: Date.now().toString() };
    setState(prev => ({ ...prev, passwords: [...prev.passwords, newPassword] }));
  };

  const updatePassword = (id: string, updates: Partial<Password>) => {
    setState(prev => ({
      ...prev,
      passwords: prev.passwords.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const deletePassword = (id: string) => {
    setState(prev => ({ ...prev, passwords: prev.passwords.filter(p => p.id !== id) }));
  };

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, bookmarks: [...prev.bookmarks, newBookmark] }));
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  };

  const deleteBookmark = (id: string) => {
    setState(prev => ({ ...prev, bookmarks: prev.bookmarks.filter(b => b.id !== id) }));
  };

  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = { ...entry, id: Date.now().toString() };
    setState(prev => ({ ...prev, diary: [...prev.diary, newEntry] }));
  };

  const updateDiaryEntry = (date: string, content: string, moodScore?: number | null, projetoId?: string) => {
    setState(prev => {
      const existing = prev.diary.find(e => e.date === date);
      const dataHoraRegistro = new Date().toISOString();

      if (existing) {
        return {
          ...prev,
          diary: prev.diary.map(e =>
            e.date === date
              ? {
                  ...e,
                  content,
                  moodScore,
                  projetoId,
                  origem: 'Diario',
                  dataHoraRegistro
                }
              : e
          ),
        };
      }
      return {
        ...prev,
        diary: [...prev.diary, {
          id: Date.now().toString(),
          date,
          content,
          moodScore,
          projetoId,
          origem: 'Diario',
          dataHoraRegistro
        }],
      };
    });
  };

  const updateDraft = (content: string) => {
    setState(prev => ({ ...prev, draft: content }));
  };

  const updatePomodoroStats = (stats: Partial<PomodoroStats>) => {
    setState(prev => ({
      ...prev,
      pomodoroStats: { ...prev.pomodoroStats, ...stats },
    }));
  };

  const addWellnessBreak = (breakRecord: Omit<WellnessBreakRecord, 'id'>) => {
    const newBreak: WellnessBreakRecord = {
      ...breakRecord,
      id: Date.now().toString(),
    };
    setState(prev => ({
      ...prev,
      wellnessStats: {
        ...prev.wellnessStats,
        breaks: [...prev.wellnessStats.breaks, newBreak],
      },
    }));
  };

  const addGamificationPoints = (pontos: number, tipo: string, descricao: string) => {
    setState(prev => {
      const novoHistorico = {
        id: Date.now().toString(),
        tipo,
        pontos,
        descricao,
        timestamp: new Date().toISOString(),
      };

      const novosPontos = prev.gamificationStats.pontos + pontos;
      const novoNivel = Math.floor(novosPontos / 150) + 1;

      return {
        ...prev,
        gamificationStats: {
          ...prev.gamificationStats,
          pontos: novosPontos,
          nivel: novoNivel,
          historico: [...prev.gamificationStats.historico, novoHistorico],
        },
      };
    });
  };

  const unlockBadge = (badgeId: string) => {
    setState(prev => {
      const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
      if (!badge || prev.gamificationStats.badges.some(b => b.id === badgeId)) {
        return prev;
      }

      return {
        ...prev,
        gamificationStats: {
          ...prev.gamificationStats,
          badges: [...prev.gamificationStats.badges, { ...badge, unlockedAt: new Date().toISOString() }],
        },
      };
    });
  };

  const updateFocusDurations = (focus: number, shortBreak: number, longBreak: number) => {
    setState(prev => ({
      ...prev,
      gamificationStats: {
        ...prev.gamificationStats,
        focusDuration: focus,
        shortBreakDuration: shortBreak,
        longBreakDuration: longBreak,
      },
    }));
  };

  const addFinancialAccount = (account: Omit<FinancialAccount, 'id' | 'createdAt'>) => {
    const newAccount: FinancialAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, financialAccounts: [...prev.financialAccounts, newAccount] }));
  };

  const updateFinancialAccount = (id: string, updates: Partial<FinancialAccount>) => {
    setState(prev => ({
      ...prev,
      financialAccounts: prev.financialAccounts.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  };

  const deleteFinancialAccount = (id: string) => {
    setState(prev => ({ ...prev, financialAccounts: prev.financialAccounts.filter(a => a.id !== id) }));
  };

  const addFinancialCategory = (category: Omit<FinancialCategory, 'id' | 'createdAt'>) => {
    const newCategory: FinancialCategory = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, financialCategories: [...prev.financialCategories, newCategory] }));
  };

  const updateFinancialCategory = (id: string, updates: Partial<FinancialCategory>) => {
    setState(prev => ({
      ...prev,
      financialCategories: prev.financialCategories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteFinancialCategory = (id: string) => {
    setState(prev => ({ ...prev, financialCategories: prev.financialCategories.filter(c => c.id !== id) }));
  };

  const addFinancialBudget = (budget: Omit<FinancialBudget, 'id'>) => {
    const newBudget: FinancialBudget = { ...budget, id: Date.now().toString() };
    setState(prev => ({ ...prev, financialBudgets: [...prev.financialBudgets, newBudget] }));
  };

  const updateFinancialBudget = (id: string, updates: Partial<FinancialBudget>) => {
    setState(prev => ({
      ...prev,
      financialBudgets: prev.financialBudgets.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  };

  const deleteFinancialBudget = (id: string) => {
    setState(prev => ({ ...prev, financialBudgets: prev.financialBudgets.filter(b => b.id !== id) }));
  };

  const addFinancialTransaction = (transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: FinancialTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, financialTransactions: [...prev.financialTransactions, newTransaction] }));
  };

  const updateFinancialTransaction = (id: string, updates: Partial<FinancialTransaction>) => {
    setState(prev => ({
      ...prev,
      financialTransactions: prev.financialTransactions.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const deleteFinancialTransaction = (id: string) => {
    setState(prev => ({ ...prev, financialTransactions: prev.financialTransactions.filter(t => t.id !== id) }));
  };

  const setMusicPlayerVolume = (volume: number) => {
    setState(prev => ({ ...prev, musicPlayerVolume: volume }));
  };

  const setMusicPlayerShuffle = (shuffle: boolean) => {
    setState(prev => ({ ...prev, musicPlayerShuffle: shuffle }));
  };

  const setMusicPlayerRepeat = (repeat: boolean) => {
    setState(prev => ({ ...prev, musicPlayerRepeat: repeat }));
  };

  const addContact = (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteContact = (id: string) => {
    setState(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
  };

  const addContactTag = (tag: string) => {
    setState(prev => ({
      ...prev,
      contactTags: [...prev.contactTags, tag],
    }));
  };

  const deleteContactTag = (tag: string) => {
    setState(prev => ({
      ...prev,
      contactTags: prev.contactTags.filter(t => t !== tag),
    }));
  };

  const addChecklist = (checklist: Omit<Checklist, 'id' | 'createdAt'>) => {
    const newChecklist: Checklist = {
      ...checklist,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, checklists: [...prev.checklists, newChecklist] }));
  };

  const updateChecklist = (id: string, updates: Partial<Checklist>) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteChecklist = (id: string) => {
    setState(prev => ({ ...prev, checklists: prev.checklists.filter(c => c.id !== id) }));
  };

  const addChecklistItem = (checklistId: string, item: Omit<ChecklistItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(checklist =>
        checklist.id === checklistId
          ? {
              ...checklist,
              itens: [...checklist.itens, { ...item, id: Date.now().toString() }]
            }
          : checklist
      ),
    }));
  };

  const updateChecklistItem = (checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(checklist =>
        checklist.id === checklistId
          ? {
              ...checklist,
              itens: checklist.itens.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : checklist
      ),
    }));
  };

  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(checklist =>
        checklist.id === checklistId
          ? {
              ...checklist,
              itens: checklist.itens.filter(item => item.id !== itemId)
            }
          : checklist
      ),
    }));
  };

  const updateBillingInfo = (info: Partial<BillingInfo>) => {
    setState(prev => ({
      ...prev,
      billingInfo: { ...prev.billingInfo, ...info }
    }));
  };

  const addServiceCatalogItem = (item: Omit<ServiceCatalogItem, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      serviceCatalog: [...prev.serviceCatalog, {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }],
    }));
  };

  const updateServiceCatalogItem = (id: string, updates: Partial<ServiceCatalogItem>) => {
    setState(prev => ({
      ...prev,
      serviceCatalog: prev.serviceCatalog.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const deleteServiceCatalogItem = (id: string) => {
    setState(prev => ({
      ...prev,
      serviceCatalog: prev.serviceCatalog.filter(item => item.id !== id),
    }));
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      budgets: [...prev.budgets, {
        ...budget,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      }],
    }));
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.map(budget =>
        budget.id === id ? { ...budget, ...updates, updatedAt: new Date().toISOString() } : budget
      ),
    }));
  };

  const deleteBudget = (id: string) => {
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.filter(budget => budget.id !== id),
    }));
  };

  const updatePricingData = (data: PricingData) => {
    setState(prev => ({
      ...prev,
      pricingData: data,
    }));
  };

  const addStockMaterial = (material: Omit<StockMaterial, 'id' | 'createdAt' | 'custoUnitario'>) => {
    const custoUnitario = material.precoPago / material.qtdEmbalagem;
    setState(prev => ({
      ...prev,
      stockMaterials: [...prev.stockMaterials, {
        ...material,
        id: Date.now().toString(),
        custoUnitario,
        createdAt: new Date().toISOString(),
      }],
    }));
  };

  const updateStockMaterial = (id: string, updates: Partial<StockMaterial>) => {
    setState(prev => ({
      ...prev,
      stockMaterials: prev.stockMaterials.map(material => {
        if (material.id === id) {
          const updated = { ...material, ...updates };
          if (updates.precoPago !== undefined || updates.qtdEmbalagem !== undefined) {
            updated.custoUnitario = updated.precoPago / updated.qtdEmbalagem;
          }
          return updated;
        }
        return material;
      }),
    }));
  };

  const deleteStockMaterial = (id: string) => {
    setState(prev => ({
      ...prev,
      stockMaterials: prev.stockMaterials.filter(material => material.id !== id),
    }));
  };

  const addTechSheet = (sheet: Omit<TechSheet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      techSheets: [...prev.techSheets, {
        ...sheet,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      }],
    }));
  };

  const updateTechSheet = (id: string, updates: Partial<TechSheet>) => {
    setState(prev => ({
      ...prev,
      techSheets: prev.techSheets.map(sheet =>
        sheet.id === id ? { ...sheet, ...updates, updatedAt: new Date().toISOString() } : sheet
      ),
    }));
  };

  const deleteTechSheet = (id: string) => {
    setState(prev => ({
      ...prev,
      techSheets: prev.techSheets.filter(sheet => sheet.id !== id),
    }));
  };

  const toggleModule = (moduleId: string) => {
    setState(prev => {
      const isEnabled = prev.enabledModules.includes(moduleId);
      return {
        ...prev,
        enabledModules: isEnabled
          ? prev.enabledModules.filter(id => id !== moduleId)
          : [...prev.enabledModules, moduleId],
      };
    });
  };

  // ── Memoized Context Value ──────────────────────────────────────────────
  const contextValue = useMemo(() => ({
    state,
    currentProject,
    setCurrentProject,
    currentTab,
    setCurrentTab,
    theme,
    toggleTheme,
    addProject,
    updateProject,
    deleteProject,
    addNote,
    updateNote,
    deleteNote,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    addCheatsheetItem,
    updateCheatsheetItem,
    deleteCheatsheetItem,
    addKanbanTask,
    updateKanbanTask,
    deleteKanbanTask,
    addPassword,
    updatePassword,
    deletePassword,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addDiaryEntry,
    updateDiaryEntry,
    updateDraft,
    updatePomodoroStats,
    addWellnessBreak,
    addGamificationPoints,
    unlockBadge,
    updateFocusDurations,
    searchQuery,
    setSearchQuery,
    addFinancialAccount,
    updateFinancialAccount,
    deleteFinancialAccount,
    addFinancialCategory,
    updateFinancialCategory,
    deleteFinancialCategory,
    addFinancialBudget,
    updateFinancialBudget,
    deleteFinancialBudget,
    addFinancialTransaction,
    updateFinancialTransaction,
    deleteFinancialTransaction,
    setMusicPlayerVolume,
    setMusicPlayerShuffle,
    setMusicPlayerRepeat,
    addContact,
    updateContact,
    deleteContact,
    addContactTag,
    deleteContactTag,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    updateBillingInfo,
    addServiceCatalogItem,
    updateServiceCatalogItem,
    deleteServiceCatalogItem,
    addBudget,
    updateBudget,
    deleteBudget,
    updatePricingData,
    addStockMaterial,
    updateStockMaterial,
    deleteStockMaterial,
    addTechSheet,
    updateTechSheet,
    deleteTechSheet,
    toggleModule,
  }), [state, currentProject, currentTab, theme, searchQuery]);

  // ── Loading State ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Carregando dados...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
