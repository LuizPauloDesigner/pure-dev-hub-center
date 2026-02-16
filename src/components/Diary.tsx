import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const moodOptions = [
  { value: 1, emoji: '😞', label: 'Muito Estressado/Ruim' },
  { value: 2, emoji: '😐', label: 'Neutro/Normal' },
  { value: 3, emoji: '🙂', label: 'OK/Levemente Positivo' },
  { value: 4, emoji: '😁', label: 'Bom/Focado' },
  { value: 5, emoji: '🤩', label: 'Excelente/Motivado' },
];

export const Diary = () => {
  const { state, updateDiaryEntry, currentProject } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState<number | null>(null);

  const dateString = selectedDate.toISOString().split('T')[0];
  
  // Filtrar entradas pelo projeto atual
  const projectEntries = state.diary.filter(e => e.projetoId === currentProject);
  const entry = projectEntries.find(e => e.date === dateString);

  useEffect(() => {
    setContent(entry?.content || '');
    setMoodScore(entry?.moodScore ?? null);
  }, [entry]);

  const handleSave = () => {
    updateDiaryEntry(dateString, content, moodScore, currentProject);
    toast.success('Entrada salva');
  };

  const datesWithEntries = projectEntries.map(e => new Date(e.date));

  return (
    <div className="grid gap-6 md:grid-cols-[350px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasEntry: datesWithEntries,
            }}
            modifiersClassNames={{
              hasEntry: 'bg-primary/20 font-bold',
            }}
          />
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Total de entradas: {projectEntries.length}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-primary/20" />
              <span className="text-muted-foreground">Dia com entrada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Como está seu foco/humor hoje?
            </label>
            <div className="flex gap-2 justify-center p-4 bg-muted/30 rounded-lg">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMoodScore(option.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-110 ${
                    moodScore === option.value
                      ? 'bg-primary/20 ring-2 ring-primary scale-110'
                      : 'hover:bg-muted/50'
                  }`}
                  title={option.label}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-xs text-muted-foreground">{option.value}</span>
                </button>
              ))}
            </div>
            {moodScore && (
              <p className="text-sm text-center text-muted-foreground">
                {moodOptions.find(o => o.value === moodScore)?.label}
              </p>
            )}
          </div>
          
          <Textarea
            placeholder="Escreva sobre seu dia..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
