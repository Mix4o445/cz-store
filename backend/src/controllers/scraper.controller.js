import { z } from 'zod';
import { ok } from '../utils/apiResponse.js';
import { badRequest, notFound } from '../utils/apiError.js';
import { scrapeOneProduct } from '../../scripts/lib/mtclim-scraper.mjs';
import { mirrorImages } from '../services/image.service.js';

const bodySchema = z.object({
  url: z.string().url('URL invalide'),
  mirrorImages: z.boolean().optional().default(true),
});

/** POST /api/scraper/product
 *  Body: { url: "https://mtclim.ma/...", mirrorImages?: boolean }
 *  Returns the scraped product in CoolZone shape, or { ok: false, error } if
 *  the page couldn't be parsed.
 *
 *  When `mirrorImages` is true (the default) every image found on the
 *  source page is downloaded and re-uploaded to our Cloudinary bucket,
 *  so the returned `images` array already points at our own CDN. This
 *  keeps us independent of mtclim.ma staying online and avoids hotlinking.
 */
export async function scrapeProduct(req, res, next) {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest('URL invalide', parsed.error.flatten());
    }

    const result = await scrapeOneProduct(parsed.data.url);

    if (!result.ok) {
      const err = notFound(
        result.error === 'no_product_jsonld'
          ? 'No Product JSON-LLD found on this page'
          : 'Could not fetch the page'
      );
      err.statusCode = result.error === 'no_product_jsonld' ? 422 : 502;
      throw err;
    }

    if (parsed.data.mirrorImages && result.product.images?.length) {
      result.product.images = await mirrorImages(result.product.images);
    }

    return ok(res, result.product);
  } catch (e) {
    next(e);
  }
}
