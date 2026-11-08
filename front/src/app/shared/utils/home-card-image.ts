const STORAGE_HOST = 'seminario1integrador.blob.core.windows.net';
const PUBLICATION_IMAGE_PATH = /^\/(imagenes|rnf8-[^/]+)\/publicaciones\/[^/]+\.(jpg|jpeg|png|webp)$/;
const WIDTHS = [320, 640, 1024] as const;
const QUALITY = 70;

export const HOME_CARD_IMAGE_SIZES =
  '(max-width: 580px) 280px, (max-width: 1050px) calc((100vw - 3rem) / 2), ' +
  '(max-width: 1200px) calc((100vw - 5rem) / 4), 280px';

/** Solo transforma fotos públicas de publicaciones; conserva la URL original. */
export function homeCardImage(url: string, optimize: boolean): { src: string; srcset: string | null } {
  const original = { src: url, srcset: null };
  if (!optimize) return original;

  try {
    const image = new URL(url);
    if (
      image.protocol !== 'https:' || image.hostname !== STORAGE_HOST || image.port ||
      image.username || image.password || image.search || image.hash ||
      !PUBLICATION_IMAGE_PATH.test(image.pathname)
    ) return original;
  } catch {
    return original;
  }

  const resized = (width: number) =>
    `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${QUALITY}`;
  return {
    src: resized(640),
    srcset: WIDTHS.map((width) => `${resized(width)} ${width}w`).join(', '),
  };
}
