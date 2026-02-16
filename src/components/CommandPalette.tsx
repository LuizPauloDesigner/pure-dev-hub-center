import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';
import { Command, FileText, Sparkles, Code, BookOpen, Columns, Lock, Calendar, FileEdit, Settings, LayoutDashboard, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const commands = [
  { id: 'dashboard', label: 'Ir para Dashboard', icon: LayoutDashboard, action: 'navigate' },
  { id: 'favorites', label: 'Ir para Favoritos', icon: Star, action: 'navigate' },
  { id: 'notes', label: 'Ir para Notas', icon: FileText, action: 'navigate' },
  { id: 'prompts', label: 'Ir para Prompts', icon: Sparkles, action: 'navigate' },
  { id: 'snippets', label: 'Ir para Snippets', icon: Code, action: 'navigate' },
  { id: 'cheatsheet', label: 'Ir para Cheatsheet', icon: BookOpen, action: 'navigate' },
  { id: 'kanban', label: 'Ir para Kanban', icon: Columns, action: 'navigate' },
  { id: 'passwords', label: 'Ir para Senhas', icon: Lock, action: 'navigate' },
  { id: 'diary', label: 'Ir para Diário', icon: Calendar, action: 'navigate' },
  { id: 'draft', label: 'Ir para Rascunho', icon: FileEdit, action: 'navigate' },
  { id: 'settings', label: 'Ir para Configurações', icon: Settings, action: 'navigate' },
  { id: 'theme', label: 'Alternar Tema', icon: Command, action: 'toggleTheme' },
];

export const CommandPalette = () => {
  const { setCurrentTab, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(filteredCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const handleSelect = (cmd: typeof commands[0]) => {
    if (cmd.action === 'navigate') {
      setCurrentTab(cmd.id);
    } else if (cmd.action === 'toggleTheme') {
      toggleTheme();
    }
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 max-w-2xl">
        <div className="flex items-center border-b px-3">
          <Command className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Digite um comando ou busque..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhum comando encontrado.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      index === selectedIndex
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t p-2 text-xs text-muted-foreground">
          Use <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium">↑↓</kbd> para navegar,{' '}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium">Enter</kbd> para selecionar
        </div>
      </DialogContent>
    </Dialog>
  );
};
