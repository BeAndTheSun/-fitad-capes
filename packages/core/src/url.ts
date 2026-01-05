export function getBaseUrl(): string {
  // browser should use relative url
  if (typeof window !== 'undefined') {
    return '';
  }
  // SSR should use vercel url
  if (process.env.VERCEL_URL != null) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.BASE_URL != null) {
    return process.env.BASE_URL;
  }

  // dev SSR should use localhost
  return `http://localhost:3000`;
}
