import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Star,
  FileText,
  Sparkles,
  Code,
  BookOpen,
  Columns,
  Lock,
  User,
  DollarSign,
  Calendar,
  FileEdit,
  Settings,
  Heart,
  ListChecks,
  Music,
  Receipt,
  Calculator,
  LucideIcon,
  Package,
  FileSpreadsheet,
  HelpCircle,
  Menu,
  Search,
  X,
  ChevronRight,
  Github,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  category: 'main' | 'productivity' | 'business' | 'personal' | 'system';
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'main' },
  { id: 'tutorial', label: 'Tutorial', icon: HelpCircle, category: 'system' },
  { id: 'wellness', label: 'Bem-Estar', icon: Heart, category: 'personal' },
  { id: 'musica', label: 'Músicas', icon: Music, category: 'personal' },
  { id: 'favorites', label: 'Favoritos', icon: Star, category: 'main' },
  { id: 'notes', label: 'Notas', icon: FileText, category: 'productivity' },
  { id: 'prompts', label: 'Prompts IA', icon: Sparkles, category: 'productivity' },
  { id: 'snippets', label: 'Snippets', icon: Code, category: 'productivity' },
  { id: 'cheatsheet', label: 'Cheatsheet', icon: BookOpen, category: 'productivity' },
  { id: 'kanban', label: 'Kanban', icon: Columns, category: 'productivity' },
  { id: 'checklists', label: 'Listas', icon: ListChecks, category: 'personal' },
  { id: 'passwords', label: 'Senhas', icon: Lock, category: 'personal' },
  { id: 'contacts', label: 'Contatos', icon: User, category: 'personal' },
  { id: 'orcamentos', label: 'Orçamentos', icon: Receipt, category: 'business' },
  { id: 'precificador', label: 'Precificador', icon: Calculator, category: 'business' },
  { id: 'estoque', label: 'Estoque', icon: Package, category: 'business' },
  { id: 'fichatecnica', label: 'Ficha Técnica', icon: FileSpreadsheet, category: 'business' },
  { id: 'finance', label: 'Financeiro', icon: DollarSign, category: 'business' },
  { id: 'github', label: 'GitHub', icon: Github, category: 'productivity' },
  { id: 'diary', label: 'Diário', icon: Calendar, category: 'personal' },
  { id: 'draft', label: 'Rascunho', icon: FileEdit, category: 'productivity' },
  { id: 'settings', label: 'Config', icon: Settings, category: 'system' },
];

const categoryLabels: Record<string, string> = {
  main: 'Principal',
  productivity: 'Produtividade',
  business: 'Negócios',
  personal: 'Pessoal',
  system: 'Sistema',
};

export function ExtensionNavbar() {
  const { state, currentTab, setCurrentTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const enabledMenuItems = useMemo(() =>
    menuItems.filter(item => state.enabledModules.includes(item.id)),
    [state.enabledModules]
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return enabledMenuItems;
    return enabledMenuItems.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enabledMenuItems, searchQuery]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const currentItem = menuItems.find(item => item.id === currentTab);
  const CurrentIcon = currentItem?.icon || LayoutDashboard;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-12 items-center gap-2 px-3">
        {/* Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
              <Menu className="h-4 w-4" />
              <CurrentIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium truncate max-w-[120px]">
                {currentItem?.label || 'Menu'}
              </span>
              <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-[70vh] overflow-auto">
            {/* Search inside dropdown */}
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar módulo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-7 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />

            {Object.entries(groupedItems).map(([category, items]) => (
              <React.Fragment key={category}>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {categoryLabels[category]}
                </DropdownMenuLabel>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={cn(
                        "gap-2 cursor-pointer",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="border-t px-3 py-2">
          <Input
            placeholder="Buscar conteúdo..."
            className="h-8 text-sm"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
