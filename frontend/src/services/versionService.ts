interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

export interface VersionInfo {
  current: string;
  latest: string;
  isUpdateAvailable: boolean;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl?: string;
}

export class VersionService {
  private static readonly GITHUB_API_URL = 'https://api.github.com/repos/Lord0fthetrains/os/releases/latest';
  private static readonly CURRENT_VERSION = '1.2.0';

  static async checkForUpdates(): Promise<VersionInfo> {
    try {
      const response = await fetch(this.GITHUB_API_URL);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release: GitHubRelease = await response.json();
      const latestVersion = release.tag_name.replace('v', '');
      const currentVersion = this.CURRENT_VERSION;

      const isUpdateAvailable = this.compareVersions(latestVersion, currentVersion) > 0;

      return {
        current: currentVersion,
        latest: latestVersion,
        isUpdateAvailable,
        releaseNotes: release.body,
        publishedAt: release.published_at,
        downloadUrl: release.assets[0]?.browser_download_url
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return {
        current: this.CURRENT_VERSION,
        latest: this.CURRENT_VERSION,
        isUpdateAvailable: false,
        releaseNotes: '',
        publishedAt: new Date().toISOString()
      };
    }
  }

  private static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  static getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }
}
