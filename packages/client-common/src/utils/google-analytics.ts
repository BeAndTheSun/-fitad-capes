import type { InternalAxiosRequestConfig } from 'axios';

export function pushToWindow(
  mutationName: string,
  config: InternalAxiosRequestConfig
): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  let windowTypeModified = (window as any).dataLayer;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  windowTypeModified = windowTypeModified || [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  windowTypeModified?.push({
    event: `mutation_${mutationName}`,
    // This is because we need to send undefined to reset dataLayer data to undefined
    body: config.data ? JSON.stringify(config.data) : undefined,
  });
}

export function formatGoogleAnalyticsData(
  method: string,
  url: string,
  dontSentToGA?: string
): string | undefined {
  if (method !== 'get' && dontSentToGA !== 'true' && url.length > 0) {
    const splitUrl = url.split('/');
    const removedSomeUrl = splitUrl?.slice(2, splitUrl.length) ?? [];
    const mutationName = removedSomeUrl.join('_');
    return mutationName;
  }
  return undefined;
}
