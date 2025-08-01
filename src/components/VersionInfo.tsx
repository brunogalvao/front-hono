import { useVersion } from '@/hooks/use-version';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VersionInfo() {
  const {
    versionInfo,
    loading,
    getVersionString,
    getCommitSha,
    getBuildInfo,
    isProduction,
    isTagged,
  } = useVersion();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informações de Versão</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Informações de Versão
          <Badge variant={isProduction() ? 'default' : 'secondary'}>
            {isProduction() ? 'Produção' : 'Desenvolvimento'}
          </Badge>
          {isTagged() && <Badge variant="outline">Tagged Release</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Versão:</span>
            <p className="text-muted-foreground">{getVersionString()}</p>
          </div>
          <div>
            <span className="font-medium">Commit:</span>
            <p className="text-muted-foreground font-mono">{getCommitSha()}</p>
          </div>
          <div>
            <span className="font-medium">Branch:</span>
            <p className="text-muted-foreground">{versionInfo?.branchName}</p>
          </div>
          <div>
            <span className="font-medium">Data:</span>
            <p className="text-muted-foreground">{versionInfo?.commitDate}</p>
          </div>
        </div>

        <div className="border-t pt-2">
          <span className="text-sm font-medium">Build Info:</span>
          <p className="text-muted-foreground text-sm">{getBuildInfo()}</p>
        </div>

        {versionInfo?.commitMessage && (
          <div className="border-t pt-2">
            <span className="text-sm font-medium">Último Commit:</span>
            <p className="text-muted-foreground text-sm">
              {versionInfo.commitMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
