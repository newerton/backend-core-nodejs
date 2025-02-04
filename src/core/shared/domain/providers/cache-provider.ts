export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string[]): Promise<boolean>;
  clear(): Promise<void>;
  deleteByPrefix(prefix: string[]): Promise<number>;
}
