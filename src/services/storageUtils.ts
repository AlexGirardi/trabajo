// Utilidades comunes para capa de datos mejorada
// Centraliza lectura/escritura, generación de IDs, revivido de fechas, caché simple y validación básica.

export type ReviverConfig<T> = {
  dateFields?: (keyof T)[]; // Campos que deben revivirse como Date
  validate?: (raw: any) => raw is T; // Guard opcional de validación
  normalize?: (entity: T) => T; // Normalizador opcional
};

interface CacheEntry<T> { data: T[]; loadedAt: number; }

const cache: Record<string, CacheEntry<any>> = {};

const DEFAULT_TTL_MS = 5_000; // Caché corta para evitar lecturas reiteradas en renders sucesivos

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function clearCache(key?: string) {
  if (key) delete cache[key]; else Object.keys(cache).forEach(k => delete cache[k]);
}

export function loadArray<T>(storageKey: string, config: ReviverConfig<T> = {}, ttlMs: number = DEFAULT_TTL_MS): T[] {
  // Caché caliente
  const now = Date.now();
  const entry = cache[storageKey];
  if (entry && (now - entry.loadedAt) < ttlMs) {
    return entry.data as T[];
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      cache[storageKey] = { data: [], loadedAt: now };
      return [];
    }
    const parsed: any[] = JSON.parse(raw);
    let revived = parsed.map(obj => reviveEntity(obj, config));
    if (config.validate) {
      revived = revived.filter(config.validate);
    }
    if (config.normalize) {
      revived = revived.map(config.normalize);
    }
    cache[storageKey] = { data: revived, loadedAt: now };
    return revived;
  } catch (e) {
    console.error(`[storage] Error parsing ${storageKey}:`, e);
    cache[storageKey] = { data: [], loadedAt: now };
    return [];
  }
}

export function saveArray<T>(storageKey: string, list: T[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
    cache[storageKey] = { data: list, loadedAt: Date.now() }; // Actualizar caché inmediatamente
  } catch (e) {
    console.error(`[storage] Error saving ${storageKey}:`, e);
    throw new Error('Persistencia fallida');
  }
}

function reviveEntity<T>(obj: any, config: ReviverConfig<T>): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (config.dateFields) {
    config.dateFields.forEach(field => {
      const key = field as string;
      if (obj[key] && typeof obj[key] === 'string') {
        const d = new Date(obj[key]);
        if (!isNaN(d.getTime())) obj[key] = d;
      }
    });
  }
  return obj;
}

// Helper para actualizaciones inmutables
export function updateById<T extends { id: string }>(items: T[], id: string, changes: Partial<T>): { updated: T | null; list: T[] } {
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return { updated: null, list: items };
  const updated = { ...items[idx], ...changes } as T;
  const list = [...items];
  list[idx] = updated;
  return { updated, list };
}

export function removeById<T extends { id: string }>(items: T[], id: string): { removed: boolean; list: T[] } {
  const list = items.filter(i => i.id !== id);
  return { removed: list.length !== items.length, list };
}
