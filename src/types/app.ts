interface AppVersion {
  version: string;
  buildNumber: string;
  releaseDate: string;
  releaseNotes: string;
  android?: {
    downloadUrl: string;
  };
  ios?: {
    downloadUrl: string;
    bundleId: string;
  };
}

interface AppEnvironment {
  name: string;
  versions: AppVersion[];
}

interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  environments: {
    staging: AppEnvironment;
    production: AppEnvironment;
  };
}

export type { AppVersion, AppEnvironment, AppInfo };
