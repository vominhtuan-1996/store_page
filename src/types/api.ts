interface ApiQueryParam {
  key: string;
  value: string;
  description: string;
}

interface ApiDefinition {
  toolName: string;
  displayName: string;
  description: string;
  method: string;
  url: string;
  folder: string;
  queryParams: ApiQueryParam[];
  bodySchema: Record<string, string> | null;
}

export type { ApiQueryParam, ApiDefinition };
