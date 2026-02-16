import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface MusicTrack {
  id: string;
  file: File;
  name: string;
  url: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  playlist: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: MusicTrack[];
}

export const useMusicLibrary = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar playlists do localStorage ao inicializar
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('musicPlaylists');
    if (savedPlaylists) {
      try {
        const parsed = JSON.parse(savedPlaylists);
        setPlaylists(parsed);
      } catch (error) {
        console.error('Erro ao carregar playlists:', error);
      }
    }
  }, []);

  // Salvar playlists no localStorage quando mudar
  useEffect(() => {
    if (playlists.length > 0) {
      localStorage.setItem('musicPlaylists', JSON.stringify(playlists));
    }
  }, [playlists]);

  // Extrair metadados usando jsmediatags
  const extractMetadata = async (file: File): Promise<Partial<MusicTrack>> => {
    return new Promise((resolve) => {
      // @ts-ignore - jsmediatags é carregado via CDN
      if (typeof window.jsmediatags === 'undefined') {
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Artista Desconhecido',
          album: 'Álbum Desconhecido',
        });
        return;
      }

      // @ts-ignore
      window.jsmediatags.read(file, {
        onSuccess: (tag: any) => {
          const tags = tag.tags;
          let artwork: string | undefined;

          if (tags.picture) {
            const { data, format } = tags.picture;
            const byteArray = new Uint8Array(data);
            const blob = new Blob([byteArray], { type: format });
            artwork = URL.createObjectURL(blob);
          }

          resolve({
            title: tags.title || file.name.replace(/\.[^/.]+$/, ''),
            artist: tags.artist || 'Artista Desconhecido',
            album: tags.album || 'Álbum Desconhecido',
            artwork,
          });
        },
        onError: () => {
          resolve({
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Artista Desconhecido',
            album: 'Álbum Desconhecido',
          });
        },
      });
    });
  };

  // Adicionar músicas a uma playlist
  const addTracksToPlaylist = async (playlistName: string, files: FileList) => {
    try {
      setIsLoading(true);
      const newTracks: MusicTrack[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (/\.(mp3|m4a|ogg|wav|flac)$/i.test(file.name)) {
          const metadata = await extractMetadata(file);
          const track: MusicTrack = {
            id: `${Date.now()}-${i}`,
            file,
            name: file.name,
            url: URL.createObjectURL(file),
            title: metadata.title || file.name,
            artist: metadata.artist || 'Artista Desconhecido',
            album: metadata.album || 'Álbum Desconhecido',
            artwork: metadata.artwork,
            playlist: playlistName,
          };
          newTracks.push(track);
        }
      }

      if (newTracks.length === 0) {
        toast.error('Nenhum arquivo de áudio encontrado');
        return;
      }

      setPlaylists(prev => {
        const existingPlaylist = prev.find(p => p.id === playlistName);
        let updated: Playlist[];
        
        if (existingPlaylist) {
          updated = prev.map(p =>
            p.id === playlistName
              ? { ...p, tracks: [...p.tracks, ...newTracks] }
              : p
          );
        } else {
          updated = [
            ...prev,
            {
              id: playlistName,
              name: playlistName,
              tracks: newTracks,
            },
          ];
        }
        
        return updated;
      });

      toast.success(`${newTracks.length} música(s) adicionada(s) à playlist "${playlistName}"`);
    } catch (error) {
      console.error('Erro ao adicionar músicas:', error);
      toast.error('Erro ao adicionar músicas');
    } finally {
      setIsLoading(false);
    }
  };

  // Criar nova playlist
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      tracks: [],
    };
    
    setPlaylists(prev => [...prev, newPlaylist]);
    
    toast.success(`Playlist "${name}" criada`);
    return newPlaylist.id;
  };

  // Remover música de uma playlist
  const removeTrack = (playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
          : p
      )
    );
    toast.success('Música removida');
  };

  // Remover playlist
  const removePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    toast.success('Playlist removida');
  };

  // Limpar toda a biblioteca
  const clearLibrary = () => {
    setPlaylists([]);
    toast.info('Biblioteca limpa');
  };

  // Obter todas as músicas de todas as playlists
  const getAllTracks = (): MusicTrack[] => {
    return playlists.flatMap(p => p.tracks);
  };

  return {
    playlists,
    isLoading,
    isConnected: playlists.length > 0,
    addTracksToPlaylist,
    createPlaylist,
    removeTrack,
    removePlaylist,
    clearLibrary,
    getAllTracks,
  };
};
