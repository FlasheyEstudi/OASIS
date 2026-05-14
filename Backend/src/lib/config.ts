import { db as prisma } from './db';
import { safeJsonParse } from './oasis-utils';

export async function getConfig(
  key: string,
  defaultValue?: string
): Promise<string | null> {
  const config = await prisma.systemConfig.findUnique({
    where: { key }
  });
  return config?.value ?? defaultValue ?? null;
}

export async function getConfigNumber(
  key: string,
  defaultValue: number
): Promise<number> {
  const value = await getConfig(key);
  return value ? Number(value) : defaultValue;
}

export async function getConfigBoolean(
  key: string,
  defaultValue: boolean
): Promise<boolean> {
  const value = await getConfig(key);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export async function getConfigJson<T>(
  key: string,
  defaultValue: T
): Promise<T> {
  const value = await getConfig(key);
  if (!value) return defaultValue;
  return safeJsonParse<T>(value, defaultValue);
}
