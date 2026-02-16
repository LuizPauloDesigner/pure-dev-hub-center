import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Star, Zap, Play, Pause, Volume2, Brain, Heart, Settings as SettingsIcon, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Wellness = () => {
  const { state, updateFocusDurations, addGamificationPoints } = useApp();
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [focusDuration, setFocusDuration] = useState(state.gamificationStats.focusDuration);
  const [shortBreak, setShortBreak] = useState(state.gamificationStats.shortBreakDuration);
  const [longBreak, setLongBreak] = useState(state.gamificationStats.longBreakDuration);
  
  const [customAudios, setCustomAudios] = useState({
    meditation: '/audios/meditation/default.mp3',
    lofi: '/audios/lofi/default.mp3',
    whitenoise: '/audios/whitenoise/default.mp3',
  });

  const completedBreaks = state.wellnessStats.breaks.filter(b => b.adesaoStatus === 'Concluida').length;
  const totalBreaks = state.wellnessStats.breaks.length;
  const adherenceRate = totalBreaks > 0 ? Math.round((completedBreaks / totalBreaks) * 100) : 0;

  // Últimos 7 dias de histórico
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const last7DaysLabels = last7Days.map(date => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
  });

  const dailyPoints = last7Days.map(date => {
    const dayHistory = state.gamificationStats.historico.filter(h => {
      const histDate = new Date(h.timestamp).toISOString().split('T')[0];
      return histDate === date;
    });
    return dayHistory.reduce((acc, h) => acc + h.pontos, 0);
  });

  const chartData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Pontos por Dia',
        data: dailyPoints,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pontos',
        },
      },
    },
  };

  const handlePlayAudio = (type: string) => {
    if (audioPlaying === type) {
      audioRef.current?.pause();
      setAudioPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = customAudios[type as keyof typeof customAudios];
        audioRef.current.play().catch(() => {
          toast.error('Erro ao carregar áudio. Coloque seus arquivos nas pastas: public/audios/meditation, public/audios/lofi, public/audios/whitenoise');
        });
        setAudioPlaying(type);
        
        // Dar pontos por meditação
        if (type === 'meditation') {
          addGamificationPoints(20, 'meditacao', 'Completou uma sessão de meditação');
          toast.success('+20 pontos por meditação! 🧘');
        }
      }
    }
  };

  const handleAudioUpload = (type: keyof typeof customAudios, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudios(prev => ({ ...prev, [type]: url }));
      toast.success('Áudio carregado com sucesso!');
    }
  };

  const handleSaveSettings = () => {
    updateFocusDurations(focusDuration, shortBreak, longBreak);
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">🧘 Bem-Estar & Foco</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{state.gamificationStats.nivel}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {state.gamificationStats.pontos % 150} / 150 XP
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(state.gamificationStats.pontos % 150 / 150) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{state.gamificationStats.pontos}</div>
            <p className="text-xs text-muted-foreground mt-1">XP acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Adesão</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{adherenceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedBreaks} de {totalBreaks} pausas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Progresso Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {state.gamificationStats.badges.map(badge => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 border"
                  title={badge.description}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-xs font-medium text-center">{badge.name}</span>
                </div>
              ))}
              {/* Badges não desbloqueadas */}
              {Array.from({ length: Math.max(0, 8 - state.gamificationStats.badges.length) }).map((_, i) => (
                <div
                  key={`locked-${i}`}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/20 border border-dashed opacity-40"
                >
                  <span className="text-2xl">🔒</span>
                  <span className="text-xs">Bloqueado</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mindfulness & Relaxamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Áudios para relaxamento e foco profundo. Coloque seus arquivos MP3 nas pastas: public/audios/meditation, public/audios/lofi, public/audios/whitenoise
          </p>
          
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Button
                variant={audioPlaying === 'meditation' ? 'default' : 'outline'}
                className="h-auto flex-col gap-2 py-4 w-full"
                onClick={() => handlePlayAudio('meditation')}
              >
                {audioPlaying === 'meditation' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                <div className="text-center">
                  <div className="font-semibold">Meditação 3min</div>
                  <div className="text-xs opacity-70">+20 XP ao completar</div>
                </div>
              </Button>
              <Label htmlFor="meditation-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed rounded p-2 justify-center">
                  <Upload className="h-3 w-3" />
                  Carregar áudio
                </div>
                <Input
                  id="meditation-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleAudioUpload('meditation', e)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Button
                variant={audioPlaying === 'lofi' ? 'default' : 'outline'}
                className="h-auto flex-col gap-2 py-4 w-full"
                onClick={() => handlePlayAudio('lofi')}
              >
                {audioPlaying === 'lofi' ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                <div className="text-center">
                  <div className="font-semibold">Lo-fi Music</div>
                  <div className="text-xs opacity-70">Foco suave</div>
                </div>
              </Button>
              <Label htmlFor="lofi-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed rounded p-2 justify-center">
                  <Upload className="h-3 w-3" />
                  Carregar áudio
                </div>
                <Input
                  id="lofi-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleAudioUpload('lofi', e)}
                />
              </Label>
            </div>

            <div className="space-y-2">
              <Button
                variant={audioPlaying === 'whitenoise' ? 'default' : 'outline'}
                className="h-auto flex-col gap-2 py-4 w-full"
                onClick={() => handlePlayAudio('whitenoise')}
              >
                {audioPlaying === 'whitenoise' ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                <div className="text-center">
                  <div className="font-semibold">Ruído Branco</div>
                  <div className="text-xs opacity-70">Concentração máxima</div>
                </div>
              </Button>
              <Label htmlFor="whitenoise-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed rounded p-2 justify-center">
                  <Upload className="h-3 w-3" />
                  Carregar áudio
                </div>
                <Input
                  id="whitenoise-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleAudioUpload('whitenoise', e)}
                />
              </Label>
            </div>
          </div>

          <audio ref={audioRef} onEnded={() => setAudioPlaying(null)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configurações de Foco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="focus">Duração do Foco (min)</Label>
              <Input
                id="focus"
                type="number"
                min={1}
                max={60}
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortBreak">Pausa Curta (min)</Label>
              <Input
                id="shortBreak"
                type="number"
                min={1}
                max={15}
                value={shortBreak}
                onChange={(e) => setShortBreak(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBreak">Pausa Longa (min)</Label>
              <Input
                id="longBreak"
                type="number"
                min={5}
                max={30}
                value={longBreak}
                onChange={(e) => setLongBreak(Number(e.target.value))}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {state.gamificationStats.historico.slice(-10).reverse().map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge variant={item.pontos > 0 ? 'default' : 'destructive'}>
                  {item.pontos > 0 ? '+' : ''}{item.pontos} XP
                </Badge>
              </div>
            ))}
            {state.gamificationStats.historico.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum histórico ainda. Complete ciclos de foco para ganhar XP!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
