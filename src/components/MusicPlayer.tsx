import { Music, Plus, Trash2, Upload, Folder, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

export const MusicPlayer = () => {
  const {
    playlists,
    isLoading,
    isConnected,
    addTracksToPlaylist,
    createPlaylist,
    removeTrack,
    removePlaylist,
    clearLibrary,
  } = useMusicLibrary();

  const { playTrack, currentTrack, isPlaying, setPlaylist } = useMusicPlayer();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const playlistId = createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreateDialogOpen(false);
      setSelectedPlaylist(playlistId);
    }
  };

  const handleAddTracks = (playlistId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addTracksToPlaylist(playlistId, files);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Music className="h-16 w-16 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Processando músicas...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center max-w-2xl px-4">
          <Music className="h-24 w-24 text-muted-foreground/20 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold mb-3">Biblioteca de Músicas</h2>
          <p className="text-muted-foreground mb-2 max-w-md mx-auto">
            Organize suas músicas em playlists personalizadas.
          </p>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Suporta MP3, M4A, OGG, WAV e FLAC. Lê automaticamente os metadados (artista, álbum, capa).
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Criar Primeira Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Playlist</DialogTitle>
                <DialogDescription>
                  Escolha um nome para sua playlist
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playlist-name">Nome da Playlist</Label>
                  <Input
                    id="playlist-name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Ex: Rock, Estudos, Treino..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  />
                </div>
                <Button onClick={handleCreatePlaylist} className="w-full">
                  Criar Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const currentPlaylist = selectedPlaylist
    ? playlists.find(p => p.id === selectedPlaylist)
    : playlists[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎵 Biblioteca de Músicas</h1>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Playlist</DialogTitle>
                <DialogDescription>
                  Escolha um nome para sua playlist
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playlist-name">Nome da Playlist</Label>
                  <Input
                    id="playlist-name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Ex: Rock, Estudos, Treino..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  />
                </div>
                <Button onClick={handleCreatePlaylist} className="w-full">
                  Criar Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {playlists.length > 0 && (
            <Button onClick={clearLibrary} variant="outline" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Limpar Tudo
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar com Playlists */}
        <Card className="h-fit max-h-[300px] md:max-h-none overflow-hidden flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Playlists</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-[200px] md:h-[calc(100vh-16rem)]">
              <div className="space-y-1 p-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedPlaylist(playlist.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${selectedPlaylist === playlist.id || (!selectedPlaylist && playlist === playlists[0])
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                      }`}
                  >
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{playlist.name}</span>
                    <span className="text-xs opacity-70 shrink-0">{playlist.tracks.length}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área Principal - Músicas da Playlist */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="py-4">
            <div className="flex flex-col gap-3">
              <CardTitle className="truncate">
                {currentPlaylist?.name || 'Selecione uma Playlist'}
              </CardTitle>
              {currentPlaylist && (
                <div className="flex flex-wrap gap-2">
                  <Label htmlFor={`upload-${currentPlaylist.id}`} className="cursor-pointer">
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full sm:w-auto gap-2">
                      <Upload className="h-4 w-4" />
                      <span>Adicionar</span>
                    </div>
                    <Input
                      id={`upload-${currentPlaylist.id}`}
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleAddTracks(currentPlaylist.id, e)}
                    />
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePlaylist(currentPlaylist.id)}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {currentPlaylist && currentPlaylist.tracks.length > 0 ? (
              <ScrollArea className="h-[400px] md:h-[calc(100vh-16rem)] w-full">
                <div className="space-y-1 p-2">
                  {currentPlaylist.tracks.map((track) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    const isTrackPlaying = isCurrentTrack && isPlaying;

                    return (
                      <div
                        key={track.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border transition-colors group ${isCurrentTrack ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                          }`}
                      >
                        {track.artwork ? (
                          <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-10 h-10 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                            <Music className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {track.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPlaylist(currentPlaylist.tracks);
                              playTrack(track);
                            }}
                            className={`h-8 w-8 ${isCurrentTrack ? 'text-primary' : ''}`}
                          >
                            {isTrackPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTrack(currentPlaylist.id, track.id)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground p-4">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Playlist vazia</p>
                {currentPlaylist && (
                  <Label htmlFor={`upload-${currentPlaylist.id}-empty`} className="cursor-pointer block mt-4">
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2 w-full">
                      <Upload className="h-4 w-4" />
                      <span>Adicionar Músicas</span>
                    </div>
                    <Input
                      id={`upload-${currentPlaylist.id}-empty`}
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleAddTracks(currentPlaylist.id, e)}
                    />
                  </Label>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground text-center">
          Total: {playlists.reduce((acc, p) => acc + p.tracks.length, 0)} música
          {playlists.reduce((acc, p) => acc + p.tracks.length, 0) !== 1 ? 's' : ''} em{' '}
          {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Use o mini-player no topo da página para controlar a reprodução
        </p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          ⚠️ As músicas ficam armazenadas apenas durante a sessão atual. Ao recarregar a página, será necessário adicioná-las novamente.
        </p>
      </div>
    </div>
  );
};
