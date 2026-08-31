export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&modestbranding=1&rel=0`;
}
