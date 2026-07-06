import { z } from 'zod';
import { ok } from '../utils/apiResponse.js';
import { badRequest, notFound } from '../utils/apiError.js';
import { scrapeOneProduct } from '../../scripts/lib/mtclim-scraper.mjs';

const bodySchema = z.object({
  url: z.string().url('URL invalide'),
});

/** POST /api/scraper/product
 *  Body: { url: "https://mtclim.ma/..." }
 *  Returns the scraped product in CoolZone shape, or { ok: false, error } if
 *  the page couldn't be parsed.
 */
export async function scrapeProduct(req, res, next) {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest('URL invalide', parsed.error.flatten());
    }

    const result = await scrapeOneProduct(parsed.data.url);

    if (!result.ok) {
      // 422 = unprocessable entity: URL was valid but the page didn't have
      // a Product JSON-LD we could parse.
      const err = notFound(
        result.error === 'no_product_jsonld'
          ? 'No Product JSON-LD found on this page'
          : 'Could not fetch the page'
      );
      err.statusCode = result.error === 'no_product_jsonld' ? 422 : 502;
      throw err;
    }

    return ok(res, result.product);
  } catch (e) {
    next(e);
  }
}
