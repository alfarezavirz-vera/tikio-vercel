import { config } from 'dotenv';
config();
export const ENV_CONFIG = {
  BE_PORT: process.env.BE_PORT || '3001',
  FE_PORT: process.env.FE_PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  TIKWM_BASE_URL: process.env.TIKWM_BASE_URL || 'https://tikwm.com',
  HOST: process.env.HOST || '0.0.0.0',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '10000'),
  DATABASE_URL: process.env.DATABASE_URL || '',
  EXTERNAL_IP_SERVICE: process.env.EXTERNAL_IP_SERVICE || 'https://api.ipify.org',
  DEV_TOOLBAR: process.env.DEV_TOOLBAR === 'true',
  DEBUG: process.env.DEBUG === 'true',
};
export function validateEnvConfig() {
  const required = ['BE_PORT', 'FE_PORT'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using default values...');
  }
  return ENV_CONFIG;
}
export default ENV_CONFIG;