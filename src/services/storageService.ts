/**
 * Unified Storage Service
 * Orchestrates IndexedDB (entities) + SettingsStore (config) + in-memory cache.
 * Provides debounced incremental writes, automatic migration from localStorage,
 * and a clean API for the AppContext to consume.
 */

import { db } from './db';
import { settingsStore } from './settingsStore';
import type { AppState } from '@/contexts/AppContext';

// ─── Entity Mapping ─────────────────────────────────────────────────────────
// Maps IDB store names to their accessor functions on AppState.
// Used for both loading (reconstructing state) and saving (diffing).

interface EntityMapping {
  store: string;
  get: (state: AppState) => any[];
}

export const ENTITY_MAP: EntityMapping[] = [
  { store: 'notes',                 get: (s) => s.notes },
  { store: 'prompts',              get: (s) => s.prompts },
  { store: 'snippets',             get: (s) => s.snippets },
  { store: 'cheatsheet',           get: (s) => s.cheatsheet },
  { store: 'kanban',               get: (s) => s.kanban },
  { store: 'passwords',            get: (s) => s.passwords },
  { store: 'bookmarks',            get: (s) => s.bookmarks },
  { store: 'diary',                get: (s) => s.diary },
  { store: 'contacts',             get: (s) => s.contacts },
  { store: 'checklists',           get: (s) => s.checklists },
  { store: 'financialAccounts',    get: (s) => s.financialAccounts },
  { store: 'financialCategories',  get: (s) => s.financialCategories },
  { store: 'financialBudgets',     get: (s) => s.financialBudgets },
  { store: 'financialTransactions',get: (s) => s.financialTransactions },
  { store: 'wellnessBreaks',       get: (s) => s.wellnessStats.breaks },
  { store: 'gamificationHistory',  get: (s) => s.gamificationStats.historico },
  { store: 'budgets',              get: (s) => s.budgets },
  { store: 'serviceCatalog',       get: (s) => s.serviceCatalog },
  { store: 'stockMaterials',       get: (s) => s.stockMaterials },
  { store: 'techSheets',           get: (s) => s.techSheets },
];

// Settings keys that map directly from AppState
const SETTINGS_KEYS = [
  'projects', 'pomodoroStats', 'billingInfo', 'pricingData', 'draft',
  'noteTemplates', 'taskTemplates', 'contactTags', 'enabledModules',
  'musicPlayerVolume', 'musicPlayerShuffle', 'musicPlayerRepeat',
  'encryptedPasswords', 'encryptedFinancial', 'encryptedContacts',
  'encryptedChecklists', 'encryptedBudgets', 'encryptedPricingData',
  'encryptedStock', 'encryptedTechSheets',
] as const;

// ─── Loaded Data ─────────────────────────────────────────────────────────
export interface LoadedData {
  state: AppState;
  currentProject: string;
  theme: string;
}

// ─── Storage Service ─────────────────────────────────────────────────────
class StorageService {
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingEntityWrites: Map<string, any[]> = new Map();
  private pendingSettings: Record<string, any> = {};
  private readonly DEBOUNCE_MS = 500;

  // ── Load ────────────────────────────────────────────────────────────
  /** Load all data from IndexedDB + settings store, with auto-migration */
  async loadAll(): Promise<LoadedData> {
    // Check if migration is needed
    const migrated = await settingsStore.get<boolean>('dbMigrated');
    if (!migrated) {
      await this.migrateFromLocalStorage();
    }

    // Load all entity data from IndexedDB in parallel
    const entityResults = await Promise.all(
      ENTITY_MAP.map(async (m) => {
        try {
          return { store: m.store, data: await db.getAll(m.store) };
        } catch {
          return { store: m.store, data: [] };
        }
      })
    );

    // Build entity map for quick lookup
    const entityData: Record<string, any[]> = {};
    for (const r of entityResults) {
      entityData[r.store] = r.data;
    }

    // Load settings
    const allSettingsKeys = [
      ...SETTINGS_KEYS,
      'currentProject', 'theme',
      'lastRecurringCheck', 'lastFinancialRecurringCheck',
      'gamificationCore',
    ];
    const settings = await settingsStore.getMany(allSettingsKeys);

    // Reconstruct gamification stats from settings + IDB history
    const gamificationCore = (settings as any).gamificationCore || {};
    const gamificationStats = {
      pontos: gamificationCore.pontos ?? 0,
      nivel: gamificationCore.nivel ?? 1,
      historico: entityData.gamificationHistory || [],
      badges: gamificationCore.badges || [],
      focusDuration: gamificationCore.focusDuration ?? 25,
      shortBreakDuration: gamificationCore.shortBreakDuration ?? 5,
      longBreakDuration: gamificationCore.longBreakDuration ?? 15,
    };

    // Reconstruct wellness stats
    const wellnessStats = {
      breaks: entityData.wellnessBreaks || [],
    };

    // Build the full AppState
    const state: AppState = {
      projects: (settings as any).projects || [{ id: 'default', name: 'Projeto Padrão', color: '#dc3545' }],
      notes: entityData.notes || [],
      prompts: entityData.prompts || [],
      snippets: entityData.snippets || [],
      cheatsheet: entityData.cheatsheet || [],
      kanban: entityData.kanban || [],
      passwords: entityData.passwords || [],
      bookmarks: entityData.bookmarks || [],
      diary: entityData.diary || [],
      draft: (settings as any).draft ?? '',
      pomodoroStats: (settings as any).pomodoroStats || { focusSessions: 0, totalMinutes: 0 },
      wellnessStats,
      gamificationStats,
      noteTemplates: (settings as any).noteTemplates || [],
      taskTemplates: (settings as any).taskTemplates || [],
      financialAccounts: entityData.financialAccounts || [],
      financialCategories: entityData.financialCategories || [],
      financialBudgets: entityData.financialBudgets || [],
      financialTransactions: entityData.financialTransactions || [],
      contacts: entityData.contacts || [],
      contactTags: (settings as any).contactTags || [],
      checklists: entityData.checklists || [],
      musicPlayerVolume: (settings as any).musicPlayerVolume ?? 0.7,
      musicPlayerShuffle: (settings as any).musicPlayerShuffle ?? false,
      musicPlayerRepeat: (settings as any).musicPlayerRepeat ?? false,
      billingInfo: (settings as any).billingInfo || {
        companyName: '', address: '', taxId: '', logoUrl: '', email: '', phone: '',
      },
      serviceCatalog: entityData.serviceCatalog || [],
      budgets: entityData.budgets || [],
      pricingData: (settings as any).pricingData || {
        fixedCosts: 0, desiredSalary: 0, taxesPercent: 0,
        hoursPerDay: 8, daysPerMonth: 22, idealHourlyRate: 0,
      },
      stockMaterials: entityData.stockMaterials || [],
      techSheets: entityData.techSheets || [],
      enabledModules: (settings as any).enabledModules || [
        'dashboard', 'tutorial', 'wellness', 'musica', 'favorites', 'notes',
        'prompts', 'snippets', 'cheatsheet', 'kanban', 'checklists',
        'passwords', 'contacts', 'orcamentos', 'precificador', 'estoque',
        'fichatecnica', 'finance', 'diary', 'draft', 'settings',
      ],
      // Encrypted fields (for export compatibility)
      encryptedPasswords: (settings as any).encryptedPasswords,
      encryptedFinancial: (settings as any).encryptedFinancial,
      encryptedContacts: (settings as any).encryptedContacts,
      encryptedChecklists: (settings as any).encryptedChecklists,
      encryptedBudgets: (settings as any).encryptedBudgets,
      encryptedPricingData: (settings as any).encryptedPricingData,
      encryptedStock: (settings as any).encryptedStock,
      encryptedTechSheets: (settings as any).encryptedTechSheets,
    };

    return {
      state,
      currentProject: (settings as any).currentProject || 'default',
      theme: (settings as any).theme || 'dark',
    };
  }

  // ── Diff & Persist ──────────────────────────────────────────────────
  /** Compare previous and current state, queue writes only for changed collections */
  diffAndPersist(prev: AppState, next: AppState): void {
    // Entity collections (IndexedDB)
    for (const mapping of ENTITY_MAP) {
      const prevData = mapping.get(prev);
      const nextData = mapping.get(next);
      if (prevData !== nextData) {
        this.queueEntityWrite(mapping.store, nextData);
      }
    }

    // Settings (chrome.storage.local / localStorage)
    const settingsChanges: Record<string, any> = {};

    // Direct-mapped settings fields
    for (const key of SETTINGS_KEYS) {
      if ((prev as any)[key] !== (next as any)[key]) {
        settingsChanges[key] = (next as any)[key];
      }
    }

    // Gamification core (separate from historico which goes to IDB)
    if (
      prev.gamificationStats.pontos !== next.gamificationStats.pontos ||
      prev.gamificationStats.nivel !== next.gamificationStats.nivel ||
      prev.gamificationStats.badges !== next.gamificationStats.badges ||
      prev.gamificationStats.focusDuration !== next.gamificationStats.focusDuration ||
      prev.gamificationStats.shortBreakDuration !== next.gamificationStats.shortBreakDuration ||
      prev.gamificationStats.longBreakDuration !== next.gamificationStats.longBreakDuration
    ) {
      settingsChanges.gamificationCore = {
        pontos: next.gamificationStats.pontos,
        nivel: next.gamificationStats.nivel,
        badges: next.gamificationStats.badges,
        focusDuration: next.gamificationStats.focusDuration,
        shortBreakDuration: next.gamificationStats.shortBreakDuration,
        longBreakDuration: next.gamificationStats.longBreakDuration,
      };
    }

    if (Object.keys(settingsChanges).length > 0) {
      this.queueSettingsWrite(settingsChanges);
    }
  }

  // ── Queue Writes ────────────────────────────────────────────────────
  /** Queue a full entity collection for write (debounced) */
  queueEntityWrite(storeName: string, items: any[]): void {
    this.pendingEntityWrites.set(storeName, items);
    this.scheduleFlush();
  }

  /** Queue settings changes for write (debounced) */
  queueSettingsWrite(updates: Record<string, any>): void {
    Object.assign(this.pendingSettings, updates);
    this.scheduleFlush();
  }

  /** Read settings values (used by recurring checks) */
  async getSettings(keys: string[]): Promise<Record<string, any>> {
    return settingsStore.getMany(keys);
  }

  // ── Flush ───────────────────────────────────────────────────────────
  private scheduleFlush(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), this.DEBOUNCE_MS);
  }

  /** Immediately flush all pending writes */
  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const entityPromises: Promise<void>[] = [];
    for (const [store, items] of this.pendingEntityWrites) {
      entityPromises.push(db.replaceAll(store, items));
    }
    this.pendingEntityWrites.clear();

    const settingsPromise = Object.keys(this.pendingSettings).length > 0
      ? settingsStore.setMany({ ...this.pendingSettings })
      : Promise.resolve();
    this.pendingSettings = {};

    await Promise.all([...entityPromises, settingsPromise]);
  }

  // ── Import ──────────────────────────────────────────────────────────
  /** Import full AppState from an external source (backup restore) */
  async importAll(appState: AppState, extras?: { theme?: string; currentProject?: string }): Promise<void> {
    // Clear all IDB stores
    await db.clearAll();

    // Write entity data to IDB
    const entityPromises: Promise<void>[] = [];
    for (const mapping of ENTITY_MAP) {
      const items = mapping.get(appState);
      if (items && items.length > 0) {
        entityPromises.push(db.replaceAll(mapping.store, items));
      }
    }
    await Promise.all(entityPromises);

    // Write settings
    const settingsData: Record<string, any> = {
      dbMigrated: true,
    };

    for (const key of SETTINGS_KEYS) {
      if ((appState as any)[key] !== undefined) {
        settingsData[key] = (appState as any)[key];
      }
    }

    // Gamification core
    settingsData.gamificationCore = {
      pontos: appState.gamificationStats.pontos,
      nivel: appState.gamificationStats.nivel,
      badges: appState.gamificationStats.badges,
      focusDuration: appState.gamificationStats.focusDuration,
      shortBreakDuration: appState.gamificationStats.shortBreakDuration,
      longBreakDuration: appState.gamificationStats.longBreakDuration,
    };

    // Extra settings
    if (extras?.theme) settingsData.theme = extras.theme;
    if (extras?.currentProject) settingsData.currentProject = extras.currentProject;

    await settingsStore.setMany(settingsData);
  }

  // ── Migration ───────────────────────────────────────────────────────
  /** One-time migration from old localStorage JSON blob */
  private async migrateFromLocalStorage(): Promise<void> {
    const raw = localStorage.getItem('devCommandCenter');
    if (!raw) {
      await settingsStore.set('dbMigrated', true);
      return;
    }

    try {
      const data = JSON.parse(raw);

      // Write entity data to IDB
      const entityWrites: Promise<void>[] = [];
      const entityFieldMap: Record<string, string> = {
        notes: 'notes',
        prompts: 'prompts',
        snippets: 'snippets',
        cheatsheet: 'cheatsheet',
        kanban: 'kanban',
        passwords: 'passwords',
        bookmarks: 'bookmarks',
        diary: 'diary',
        contacts: 'contacts',
        checklists: 'checklists',
        financialAccounts: 'financialAccounts',
        financialCategories: 'financialCategories',
        financialBudgets: 'financialBudgets',
        financialTransactions: 'financialTransactions',
        budgets: 'budgets',
        serviceCatalog: 'serviceCatalog',
        stockMaterials: 'stockMaterials',
        techSheets: 'techSheets',
      };

      for (const [store, field] of Object.entries(entityFieldMap)) {
        const items = data[field];
        if (Array.isArray(items) && items.length > 0) {
          entityWrites.push(db.replaceAll(store, items));
        }
      }

      // Special nested fields
      if (data.wellnessStats?.breaks?.length > 0) {
        entityWrites.push(db.replaceAll('wellnessBreaks', data.wellnessStats.breaks));
      }
      if (data.gamificationStats?.historico?.length > 0) {
        entityWrites.push(db.replaceAll('gamificationHistory', data.gamificationStats.historico));
      }

      await Promise.all(entityWrites);

      // Write settings
      const settingsData: Record<string, any> = {
        dbMigrated: true,
      };

      // Simple settings
      for (const key of SETTINGS_KEYS) {
        if (data[key] !== undefined) {
          settingsData[key] = data[key];
        }
      }

      // Gamification core (without historico)
      if (data.gamificationStats) {
        settingsData.gamificationCore = {
          pontos: data.gamificationStats.pontos ?? 0,
          nivel: data.gamificationStats.nivel ?? 1,
          badges: data.gamificationStats.badges || [],
          focusDuration: data.gamificationStats.focusDuration ?? 25,
          shortBreakDuration: data.gamificationStats.shortBreakDuration ?? 5,
          longBreakDuration: data.gamificationStats.longBreakDuration ?? 15,
        };
      }

      // Migrate theme, currentProject from separate localStorage keys
      const theme = localStorage.getItem('theme');
      if (theme) settingsData.theme = theme;

      const currentProject = localStorage.getItem('currentProject');
      if (currentProject) settingsData.currentProject = currentProject;

      const lastRecurringCheck = localStorage.getItem('lastRecurringCheck');
      if (lastRecurringCheck) settingsData.lastRecurringCheck = lastRecurringCheck;

      const lastFinancialCheck = localStorage.getItem('lastFinancialRecurringCheck');
      if (lastFinancialCheck) settingsData.lastFinancialRecurringCheck = lastFinancialCheck;

      await settingsStore.setMany(settingsData);

      console.log('[StorageService] Migration from localStorage complete.');
    } catch (err) {
      console.error('[StorageService] Migration failed:', err);
      // Mark as migrated to avoid retry loops; old data remains in localStorage as backup
      await settingsStore.set('dbMigrated', true);
    }
  }
}

// Singleton
export const storageService = new StorageService();
