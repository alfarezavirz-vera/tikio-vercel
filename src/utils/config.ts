import { config } from 'dotenv';
config();
export async function getVPSIP(): Promise<string> {
  if (typeof window === 'undefined') {
    try {
      const os = await import('os');
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        const interfaceList = interfaces[name];
        if (interfaceList) {
          for (const iface of interfaceList) {
            if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not get network interfaces:', error);
    }
  }
  return '0.0.0.0';
}
export async function getExternalIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { 
      signal: AbortSignal.timeout(5000) 
    });
    const data = await response.json();
    return data.ip;
  } catch (error) {
    try {
      const response = await fetch('https://ipapi.co/ip/', { 
        signal: AbortSignal.timeout(5000) 
      });
      const data = await response.text();
      return data.trim();
    } catch (error2) {
      try {
        const response = await fetch('https://checkip.amazonaws.com/', { 
          signal: AbortSignal.timeout(5000) 
        });
        const data = await response.text();
        return data.trim();
      } catch (error3) {
        return getVPSIP(); 
      }
    }
  }
}
import { ENV_CONFIG } from '../config/env.ts';
export const VPS_CONFIG = {
  async getFrontendUrl(): Promise<string> {
    if (ENV_CONFIG.NODE_ENV === 'development') {
      return `http://localhost:${ENV_CONFIG.FE_PORT}`;
    }
    const ip = await getVPSIP();
    return `http://${ip}:${ENV_CONFIG.FE_PORT}`;
  },
  async getBackendUrl(): Promise<string> {
    if (ENV_CONFIG.NODE_ENV === 'development') {
      return `http://localhost:${ENV_CONFIG.BE_PORT}`;
    }
    const ip = await getVPSIP();
    return `http://${ip}:${ENV_CONFIG.BE_PORT}`;
  },
  async getIP(): Promise<string> {
    return await getVPSIP();
  }
};