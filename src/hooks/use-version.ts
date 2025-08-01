import { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  commitSha: string;
  commitShaFull: string;
  commitMessage: string;
  commitDate: string;
  branchName: string;
  tagName: string;
  buildInfo: string;
  buildTime: string;
}

export function useVersion() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        // Try to load from version.json (created by GitHub Actions)
        const response = await fetch('/version.json');
        if (response.ok) {
          const data = await response.json();
          setVersionInfo(data);
        } else {
          // Fallback to default version info
          setVersionInfo({
            version: 'beta - v1.0.0',
            commitSha: 'dev',
            commitShaFull: 'dev',
            commitMessage: 'Development build',
            commitDate: new Date().toISOString().split('T')[0],
            branchName: 'dev',
            tagName: '',
            buildInfo: 'Development build',
            buildTime: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to load version info:', err);
        // Fallback to default version info
        setVersionInfo({
          version: 'beta - v1.0.0',
          commitSha: 'dev',
          commitShaFull: 'dev',
          commitMessage: 'Development build',
          commitDate: new Date().toISOString().split('T')[0],
          branchName: 'dev',
          tagName: '',
          buildInfo: 'Development build',
          buildTime: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    loadVersionInfo();
  }, []);

  return {
    versionInfo,
    loading,
    // Helper functions
    getVersionString: () => versionInfo?.version || 'beta - v1.0.0',
    getCommitSha: () => versionInfo?.commitSha || 'dev',
    getBuildInfo: () => versionInfo?.buildInfo || 'Development build',
    isProduction: () => versionInfo?.branchName === 'main',
    isTagged: () => !!versionInfo?.tagName,
  };
}
