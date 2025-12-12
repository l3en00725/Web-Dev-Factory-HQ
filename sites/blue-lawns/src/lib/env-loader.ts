/**
 * Deterministic Environment Variable Loader
 * 
 * In Astro with ESM, env vars are loaded in astro.config.mjs BEFORE the server starts.
 * This module provides helpers to access those vars from process.env or import.meta.env.
 * 
 * DO NOT use dotenv here - it uses CommonJS require() which breaks in Vite's ESM runtime.
 * Env loading is done in astro.config.mjs using dotenv BEFORE Vite starts.
 */

/**
 * Get an environment variable with fallback
 * Checks process.env first (populated by dotenv in astro.config.mjs),
 * then import.meta.env (Vite's built-in env handling).
 */
export function getEnv(key: string, fallback?: string): string {
  // Try process.env first (populated by dotenv in astro.config.mjs)
  if (typeof process !== 'undefined' && process.env) {
    const processValue = process.env[key];
    if (processValue !== undefined && processValue !== '') {
      return processValue;
    }
  }

  // Try import.meta.env (Vite/Astro)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const metaValue = (import.meta.env as Record<string, string>)[key];
    if (metaValue !== undefined && metaValue !== '') {
      return metaValue;
    }
  }

  // Return fallback or empty string
  return fallback ?? '';
}

/**
 * Get required env var - throws if missing
 */
export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`[ENV] Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Debug: Get all loaded env var keys (not values)
 */
export function getLoadedEnvKeys(): string[] {
  const keys: string[] = [];
  
  if (typeof process !== 'undefined' && process.env) {
    keys.push(...Object.keys(process.env).filter(k => !k.startsWith('npm_')));
  }
  
  return [...new Set(keys)];
}
