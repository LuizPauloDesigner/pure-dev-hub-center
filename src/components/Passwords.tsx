import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Eye, EyeOff, Copy, Trash2, Lock } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { toast } from 'sonner';

export const Passwords = () => {
  const { state, currentProject, addPassword, updatePassword, deletePassword } = useApp();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterDialog, setShowMasterDialog] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  const projectPasswords = state.passwords.filter(p => p.projectId === currentProject);

  const handleUnlock = () => {
    if (!masterPassword) {
      toast.error('Digite a senha mestra');
      return;
    }

    // In a real app, you would validate the master password
    // For demo purposes, we'll accept any non-empty password
    setIsUnlocked(true);
    setShowMasterDialog(false);
    toast.success('Cofre desbloqueado');
  };

  const handleAdd = () => {
    if (!form.title.trim() || !form.password.trim()) {
      toast.error('Título e senha são obrigatórios');
      return;
    }

    addPassword({
      projectId: currentProject,
      ...form,
    });

    setForm({ title: '', username: '', password: '', url: '', notes: '' });
    setIsDialogOpen(false);
    toast.success('Senha adicionada');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado');
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isUnlocked) {
    return (
      <Dialog open={showMasterDialog} onOpenChange={setShowMasterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Digite a Senha Mestra
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Digite sua senha mestra para acessar o gerenciador de senhas.
            </p>
            <Input
              type="password"
              placeholder="Senha mestra"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <Button onClick={handleUnlock} className="w-full">
              Desbloquear
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciador de Senhas</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsUnlocked(false)}>
            <Lock className="h-4 w-4 mr-2" />
            Bloquear
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Senha
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Título"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Usuário/Email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Input
              placeholder="URL (opcional)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
            <Textarea
              placeholder="Notas (opcional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <Button onClick={handleAdd} className="w-full">
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projectPasswords.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Nenhuma senha salva</p>
            </CardContent>
          </Card>
        ) : (
          projectPasswords.map(password => (
            <Card key={password.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{password.title}</CardTitle>
                  <button
                    onClick={() => {
                      deletePassword(password.id);
                      toast.success('Senha deletada');
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {password.username && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Usuário:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{password.username}</span>
                      <button onClick={() => handleCopy(password.username)}>
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Senha:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {showPasswords[password.id] ? password.password : '••••••••'}
                    </span>
                    <button onClick={() => toggleShowPassword(password.id)}>
                      {showPasswords[password.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>
                    <button onClick={() => handleCopy(password.password)}>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {password.url && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">URL:</span>
                    <a
                      href={password.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate max-w-[150px]"
                    >
                      {password.url}
                    </a>
                  </div>
                )}
                {password.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{password.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
