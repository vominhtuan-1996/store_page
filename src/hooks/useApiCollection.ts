import { useState, useEffect, useMemo } from 'react';
import { parsePostmanCollection } from '../utils/postmanParser';
import type { ApiDefinition } from '../types/api';

const BASE_URL = import.meta.env.BASE_URL;

type Environment = 'staging' | 'production';

const ENV_BASE_URLS: Record<Environment, string> = {
  staging: 'https://apis-stag.fpt.vn',
  production: 'https://apis.fpt.vn',
};

export const useApiCollection = () => {
  const [apis, setApis] = useState<ApiDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [folderFilter, setFolderFilter] = useState<string>('ALL');
  const [environment, setEnvironment] = useState<Environment>('staging');

  useEffect(() => {
    fetch(`${BASE_URL}PMS.postman.json`)
      .then((res) => res.json())
      .then((data) => {
        setApis(parsePostmanCollection(data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const folders = useMemo(() => {
    const set = new Set(apis.map((a) => a.folder));
    return ['ALL', ...Array.from(set).sort()];
  }, [apis]);

  const methods = useMemo(() => {
    const set = new Set(apis.map((a) => a.method));
    return ['ALL', ...Array.from(set).sort()];
  }, [apis]);

  const filtered = useMemo(() => {
    return apis.filter((api) => {
      const matchSearch =
        !search ||
        api.displayName.toLowerCase().includes(search.toLowerCase()) ||
        api.url.toLowerCase().includes(search.toLowerCase()) ||
        api.toolName.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === 'ALL' || api.method === methodFilter;
      const matchFolder = folderFilter === 'ALL' || api.folder === folderFilter;
      return matchSearch && matchMethod && matchFolder;
    });
  }, [apis, search, methodFilter, folderFilter]);

  const envBaseUrl = ENV_BASE_URLS[environment];

  const resolveUrl = (rawUrl: string) => {
    return rawUrl
      .replace(/\{\{baseUrl\}\}/g, envBaseUrl)
      .replace(/https:\/\/apis-stag\.fpt\.vn/g, envBaseUrl);
  };

  return {
    apis: filtered,
    totalCount: apis.length,
    loading,
    error,
    search,
    setSearch,
    methodFilter,
    setMethodFilter,
    folderFilter,
    setFolderFilter,
    folders,
    methods,
    environment,
    setEnvironment,
    envBaseUrl,
    resolveUrl,
  };
};
