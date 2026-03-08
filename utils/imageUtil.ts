export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace('localhost', '10.0.2.2');
}