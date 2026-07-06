import { uploadToCloudinary } from '../middleware/upload.middleware.js';
import { env } from '../config/env.js';

const FETCH_TIMEOUT_MS = 15000;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Download a remote image and re-upload it to our Cloudinary bucket. The
 * function is a no-op (returns the original URL) when Cloudinary isn't
 * configured, the URL is not http(s), the response isn't an image, or
 * the upload itself fails. Callers can therefore use it on any URL
 * without pre-checking and get a best-effort result.
 */
export async function mirrorImage(url) {
  if (!url || !/^https?:\/\//i.test(url)) return url;

  // If Cloudinary isn't configured, there's nowhere to host the file.
  // Keep the original URL rather than 500'ing.
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    return url;
  }

  let buf;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CoolZone/1.0' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return url;
    const ctype = res.headers.get('content-type') || '';
    if (!ctype.startsWith('image/')) return url;
    const ab = await res.arrayBuffer();
    if (ab.byteLength > MAX_BYTES) return url;
    buf = Buffer.from(ab);
  } catch {
    return url;
  }

  try {
    const result = await uploadToCloudinary(buf, 'coolzone/scraped');
    return result.secure_url || url;
  } catch {
    return url;
  }
}

/** Mirror every URL in an array, sequentially. Order is preserved. */
export async function mirrorImages(urls = []) {
  const out = [];
  for (const u of urls) {
    out.push(await mirrorImage(u));
  }
  return out;
}
