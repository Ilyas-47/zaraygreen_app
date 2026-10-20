import { Platform } from 'react-native';

const DEV_IP = '192.168.100.178'; 

export const API_URL = __DEV__
  ? `http://${DEV_IP}:5001/api`
  : 'https://api.zaray.com/api';

export const APP_CONFIG = {
  name:           'Zaray Green',
  version:        '1.0.0',
  currency:       'MAD',
  defaultLang:    'fr',
  imageQuality:   0.8,
  requestTimeout: 10000,
} as const;