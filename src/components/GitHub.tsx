import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Github, Star, GitFork, Eye, ExternalLink, LogOut, Key } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UserProfile {
    login: string;
    avatar_url: string;
    html_url: string;
    name: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
}

interface Repository {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    updated_at: string;
    private: boolean;
}

export const GitHub = () => {
    const [token, setToken] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [repos, setRepos] = useState<Repository[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('github_token');
        if (savedToken) {
            setToken(savedToken);
            fetchData(savedToken);
        }
    }, []);

    const fetchData = async (authToken: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const headers = {
                Authorization: `token ${authToken}`,
            };

            const userRes = await fetch('https://api.github.com/user', { headers });
            if (!userRes.ok) throw new Error('Falha na autenticação');
            const userData = await userRes.json();
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('github_token', authToken);

            const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', { headers });
            if (reposRes.ok) {
                const reposData = await reposRes.json();
                setRepos(reposData);
            }
        } catch (err) {
            setError('Erro ao conectar. Verifique seu token.');
            localStorage.removeItem('github_token');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        if (token) fetchData(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('github_token');
        setToken('');
        setUser(null);
        setRepos([]);
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center p-6 h-full text-center space-y-6">
                <Github className="w-16 h-16 text-primary" />
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold">Conectar GitHub</h2>
                    <p className="text-muted-foreground text-sm">
                        Gere um Personal Access Token (PAT) no GitHub para visualizar seus repositórios e perfil aqui.
                    </p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium">Personal Access Token</label>
                        <Input
                            type="password"
                            placeholder="ghp_..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Vá em Settings {'>'} Developer settings {'>'} Personal access tokens. Apenas permissão 'repo' é necessária.
                        </p>
                    </div>
                    <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                        {isLoading ? 'Conectando...' : 'Conectar'}
                    </Button>
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header / Profile */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback>GH</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-bold">{user?.name || user?.login}</h2>
                        <p className="text-sm text-muted-foreground">@{user?.login}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold">{user?.public_repos}</div>
                        <div className="text-xs text-muted-foreground">Repositórios</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold">{user?.followers}</div>
                        <div className="text-xs text-muted-foreground">Seguidores</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold">{user?.following}</div>
                        <div className="text-xs text-muted-foreground">Seguindo</div>
                    </CardContent>
                </Card>
            </div>

            {/* Repositories List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Seus Repositórios Recentes
                </h3>
                <ScrollArea className="h-[400px]">
                    <div className="grid gap-4">
                        {repos.map((repo) => (
                            <Card key={repo.id} className="hover:bg-muted/50 transition-colors">
                                <CardHeader className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                {repo.private && <Badge variant="secondary" className="text-[10px] px-1 h-5">Privado</Badge>}
                                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary">
                                                    {repo.name}
                                                </a>
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 text-xs">
                                                {repo.description || 'Sem descrição'}
                                            </CardDescription>
                                        </div>
                                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                        {repo.language && (
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-primary/60" />
                                                {repo.language}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3" />
                                            {repo.stargazers_count}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <GitFork className="h-3 w-3" />
                                            {repo.forks_count}
                                        </div>
                                        <div className="ml-auto">
                                            Atualizado em {new Date(repo.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
