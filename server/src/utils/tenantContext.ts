import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export const runWithTenant = <T>(tenantId: string, fn: () => Promise<T>): Promise<T> => {
  return tenantStorage.run({ tenantId }, fn);
};
