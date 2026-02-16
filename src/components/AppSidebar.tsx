import React from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
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
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tutorial', label: 'Tutorial', icon: HelpCircle },
  { id: 'wellness', label: 'Bem-Estar', icon: Heart },
  { id: 'musica', label: 'Biblioteca de Músicas', icon: Music },
  { id: 'favorites', label: 'Favoritos', icon: Star },
  { id: 'notes', label: 'Notas', icon: FileText },
  { id: 'prompts', label: 'Prompts IA', icon: Sparkles },
  { id: 'snippets', label: 'Snippets', icon: Code },
  { id: 'cheatsheet', label: 'Cheatsheet', icon: BookOpen },
  { id: 'kanban', label: 'Kanban', icon: Columns },
  { id: 'checklists', label: 'Listas Pessoais', icon: ListChecks },
  { id: 'passwords', label: 'Senhas', icon: Lock },
  { id: 'contacts', label: 'Contatos', icon: User },
  { id: 'orcamentos', label: 'Orçamentos', icon: Receipt },
  { id: 'precificador', label: 'Precificador', icon: Calculator },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'fichatecnica', label: 'Ficha Técnica', icon: FileSpreadsheet },
  { id: 'finance', label: 'Financeiro', icon: DollarSign },
  { id: 'diary', label: 'Diário', icon: Calendar },
  { id: 'draft', label: 'Rascunho', icon: FileEdit },
  { id: 'settings', label: 'Config', icon: Settings },
];

export function AppSidebar() {
  const { state, currentTab, setCurrentTab } = useApp();
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  // Filtrar apenas módulos habilitados
  const enabledMenuItems = menuItems.filter(item => 
    state.enabledModules.includes(item.id)
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'justify-center' : ''}>
            {isCollapsed ? '📋' : 'Central de Comando'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enabledMenuItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        setCurrentTab(item.id);
                        // Fechar sidebar em mobile após selecionar
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                      isActive={isActive}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
