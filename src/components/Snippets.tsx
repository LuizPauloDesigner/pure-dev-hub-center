import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Star, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'go',
  'rust',
  'html',
  'css',
  'sql',
  'bash',
  'other',
];

export const Snippets = () => {
  const { state, currentProject, addSnippet, updateSnippet, deleteSnippet } = useApp();
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    code: '',
    language: 'javascript',
    tags: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const projectSnippets = state.snippets.filter(s => s.projectId === currentProject);
  const currentSnippet = selectedSnippet ? state.snippets.find(s => s.id === selectedSnippet) : null;

  const handleNew = () => {
    setSelectedSnippet(null);
    setForm({ title: '', code: '', language: 'javascript', tags: '' });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast.error('Título e código são obrigatórios');
      return;
    }

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (selectedSnippet) {
      updateSnippet(selectedSnippet, { ...form, tags });
      toast.success('Snippet atualizado');
    } else {
      addSnippet({ projectId: currentProject, ...form, tags, isFavorite: false });
      toast.success('Snippet criado');
    }
    setIsEditing(false);
  };

  const handleSelect = (snippetId: string) => {
    const snippet = state.snippets.find(s => s.id === snippetId);
    if (snippet) {
      setSelectedSnippet(snippetId);
      setForm({
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags.join(', '),
      });
      setIsEditing(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado');
  };

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Code Snippets</CardTitle>
            <Button size="icon" variant="ghost" onClick={handleNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {projectSnippets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum snippet</p>
          ) : (
            projectSnippets.map(snippet => (
              <div
                key={snippet.id}
                className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedSnippet === snippet.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                }`}
                onClick={() => handleSelect(snippet.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{snippet.title}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {snippet.language}
                    </Badge>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSnippet(snippet.id, { isFavorite: !snippet.isFavorite });
                    }}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        snippet.isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {(isEditing || selectedSnippet) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Editor de Snippet</CardTitle>
                <div className="flex gap-2">
                  {!isEditing && currentSnippet && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleCopy(currentSnippet.code)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteSnippet(currentSnippet.id);
                          setSelectedSnippet(null);
                          toast.success('Snippet deletado');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {isEditing && (
                    <Button size="sm" onClick={handleSave}>
                      Salvar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título do snippet"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={!isEditing}
              />
              <Select
                value={form.language}
                onValueChange={(value) => setForm({ ...form, language: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Cole seu código aqui..."
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="min-h-[300px] font-mono text-sm"
                disabled={!isEditing}
              />
              <Input
                placeholder="Tags (separadas por vírgula)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                disabled={!isEditing}
              />
            </CardContent>
          </Card>
        )}

        {!isEditing && !selectedSnippet && (
          <Card>
            <CardContent className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Selecione ou crie um snippet</p>
                <Button onClick={handleNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Snippet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
