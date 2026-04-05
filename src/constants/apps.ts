import type { AppInfo } from '../types/app';

const BASE_URL = import.meta.env.BASE_URL;

export const APP_LIST: AppInfo[] = [
  {
    id: 'tcss',
    name: 'TCSS',
    description: 'Hệ thống quản lý TCSS',
    icon: `${BASE_URL}apps/tcss/icon.png`,
    environments: {
      staging: {
        name: 'Staging',
        versions: [],
      },
      production: {
        name: 'Production',
        versions: [],
      },
    },
  },
  {
    id: 'pms',
    name: 'PMS',
    description: 'Hệ thống quản lý PMS',
    icon: `${BASE_URL}apps/pms/icon.png`,
    environments: {
      staging: {
        name: 'Staging',
        versions: [],
      },
      production: {
        name: 'Production',
        versions: [],
      },
    },
  },
  {
    id: 'rii-mobimap',
    name: 'RII Mobimap',
    description: 'Ứng dụng RII Mobimap',
    icon: `${BASE_URL}apps/rii-mobimap/icon.png`,
    environments: {
      staging: {
        name: 'Staging',
        versions: [],
      },
      production: {
        name: 'Production',
        versions: [],
      },
    },
  },
  {
    id: 'mobimap',
    name: 'Mobimap',
    description: 'Ứng dụng Mobimap',
    icon: `${BASE_URL}apps/mobimap/icon.png`,
    environments: {
      staging: {
        name: 'Staging',
        versions: [],
      },
      production: {
        name: 'Production',
        versions: [],
      },
    },
  },
];
